// Importing necessary modules and configurations

const chalk = require("chalk"); // Used for styling and coloring console output
const { solveHint, getImage } = require("pokehint"); // Functions for solving hints and getting images
const config = require("../../config.js"); // Loading configuration from JSON file
const axios = require("axios"); // Used for captchasolving

// Utility functions and classes
const {
  sendLog,
  sendWebhook,
  getMentions,
} = require("../functions/logging.js"); // Logging functions
const { getWaiting, setWaiting } = require("../utils/states.js"); // State management functions
const { addStat } = require("../utils/stats.js"); // Stats management functions

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
              dmChannel = await user.createDM();
            }

            let lastMessage = await dmChannel.messages.fetch(
              dmChannel?.lastMessageId
            );

            if (lastMessage?.content?.includes("suspended")) {
              return client.destroy();
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
                })
                .finally(() => {
                  client.destroy();
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
  /*const clickYesButton = async (msg) => {
    let buttonId = 0; // Default button ID
    let rowId = 0;

    if (msg.content.includes("Are you sure you want to")) {
      console.log("Clicking the Yes button...");
      await msg.clickButton({ X: isNaN(buttonId) ? 0 : buttonId, Y: rowId });
    } else {
      console.log("Yes button not found.");
    }
  };*/

  if (getWaiting(client.user.username)) return;
  setWaiting(client.user.username, true);

  sendLog(client.user.username, "Detected captcha.", "captcha");

  sendWebhook(null, {
    title: `Captcha Found!`,
    color: "#FF5600",
    url: `https://verify.poketwo.net/captcha/${client.user.id}`,
    footer: {
      text: "CatchTwo by @kyan0045",
      icon_url:
        "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
    },
  });

  config.ownership.OwnerIDs.forEach((id) => {
    if (id?.length && id.length <= 16) return;
    client.users.fetch(id).then(async (user) => {
      dmChannel = await client.channels
        .fetch(user.dmChannel?.id)
        .catch(() => null);
      if (!dmChannel) dmChannel = await user.createDM();
      lastMessage = await dmChannel.messages.fetch(dmChannel.lastMessageId);

      if (
        lastMessage?.content?.includes("captcha") &&
        lastMessage?.author?.id == client.user.id &&
        lastMessage?.createdTimestamp > Date.now() - 86400000
      ) {
        return;
      } else {
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

  /** STOPPING BOT & RELEASING POKEMON */
  if (config.logging.autoStop) {
    console.log("AutoStop enabled: Releasing Pokémon...");
    await message.channel.send("<@716390085896962058> inc p all -y");

    /*let confirmationMessage = await collectMessage();
    if (confirmationMessage) {
      await clickYesButton(confirmationMessage);
      console.log("Confirmed Release.");
    }*/

    sendWebhook(null, {
      title: `AutoStop Triggered!`,
      color: "#FF0000",
      description: "The bot has been paused and Pokémon were released.",
      footer: {
        text: "CatchTwo by @kyan0045",
        icon_url:
          "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
      },
    });

    setWaiting(client.user.username, false);
    return;
  }

  if (config.captchaSolving.key) {
    let globalTaskId;

    axios
      .post(
        "https://api.catchtwo.online/solve-captcha",
        {
          token: client.token,
          userId: client.user.id,
        },
        {
          headers: {
            "api-key": `${config.captchaSolving.key}`,
          },
        }
      )
      .then((response) => {
        globalTaskId = response.data.requestId;
        console.log("Task ID:", globalTaskId);
      });

    sendLog(client.user.username, "Sent captcha to the solver.", "captcha");

    setTimeout(async () => {
      let retries = 5;
      let success = false;

      while (retries > 0 && !success) {
        try {
          const response = await axios.get(
            `https://api.catchtwo.online/check-result/${globalTaskId}`,
            {
              headers: {
                "api-key": `${config.captchaSolving.key}`,
              },
            }
          );

          if (response.data.status == "completed") {
            setWaiting(client.user.username, false);
            sendLog(client.user.username, "Successfully solved the captcha!", "captcha");
            sendWebhook(await getMentions(), {
              title: `Captcha Solved!`,
              color: "#00FF00",
              footer: {
                text: "CatchTwo by @kyan0045",
                icon_url:
                  "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
              },
            });

            /** RESTARTING BOT AFTER SOLVE */
            console.log("Restarting Pokémon catching...");
            await message.channel.send("<@716390085896962058> inc r all -y");

            /*let restartConfirmation = await collectMessage();
            if (restartConfirmation) {
              await clickYesButton(restartConfirmation);
              console.log("Confirmed Restart.");
            }*/

            success = true;
          } else if (response.data.status == "pending") {
            sendLog(client.user.username, "Captcha solve pending.", "debug");
          } else {
            sendLog(client.user.username, "Captcha solving failed.", "captcha");
            sendWebhook(await getMentions(), {
              title: `Solve with ${globalTaskId} failed!`,
              color: "#FF0000",
              footer: {
                text: "CatchTwo by @kyan0045",
                icon_url:
                  "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
              },
            });
          }
        } catch (error) {
          console.error("Error checking captcha result:", error);
        }

        if (!success) {
          retries--;
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
      }
    }, 15000);
  }
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

    if (
      newMessage[1].author.id == client.user.id ||
      (newMessage[1].author.id == "716390085896962058" &&
        newMessage[1].content.includes(client.user.id))
    ) {
      if (message.content.includes(`You have completed the quest`)) {
        // Extract amount of pokemon caught using regex
        const amountMatch = message.content.match(/Catch (\d+) pokémon/);
        const amount = amountMatch ? amountMatch[1] : "0";

        // Extract region name using regex
        const regionMatch = message.content.match(/found in the (.*?) region/);
        const region = regionMatch ? regionMatch[1] : "Unknown region";

        // Extract Pokécoins amount using regex
        const pokecoinsMatch = message.content.match(
          /received\s+(?:\*\*)?([\d,]+)(?:\*\*)?\s+Pokécoins!?/
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
        addStat(client.user.username, "coins", pokecoins);
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

  if (
    message.content.includes("You received") &&
    message.content.includes("Pokécoins") &&
    message.content.includes(client.user.id)
  ) {
    const pokeCoins = message.content.match(
      /received\s+(?:\*\*)?([\d,]+)(?:\*\*)?\s+Pokécoins[.!]?/
    );
    if (pokeCoins) {
      addStat(client.user.username, "coins", pokeCoins[1]);
    }
  }
};
