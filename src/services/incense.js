const { POKETWO_ID, POKETWO_MENTION } = require("../constants.js");
const { getMentions, sendLog, sendWebhook } = require("./logging.js");

const WEBHOOK_AVATAR =
  "https://res.cloudinary.com/dppthk8lt/image/upload/ar_1.0,c_lpad/v1719331169/catchtwo_bjvlqi.png";
const PLACEHOLDER_CHANNELS = new Set(["ChannelID", "..."]);
const NO_SHARDS = "You don't have enough shards for that!";
const ALREADY_ACTIVE =
  "This channel already has an incense active! Please wait for it to end before purchasing another one.";

function normalizeIncenseChannels(value) {
  const values = Array.isArray(value) ? value : [value];
  const channels = values
    .filter((channel) => typeof channel === "string")
    .map((channel) => channel.trim())
    .filter((channel) => channel && !PLACEHOLDER_CHANNELS.has(channel));

  return [...new Set(channels)];
}

function getIncenseResponseReason(content) {
  if (typeof content !== "string") return null;
  if (content.includes(NO_SHARDS)) return "no-shards";
  if (content.includes(ALREADY_ACTIVE)) return "already-active";
  return null;
}

function isIncenseResponse(message) {
  return (
    message?.author?.id === POKETWO_ID &&
    getIncenseResponseReason(message.content) !== null
  );
}

async function buyIncense(channel, { timeout = 5000 } = {}) {
  const channelId = channel.id;
  const channelName = channel.name;
  try {
    // Attach the waiter before sending: Poketwo can answer before send() resolves.
    const responsePromise = channel.awaitMessage({
      filter: isIncenseResponse,
      time: timeout,
      errors: false,
    });

    const sent = await channel.send(
      `${POKETWO_MENTION} incense buy 30m 10s -y`
    );
    if (!sent)
      return {
        sent: null,
        response: null,
        reason: null,
        channelId,
        channelName,
      };

    const response = await responsePromise;
    return {
      sent,
      response,
      reason: getIncenseResponseReason(response?.content),
      channelId,
      channelName,
    };
  } catch (error) {
    return {
      sent: null,
      response: null,
      reason: null,
      channelId,
      channelName,
      error,
    };
  }
}

async function logIncenseResult(client, result) {
  const username = client.user?.username ?? "CatchTwo";
  let message;
  let type = "debug";
  let title;
  let color;

  if (result.error) {
    message = `Incense purchase failed: ${result.error.message || result.error}`;
    type = "error";
    title = "Incense purchase error";
    color = "#ED4245";
  } else if (!result.sent) {
    message = "Incense purchase was dropped before sending (route queue full).";
    type = "warning";
    title = "Incense purchase dropped";
    color = "#FEE75C";
  } else if (result.reason === "no-shards") {
    message = "Incense purchase failed: not enough shards.";
    type = "warning";
    title = "Incense purchase failed";
    color = "#FEE75C";
  } else if (result.reason === "already-active") {
    message = "Incense purchase skipped: an incense is already active.";
    type = "incense";
    title = "Incense purchase skipped";
    color = "#57F287";
  } else {
    message =
      "Incense purchase was not confirmed; keeping spam state unchanged.";
  }

  const channelLabel = result.channelId
    ? `(${
        result.channelName ? `${JSON.stringify(result.channelName)}, ` : ""
      }${result.channelId})`
    : null;
  sendLog(
    username,
    channelLabel ? `${message} ${channelLabel}` : message,
    type
  );
  if (type === "debug") return;

  const mentions = type === "incense" ? "" : getMentions();
  await sendWebhook(mentions || null, {
    title,
    description: `**Account:** ${username}\n${
      channelLabel ? `**Channel:** ${channelLabel}\n` : ""
    }${message}`,
    color,
    timestamp: new Date(),
    footer: {
      text: "CatchTwo by @kyan0045",
      icon_url: WEBHOOK_AVATAR,
    },
  });
}

module.exports = {
  buyIncense,
  logIncenseResult,
  normalizeIncenseChannels,
  getIncenseResponseReason,
  isIncenseResponse,
  NO_SHARDS,
  ALREADY_ACTIVE,
};
