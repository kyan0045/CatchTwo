const {
  RestManager,
  RouteQueueFullError,
  RestManagerDestroyedError,
} = require("discord-self-lite");
const { sendLog } = require("./logging.js");
const { POKETWO_MENTION } = require("../constants.js");

if (typeof RestManager !== "function") {
  throw new Error("CatchTwo requires discord-self-lite 0.2.0 or newer.");
}

const MAX_ATTEMPTS = 3;
const RETRY_BACKOFFS = [250, 750];

// Leave one request of headroom in the route bucket instead of draining it
const ROUTE_HEADROOM = 1;

// Hard bound on the shared queue.
const MAX_QUEUE = 40;

// Spam may be dropped: keep a few queued and drop the rest instead of growing.
const MAX_SPAM_BUFFER = 3;

const PRIORITIES = {
  catch: 0,
  hint: 1,
  command: 2,
  spam: 3,
};

const PRIORITY_NAMES = ["catch", "hint", "command", "spam"];

// A catch or hint that is still queued after the response window is useless
const TTL_MS = {
  [PRIORITIES.catch]: 4_000,
  [PRIORITIES.hint]: 4_000,
  [PRIORITIES.command]: 15_000,
};

function payloadIncludesPoketwoMention(payload) {
  if (typeof payload === "string") {
    return payload.includes(POKETWO_MENTION);
  }

  return (
    typeof payload?.content === "string" &&
    payload.content.includes(POKETWO_MENTION)
  );
}

// A catch beats a hint, a hint beats a command, and all of them beat spam
function classifyPayload(payload) {
  const content =
    typeof payload === "string" ? payload : (payload?.content ?? "");
  const command = content.replace(POKETWO_MENTION, "").trim().toLowerCase();

  if (/^c\s+\S/.test(command)) return PRIORITIES.catch;
  if (/^(h|hint)$/.test(command)) return PRIORITIES.hint;
  return PRIORITIES.command;
}

function stoppedError() {
  return Object.assign(new Error("Client has been stopped."), {
    code: "CLIENT_STOPPED",
  });
}

function isRouteQueueFull(error) {
  return (
    (typeof RouteQueueFullError === "function" &&
      error instanceof RouteQueueFullError) ||
    error?.code === "ROUTE_QUEUE_FULL" ||
    error?.name === "RouteQueueFullError"
  );
}

