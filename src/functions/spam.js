// Importing necessary modules and configurations
const fs = require("fs-extra");
const messages = fs
  .readFileSync("./src/data/messages/spam.txt", "utf-8")
  .split("\n")
  .filter((message) => message.length > 0);
const { Permissions } = require("discord.js-selfbot-v13");
const { setSpamming, getSpamming, getWaiting } = require("../utils/states.js");
const config = require("../../config.js");
const { sendLog } = require("./logging.js");
const { addStat } = require("../utils/stats.js");

function spam(client, guildId) {
  if (config.behavior.Spamming == false) return;
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return sendLog(client.user.username, `Guild not found`, "error");
  let channel = guild.channels.cache.get(config.spamming.SpamChannel);
  if (!channel) {
    channel = guild.channels.cache
      .filter(
        (channel) =>
          channel.type === "GUILD_TEXT" &&
          channel.name.includes("spam") &&
          channel
            .permissionsFor(guild.members.me)
            .has([
              Permissions.FLAGS.VIEW_CHANNEL,
              Permissions.FLAGS.SEND_MESSAGES,
            ])
      )
      .first();
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
