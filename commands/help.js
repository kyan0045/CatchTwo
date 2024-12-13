const { sendCommandWebhook } = require("../functions/logging.js");
const config = require("../config.js");

// Command help details object
const commandHelp = {
  help: {
    description: "Shows information about available commands",
    usage: `${config.ownership.CommandPrefix}help [command]`,
    examples: [`${config.ownership.CommandPrefix}help`, `${config.ownership.CommandPrefix}help ping`],
    category: "General"
  },
  say: {
    description: "Makes the bot repeat a specified message",
    usage: `${config.ownership.CommandPrefix}say <message>`,
    examples: [`${config.ownership.CommandPrefix}say Hello World!`],
    category: "Utility"
  },
  click: {
    description: "Makes the bot click a specified button",
    usage: `${config.ownership.CommandPrefix}click <button>`,
    examples: [`${config.ownership.CommandPrefix}click 1`],
    category: "Utility"
  },
  react: {
    description: "Makes the bot react to a specified message",
    usage: `${config.ownership.CommandPrefix}react <messageID> <emoji>`,
    examples: [`${config.ownership.CommandPrefix}react 123456789 👍`],
    category: "Utility"
  },
  restart: {
    description: "Restarts the selfbot",
    usage: `${config.ownership.CommandPrefix}restart`,
    examples: [`${config.ownership.CommandPrefix}restart`],
    category: "System"
  },
  support: {
    description: "Provides a link to the support server",
    usage: `${config.ownership.CommandPrefix}support`,
    examples: [`${config.ownership.CommandPrefix}support`],
    category: "General"
  },
  config: {
    description: "View and modify configuration settings",
    usage: `${config.ownership.CommandPrefix}config <view|set> [setting] [value]`,
    examples: [
      `${config.ownership.CommandPrefix}config view`,
      `${config.ownership.CommandPrefix}config set Catching true`
    ],
    category: "Settings"
  },
  stats: {
    description: "View statistics about catches and Pokemon",
    usage: `${config.ownership.CommandPrefix}stats [pokemon]`,
    examples: [
      `${config.ownership.CommandPrefix}stats`,
      `${config.ownership.CommandPrefix}stats pikachu`
    ],
    category: "Information"
  },
  ping: {
    description: "Check the bot's response time",
    usage: `${config.ownership.CommandPrefix}ping`,
    examples: [`${config.ownership.CommandPrefix}ping`],
    category: "System"
  },
  solved: {
    description: "Resume bot operation after completing a captcha",
    usage: `${config.ownership.CommandPrefix}solved`,
    examples: [`${config.ownership.CommandPrefix}solved`],
    category: "System"
  },
  setup: {
    description: "Set up a new CatchTwo server automatically",
    usage: `${config.ownership.CommandPrefix}setup [new]`,
    examples: [
      `${config.ownership.CommandPrefix}setup`,
      `${config.ownership.CommandPrefix}setup new`
    ],
    category: "Setup"
  },
  levelup: {
    description: "Manage your levelup Pokemon list",
    usage: `${config.ownership.CommandPrefix}levelup <add|remove|list> [pokemon]`,
    examples: [
      `${config.ownership.CommandPrefix}levelup list`,
      `${config.ownership.CommandPrefix}levelup add pikachu`,
      `${config.ownership.CommandPrefix}levelup remove pikachu`
    ],
    category: "Pokemon"
  }
};

module.exports = {
  name: "help",
  aliases: ["commands", "commandlist"],
  async execute(client, message, args, webhook) {
    // If no arguments provided, show main help menu
    if (!args.length) {
      sendCommandWebhook(webhook, `<@${message.author.id}>`, {
        title: "CatchTwo Command Help",
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
            "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
        },
      });
    } else {
      // Show detailed help for specific command
      const commandName = args[0].toLowerCase();
      const command =
        client.commands.get(commandName) ||
        client.commands.find(
          (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
        );

      if (!command) {
        return message.reply(`The command \`${commandName}\` does not exist.`);
      }

      const helpInfo = commandHelp[command.name];

      sendCommandWebhook(webhook, `<@${message.author.id}>`, {
        title: `Command: ${config.ownership.CommandPrefix}${command.name}`,
        url: "https://github.com/kyan0045/CatchTwo",
        description: helpInfo.description,
        fields: [
          {
            name: "Aliases",
            value: command.aliases.length
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
        color: "#E74C3C",
        timestamp: new Date(),
        footer: {
          text: "CatchTwo by @kyan0045",
          icon_url:
            "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
        },
      });
    }
  },
};
