const fs = require("fs");
const path = require("path");
const { MessageAttachment } = require("discord.js-selfbot-v13");
const package = require("../../package.json");
const { sendCommandWebhook } = require("../functions/logging.js");

module.exports = {
  name: "version",
  aliases: ["info", "process", "v", "about", "versions"],
  async execute(client, message, args, webhook) {
    sendCommandWebhook(
      webhook,
      `<@${message.author.id}>\n\`\`\`json\n${JSON.stringify(
        package,
        null,
        2
      )}\`\`\``,
      {
        title: "Version",
        description: `**CatchTwo version:** ${
          package.version
        }\n **NodeJS version:** ${process.version.replace(
          "v",
          ""
        )}\n **Discord.JS-selfbot-v13 version:** ${
          package.dependencies["discord.js-selfbot-v13"].replace("^", "")
        }`,
        color: "#fecd06",
        timestamp: new Date(),
        thumbnail: {
          url: "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
        },
      }
    );
  },
};
