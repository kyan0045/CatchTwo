// Importing necessary modules and configurations
const chalk = require("chalk"); // Used for styling and coloring console output
const spam = require("../functions/spam.js"); // Importing a spam function
const config = require("../config.json"); // Loading configuration from JSON file
const { sendLog, sendWebhook } = require("../functions/logging.js"); // Importing logging functions

// Exporting an asynchronous function that will be executed when the client is ready
module.exports = async (client) => {
  // Sending a log message indicating the bot has logged in, with the username styled in red and bold
  sendLog(
    null,
    `Logged in to ${chalk.red.bold(`${client.user.username}`)}!`,
    "INFO"
  );
  // Sending a webhook message indicating the bot has logged in, with additional details
  sendWebhook(null, {
    title: `Logged in to ${client.user.username}!`, // Title of the webhook message
    color: "#60fca4", // Color of the webhook message
    url: "https://github.com/kyan0045/CatchTwo", // URL associated with the webhook message
    footer: {
      text: "CatchTwo by @kyan0045", // Footer text of the webhook message
      icon_url:
        "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png", // Footer icon URL
    },
  });
  // Setting the client's status to 'invisible'
  client.user.setStatus("invisible");
  // Checking if auto-buying incense is enabled in the configuration
  if (config.incense.AutoIncenseBuy == true) {
    // If enabled, sending a command in the specified channel to buy incense
    client.channels.cache
      .get(config.incense.IncenseChannel)
      .send(`<@716390085896962058> incense buy`);
  }
};
