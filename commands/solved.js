const { setWaiting } = require("../utils/states");

// Exporting a module with command details and an asynchronous function to be used in CatchTwo
module.exports = {
  // Command name that triggers the execution
  name: "solved",
  // Alternative names for the command that can also trigger the execution
  aliases: ["resume", "captcha-solved", "done"],
  // The asynchronous function that executes when the command or its aliases are called
  async execute(client, message, args) {
    // Set the waiting state to false
    setWaiting(false);
    // React to the command message with a checkmark emoji to indicate successful execution
    await message.react("✅");
  },
};
