const pkg = require("../../package.json");
const version = pkg.version;

const { getAccountStat, getTotalStats } = require("../services/stats.js");
const { sendCommandWebhook } = require("../services/logging.js");

async function sendStatsEmbed(
  webhook,
  message,
  title,
  fields,
  processStartTime,
  lastCatch
) {
  const sent = await sendCommandWebhook(webhook, `<@${message.author.id}>`, {
    title,
    description: `**Started:** <t:${Math.round(processStartTime / 1000)}:R>\n**Last Catch:** ${
      lastCatch === 0 ? "Never" : `<t:${Math.round(lastCatch / 1000)}:R>`
    }`,
    fields,
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

  if (sent) return true;

  const lines = fields.map((field) => `**${field.name}:** ${field.value}`);
  return message.reply(`**${title}**\n${lines.join("\n")}`);
}

function getPokemonFields(catches, processUptime, isUser = false) {
  const uptimeHours = processUptime / 3600;
  const catchRate =
    catches.total === 0 || !(uptimeHours > 0)
      ? "0 per hour"
      : `${Math.round(catches.total / uptimeHours)} catches per hour`;

  const fields = [
    { name: "Total Catches", value: `${catches.total}`, inline: true },
    { name: "Catch Rate", value: catchRate, inline: true },
    { name: "\u200B", value: "\u200B", inline: true },
    {
      name: isUser ? "Shiny" : "Total Shiny",
      value: `${catches.shiny}`,
      inline: true,
    },
    {
      name: isUser ? "Legendary" : "Total Legendary",
      value: `${catches.legendary}`,
      inline: true,
    },
    {
      name: isUser ? "Mythical" : "Total Mythical",
      value: `${catches.mythical}`,
      inline: true,
    },
    {
      name: isUser ? "Ultra Beasts" : "Total Ultra Beasts",
      value: `${catches.ultrabeast}`,
      inline: true,
    },
    {
      name: isUser ? "Events" : "Total Events",
      value: `${catches.event}`,
      inline: true,
    },
    {
      name: isUser ? "Regionals" : "Total Regionals",
      value: `${catches.regional}`,
      inline: true,
    },
  ];

  if (catches.gigantamax !== undefined) {
    fields.push({
      name: isUser ? "Gigantamax" : "Total Gigantamax",
      value: `${catches.gigantamax}`,
      inline: true,
    });
  }

  return fields;
}

function getGeneralFields(stats, isUser = false) {
  const prefix = isUser ? "" : "Total ";
  return [
    { name: `${prefix}Catches`, value: `${stats.catches.total}`, inline: true },
    {
      name: `${prefix}Coins Gained`,
      value: `${stats.general.coins}`,
      inline: true,
    },
    {
      name: `${prefix}Spam Messages`,
      value: `${stats.general.spamMessages}`,
      inline: true,
    },
  ];
}

module.exports = {
  name: "stats",
  aliases: ["statistics", "data", "catches"],
  getGeneralFields,
  getPokemonFields,
  async execute(client, message, args, webhook) {
    const { clients } = require("../classes/catcher");
    const processUptime = process.uptime();
    const processStartTime = Date.now() - processUptime * 1000;

    if (!args.length) {
      return message.reply(
        "Please provide a valid argument.\nUse `pokemon` to view your Pokemon statistics, `general` to view your general statistics. You can also mention one of your catchers or provide their ID to view their statistics."
      );
    }

    const lowered = args.map((arg) => arg.toLowerCase());
    const wantsPokemon = lowered.includes("pokemon");
    const wantsGeneral = lowered.includes("general");
    // Any argument that is not a category is the target account
    const userArg = args.find(
      (_arg, index) => !["pokemon", "general"].includes(lowered[index])
    );

    if (!userArg) {
      const stats = getTotalStats();
      if (wantsPokemon) {
        return sendStatsEmbed(
          webhook,
          message,
          "Statistics",
          getPokemonFields(stats.catches, processUptime, false),
          processStartTime,
          stats.general.lastCatch
        );
      }
      if (wantsGeneral) {
        return sendStatsEmbed(
          webhook,
          message,
          "General Statistics",
          getGeneralFields(stats, false),
          processStartTime,
          stats.general.lastCatch
        );
      }
      return message.reply(
        "Please provide a valid argument: `pokemon`, `general`, or a catcher mention/ID."
      );
    }

    let userId = userArg;
    if (userId.startsWith("<@") && userId.endsWith(">")) {
      userId = userId.slice(2, -1);
      if (userId.startsWith("!")) {
        userId = userId.slice(1);
      }
    }

    const user = await client.resolveUser(userId).catch(() => null);
    if (!user) {
      return message.reply(
        "That user was not found in this CatchTwo instance."
      );
    }

    if (!clients.find((c) => c?.user?.id === user.id)) {
      return message.reply(
        "That user is not a CatchTwo catcher running in this instance."
      );
    }

    const stats = getAccountStat(user.id);
    if (!stats) {
      return message.reply(
        "That catcher was not found in this CatchTwo instance."
      );
    }

    // A plain mention defaults to the general view
    if (wantsPokemon) {
      return sendStatsEmbed(
        webhook,
        message,
        "Pokemon Statistics",
        getPokemonFields(stats.catches, processUptime, true),
        processStartTime,
        stats.general.lastCatch
      );
    }
    return sendStatsEmbed(
      webhook,
      message,
      "General Statistics",
      getGeneralFields(stats, true),
      processStartTime,
      stats.general.lastCatch
    );
  },
};
