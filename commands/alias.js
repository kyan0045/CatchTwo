// This module exports the "alias" command for CatchTwo, which displays aliases for other commands.
module.exports = {
  name: "alias", // Command name
  aliases: ["aliases", "ways", "synonyms"], // Command aliases
  // Asynchronous function to execute the command
  async execute(client, message, args) {
    // Check if any arguments were provided
    if(args.length > 0) {
      let command = args[0].toLowerCase(); // Convert the first argument to lowercase to match command names
      let commandFile = client.commands.get(command); // Retrieve the command object from the client's command collection
      // If the command exists
      if(commandFile) {
        let aliases = commandFile.aliases; // Retrieve the aliases of the command
        // If there are any aliases
        if(aliases.length > 0) {
          // Reply with the list of aliases
          message.reply(`The aliases for the command \`${command}\` are: \`${aliases.join("`, `")}\`.`);
        } else {
          // Reply indicating there are no aliases for the command
          message.reply(`The command \`${command}\` has no aliases.`);
        }
      } else {
        // Reply indicating the specified command does not exist
        message.reply(`The command \`${command}\` does not exist.`);
      }
    } else {
      // If no arguments were provided, instruct the user on how to use the command
      message.reply("This command is used to view the aliases of other commands. To use this command, type `alias [command]`.");
    }
  },
};