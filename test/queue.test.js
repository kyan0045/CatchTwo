const test = require("node:test");
const assert = require("node:assert/strict");
const { RouteQueueFullError } = require("discord-self-lite");

const { payloadIncludesPoketwoMention } = require("../src/services/queue.js");

const POKETWO_ID = "716390085896962058";

test("queue pacing only intercepts messages mentioning poketwo", () => {
  assert.equal(
    payloadIncludesPoketwoMention(`<@${POKETWO_ID}> c pikachu`),
    true
  );
  assert.equal(
    payloadIncludesPoketwoMention({ content: `<@${POKETWO_ID}> h` }),
    true
  );
  assert.equal(
    payloadIncludesPoketwoMention({ content: "hello world" }),
    false
  );
  assert.equal(
    payloadIncludesPoketwoMention({
      embeds: [{ title: "wild pokémon has appeared" }],
    }),
    false
  );
});

function lifecycleTimers(t) {
  const timers = new Map();
  t.mock.method(global, "setTimeout", (callback, delay) => {
    const timer = { unref() {} };
    timers.set(timer, { callback, delay });
    return timer;
  });
  t.mock.method(global, "clearTimeout", (timer) => timers.delete(timer));
  return timers;
}

test("REST lifecycle aborts requests, drains sleeps, and rejects later work", async (t) => {
  const {
    CatchTwoRestManager,
    stoppedError,
  } = require("../src/services/queue.js");
  const timers = lifecycleTimers(t);
  const rest = new CatchTwoRestManager("offline-test-token");
  let requestSignal;
  rest.makeRequest = () => {
    requestSignal = rest.abortController.signal;
    return new Promise((resolve, reject) => {
      requestSignal.addEventListener(
        "abort",
        () => reject(requestSignal.reason),
        {
          once: true,
        }
      );
    });
  };

  const request = rest.request("/offline");
  const rejected = assert.rejects(request, { code: "CLIENT_STOPPED" });
  const sleep = rest.sleep(60_000);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(timers.size, 1);
  assert.equal(requestSignal.aborted, false);

  rest.destroy(stoppedError());

  assert.equal(requestSignal.aborted, true);
  assert.equal(rest.rateLimits.size, 0);
  assert.equal(rest.globalRateLimit, null);
  assert.equal(timers.size, 0);
  await rejected;
  await assert.rejects(sleep, { code: "CLIENT_STOPPED" });
  await assert.rejects(rest.request("/offline"), { code: "CLIENT_STOPPED" });
});

test("CatchTwoRestManager sends Pokétwo messages through its own queue", async () => {
  const {
    CatchTwoRestManager,
    stoppedError,
  } = require("../src/services/queue.js");
  const rest = new CatchTwoRestManager("offline-test-token");
  const calls = [];
  rest.request = async (endpoint, options) => {
    calls.push({ endpoint, options });
    return { id: "sent-message" };
  };

  const result = await rest.sendMessage("channel", {
    content: `<@${POKETWO_ID}> c pikachu`,
  });

  assert.equal(result.id, "sent-message");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].endpoint, "/channels/channel/messages");
  assert.equal(rest._poketwoQueue.length, 0);
  rest.destroy(stoppedError());
});

test("destroy rejects queued Pokétwo sends", () => {
  const {
    CatchTwoRestManager,
    enqueuePoketwoSend,
    stoppedError,
  } = require("../src/services/queue.js");
  const rest = new CatchTwoRestManager("offline-test-token");
  let failure;
  enqueuePoketwoSend(rest, {
    channelId: "channel",
    payload: { content: `<@${POKETWO_ID}> c pikachu` },
    priority: 0,
    expiresAt: Date.now() + 10_000,
    resolve: () => {},
    reject: (error) => {
      failure = error;
    },
  });

  rest.destroy(stoppedError());

  assert.equal(rest._poketwoQueue.length, 0);
  assert.equal(failure.code, "CLIENT_STOPPED");
});

test("queue retries route-queue-full sends only up to the attempt limit", async () => {
  const { processPoketwoQueue } = require("../src/services/queue.js");

  const sleeps = [];
  let attempts = 0;
  let resolved = false;
  let failure;
  const restManager = {
    _poketwoQueue: [
      {
        channelId: "channel",
        payload: { content: "message" },
        priority: 2,
        expiresAt: Date.now() + 10_000,
        resolve: () => {
          resolved = true;
        },
        reject: (error) => {
          failure = error;
        },
      },
    ],
    _poketwoQueueProcessing: false,
    destroyed: false,
    sleep: async (ms) => {
      sleeps.push(ms);
    },
  };

  await processPoketwoQueue(restManager, async () => {
    attempts++;
    throw new RouteQueueFullError("route", 50);
  });

  assert.equal(attempts, 3);
  assert.deepEqual(sleeps, [250, 750]);
  assert.equal(resolved, false);
  assert.equal(failure.code, "ROUTE_QUEUE_FULL");
});

