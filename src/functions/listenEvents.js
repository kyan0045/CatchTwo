const fs = require("fs-extra");
const chalk = require("chalk");
const { sendLog } = require("./logging.js");

function listenEvents(client, guildId) {
  fs.readdir("./src/events/", (_err, files) => {
    files.forEach((file) => {
      if (!file.endsWith(".js")) return;

      const event = require(`../events/${file}`);

      let eventName;
      if (
        file.includes("catching") ||
        file.includes("commands") ||
        file.includes("misc") ||
        file.includes("event")
      ) {
        eventName = "messageCreate";
      } else eventName = file.split(".")[0];

      if (typeof event === "function") {
        const registeredEventName = eventName;
        client.on(registeredEventName, async (message) => {
          if (
            registeredEventName === "messageCreate" &&
            !client.getChannel(message.channelId)
          ) {
            await client.resolveChannel(message.channelId);
          }
          await event(client, guildId, message);
        });
        eventName = file.split(".")[0];
        sendLog(
          null,
          `Listening for event: ${chalk.yellow.bold(eventName)}`,
          "debug"
        );
      } else {
        console.log(
          `${chalk.redBright(`[EVENT]`)} Invalid event: ${eventName}`
        );
      }
    });
  });
}

module.exports = { listenEvents };
