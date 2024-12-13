// Importing necessary modules and configurations

const chalk = require("chalk"); // Used for styling and coloring console output
const { solveHint, getImage } = require("pokehint"); // Functions for solving hints and getting images
const config = require("../config.js"); // Loading configuration from JSON file

// Utility functions and classes

const { wait, randomInteger } = require("../utils/utils.js"); // Utility functions for waiting and generating random integers
const { ShinyHunter } = require("../classes/clients/shinyHunter.js"); // ShinyHunter class
const {
  sendLog,
  sendCatch,
  sendWebhook,
  getMentions,
} = require("../functions/logging.js"); // Logging functions
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
            try {
              dmChannel = await client.channels.fetch(user?.dmChannel?.id);
            } catch (error) {
              //console.error("Error fetching DM channel:", error);
              dmChannel = await user.createDM();
            }

            lastMessage = await dmChannel.messages.fetch(
              dmChannel?.lastMessageId
            );

            if (lastMessage?.content?.includes("suspended")) {
              return;
            } else {
              sendWebhook(`${await getMentions()}`, {
                title: `Account ${client.user.username} was suspended!`,
                color: "#FF0000",
                footer: {
                  text: "CatchTwo by @kyan0045",
                  icon_url:
                    "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
                },
              });

              return user
                .send(
                  `## ACCOUNT SUSPENDED\n> Your account has been suspended. The autocatcher has been paused. Please check your account for more information.`
                )
                .catch((error) => {
                  sendLog(
                    client.user.username,
                    `Error sending message to ${user.username}: ${error}`,
                    "error"
                  );
                }); // Send a DM to the owner(s) specified in the config
            }
          });
        });
      }
    }

    // Handling captcha detection
    if (
      message.content.includes(
        `https://verify.poketwo.net/captcha/${client.user.id}`
      )
    ) {
      if (getWaiting(client.user.username) == true) return;
      setWaiting(client.user.username, true); // Setting the bot to a waiting state
      sendLog(client.user.username, "Detected captcha.", "captcha"); // Logging captcha detection
      // Notifying all owners about the captcha
      config.ownership.OwnerIDs.forEach((id) => {
        if (id.length <= 16) return; // Skipping invalid IDs
        client.users.fetch(id).then(async (user) => {
          dmChannel = await client.channels.fetch(user.dmChannel?.id);
          if (!dmChannel) {
            dmChannel = await user.createDM();
          }
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
            sendWebhook(await getMentions(), {
              title: `Captcha Found!`,
              color: "#FF5600",
              url: `https://verify.poketwo.net/captcha/${client.user.id}`,
              footer: {
                text: "CatchTwo by @kyan0045",
                icon_url:
                  "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
              },
            });
            return user
              .send(
                `## DETECTED A CAPTCHA\n> I've detected a captcha. The autocatcher has been paused. To continue, please solve the captcha below.\n* https://verify.poketwo.net/captcha/${client.user.id}\n\n### SOLVED?\n> Once solved, run the command \`\`${config.ownership.CommandPrefix}solved\`\` to continue catching.`
              )
              .catch((error) => {
                sendLog(
                  client.user.username,
                  `Error sending message to ${user.username}: ${error}`,
                  "error"
                );
              });
          }
        });
      });
    }

    // Handling quest completion
    if (message.content.includes(`You have completed`)) {
      const messages = await message.channel.messages
        .fetch({
          limit: 2,
          around: message.id,
        })
        .catch(() => null);

      const newMessage = Array.from(messages.values());

      if (newMessage[1].author.id == client.user.id) {
        if (message.content.includes(`You have completed the quest`)) {
          // Extract amount of pokemon caught using regex
          const amountMatch = message.content.match(/Catch (\d+) pokémon/);
          const amount = amountMatch ? amountMatch[1] : "0";

          // Extract region name using regex
          const regionMatch = message.content.match(
            /found in the (.*?) region/
          );
          const region = regionMatch ? regionMatch[1] : "Unknown region";

          // Extract Pokécoins amount using regex
          const pokecoinsMatch = message.content.match(
            /received ([\d,]+) Pokécoins/
          );
          const pokecoins = pokecoinsMatch
            ? pokecoinsMatch[1].replace(/,/g, "")
            : "0";

          // Log the extracted information
          sendLog(
            client.user.username,
            `Detected quest completion: Caught ${amount} ${region} pokemon and received ${pokecoins} Pokécoins.`,
            "quest"
          );
        } else if (message.content.includes(`You have completed this quest`)) {
          // Extract badge name using regex
          const badgeMatch = message.content.match(/received the (.*?) badge/);
          const badge = badgeMatch ? badgeMatch[1] : "Unknown badge";

          // Log the extracted information
          sendLog(
            client.user.username,
            `Detected quest track completion and received the ${badge} badge.`,
            "quest"
          );
        }
      }
    }
  }
};
