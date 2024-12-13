// Importing necessary modules and configurations

const chalk = require("chalk"); // Used for styling and coloring console output
const { solveHint, getImage } = require("pokehint"); // Functions for solving hints and getting images
const config = require("../config.js"); // Loading configuration from JSON file
const axios = require("axios"); // Used for fetching the archery image
const sharp = require("sharp"); // Used for processing the archery image

// Utility functions and classes

const { wait, randomInteger } = require("../utils/utils.js"); // Utility functions for waiting and generating random integers
const { ShinyHunter } = require("../classes/clients/shinyHunter.js"); // ShinyHunter class
const { sendLog, sendCatch } = require("../functions/logging.js"); // Logging functions
const {
  setSpamming,
  getSpamming,
  getWaiting,
  setWaiting,
} = require("../utils/states.js"); // State management functions

// The main function that handles new messages

module.exports = async (client, guildId, message) => {
  // Checking if the message is from Pokétwo and if the bot is not already waiting

  if (
    message.author.id == "716390085896962058" &&
    getWaiting(client.user.username) == false &&
    message.guild.id == guildId
  ) {
    // Checking if the account is suspended

    if (message?.embeds[0]?.title?.includes("Account Suspended")) {
      const messages = await message.channel.messages

        .fetch({
          limit: 2,
          around: message.id,
        })

        .catch(() => null);

      const newMessage = Array.from(messages.values());

      [...messages.values()];

      if (newMessage[1].author.id == client.user.id) {
        sendLog(client.user.username, "Detected suspension.", "suspension");

        setWaiting(client.user.username, true);

        config.ownership.OwnerIDs.forEach((id) => {
          if (id.length <= 16) return;

          client.users.fetch(id).then(async (user) => {
            dmChannel = await client.channels.fetch(user.dmChannel.id);

            lastMessage = await dmChannel.messages.fetch(
              dmChannel.lastMessageId
            );

            if (lastMessage?.content.includes("suspended")) {
              return;
            } else {
              sendWebhook(null, {
                title: `Account ${client.user.username} Suspended!`,

                color: "#FF0000",

                footer: {
                  text: "CatchTwo by @kyan0045",

                  icon_url:
                    "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
                },
              });

              return user.send(
                `## ACCOUNT SUSPENDED\n> Your account has been suspended. The autocatcher has been paused. Please check your account for more information.`
              );
            }
          });
        });
      }
    }

    if (
      // Handling captcha detection

      message.content.includes(
        `https://verify.poketwo.net/captcha/${client.user.id}`
      )
    ) {
      setWaiting(client.user.username, true); // Setting the bot to a waiting state

      sendLog(client.user.username, "Detected captcha.", "captcha"); // Logging captcha detection

      // Notifying all owners about the captcha

      config.ownership.OwnerIDs.forEach((id) => {
        if (id.length <= 16) return; // Skipping invalid IDs

        client.users.fetch(id).then(async (user) => {
          // Fetching the DM channel and the last message to the owner

          dmChannel = await client.channels.fetch(user.dmChannel.id);

          lastMessage = await dmChannel.messages.fetch(dmChannel.lastMessageId);

          // Checking if the last message already informed about a captcha within the last 24 hours

          if (
            lastMessage?.content.includes("captcha") &&
            lastMessage?.author.id == client.user.id &&
            lastMessage?.createdTimestamp > Date.now() - 86400000
          ) {
            return; // Skipping if a recent captcha message was already sent
          } else {
            // Sending a webhook and a direct message to the owner about the captcha

            sendWebhook(null, {
              title: `Captcha Found!`,

              color: "#FF5600",

              url: `https://verify.poketwo.net/captcha/${client.user.id}`,

              footer: {
                text: "CatchTwo by @kyan0045",

                icon_url:
                  "https://camo.githubusercontent.com/50135c6f8c4ae4b9faa62bf3aca70ce4ee18908c0b239539b18fc26f35d5f50b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
              },
            });

            return user.send(
              `## DETECTED A CAPTCHA\n> I've detected a captcha. The autocatcher has been paused. To continue, please solve the captcha below.\n* https://verify.poketwo.net/captcha/${client.user.id}\n\n### SOLVED?\n> Once solved, run the command \`\`${config.ownership.CommandPrefix}solved\`\` to continue catching.`
            );
          }
        });
      });
    }
  }
};