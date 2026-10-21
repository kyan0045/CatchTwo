const chalk = require("chalk");
const config = require("../../config.js");
const { sendLog, sendWebhook } = require("../services/logging.js");
const { setWaiting } = require("../services/states.js");
const { POKETWO_MENTION } = require("../constants.js");

let accountReadyCount = 0;
let timer;

module.exports = {
  name: "ready",
  execute: async (client) => {
    sendLog(
      null,
      `Logged in to ${chalk.red.bold(`${client.user.username}`)}!`,
      "INFO"
    );

    // Report once, five seconds after the last account becomes ready
    accountReadyCount++;
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      sendWebhook(null, {
        title: `Logged into ${accountReadyCount} accounts!`,
        color: "#60fca4",
        url: "https://github.com/kyan0045/CatchTwo",
        footer: {
          text: "CatchTwo by @kyan0045",
          icon_url:
            "https://res.cloudinary.com/dppthk8lt/image/upload/ar_1.0,c_lpad/v1719331169/catchtwo_bjvlqi.png",
        },
      });
      accountReadyCount = 0;
    }, 5000);

    client.user.setStatus("invisible");
    if (
      config.incense.IncenseMode === true &&
      config.incense.AutoIncenseBuy === true
    ) {
      try {
        const incenseChannel = await client.resolveChannel(
          config.incense.IncenseChannel
        );

        if (!incenseChannel) {
          throw new Error(
            `Could not resolve incense channel: ${config.incense.IncenseChannel}`
          );
        }

        const sent = await incenseChannel.send(
          `${POKETWO_MENTION} incense buy 30m 10s -y`
        );
        if (!sent) {
          // A dropped send means no purchase happened; keep the current spam state
          sendLog(
            client.user.username,
            "Incense purchase was dropped before sending (route queue full).",
            "warning"
          );
        } else {
          const msg = await incenseChannel.awaitMessage({
            filter: (message) =>
              message.content.includes(
                "You don't have enough shards for that!"
              ) ||
              message.content.includes(
                "This channel already has an incense active! Please wait for it to end before purchasing another one."
              ),
            time: 5000,
            errors: false,
          });

          if (msg?.content.includes("You don't have enough shards for that!")) {
            setWaiting(client.user.id, false);
          } else if (
            msg?.content.includes(
              "This channel already has an incense active! Please wait for it to end before purchasing another one."
            )
          ) {
            setWaiting(client.user.id, false);
          } else {
            sendLog(
              client.user.username,
              "Incense purchase was not confirmed; keeping spam state unchanged.",
              "debug"
            );
          }
        }
      } catch (error) {
        sendLog(
          client.user.username,
          `Automatic incense setup failed: ${error.message}`,
          "error"
        );
      }
    }

    const { catchers } = require("../services/createCatchers.js");
    const catcher = catchers.find((catcher) => catcher.token === client.token);

    if (!catcher) return;

    catcher.start();
  },
};
