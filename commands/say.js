// Exporting a module with command details and an asynchronous function to be used in CatchTwo
module.exports = {
  // Command name that triggers the execution
  name: "say",
  // Alternative names for the command that can also trigger the execution
  aliases: ["repeat", "respond", "echo"],
  // The asynchronous function that executes when the command or its aliases are called
  async execute(client, message, args) {
    // Sends a message to the same channel where the command was used. The message content is the arguments joined with a space.
    message.channel.send(args.join(" ")).then(
      // After sending the message, reacts to the command message with a checkmark emoji to indicate successful execution
      message.react("✅")
    );
  },
};
