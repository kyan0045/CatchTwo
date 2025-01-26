// Importing necessary modules and configurations
const config = require("../../config.js"); // Loading configuration from JSON file

// The main function that handles new messages
module.exports = async (client, guildId, message) => {
  // Checking if the message author is an owner and if the message starts with the command prefix
  if (
    (config.ownership.OwnerIDs.includes(message.author.id) ||
      client.user.id == message.author.id) &&
    (message.content.startsWith(config.ownership.CommandPrefix) ||
      message.content.startsWith(`<@${client.user.id}>`))
  ) {
    // Determine the prefix used
    const prefix = message.content.startsWith(config.ownership.CommandPrefix)
      ? config.ownership.CommandPrefix
      : `<@${client.user.id}>`;

    // Parsing the command and arguments from the message
    const args = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/);
    const command = args.shift().toLowerCase();

    // Attempting to find the command file from the client's command collection
    const commandFile =
      client.commands.get(command) ||
      Array.from(client.commands.values()).find(
        (cmd) => cmd.aliases && cmd.aliases.includes(command)
      );

    let webhookUrl;
    try {
      // Attempting to fetch existing webhooks in the channel
      const webhooks = await message.channel.fetchWebhooks();
      if (webhooks.size > 0) {
        // Using the first webhook found
        webhookUrl = webhooks.first().url;
      } else {
        // Creating a new webhook if none exist
        const newWebhook = await message.channel.createWebhook("CatchTwo", {
          avatar:
            "https://res.cloudinary.com/dppthk8lt/image/upload/ar_1.0,c_lpad,w_1.5/v1719331169/catchtwo_bjvlqi.png",
          reason: "CatchTwo Commands",
        });
        webhookUrl = newWebhook.url;
      }
    } catch (err) {
      // Handling errors, specifically the lack of permissions to create webhooks
      if (err.code == "50013") {
        webhookUrl = config.logging.LogWebhook;
      } else {
        console.log(err);
      }
    }

    // If a command file & webhookUrl is found, execute the command with the provided arguments and webhook
    if (commandFile && webhookUrl) {
      commandFile.execute(client, message, args, webhookUrl);
    }
  }
};
