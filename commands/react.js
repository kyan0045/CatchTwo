module.exports = {
  name: "react",
  aliases: ["reaction", "reactto"],
  async execute(client, message, args) {
    let msg;
    let emoji;

    try {
      if (args[0]?.length > 10 && args[1]) {
        msg = await client.channels.cache
          .get(message.channelId)
          .messages.fetch(args[0]);

        if (args[1]) {
          emoji = args[1];
        }
      } else if (args[0]?.length > 10 && !args[1]) {
        if (args[0].startsWith("<")) {
          emoji = args[0];
          msg = await client.channels.cache
            .get(message?.reference.channelId)
            .messages.fetch(message?.reference?.messageId);
        } else {
          msg = await client.channels.cache
            .get(message.channelId)
            .messages.fetch(args[0]);
        }
      } else {
        msg = await client.channels.cache
          .get(message?.reference.channelId)
          .messages.fetch(message?.reference?.messageId);

        if (args[0]) {
          emoji = args[0];
        }
      }
    } catch (err) {
      console.error(err);
      message.reply(
        `Please reply to the message with the emoji, or specify a message ID.`
      );
    }

    if (msg) {
      try {
        if (typeof emoji === "string" && emoji.length > 10) {
          msg.react(emoji);
        } else if (msg.reactions.cache.first()?._emoji) {
          msg.react(msg.reactions.cache.first()._emoji);
        }
        message.react("✅");
      } catch (err) {
        message.react("❌");
        console.log(err);
      }
    }
  },
};
