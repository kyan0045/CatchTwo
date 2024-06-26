// This module exports a command for CatchTwo that allows it to react to messages.
module.exports = {
  // Command name
  name: "react",
  // Command aliases
  aliases: ["reaction", "reactto"],
  // Asynchronous function that executes the command
  async execute(client, message, args) {
    let msg; // Variable to store the message to react to
    let emoji; // Variable to store the emoji to react with

    try {
      // If the first argument is a message ID and there is a second argument (emoji)
      if (args[0]?.length > 10 && args[1]) {
        // Fetch the message by ID from the same channel
        msg = await client.channels.cache
          .get(message.channelId)
          .messages.fetch(args[0]);

        // Set the emoji to the second argument
        emoji = args[1];
      } else if (args[0]?.length > 10 && !args[1]) {
        // If there's only one argument and it's a message ID or an emoji
        if (args[0].startsWith("<")) {
          // If it starts with "<", it's an emoji
          emoji = args[0];
          // Fetch the referenced message in the channel
          msg = await client.channels.cache
            .get(message?.reference.channelId)
            .messages.fetch(message?.reference?.messageId);
        } else {
          // Otherwise, fetch the message by ID from the same channel
          msg = await client.channels.cache
            .get(message.channelId)
            .messages.fetch(args[0]);
        }
      } else {
        // If no valid message ID or emoji is provided, fetch the referenced message
        msg = await client.channels.cache
          .get(message?.reference.channelId)
          .messages.fetch(message?.reference?.messageId);

        // If there's an argument, assume it's an emoji
        if (args[0]) {
          emoji = args[0];
        }
      }
    } catch (err) {
      // Log errors and send a reply if the message or emoji couldn't be processed
      console.error(err);
      message.reply(
        `Please reply to the message with the emoji, or specify a message ID.`
      );
    }

    // If a message was successfully fetched
    if (msg) {
      try {
        // If an emoji is specified and it's a custom emoji (length > 10)
        if (typeof emoji === "string" && emoji.length > 10) {
          msg.react(emoji); // React to the message with the specified emoji
        } else if (msg.reactions.cache.first()?._emoji) {
          // If no emoji is specified, react with the first emoji already on the message
          msg.react(msg.reactions.cache.first()._emoji);
        }
        // React to the command message with a checkmark to indicate success
        message.react("✅");
      } catch (err) {
        // If there's an error in reacting, react to the command message with an X and log the error
        message.react("❌");
        console.log(err);
      }
    }
  },
};
