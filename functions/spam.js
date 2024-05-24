const fs = require("fs-extra");
const messages = fs
  .readFileSync("./data/messages/spam.txt", "utf-8")
  .split("\n");
const { Permissions } = require("discord.js-selfbot-v13");
const { setSpamming, getSpamming, getWaiting } = require("../utils/states.js");
const config = require("../config.json");
const { sendLog } = require("./logging.js");

function spam(client, guildId) {
  if (config.behavior.Spamming == false) return;
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;
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

  if (!channel) return;
  if (getSpamming() !== false) {
    setSpamming(true);
  } else {
    return;
  }
  sendLog(client.user.username, `Action sent: started spamming`, "debug");

  setInterval(() => {
    if (getSpamming() == false || getWaiting() == true) return;
    const message = messages[Math.floor(Math.random() * messages.length)];
    channel.send(message);
  }, config.spamming.SpamSpeed);

  return channel.id;
}

module.exports = { spam };
