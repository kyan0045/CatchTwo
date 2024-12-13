const { setWaiting } = require("../utils/states");
const { clients } = require("../classes/clients/catcher");

// Exporting a module with command details and an asynchronous function to be used in CatchTwo
module.exports = {
  // Command name that triggers the execution
  name: "resume",
  // Alternative names for the command that can also trigger the execution
  aliases: ["solved", "captcha-solved", "done"],
  // The asynchronous function that executes when the command or its aliases are called
  async execute(client, message, args) {
    if (!args.length) {
      // No arguments provided, set all accounts to resume
      clients.forEach((client) => {
        setWaiting(client.user.username, false);
      });
    } else {
      // Argument provided, check if it's a user ID or mention
      let userId = args[0];
      if (userId.startsWith('<@') && userId.endsWith('>')) {
        // If it's a mention, extract the user ID
        userId = userId.slice(2, -1);
        if (userId.startsWith('!')) {
          userId = userId.slice(1);
        }
      }
      // Fetch the user by ID and set their account to resume
      const user = client.users.cache.get(userId);
      if (user) {
        setWaiting(user.username, false);
      } else {
        // If the user is not found, send an error message
        return message.reply("That user was not found in this CatchTwo instance.");
      }
    }
    // React to the command message with a checkmark emoji to indicate successful execution
    await message.react("✅");
  },
};