const chalk = require("chalk");
const config = require("../config.json");

const { wait, randomInteger } = require("../utils/utils.js");
const { ShinyHunter } = require("../classes/clients/shinyHunter.js");
const { sendLog, sendCatch } = require("../functions/logging.js");
const {
  setSpamming,
  getSpamming,
  getWaiting,
  setWaiting,
} = require("../utils/states.js");

module.exports = async (client, guildId, message) => {
  if (
    config.ownership.OwnerIDs.includes(message.author.id) &&
    message.content.startsWith(config.ownership.CommandPrefix)
  ) {
    const args = message.content
      .slice(config.ownership.CommandPrefix.length)
      .trim()
      .split(/ +/);
    const command = args.shift().toLowerCase();

    const commandFile =
      client.commands.get(command) ||
      Array.from(client.commands.values()).find(
        (cmd) => cmd.aliases && cmd.aliases.includes(command)
      );

    try {
      webhook = await message.channel.fetchWebhooks();
    } catch (err) {
      if (err.code == "50013") {
        webhook = [];
        webhook[0] = config.logging.LogWebhook;
      } else {
        console.log(err);
      }
    }
    if (webhook.size <= 0) {
      webhook[0] = await message.channel.createWebhook("CatchTwo", {
        avatar:
          "https://cdn.discordapp.com/icons/1133853334944632832/1cb8326e5b0e60e40c8b830803604a6b.webp?size=96",
        reason: "CatchTwo Commands",
      });
    } else {
      if (webhook[0]?.url) webhook = webhook.map((w) => w.url);
    }

    if (commandFile) {
      commandFile.execute(client, message, args, webhook[0]);
    }
  }
};
