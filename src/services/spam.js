const fs = require("fs-extra");
const path = require("path");
const messages = fs
  .readFileSync(
    path.join(__dirname, "..", "data", "messages", "spam.txt"),
    "utf-8"
  )
  .split(/\r?\n/)
  .filter((message) => message.length > 0);
const { Permissions } = require("discord-self-lite");
const { setSpamming, getSpamming, getWaiting } = require("./states.js");
const config = require("../../config.js");
const { sendLog } = require("./logging.js");
const { enqueueSpam } = require("./queue.js");
const { addStat } = require("./stats.js");

function shouldStartSpam(settings = config) {
  return (
    settings.behavior?.Spamming !== false &&
    settings.incense?.IncenseMode !== true
  );
}

async function spam(client, guildId) {
  if (client.stopped || client.suspended) return;
  if (!shouldStartSpam()) {
    if (config.incense?.IncenseMode === true) {
      setSpamming(client.user.id, false);
      sendLog(
        client.user.username,
        "Spamming disabled while IncenseMode is enabled.",
        "incense"
      );
    }
    return;
  }
  const guild = await client.fetchGuild(guildId);
  if (!guild) return sendLog(client.user.username, `Guild not found`, "error");

  let channel;

  if (config.spamming.SpamChannel) {
    channel = await client.fetchChannel(config.spamming.SpamChannel);
  } else {
    const channels = await guild.fetchChannels();
    channel = channels.find(
      (channel) =>
        channel.type === 0 &&
        channel.name.includes("spam") &&
        channel
          .permissionsFor(guild.members.me)
          .has([
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.SEND_MESSAGES,
          ])
    );
  }

  if (client.stopped || client.suspended) return;
  if (!channel)
    return sendLog(
      client.user.username,
      `No spam channel found, please create a channel called "spam"`,
      "error"
    );
  const shouldSpam = getSpamming(client.user.id) !== false;
  if (shouldSpam) {
    setSpamming(client.user.id, true);
    sendLog(client.user.username, `Action sent: started spamming`, "debug");
  }

  // Queue at the lowest priority; the shared lane decides when it goes out.
  if (client.spamInterval) {
    clearInterval(client.spamInterval);
  }

  client.spamInterval = setInterval(() => {
    const userId = client.user?.id;
    if (!userId) return;
    if (
      !shouldStartSpam() ||
      getSpamming(userId) === false ||
      getWaiting(userId) === true
    )
      return;

    const message = messages[Math.floor(Math.random() * messages.length)];
    enqueueSpam(
      client.rest,
      channel.id,
      { content: message },
      {
        spacingMs: config.spamming.SpamSpeed,
        // Re-checked at send time so a pause also applies to queued messages
        shouldSend: () =>
          shouldStartSpam() &&
          getSpamming(userId) !== false &&
          getWaiting(userId) !== true,
        onSent: () => addStat(userId, "spamMessages"),
      }
    );
  }, config.spamming.SpamSpeed);

  return channel.id;
}

module.exports = { spam, shouldStartSpam };
