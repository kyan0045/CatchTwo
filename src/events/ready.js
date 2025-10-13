// Importing necessary modules and configurations
const chalk = require("chalk"); // Used for styling and coloring console output
const config = require("../../config.js"); // Loading configuration from JSON file
const { sendLog, sendWebhook } = require("../functions/logging.js"); // Importing logging functions

let accountReadyCount = 0; // Initialize counter
let timer; // To keep track of the timer

// Exporting an asynchronous function that will be executed when the client is ready
module.exports = async (client) => {
  // Sending a log message indicating the bot has logged in, with the username styled in red and bold
  sendLog(
    null,
    `Logged in to ${chalk.red.bold(`${client.user.username}`)}!`,
    "INFO"
  );

  // Increment and manage timer
  accountReadyCount++; // Increment counter when an account is ready
  if (timer) clearTimeout(timer); // If timer exists, clear it to reset the countdown

  timer = setTimeout(() => {
    // Start or reset a 5-second timer
    // This code runs after 5 seconds of the last account becoming ready
    sendWebhook(null, {
      title: `Logged into ${accountReadyCount} accounts!`, // Send the count of ready accounts
      color: "#60fca4",
      url: "https://github.com/kyan0045/CatchTwo",
      footer: {
        text: "CatchTwo by @kyan0045",
        icon_url:
          "https://res.cloudinary.com/dppthk8lt/image/upload/ar_1.0,c_lpad/v1719331169/catchtwo_bjvlqi.png",
      },
    });
    accountReadyCount = 0; // Reset counter after sending the message
  }, 5000); // Wait for 5 seconds

  // Setting the client's status to 'invisible'
  client.user.setStatus("invisible");
  // Checking if auto-buying incense is enabled in the configuration
  if (config.incense.AutoIncenseBuy == true) {
    // If enabled, sending a command in the specified channel to buy incense
    let incenseChannel = client.channels.cache
      .get(config.incense.IncenseChannel)
      .send(`<@716390085896962058> incense buy 30m 10s -y`);
    await incenseChannel
      .createMessageCollector({ time: 5000 })
      .on("collect", async (msg) => {
        if (msg.content.includes("You don't have enough shards for that!")) {
          setSpamming(client.user.id, true);
          setWaiting(client.user.id, false);
        } else if (
          msg.content.includes(
            "This channel already has an incense active! Please wait for it to end before purchasing another one."
          )
        ) {
          setSpamming(client.user.id, false);
          setWaiting(client.user.id, false);
        }
      });
  }

  const { catchers } = require("../functions/createCatchers.js"); // Importing the catchers
  const catcher = catchers.find((catcher) => catcher.token === client.token); // Finding the correct catcher
  catcher.start(); // Starting the catcher
};
