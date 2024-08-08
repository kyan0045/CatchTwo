const fs = require("fs-extra");
const messages = fs
  .readFileSync("./data/messages/spam.txt", "utf-8")
  .split("\n");
const { Permissions } = require("discord.js-selfbot-v13");
const { getSpamming, setSpamming } = require("../utils/states.js");
const config = require("../config.json");
const { sendLog } = require("./logging.js");

async function eventOpen(client, guildId) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;
  const channel = guild.channels.cache
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
  sendLog(
    client.user.username,
    `Action sent: attempting to play archery.`,
    "debug"
  );
  channel.send(`<@716390085896962058> event play archery`);
}

module.exports = { eventOpen };
