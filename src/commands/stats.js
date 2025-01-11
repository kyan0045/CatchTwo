// Importing necessary modules and configurations
const package = require("../../package.json"); // Loading package.json for version
const version = package.version;
const { clients } = require("../classes/catcher");

// Importing necessary functions
const { getAccountStat, getTotalStats } = require("../utils/stats.js");
const { sendCommandWebhook } = require("../functions/logging.js");

module.exports = {
  name: "stats",
  aliases: ["statistics", "data", "catches"],
  async execute(client, message, args, webhook) {
    // Get process uptime and start time
    const processUptime = process.uptime();
    const processStartTime = Date.now() - processUptime * 1000;

    // If no arguments provided, show main stats menu
    if (!args.length) {
      message.reply(
        "Please provide a valid argument.\nUse `pokemon` to view your Pokemon statistics, `General` to view your general statistics. You can also mention one of your catchers or provide their ID to view their statistics."
      );
    } else if (args.length === 1 && args[0] === "pokemon") {
      const stats = getTotalStats();

      sendCommandWebhook(webhook, `<@${message.author.id}>`, {
        title: "Statistics",
        description: `**Started:** <t:${Math.round(
          processStartTime / 1000
        )}:R>\n**Last Catch:** ${
          stats.general.lastCatch === 0
            ? "Never"
            : `<t:${Math.round(stats.general.lastCatch / 1000)}:R>`
        }`,
        fields: [
          {
            name: "Total Catches",
            value: `${stats.catches.total}`,
            inline: true,
          },
          {
            name: "Catch Rate",
            value:
              stats.catches.total === 0
                ? "0 per hour"
                : `${Math.round(
                    stats.catches.total / (processUptime / 2400)
                  )} catches per hour`,
            inline: true,
          },
          { name: "\u200B", value: "\u200B", inline: true },
          {
            name: "Total Shiny",
            value: `${stats.catches.shiny}`,
            inline: true,
          },
          {
            name: "Total Legendary",
            value: `${stats.catches.legendary}`,
            inline: true,
          },
          {
            name: "Total Mythical",
            value: `${stats.catches.mythical}`,
            inline: true,
          },
          {
            name: "Total Ultra Beasts",
            value: `${stats.catches.ultrabeast}`,
            inline: true,
          },
          {
            name: "Total Events",
            value: `${stats.catches.event}`,
            inline: true,
          },
          {
            name: "Total Regionals",
            value: `${stats.catches.regional}`,
            inline: true,
          },
        ],
        color: "#fecd06",
        thumbnail: {
          url: "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
        },
        footer: {
          text: "CatchTwo by @kyan0045, version " + version,
          icon_url:
            "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
        },
      });
    } else if (args[0] && args[0] === "general") {
      const stats = getTotalStats();

      sendCommandWebhook(webhook, `<@${message.author.id}>`, {
        title: "General Statistics",
        description: `**Started:** <t:${Math.round(
          processStartTime / 1000
        )}:R>\n**Last Catch:** ${
          stats.general.lastCatch === 0
            ? "Never"
            : `<t:${Math.round(stats.general.lastCatch / 1000)}:R>`
        }`,
        fields: [
          {
            name: "Total Catches",
            value: `${stats.catches.total}`,
            inline: true,
          },
          {
            name: "Total Coins Gained",
            value: `${stats.general.coins}`,
            inline: true,
          },
          {
            name: "Total Spam Messages",
            value: `${stats.general.spamMessages}`,
            inline: true,
          },
        ],
        color: "#fecd06",
        thumbnail: {
          url: "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
        },
        footer: {
          text: "CatchTwo by @kyan0045, version " + version,
          icon_url:
            "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
        },
      });
    } else if (args[1] && (args[1] === "pokemon" || args[0] === "pokemon")) {
      let userId = args[0].includes("pokemon") ? args[1] : args[0];
      if (userId.startsWith("<@") && userId.endsWith(">")) {
        // If it's a mention, extract the user ID
        userId = userId.slice(2, -1);
        if (userId.startsWith("!")) {
          userId = userId.slice(1);
        }
      }

      const user = client.users.cache.get(userId);
      if (!clients.find((c) => c.user.username === user.username)) return message.reply("That user is not a CatchTwo catcher running in this instance.");
      if (user) {
        const stats = getAccountStat(user.username);
        if (!stats) {
          return message.reply(
            "That catcher was not found in this CatchTwo instance."
          );
        }

        sendCommandWebhook(webhook, `<@${message.author.id}>`, {
          title: "Pokemon Statistics",
          description: `**Started:** <t:${Math.round(
            processStartTime / 1000
          )}:R>\n**Last Catch:** ${
            stats.general.lastCatch === 0
              ? "Never"
              : `<t:${Math.round(stats.general.lastCatch / 1000)}:R>`
          }`,
          fields: [
            {
              name: "Total Catches",
              value: `${stats.catches.total}`,
              inline: true,
            },
            {
              name: "Catch Rate",
              value:
                stats.catches.total === 0
                  ? "0 per hour"
                  : `${Math.round(
                      stats.catches.total / (processUptime / 2400)
                    )} catches per hour`,
              inline: true,
            },
            { name: "\u200B", value: "\u200B", inline: true },
            {
              name: "Shiny",
              value: `${stats.catches.shiny}`,
              inline: true,
            },
            {
              name: "Legendary",
              value: `${stats.catches.legendary}`,
              inline: true,
            },
            {
              name: "Mythical",
              value: `${stats.catches.mythical}`,
              inline: true,
            },
            {
              name: "Ultra Beasts",
              value: `${stats.catches.ultrabeast}`,
              inline: true,
            },
            {
              name: "Events",
              value: `${stats.catches.event}`,
              inline: true,
            },
            {
              name: "Regionals",
              value: `${stats.catches.regional}`,
              inline: true,
            },
          ],
          color: "#fecd06",
          thumbnail: {
            url: "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
          },
          footer: {
            text: "CatchTwo by @kyan0045, version " + version,
            icon_url:
              "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
          },
        });
      } else {
        // If the user is not found, send an error message
        return message.reply(
          "That user was not found in this CatchTwo instance."
        );
      }
    } else if (args[1] && (args[1] === "general" || args[0] === "general")) {
      let userId = args[0].includes("general") ? args[1] : args[0];
      if (userId.startsWith("<@") && userId.endsWith(">")) {
        // If it's a mention, extract the user ID
        userId = userId.slice(2, -1);
        if (userId.startsWith("!")) {
          userId = userId.slice(1);
        }
      }

      const user = client.users.cache.get(userId);
      if (!clients.find((c) => c.user.username === user.username)) return message.reply("That user is not a CatchTwo catcher running in this instance.");
      if (user) {
        const stats = getAccountStat(user.username);
        if (!stats) {
          return message.reply(
            "That catcher was not found in this CatchTwo instance."
          );
        }

        sendCommandWebhook(webhook, `<@${message.author.id}>`, {
          title: "General Statistics",
          description: `**Started:** <t:${Math.round(
            processStartTime / 1000
          )}:R>\n**Last Catch:** ${
            stats.general.lastCatch === 0
              ? "Never"
              : `<t:${Math.round(stats.general.lastCatch / 1000)}:R>`
          }`,
          fields: [
            {
              name: "Catches",
              value: `${stats.catches.total}`,
              inline: true,
            },
            {
              name: "Coins Gained",
              value: `${stats.general.coins}`,
              inline: true,
            },
            {
              name: "Spam Messages",
              value: `${stats.general.spamMessages}`,
              inline: true,
            },
          ],
          color: "#fecd06",
          thumbnail: {
            url: "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
          },
          footer: {
            text: "CatchTwo by @kyan0045, version " + version,
            icon_url:
              "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
          },
        });
      } else {
        // If the user is not found, send an error message
        return message.reply(
          "That user was not found in this CatchTwo instance."
        );
      }
    }
  },
};