test("queue resolves on the first send without retrying", async () => {
  const { processPoketwoQueue } = require("../src/services/queue.js");

  const sleeps = [];
  const sent = { id: "message" };
  let attempts = 0;
  let resolvedWith;
  const restManager = {
    _poketwoQueue: [
      {
        channelId: "channel",
        payload: { content: "message" },
        priority: 2,
        expiresAt: Date.now() + 10_000,
        resolve: (value) => {
          resolvedWith = value;
        },
        reject: () => {},
      },
    ],
    _poketwoQueueProcessing: false,
    destroyed: false,
    sleep: async (ms) => {
      sleeps.push(ms);
    },
  };

  await processPoketwoQueue(restManager, async () => {
    attempts++;
    return sent;
  });

  assert.equal(attempts, 1);
  assert.deepEqual(sleeps, []);
  assert.equal(resolvedWith, sent);
});

test("a null response is a completed 204, not a dropped send", async () => {
  const { processPoketwoQueue } = require("../src/services/queue.js");
  let resolvedWith = "unset";
  const restManager = {
    _poketwoQueue: [
      queuedItem({
        resolve: (value) => {
          resolvedWith = value;
        },
      }),
    ],
    _poketwoQueueProcessing: false,
    destroyed: false,
    sleep: async () => {},
  };

  await processPoketwoQueue(restManager, async () => null);

  assert.equal(resolvedWith, null);
});

function queuedItem(overrides = {}) {
  return {
    channelId: "channel",
    payload: { content: "command" },
    priority: 2,
    expiresAt: Date.now() + 10_000,
    resolve: () => {},
    reject: () => {},
    ...overrides,
  };
}

test("poketwo payloads are classified by urgency", () => {
  const { classifyPayload } = require("../src/services/queue.js");

  assert.equal(classifyPayload({ content: `<@${POKETWO_ID}> c pikachu` }), 0);
  assert.equal(classifyPayload({ content: `<@${POKETWO_ID}> h` }), 1);
  assert.equal(classifyPayload({ content: `<@${POKETWO_ID}> hint` }), 1);
  assert.equal(
    classifyPayload({ content: `<@${POKETWO_ID}> incense buy 30m 10s -y` }),
    2
  );
});

test("expired catches are dropped instead of sent late", async () => {
  const { processPoketwoQueue } = require("../src/services/queue.js");

  let sent = false;
  let resolvedWith = "unset";
  const restManager = {
    _poketwoQueue: [
      queuedItem({
        priority: 0,
        expiresAt: Date.now() - 1,
        resolve: (value) => {
          resolvedWith = value;
        },
      }),
    ],
    _poketwoQueueProcessing: false,
    destroyed: false,
    sleep: async () => {},
  };

  await processPoketwoQueue(restManager, async () => {
    sent = true;
    return { id: "late" };
  });

  assert.equal(sent, false);
  assert.equal(resolvedWith, null);
});

test("catches are sent before queued commands", async () => {
  const { processPoketwoQueue } = require("../src/services/queue.js");

  const order = [];
  const restManager = {
    _poketwoQueue: [
      queuedItem({ priority: 2, payload: { content: "command" } }),
      queuedItem({ priority: 0, payload: { content: "catch" } }),
    ],
    _poketwoQueueProcessing: false,
    destroyed: false,
    sleep: async () => {},
  };

  await processPoketwoQueue(restManager, async (_channelId, payload) => {
    order.push(payload.content);
    return { id: payload.content };
  });

  assert.deepEqual(order, ["catch", "command"]);
});

test("a full lane evicts the least urgent item, never a catch", () => {
  const { enqueuePoketwoSend } = require("../src/services/queue.js");
  const restManager = { _poketwoQueue: [] };
  for (let index = 0; index < 40; index++) {
    restManager._poketwoQueue.push(queuedItem({ priority: 2 }));
  }

  const catchItem = queuedItem({ priority: 0 });
  assert.equal(enqueuePoketwoSend(restManager, catchItem), true);
  assert.equal(restManager._poketwoQueue.includes(catchItem), true);
  assert.equal(restManager._poketwoQueue.length, 40);
  assert.equal(
    restManager._poketwoQueue.filter((item) => item.priority === 0).length >= 1,
    true
  );
  const command = queuedItem({ priority: 2 });
  assert.equal(enqueuePoketwoSend(restManager, command), false);
});

test("spam enqueues at the lowest priority with a bounded buffer", () => {
  const {
    enqueueSpam,
    enqueuePoketwoSend,
  } = require("../src/services/queue.js");
  const restManager = { _poketwoQueue: [], _lastSentAt: {} };

  for (let index = 0; index < 3; index++) {
    assert.equal(
      enqueueSpam(restManager, "channel", { content: `spam ${index}` }),
      true
    );
  }
  assert.equal(enqueueSpam(restManager, "channel", { content: "x" }), false);
  assert.equal(restManager._poketwoQueue.length, 3);
  assert.ok(restManager._poketwoQueue.every((item) => item.priority === 3));
  assert.ok(restManager._poketwoQueue.every((item) => item.maxAttempts === 1));

  // A catch still gets in and evicts spam rather than being refused
  const catchItem = queuedItem({ priority: 0 });
  assert.equal(enqueuePoketwoSend(restManager, catchItem), true);
  assert.equal(restManager._poketwoQueue.includes(catchItem), true);
});

