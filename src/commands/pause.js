const { setWaiting } = require("../utils/states");
const { clients } = require("../classes/catcher.js");

// Exporting a module with command details and an asynchronous function to be used in CatchTwo
module.exports = {
  // Command name that triggers the execution
  name: "pause",
  // Alternative names for the command that can also trigger the execution
  aliases: ["pause", "wait", "stop"],
  // The asynchronous function that executes when the command or its aliases are called
  async execute(client, message, args) {
    if (!args.length) {
      // No arguments provided, set all accounts to waiting
      clients.forEach((c) => {
        setWaiting(c.user.username, true);
      });
      await message.react("✅");
      return;
    }

    // Argument provided, parse an ID (supports raw ID or <@id> / <@!id> mention)
    let userId = args[0];
    const mentionMatch = /^<@!?(\d+)>$/.exec(userId);
    if (mentionMatch) {
      userId = mentionMatch[1];
    }

    // Find the catcher client by ID
    const catcher = clients.find((c) => c.user.id === userId);
    if (!catcher) {
      return message.reply("That user is not a CatchTwo catcher running in this instance.");
    }

    setWaiting(catcher.user.username, true);
    await message.react("✅");
  },
};