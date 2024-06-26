module.exports = {
  name: "alias",
  aliases: ["aliases", "ways", "synonyms"],
  async execute(client, message, args) {
      if(args) {
        let command = args[0].toLowerCase();
        let commandFile = client.commands.get(command);
        if(commandFile) {
          let aliases = commandFile.aliases;
          if(aliases.length > 0) {
            message.reply(`The aliases for the command \`${command}\` are: \`${aliases.join("`, `")}\`.`);
          } else {
            message.reply(`The command \`${command}\` has no aliases.`);
          }
        } else {
          message.reply(`The command \`${command}\` does not exist.`);
        }
      } else {
        message.reply("This command is used to view the aliases of other commands. To use this command, type `alias [command]`.");
      }

    },
};
