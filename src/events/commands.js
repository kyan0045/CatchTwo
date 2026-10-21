const config = require("../../config.js");
const { sendLog } = require("../services/logging.js");

// Webhook URLs are cached per channel to avoid repeated API calls
const webhookCache = new Map();

module.exports = {
  name: "messageCreate",
  execute: async (client, guildId, message) => {
    // Commands are owner-only and may use the prefix or a direct mention
    if (
      (config.ownership.OwnerIDs.includes(message?.author.id) ||
        client.user.id === message?.author.id) &&
      (message.content.startsWith(config.ownership.CommandPrefix) ||
        message.content.startsWith(`<@${client.user.id}>`))
    ) {
      const prefix = message.content.startsWith(config.ownership.CommandPrefix)
        ? config.ownership.CommandPrefix
        : `<@${client.user.id}>`;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      const commandFile =
        client.commands.get(command) ||
        Array.from(client.commands.values()).find(
          (cmd) => cmd.aliases && cmd.aliases.includes(command)
        );

      if (!commandFile) return;

      let webhookUrl = null;

      // Only resolve webhooks for commands that render through them
      const commandsUsingWebhook = ["help", "restart", "stats", "version"];
      if (commandsUsingWebhook.includes(commandFile.name)) {
        webhookUrl = webhookCache.get(message.channel.id);

        if (!webhookUrl) {
          try {
            const webhooks = await message.channel.fetchWebhooks();
            if (webhooks.length > 0) {
              webhookUrl = webhooks[0].url;
            } else {
              const newWebhook = await message.channel.createWebhook(
                "CatchTwo",
                {
                  avatar:
                    "https://res.cloudinary.com/dppthk8lt/image/upload/ar_1.0,c_lpad,w_1.5/v1719331169/catchtwo_bjvlqi.png",
                  reason: "CatchTwo Commands",
                }
              );
              webhookUrl = newWebhook.url;
            }
            webhookCache.set(message.channel.id, webhookUrl);
          } catch (err) {
            // Missing Manage Webhooks permission: fall back to the log webhook
            if (Number(err.code) === 50013) {
              webhookUrl = config.logging.LogWebhook;
            } else {
              sendLog(
                null,
                `Error fetching/creating webhook: ${err.message || err}`,
                "error"
              );
            }
          }
        }
      }

      try {
        await commandFile.execute(client, message, args, webhookUrl);
      } catch (err) {
        sendLog(
          null,
          `Error executing command ${commandFile.name}: ${err.message || err}`,
          "error"
        );
      }
    }
  },
};
