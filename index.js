// Importing necessary classes
const { Catcher } = require("./classes/clients/catcher.js");
const { ShinyHunter } = require("./classes/clients/shinyHunter.js");

// Importing necessary functions
const { createCatchers } = require("./functions/createCatchers.js");
const { sendLog, sendWebhook } = require("./functions/logging.js");
const { logMemoryUsage } = require("./utils/utils.js");

// Importing necessary modules
const chalk = require("chalk");
const config = require("./config.json");

// Main function to initialize and start the application
async function main() {
  // Dynamically importing the module to display images
  const displayImage = require("display-image");

  // Displaying the CatchTwo logo and welcome message
  await displayImage.fromFile("./data/logo.png").then((image) => {
    console.log(image);
    console.log(
      chalk.bold.yellow(`[${"WELCOME".toUpperCase()}]`) +
        ` - ` +
        chalk.yellow.bold("Welcome to CatchTwo!")
    );
  });

  // Sending a welcome message via webhook
  sendWebhook(null, {
    title: "Welcome to CatchTwo!",
    description: `If you need any help, please join our [Discord](https://discord.gg/RtnQavFVRq).`,
    color: "#fecd06",
    url: "https://github.com/kyan0045/CatchTwo",
    footer: {
      text: "CatchTwo by @kyan0045",
      icon_url:
        "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
    },
  });

  // Delayed execution to create catchers and log memory usage
  setTimeout(() => {
    createCatchers();
    logMemoryUsage();
  }, 500);
}

// Handling unhandled promise rejections
process.on("unhandledRejection", (reason, p) => {
  // Ignoring specific errors
  const ignoreErrors = [
    "MESSAGE_ID_NOT_FOUND",
    "INTERACTION_TIMEOUT",
    "BUTTON_NOT_FOUND",
  ];
  if (ignoreErrors.includes(reason.code || reason.message)) return;
  // Logging unhandled rejections
  sendLog(undefined, `Unhandled Rejection`, "error");
  console.log(reason, p);
});

// Handling uncaught exceptions
process.on("uncaughtException", (e, o) => {
  // Logging uncaught exceptions
  sendLog(undefined, `Uncaught Exception/Catch`, "error");
  console.log(e);
});

// Handling uncaught exceptions with a monitor (currently commented out)
/*process.on("uncaughtExceptionMonitor", (err, origin) => {
  sendLog(undefined, `Uncaught Exception/Catch (MONITOR)`, "error")
  console.log(err, origin);
}); */

// Handling multiple promise resolutions
process.on("multipleResolves", (type, promise, reason) => {
  // Logging multiple resolutions  sendLog(undefined, `Multiple Resolves`, "error");
  console.log(type, promise, reason);
});

// Executing the main function to start the application
main();
