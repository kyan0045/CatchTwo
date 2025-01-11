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
      clients.forEach((client) => {
        setWaiting(client.user.username, true);
      });
      await message.react("✅");
    } else {
      // Argument provided, check if it's a user ID or mention
      let userId = args[0];
      if (userId.startsWith("<@") && userId.endsWith(">")) {
        // If it's a mention, extract the user ID
        userId = userId.slice(2, -1);
        if (userId.startsWith("!")) {
          userId = userId.slice(1);
        }
      }
      // Fetch the user by ID and set their account to waiting
      const user = client.users.cache.get(userId);
      if (!clients.find((c) => c.user.username === user.username)) return message.reply("That user is not a CatchTwo catcher running in this instance.");
      if (user) {
        setWaiting(user.username, true);
        await message.react("✅");
      } else {
        // If the user is not found, send an error message
        return message.reply(
          "That user was not found in this CatchTwo instance."
        );
      }
    }
    // React to the command message with a checkmark emoji to indicate successful execution
  },
};