function sleepFor(restManager, ms) {
  if (typeof restManager.sleep === "function") return restManager.sleep(ms);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function routeKeyFor(restManager, channelId) {
  if (typeof restManager.getRouteKey !== "function") return null;
  return restManager.getRouteKey(`/channels/${channelId}/messages`, "POST");
}

// Milliseconds to wait before this route and this priority can send again
function getSendWait(restManager, routeKey, item) {
  const now = Date.now();
  let wait = 0;

  const globalReset = restManager.globalRateLimit?.reset ?? 0;
  if (globalReset > now) wait = globalReset - now;

  if (routeKey && restManager.rateLimits) {
    const bucket = restManager.rateLimits.get(routeKey);
    if (bucket && bucket.remaining <= ROUTE_HEADROOM && bucket.reset > now) {
      wait = Math.max(wait, bucket.reset - now);
    }
  }

  if (item?.spacingMs > 0) {
    const lastSent = restManager._lastSentAt?.[item.priority] ?? 0;
    wait = Math.max(wait, lastSent + item.spacingMs - now);
  }

  return wait;
}

// Pick the most urgent item that is still queued, dropping the rest
function selectNext(restManager) {
  const queue = restManager._poketwoQueue;
  const now = Date.now();
  let bestIndex = -1;

  for (let index = 0; index < queue.length; index++) {
    const item = queue[index];
    const expired = item.expiresAt <= now;
    const unwanted =
      typeof item.shouldSend === "function" && !item.shouldSend();

    if (expired || unwanted) {
      queue.splice(index, 1);
      index--;
      sendLog(
        "queue",
        `Dropped ${expired ? "expired" : "no-longer-wanted"} ${PRIORITY_NAMES[item.priority]} send.`,
        "debug"
      );
      item.resolve(null);
      continue;
    }

    if (bestIndex === -1 || item.priority < queue[bestIndex].priority) {
      bestIndex = index;
    }
  }

  return bestIndex;
}

function enqueuePoketwoSend(restManager, item) {
  const queue = restManager._poketwoQueue;

  if (queue.length >= MAX_QUEUE) {
    let worstIndex = 0;
    for (let index = 1; index < queue.length; index++) {
      if (queue[index].priority >= queue[worstIndex].priority)
        worstIndex = index;
    }
    const worst = queue[worstIndex];

    // Never evict a catch for something less urgent --> drop the newcomer instead
    if (item.priority >= worst.priority) {
      sendLog(
        "queue",
        `Dropped incoming ${PRIORITY_NAMES[item.priority]} send: queue full (${MAX_QUEUE}).`,
        "debug"
      );
      item.resolve(null);
      return false;
    }

    queue.splice(worstIndex, 1);
    sendLog(
      "queue",
      `Evicted queued ${PRIORITY_NAMES[worst.priority]} send to make room for a ${PRIORITY_NAMES[item.priority]}.`,
      "debug"
    );
    worst.resolve(null);
  }

  queue.push(item);
  return true;
}

// Queue at the lowest priority; shouldSend is re-checked at send time so pauses apply.
function enqueueSpam(
  restManager,
  channelId,
  payload,
  { spacingMs = 0, shouldSend, onSent } = {}
) {
  if (!restManager || restManager.destroyed) return false;
  if (!restManager._poketwoQueue) restManager._poketwoQueue = [];

  const queuedSpam = restManager._poketwoQueue.filter(
    (item) => item.priority === PRIORITIES.spam
  ).length;
  if (queuedSpam >= MAX_SPAM_BUFFER) return false;

  const queued = enqueuePoketwoSend(restManager, {
    channelId,
    payload,
    priority: PRIORITIES.spam,
    expiresAt: Infinity,
    spacingMs,
    shouldSend,
    onSent,
    maxAttempts: 1,
    quietDrop: true,
    resolve: () => {},
    reject: () => {},
  });

  if (queued && restManager instanceof CatchTwoRestManager) {
    processPoketwoQueue(restManager).catch(() => {});
  }

  return queued;
}

class CatchTwoRestManager extends RestManager {
  constructor(token, apiVersion = 9) {
    super(token, apiVersion);
    this._poketwoQueue = [];
    this._poketwoQueueProcessing = false;
    this._lastSentAt = {};
    this._poketwoActive = null;
  }

  async sendMessage(channelId, payload) {
    if (this.destroyed) throw this.destroyReason;
    if (!payloadIncludesPoketwoMention(payload)) {
      return super.sendMessage(channelId, payload);
    }

    return new Promise((resolve, reject) => {
      const priority = classifyPayload(payload);
      const queued = enqueuePoketwoSend(this, {
        channelId,
        payload,
        priority,
        expiresAt: Date.now() + TTL_MS[priority],
        resolve,
        reject,
      });
      if (queued) processPoketwoQueue(this).catch(() => {});
    });
  }

  destroy(reason) {
    if (this.destroyed) return;

    const error =
      reason instanceof Error ? reason : new RestManagerDestroyedError();
    this._poketwoActive?.reject(error);
    this._poketwoActive = null;
    for (const item of this._poketwoQueue.splice(0)) item.reject(error);
    this._poketwoQueueProcessing = false;

    super.destroy(error);
  }
}

async function processPoketwoQueue(restManager, sendMessage) {
  if (restManager._poketwoQueueProcessing) return;
  if (restManager.destroyed) return;

  restManager._poketwoQueueProcessing = true;

  const send =
    sendMessage ??
    ((channelId, payload) =>
      RestManager.prototype.sendMessage.call(restManager, channelId, payload));

  try {
    while (!restManager.destroyed && restManager._poketwoQueue.length > 0) {
      // Peek before removing so a more urgent item can win while this one waits.
      const index = selectNext(restManager);
      if (index === -1) break;

      const queueItem = restManager._poketwoQueue[index];
      const routeKey = routeKeyFor(restManager, queueItem.channelId);
      const wait = getSendWait(restManager, routeKey, queueItem);

      if (wait > 0) {
        try {
          await sleepFor(restManager, Math.min(wait, 1_000));
        } catch (error) {
          if (restManager.destroyed) break;
          throw error;
        }
        continue;
      }

      restManager._poketwoQueue.splice(index, 1);
      restManager._poketwoActive = queueItem;

      const name = PRIORITY_NAMES[queueItem.priority];
      const maxAttempts = queueItem.maxAttempts ?? MAX_ATTEMPTS;
      let sent = false;
      let result;
      let attempt = 1;

      try {
        while (attempt <= maxAttempts) {
          if (restManager.destroyed) throw restManager.destroyReason;
          if (Date.now() >= queueItem.expiresAt) break;

          try {
            result = await send(queueItem.channelId, queueItem.payload);
            sent = true;
            break;
          } catch (error) {
            const expired = Date.now() >= queueItem.expiresAt;
            if (!isRouteQueueFull(error) || attempt >= maxAttempts || expired) {
              throw error;
            }

            sendLog(
              "queue",
              `Route queue full for ${name} send; retrying (attempt ${attempt}/${maxAttempts}).`,
              "debug"
            );
            await sleepFor(restManager, RETRY_BACKOFFS[attempt - 1] ?? 250);
            attempt++;
          }
        }

        if (sent) {
          if (!restManager._lastSentAt) restManager._lastSentAt = {};
          restManager._lastSentAt[queueItem.priority] = Date.now();
          try {
            queueItem.onSent?.(result);
          } catch {}
          queueItem.resolve(result);
        } else if (queueItem.quietDrop || Date.now() >= queueItem.expiresAt) {
          sendLog(
            "queue",
            `Dropped ${name} send before it could go out.`,
            "debug"
          );
          queueItem.resolve(null);
        } else {
          queueItem.reject(
            new Error(`Protected message gave up after ${maxAttempts} attempts`)
          );
        }
      } catch (error) {
        queueItem.reject(error);
      } finally {
        restManager._poketwoActive = null;
      }
    }
  } finally {
    restManager._poketwoActive = null;
    restManager._poketwoQueueProcessing = false;
  }
}

module.exports = {
  CatchTwoRestManager,
  processPoketwoQueue,
  payloadIncludesPoketwoMention,
  classifyPayload,
  enqueueSpam,
  enqueuePoketwoSend,
  stoppedError,
};
