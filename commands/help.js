const { sendCommandWebhook } = require("../functions/logging.js");
const config = require("../config.json");

module.exports = {
  name: "help",
  aliases: ["commands", "commandlist"],
  async execute(client, message, args, webhook) {
    sendCommandWebhook(webhook, `<@${message.author.id}>`, {
      title: "CatchTwo Command Help",
      footer: "©️ CatchTwo ~ @kyan0045",
      url: "https://github.com/kyan0045/CatchTwo",
      description:
        "CatchTwo is a simple and easy to use PokéTwo selfbot, you can find available commands below.",
      fields: [
        {
          name: `${config.ownership.CommandPrefix}help`,
          value: "This is the command you're looking at right now.",
          inline: true,
        },
        {
          name: `${config.ownership.CommandPrefix}say`,
          value:
            "This can be used to make the selfbot repeat a message you specify.",
          inline: true,
        },
        {
          name: `${config.ownership.CommandPrefix}click`,
          value:
            "This can be used to make the selfbot click a button you specify.",
          inline: true,
        },
        {
          name: `${config.ownership.CommandPrefix}react`,
          value:
            "This can be used to make the selfbot react to a message you specify.",
          inline: true,
        },
        {
          name: `${config.ownership.CommandPrefix}restart`,
          value: "This can be used to make the selfbot restart.",
          inline: true,
        },
        {
          name: `${config.ownership.CommandPrefix}support`,
          value: "This can be used to get a link to our support server.",
          inline: true,
        },
        {
          name: `${config.ownership.CommandPrefix}config [view, set]`,
          value: "This can be used to view and change values in your config.",
          inline: true,
        },
        {
          name: `${config.ownership.CommandPrefix}stats [pokemon]`,
          value: "This can be used to view your stats.",
          inline: true,
        },
        {
          name: `${config.ownership.CommandPrefix}ping`,
          value: "This can be used to check the bot's response time.",
          inline: true,
        },
        {
          name: `${config.ownership.CommandPrefix}solved`,
          value:
            "This can be used to resume the bot after completing a captcha.",
          inline: true,
        },
        {
          name: `${config.ownership.CommandPrefix}setup [new]`,
          value:
            "This can be used to automatically set up a new CatchTwo server.",
          inline: true,
        },
        {
          name: `${config.ownership.CommandPrefix}levelup [add, remove, list]`,
          value: "This can be used to manage your levelup list.",
          inline: true,
        },
      ],
      color: "#E74C3C",
      timestamp: new Date(),
      footer: {
        text: "CatchTwo by @kyan0045",
        icon_url:
          "https://cdn.discordapp.com/icons/1133853334944632832/1cb8326e5b0e60e40c8b830803604a6b.webp?size=96",
      },
    });
  },
};
