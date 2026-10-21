const chalk = require("chalk");
const config = require("../../config.js");
const { sendLog, sendWebhook } = require("../services/logging.js");
const { setWaiting } = require("../services/states.js");
const {
  buyIncense,
  logIncenseResult,
  normalizeIncenseChannels,
} = require("../services/incense.js");

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

    // Report once, briefly after the last account becomes ready
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
    }, 1500);

    client.user.setStatus("invisible");
    if (
      config.incense.IncenseMode === true &&
      config.incense.AutoIncenseBuy === true
    ) {
      try {
        const channelIds = normalizeIncenseChannels(
          config.incense.IncenseChannel
        );
        if (channelIds.length === 0) {
          throw new Error("No valid incense channels configured.");
        }

        for (const channelId of channelIds) {
          const incenseChannel = await client.resolveChannel(channelId);
          if (!incenseChannel) {
            sendLog(
              client.user.username,
              `Could not resolve incense channel: ${channelId}`,
              "error"
            );
            continue;
          }

          const result = await buyIncense(incenseChannel);
          await logIncenseResult(client, result);
          if (result.reason) {
            setWaiting(client.user.id, false);
            if (result.reason === "no-shards") break;
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
