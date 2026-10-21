const { sendCommandWebhook } = require("../services/logging.js");
const { findCommand } = require("../utils/commands.js");
const config = require("../../config.js");
const pkg = require("../../package.json");

const THUMBNAIL_URL =
  "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png";
const EMBED_COLOR = "#fecd06";

const commandHelp = {
  help: {
    description: "Shows information about available commands.",
    usage: `${config.ownership.CommandPrefix}help [command]`,
    examples: [
      `${config.ownership.CommandPrefix}help`,
      `${config.ownership.CommandPrefix}help ping`,
    ],
    category: "General",
  },
  alias: {
    description: "Shows the aliases for another command.",
    usage: `${config.ownership.CommandPrefix}alias <command>`,
    examples: [`${config.ownership.CommandPrefix}alias stats`],
    category: "General",
  },
  say: {
    description: "Makes the bot repeat a specified message.",
    usage: `${config.ownership.CommandPrefix}say <message>`,
    examples: [`${config.ownership.CommandPrefix}say Hello World!`],
    category: "Utility",
  },
  click: {
    description: "Clicks a button on a replied-to or specified message.",
    usage: `${config.ownership.CommandPrefix}click [messageID] <button> [row]`,
    examples: [
      `${config.ownership.CommandPrefix}click 1`,
      `${config.ownership.CommandPrefix}click 123456789012345678 1`,
    ],
    category: "Utility",
  },
  react: {
    description: "Reacts to a replied-to or specified message.",
    usage: `${config.ownership.CommandPrefix}react [messageID] [emoji]`,
    examples: [
      `${config.ownership.CommandPrefix}react 👍`,
      `${config.ownership.CommandPrefix}react 123456789012345678 👍`,
    ],
    category: "Utility",
  },
  predict: {
    description: "Analyzes a Pokemon image and returns the top predictions.",
    usage: `${config.ownership.CommandPrefix}predict [imageURL]`,
    examples: [
      `${config.ownership.CommandPrefix}predict https://example.com/pokemon.png`,
      `${config.ownership.CommandPrefix}predict`,
    ],
    category: "Utility",
  },
  support: {
    description: "Provides a link to the CatchTwo support server.",
    usage: `${config.ownership.CommandPrefix}support`,
    examples: [`${config.ownership.CommandPrefix}support`],
    category: "General",
  },
  stats: {
    description:
      "Shows Pokemon or general statistics for all catchers or a specific catcher.",
    usage: `${config.ownership.CommandPrefix}stats <pokemon|general> [@user|userID]`,
    examples: [
      `${config.ownership.CommandPrefix}stats pokemon`,
      `${config.ownership.CommandPrefix}stats general`,
      `${config.ownership.CommandPrefix}stats @user pokemon`,
    ],
    category: "Information",
  },
  ping: {
    description: "Checks the bot's response time.",
    usage: `${config.ownership.CommandPrefix}ping`,
    examples: [`${config.ownership.CommandPrefix}ping`],
    category: "Information",
  },
  version: {
    description: "Shows CatchTwo, Node.js, and dependency version information.",
    usage: `${config.ownership.CommandPrefix}version`,
    examples: [`${config.ownership.CommandPrefix}version`],
    category: "Information",
  },
  restart: {
    description: "Restarts the selfbot.",
    usage: `${config.ownership.CommandPrefix}restart`,
    examples: [`${config.ownership.CommandPrefix}restart`],
    category: "System",
  },
  resume: {
    description: "Resumes bot operation after a captcha or manual pause.",
    usage: `${config.ownership.CommandPrefix}resume [@user|userID]`,
    examples: [
      `${config.ownership.CommandPrefix}resume`,
      `${config.ownership.CommandPrefix}resume @user`,
    ],
    category: "System",
  },
  pause: {
    description: "Pauses bot operation for all catchers or one catcher.",
    usage: `${config.ownership.CommandPrefix}pause [@user|userID]`,
    examples: [
      `${config.ownership.CommandPrefix}pause`,
      `${config.ownership.CommandPrefix}pause @user`,
    ],
    category: "System",
  },
  eval: {
    description: "Evaluates JavaScript when debug mode is enabled.",
    usage: `${config.ownership.CommandPrefix}eval <code>`,
    examples: [`${config.ownership.CommandPrefix}eval client.user.tag`],
    category: "Debug",
    debugOnly: true,
  },
};

const categoryOrder = ["General", "Information", "Utility", "System", "Debug"];

function isVisibleCommand(command) {
  if (!command?.name || !commandHelp[command.name]) return false;
  return !commandHelp[command.name].debugOnly || config.debug === true;
}

function getCommands(client) {
  return Array.from(client.commands.values())
    .filter(isVisibleCommand)
    .sort((a, b) => {
      const aInfo = commandHelp[a.name];
      const bInfo = commandHelp[b.name];
      const categoryDiff =
        categoryOrder.indexOf(aInfo.category) -
        categoryOrder.indexOf(bInfo.category);

      if (categoryDiff !== 0) return categoryDiff;
      return a.name.localeCompare(b.name);
    });
}

// Send the embed through a webhook, or reply in-channel when none is set
async function sendHelp(message, webhook, embed) {
  const sent = await sendCommandWebhook(webhook, `<@${message.author.id}>`, {
    ...getBaseEmbed(),
    ...embed,
  });
  if (sent) return;

  const lines = (embed.fields ?? []).map(
    (field) => `**${field.name}:** ${field.value}`
  );
  const text = `**${embed.title}**\n${embed.description}\n\n${lines.join("\n")}`;
  return message.reply(
    text.length > 1_900 ? `${text.slice(0, 1_900)}...` : text
  );
}

function getBaseEmbed() {
  return {
    url: "https://github.com/kyan0045/CatchTwo",
    color: EMBED_COLOR,
    timestamp: new Date(),
    thumbnail: {
      url: THUMBNAIL_URL,
    },
    footer: {
      text: `CatchTwo by @kyan0045, version ${pkg.version}`,
      icon_url: THUMBNAIL_URL,
    },
  };
}

module.exports = {
  name: "help",
  aliases: ["commands", "commandlist"],
  async execute(client, message, args, webhook) {
    if (!args.length) {
      const fields = getCommands(client).map((command) => {
        const helpInfo = commandHelp[command.name];

        return {
          name: helpInfo.usage,
          value: helpInfo.description,
          inline: true,
        };
      });

      return sendHelp(message, webhook, {
        title: "CatchTwo Command Help",
        description:
          "CatchTwo is a simple and easy to use PokeTwo selfbot. Available commands are listed below.",
        fields,
      });
    }

    const commandName = args[0].toLowerCase();
    const command = findCommand(client, commandName);

    if (!command || !isVisibleCommand(command)) {
      return message.reply(`The command \`${commandName}\` does not exist.`);
    }

    const helpInfo = commandHelp[command.name];

    return sendHelp(message, webhook, {
      title: `Command: ${config.ownership.CommandPrefix}${command.name}`,
      description: helpInfo.description,
      fields: [
        {
          name: "Aliases",
          value: command.aliases?.length
            ? `\`${command.aliases.join("`, `")}\``
            : "No aliases",
          inline: true,
        },
        {
          name: "Usage",
          value: helpInfo.usage,
          inline: true,
        },
        {
          name: "Category",
          value: helpInfo.category,
          inline: true,
        },
        {
          name: "Examples",
          value: helpInfo.examples.join("\n"),
          inline: false,
        },
      ],
    });
  },
};
