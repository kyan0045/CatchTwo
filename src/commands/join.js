// Disabled: discord-self-lite cannot accept invites yet. Kept for when I implement it downstream

/*
const { sendLog } = require("../services/logging.js");

module.exports = {
  name: "join",
  aliases: ["accept-invite", "accept", "enterserver"],
  async execute(client, message, args) {
    if (!args[0]) {
      // If no invite code/link is provided, inform the user and stop execution
      return message.reply("Please provide a Discord invite link or code.");
    }

    try {
      // Extract the invite code from the provided argument
      let inviteCode = args[0];
      
      // If the input is a full URL (contains slashes), extract just the code part from the end
      if (inviteCode.includes("/")) {
        inviteCode = inviteCode.split("/").pop();
      }
      
      // Log the attempt to join the server with the extracted invite code
      sendLog(client.user.username, `Attempting to join server with invite: ${inviteCode}`, "debug");
      
      // Format the complete Discord invite URL
      const inviteUrl = `https://discord.gg/${inviteCode}`;
      
      // The options bypass server onboarding and verification processes
      const guildInfo = await client.acceptInvite(inviteUrl, { 
        bypassOnboarding: true, 
        bypassVerify: true 
      });
      
      // React with a checkmark emoji to indicate successful server join
      await message.react("✅");
      
      // Log successful server join with the server name
      sendLog(client.user.username, `Successfully joined server: ${guildInfo.name}`, "info");
    } catch (err) {
      // If there's an error (invalid invite, already in server, etc.)
      // React with an X emoji to indicate failure
      await message.react("❌");
      
      // Reply to the user with the error message
      message.reply(`Failed to join server: ${err.message}`);
      
      // Log the error for debugging purposes
      sendLog(client.user.username, `Error joining server: ${err.message}`, "error");
    }
  },
};
*/
