// Importing the sendCommandWebhook function from the logging module
const { sendCommandWebhook } = require("../functions/logging.js");

// This module exports a command for CatchTwo that allows it to restart through Discord commands.
module.exports = {
    // Command name that triggers the execution
    name: "restart",
    // Alternative names for the command that can also trigger the execution
    aliases: ["reboot", "reload"],
    // The asynchronous function that executes when the command or its aliases are called
    async execute(client, message, args, webhook) {
        try {
            // Send restart notification to the webhook
            await sendCommandWebhook(webhook, `<@${message.author.id}>`, {
                title: "CatchTwo Restart",
                description: "Bot is restarting...",
                color: "#E74C3C",
                timestamp: new Date()
            });

            // Clean up resources by destroying the client
            await client.destroy();
            
            // Exit the process with code 0 (success) to trigger restart
            process.exit(0);
            
        } catch (error) {
            // Log any errors that occur during the restart process
            console.error("Error during restart:", error);
            
            // Send error notification to the webhook
            await sendCommandWebhook(webhook, `<@${message.author.id}>`, {
                title: "Restart Error",
                description: "Failed to restart the bot.",
                color: "#E74C3C",
                timestamp: new Date()
            });
        }
    }
};