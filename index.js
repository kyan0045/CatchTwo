
// Importing necessary functions
const tf = require("@tensorflow/tfjs-node");
const { createCatchers } = require("./src/functions/createCatchers.js");
const { sendLog, sendWebhook } = require("./src/functions/logging.js");
const { logMemoryUsage, memoryUsage } = require("./src/utils/utils.js");

// Importing necessary modules
const chalk = require("chalk");
const fs = require("fs-extra");

// Importing package.json
const package = require("./package.json");

// Main function to initialize and start the application
async function main() {
  const figlet = require("figlet");
  const gradient = await import('gradient-string').then(({default: gradient}) => gradient);

  // Displaying the CatchTwo logo
  await figlet.text(
    "CatchTwo",
    {
      font: "Standard",
      horizontalLayout: "fitted",
      verticalLayout: "default",
    },
    async function (err, data) {
      if (err) {
        console.log("Something went wrong...");
        console.dir(err);
        return;
      } 
      console.log(gradient.fruit(data));
    } 
  );  

  // Extract version
  const version = package.version;

  // Displaying the CatchTwo logo and welcome message
  console.log(
    chalk.bold.yellow(`[${"WELCOME".toUpperCase()}]`) +
      ` - ` +
      chalk.yellow.bold(`Welcome to CatchTwo!`)
  );

  // Log the current version with a nicer color
  console.log(
    chalk.bold.cyan(`[VERSION]`) +
      ` - ` +
      chalk.cyan(
        `Version ${chalk.bold(version)}, by ${chalk.bold(`@kyan0045`)}`
      )
  );

  // Sending a welcome message via webhook
  sendWebhook(null, {
    title: "Welcome to CatchTwo!",
    description: `If you need any help, please join our [Discord](https://discord.gg/RtnQavFVRq).`,
    color: "#fecd06",
    url: "https://github.com/kyan0045/CatchTwo",
    footer: {
      text: "CatchTwo by @kyan0045, version " + version,
      icon_url:
        "https://res.cloudinary.com/dppthk8lt/image/upload/ar_1.0,c_lpad/v1719331169/catchtwo_bjvlqi.png",
    },
    thumbnail: {
      url: "https://res.cloudinary.com/dppthk8lt/image/upload/c_scale,h_50,w_64/v1719331169/catchtwo_bjvlqi.png",
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
