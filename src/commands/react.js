const { sendLog } = require("../services/logging.js");

module.exports = {
  name: "react",
  aliases: ["reaction", "reactto"],
  async execute(client, message, args) {
    let msg;
    let emoji;

    try {
      // Accept "messageID emoji", "messageID" (reuse its first reaction), or a reply with an optional emoji.
      if (args[0]?.length > 10 && args[1]) {
        msg = await message.channel.fetchMessage(args[0]);

        emoji = args[1];
      } else if (args[0]?.length > 10 && !args[1]) {
        if (args[0].startsWith("<")) {
          emoji = args[0];
          msg = await message.fetchReference().catch(() => null);
        } else {
          msg = await message.channel.fetchMessage(args[0]);
        }
      } else {
        msg = await message.fetchReference().catch(() => null);

        if (args[0]) {
          emoji = args[0];
        }
      }
    } catch (err) {
      sendLog(
        client?.user?.username,
        `React command failed: ${err.message || err}`,
        "error"
      );
      return message.reply(
        `Please reply to the message with the emoji, or specify a message ID.`
      );
    }

    if (msg) {
      try {
        if (typeof emoji === "string" && emoji.length > 0) {
          await msg.react(emoji);
        } else if (msg.reactions?.[0]) {
          await msg.react(
            msg.reactions[0]._emoji ??
              msg.reactions[0].emoji ??
              msg.reactions[0]
          );
        } else {
          return message.reply(
            "No emoji was provided or found on that message."
          );
        }
        await message.react("✅");
      } catch (err) {
        await message.react("❌").catch(() => null);
        sendLog(
          client?.user?.username,
          `React command failed: ${err.message || err}`,
          "error"
        );
      }
    } else {
      return message.reply(
        "Please reply to a message or provide a message ID."
      );
    }
  },
};
