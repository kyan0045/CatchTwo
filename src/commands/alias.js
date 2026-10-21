const { findCommand } = require("../utils/commands.js");

module.exports = {
  name: "alias",
  aliases: ["aliases", "synonyms"],
  async execute(client, message, args) {
    if (!args.length) {
      return message.reply(
        "This command is used to view the aliases of other commands. To use this command, type `alias [command]`."
      );
    }

    const command = findCommand(client, args[0]);
    if (!command) {
      return message.reply(
        `The command \`${args[0].toLowerCase()}\` does not exist.`
      );
    }

    const aliases = command.aliases ?? [];
    if (!aliases.length) {
      return message.reply(`The command \`${command.name}\` has no aliases.`);
    }

    return message.reply(
      `The aliases for the command \`${command.name}\` are: \`${aliases.join("`, `")}\`.`
    );
  },
};
