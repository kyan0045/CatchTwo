const chalk = require("chalk");
const spam = require("../functions/spam.js");
const { sendLog, sendWebhook } = require("../functions/logging.js");

module.exports = async (client) => {
  sendLog(
    null,
    `Logged in to ${chalk.red.bold(`${client.user.username}`)}!`,
    "INFO"
  );
  sendWebhook(null, {
    title: `Logged in to ${client.user.username}!`,
    color: "#60fca4",
    url: "https://github.com/kyan0045/CatchTwo",
    footer: {
      text: "CatchTwo by @kyan0045",
      icon_url:
        "https://cdn.discordapp.com/icons/1133853334944632832/1cb8326e5b0e60e40c8b830803604a6b.webp?size=96",
    },
  });
  client.user.setStatus("invisible");
  if (config.incense.AutoIncenseBuy == true) {
    client.channels.cache
      .get(config.incense.IncenseChannel)
      .send(`<@716390085896962058> buy incense`);
  }
};
