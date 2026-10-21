const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const config = require("../../config.js");
const { sendLog } = require("./logging.js");

const preloadedEvents = [];
try {
  const files = fs.readdirSync(path.join(__dirname, "..", "events"));
  for (const file of files) {
    if (!file.endsWith(".js")) continue;
    try {
      const event = require(`../events/${file}`);
      if (event.name && typeof event.execute === "function") {
        preloadedEvents.push({ file, event });
      } else {
        console.log(
          `${chalk.redBright(`[EVENT]`)} Invalid event file: ${file}`
        );
      }
    } catch (error) {
      console.error(`Error preloading event ${file}:`, error);
    }
  }
} catch (error) {
  console.error("Error reading events directory:", error);
}

function listenEvents(client, guildId) {
  for (const { file, event } of preloadedEvents) {
    const handler = event.execute.bind(null, client, guildId);
    client.on(event.name, async (...args) => {
      if (client.stopped || client.suspended) return;
      try {
        await handler(...args);
      } catch (error) {
        const detail = config.debug && error.stack ? `\n${error.stack}` : "";
        sendLog(
          null,
          `Error in event ${chalk.yellow.bold(event.name)} (${file}): ${
            error.message || error
          }${detail}`,
          "error"
        );
      }
    });
    sendLog(
      null,
      `Listening for event: ${chalk.yellow.bold(event.name)} from ${file}`,
      "debug"
    );
  }
}

module.exports = { listenEvents };
