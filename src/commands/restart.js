const { sendCommandWebhook, sendLog } = require("../services/logging.js");

module.exports = {
  name: "restart",
  aliases: ["reboot", "reload"],
  async execute(client, message, args, webhook) {
    try {
      await sendCommandWebhook(webhook, `<@${message.author.id}>`, {
        title: "CatchTwo Restart",
        description: "Bot is restarting...",
        color: "#E74C3C",
        timestamp: new Date(),
      });

      const { catchers } = require("../services/createCatchers.js");
      for (const catcher of [...catchers]) {
        try {
          catcher.destroy();
        } catch (error) {
          sendLog(
            client?.user?.username,
            `Error destroying catcher during restart: ${error.message || error}`,
            "error"
          );
        }
      }

      // Exit 0 so the launcher restarts the process
      process.exit(0);
    } catch (error) {
      sendLog(
        client?.user?.username,
        `Error during restart: ${error.message || error}`,
        "error"
      );

      await sendCommandWebhook(webhook, `<@${message.author.id}>`, {
        title: "Restart Error",
        description: "Failed to restart the bot.",
        color: "#E74C3C",
        timestamp: new Date(),
      });
    }
  },
};
