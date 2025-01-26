const { MessageAttachment } = require("discord.js-selfbot-v13");

// This module exports a "eval" command for CatchTwo. It allows the selfbot to evaluate a piece of code.
module.exports = {
  name: "eval", // Command name
  aliases: ["evaluate"], // Command aliases for easier access
  // Asynchronous function to handle the command execution
  async execute(client, message, args) {
    const { clients } = require("../classes/catcher.js");

    if (args.length === 0) {
      // If no arguments are provided, inform the user to specify code
      return message.reply("Please specify code to evaluate.");
    }

    // Join the arguments into a single string
    const code = args.join(" ");
    let result;

    try {
      // Attempt to evaluate the code
      result = await eval(code);
    } catch (err) {
      // If an error occurs, log it and inform the user
      console.error(err);
      return message.reply(
        `An error occurred while evaluating the code:\n\`${err}\``
      );
    }

    // If the result is a Promise, await it
    if (result instanceof Promise) {
      result = await result;
    }

    // Format the result for display
    result = require("util").inspect(result, { depth: 0 });

    // If the result is too long, upload it as a file

    if (result.length > 2000) {
      const buffer = Buffer.from(result, "utf8");
      const attachment = new MessageAttachment(buffer, "result.js");
      return message.reply({
        content: "The result was too long to send in a message.",
        files: [attachment],
      });
    } else {
      // Send the result as a message
      return message.reply(`\`\`\`js\n${result}\n\`\`\``);
    }
  },
};