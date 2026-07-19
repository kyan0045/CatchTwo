// Importing necessary modules and configurations
const fs = require("fs-extra");
const messages = fs
  .readFileSync("./src/data/messages/spam.txt", "utf-8")
  .split("\n")
  .filter((message) => message.length > 0);
const { Permissions } = require("discord-self-lite");
const { setSpamming, getSpamming, getWaiting } = require("../utils/states.js");
const config = require("../../config.js");
const { sendLog } = require("./logging.js");
const { addStat } = require("../utils/stats.js");

function spam(client, guildId) {
  if (config.behavior.Spamming == false) return;
  const guild = client.getGuild(guildId);
  if (!guild) return sendLog(client.user.username, `Guild not found`, "error");
  let channel = client.getChannel(config.spamming.SpamChannel);
  if (!channel) {
    channel = guild
      .getChannels()
      .find(
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

  if (!channel) return sendLog(client.user.username, `No spam channel found, please create a channel called "spam"`, "error");
  if (getSpamming(client.user.id) !== false) {
    setSpamming(client.user.id, true);
  } else {
    return;
  }
  sendLog(client.user.username, `Action sent: started spamming`, "debug");

  setInterval(() => {
    if (getSpamming(client.user.id) == false || getWaiting(client.user.id) == true) return;
    const message = messages[Math.floor(Math.random() * messages.length)];
    channel.send(message);
    addStat(client.user.username, "spamMessages");
  }, config.spamming.SpamSpeed);

  return channel.id;
}

module.exports = { spam };
