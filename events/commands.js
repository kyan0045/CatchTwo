// Importing necessary modules and configurations
const chalk = require("chalk"); // Used for styling and coloring console output
const config = require("../config.json"); // Loading configuration from JSON file

// Importing utility functions and classes
const { wait, randomInteger } = require("../utils/utils.js"); // Utility functions for waiting and generating random integers
const { ShinyHunter } = require("../classes/clients/shinyHunter.js"); // ShinyHunter class, not used in this snippet
const { sendLog, sendCatch } = require("../functions/logging.js"); // Logging functions
const {
  setSpamming,
  getSpamming,
  getWaiting,
  setWaiting,
} = require("../utils/states.js"); // State management functions

// The main function that handles new messages
module.exports = async (client, guildId, message) => {
  // Checking if the message author is an owner and if the message starts with the command prefix
  if (
    config.ownership.OwnerIDs.includes(message.author.id) &&
    message.content.startsWith(config.ownership.CommandPrefix)
  ) {
    // Parsing the command and arguments from the message
    const args = message.content
      .slice(config.ownership.CommandPrefix.length)
      .trim()
      .split(/ +/);
    const command = args.shift().toLowerCase();

    // Attempting to find the command file from the client's command collection
    const commandFile =
      client.commands.get(command) ||
      Array.from(client.commands.values()).find(
        (cmd) => cmd.aliases && cmd.aliases.includes(command)
      );

    // Attempting to fetch existing webhooks in the channel
    try {
      webhook = await message.channel.fetchWebhooks();
    } catch (err) {
      // Handling errors, specifically the lack of permissions
      if (err.code == "50013") {
        // If the bot lacks permissions, use a predefined webhook from the config
        webhook = [];
        webhook[0] = config.logging.LogWebhook;
      } else {
        // Log any other errors
        console.log(err);
      }
    }
    // If no webhooks exist, create a new one for CatchTwo commands
    if (webhook?.size <= 0 || !webhook) {
      try {
      webhook[0] = await message.channel.createWebhook("CatchTwo", {
        avatar:
          "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
        reason: "CatchTwo Commands",
      });
    } catch (error) {
      message.reply("I don't have permission to create a webhook, a webhook is necessary for this particular command to work.");
      throw new Error("No webhook found and unable to create one.");
    }
    } else {
      // If webhooks exist, map the collection to their URLs
      if (webhook[0]?.url) webhook = webhook.map((w) => w.url);
    }

    // If a command file is found, execute the command with the provided arguments and webhook
    if (commandFile) {
      commandFile.execute(client, message, args, webhook[0]);
    }
  }
};