test("spam is dropped without retrying when the send is refused", async () => {
  const { processPoketwoQueue } = require("../src/services/queue.js");

  let attempts = 0;
  let onSent = 0;
  const restManager = {
    _poketwoQueue: [],
    _poketwoQueueProcessing: false,
    destroyed: false,
    _lastSentAt: {},
    sleep: async () => {},
  };
  restManager._poketwoQueue.push(
    queuedItem({
      priority: 3,
      expiresAt: Infinity,
      maxAttempts: 1,
      quietDrop: true,
      onSent: () => {
        onSent++;
      },
    })
  );

  await processPoketwoQueue(restManager, async () => {
    attempts++;
    throw new RouteQueueFullError("route", 50);
  });

  assert.equal(attempts, 1);
  assert.equal(onSent, 0);
});

test("spam does not delay a catch that arrives while it waits", async () => {
  const { processPoketwoQueue } = require("../src/services/queue.js");

  const order = [];
  const restManager = {
    _poketwoQueue: [],
    _poketwoQueueProcessing: false,
    destroyed: false,
    _lastSentAt: { 3: Date.now() },
    sleep: async () => {
      // Simulate the spacing window elapsing and enqueue a catch meanwhile
      restManager._lastSentAt[3] = 0;
      if (!restManager._poketwoQueue.some((item) => item.priority === 0)) {
        restManager._poketwoQueue.push(
          queuedItem({ priority: 0, payload: { content: "catch" } })
        );
      }
    },
  };
  restManager._poketwoQueue.push(
    queuedItem({
      priority: 3,
      payload: { content: "spam" },
      spacingMs: 5_000,
      expiresAt: Infinity,
      maxAttempts: 1,
      quietDrop: true,
    })
  );

  await processPoketwoQueue(restManager, async (_channelId, payload) => {
    order.push(payload.content);
    return { id: payload.content };
  });

  assert.deepEqual(order, ["catch", "spam"]);
});

test("queued spam is dropped when the state pauses", async () => {
  const { processPoketwoQueue } = require("../src/services/queue.js");

  let sent = false;
  let resolvedWith = "unset";
  const restManager = {
    _poketwoQueue: [],
    _poketwoQueueProcessing: false,
    destroyed: false,
    _lastSentAt: {},
    sleep: async () => {},
  };
  restManager._poketwoQueue.push(
    queuedItem({
      priority: 3,
      expiresAt: Infinity,
      maxAttempts: 1,
      quietDrop: true,
      shouldSend: () => false,
      resolve: (value) => {
        resolvedWith = value;
      },
    })
  );

  await processPoketwoQueue(restManager, async () => {
    sent = true;
    return { id: "spam" };
  });

  assert.equal(sent, false);
  assert.equal(resolvedWith, null);
});

test("successful spam reports through onSent once", async () => {
  const { processPoketwoQueue } = require("../src/services/queue.js");

  let onSent = 0;
  const restManager = {
    _poketwoQueue: [],
    _poketwoQueueProcessing: false,
    destroyed: false,
    _lastSentAt: {},
    sleep: async () => {},
  };
  restManager._poketwoQueue.push(
    queuedItem({
      priority: 3,
      expiresAt: Infinity,
      maxAttempts: 1,
      quietDrop: true,
      onSent: () => {
        onSent++;
      },
    })
  );

  await processPoketwoQueue(restManager, async () => ({ id: "spam" }));

  assert.equal(onSent, 1);
  assert.ok(restManager._lastSentAt[3] > 0);
});

test("the lane waits for the global rate limit before sending", async () => {
  const { processPoketwoQueue } = require("../src/services/queue.js");

  const sleeps = [];
  let restManager;
  restManager = {
    _poketwoQueue: [queuedItem({ priority: 0 })],
    _poketwoQueueProcessing: false,
    destroyed: false,
    getRouteKey: () => "route",
    rateLimits: new Map(),
    globalRateLimit: { reset: Date.now() + 2_500 },
    sleep: async (ms) => {
      sleeps.push(ms);
      restManager.globalRateLimit = null;
    },
  };

  let sent = 0;
  await processPoketwoQueue(restManager, async () => {
    sent++;
    return { id: "message" };
  });

  assert.equal(sent, 1);
  // Sleeps are chunked so a stop is noticed promptly
  assert.ok(sleeps.length >= 1);
  assert.ok(sleeps.every((ms) => ms <= 1_000));
});

test("IncenseMode disables spam", () => {
  const { shouldStartSpam } = require("../src/services/spam.js");

  assert.equal(
    shouldStartSpam({
      behavior: { Spamming: true },
      incense: { IncenseMode: true },
    }),
    false
  );
  assert.equal(
    shouldStartSpam({
      behavior: { Spamming: true },
      incense: { IncenseMode: false },
    }),
    true
  );
  assert.equal(
    shouldStartSpam({
      behavior: { Spamming: false },
      incense: { IncenseMode: false },
    }),
    false
  );
});
