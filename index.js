const { Catcher } = require("./classes/clients/catcher.js");
const { ShinyHunter } = require("./classes/clients/shinyHunter.js");

const { createCatchers } = require("./functions/createCatchers.js");

const config = require("./config.json");
const { sendLog, sendWebhook } = require("./functions/logging.js");
const { logMemoryUsage } = require("./utils/utils.js");
const chalk = require("chalk");

async function main() {
  const displayImage = require("display-image");

  await displayImage.fromFile("./data/logo.png").then((image) => {
    console.log(image);
    console.log(
      chalk.bold.yellow(`[${"WELCOME".toUpperCase()}]`) +
        ` - ` +
        chalk.yellow.bold("Welcome to CatchTwo!")
    );
  });
    sendWebhook(null, {
      title: "Welcome to CatchTwo!",
      description: `If you need any help, please join our [Discord](https://discord.gg/RtnQavFVRq).`,
      color: "#fecd06",
      url: "https://github.com/kyan0045/CatchTwo",
      footer: {
        text: "CatchTwo by @kyan0045",
        icon_url:
          "https://cdn.discordapp.com/icons/1133853334944632832/1cb8326e5b0e60e40c8b830803604a6b.webp?size=96",
      },
    });

  setTimeout(() => {
    createCatchers();
    logMemoryUsage();
  }, 500);
}

process.on("unhandledRejection", (reason, p) => {
  const ignoreErrors = [
    "MESSAGE_ID_NOT_FOUND",
    "INTERACTION_TIMEOUT",
    "BUTTON_NOT_FOUND",
  ];
  if (ignoreErrors.includes(reason.code || reason.message)) return;
  sendLog(
    undefined,
    `Unhandled Rejection`,
    "error"
  );
  console.log(reason, p);
});

process.on("uncaughtException", (e, o) => {
  sendLog(undefined, `Uncaught Exception/Catch`, "error")
  console.log(e);
});

/* process.on("uncaughtExceptionMonitor", (err, origin) => {
  sendLog(undefined, `Uncaught Exception/Catch (MONITOR)`, "error")
  console.log(err, origin);
}); */

process.on("multipleResolves", (type, promise, reason) => {
  sendLog(undefined, `Multiple Resolves`, "error")
  console.log(type, promise, reason);
});


main();
