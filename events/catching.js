// Import necessary modules and functions
const chalk = require("chalk");
const { solveHint, getImage, getName } = require("pokehint");
const config = require("../config.json");
const { wait, randomInteger } = require("../utils/utils.js");
const { ShinyHunter } = require("../classes/clients/shinyHunter.js");
const {
  sendLog,
  sendCatch,
  sendWebhook,
  getMentions,
} = require("../functions/logging.js");
const {
  setSpamming,
  getSpamming,
  getWaiting,
  setWaiting,
} = require("../utils/states.js");

// Main function to handle message creation events
module.exports = async (client, guildId, message) => {
  // Return if the bot is set to waiting
  if (getWaiting() == true) return;

  // Check if the message is from the bot itself in the specified guild or if global catch is enabled and the guild is not blacklisted
  if (
    (config.behavior.Catching == true &&
      message.guild?.id == guildId &&
      message.author.id == "716390085896962058") ||
    (config.globalSettings.GlobalCatch &&
      message.author.id == "716390085896962058" &&
      !config.globalSettings.BlacklistedGuilds.includes(message.guild?.id))
  ) {
    // Handle wild Pokémon appearance
    if (message.embeds[0]?.title?.includes("wild pokémon has appeared")) {
      // Return if IncenseMode is off and the message includes "Incense"
      if (
        config.incense.IncenseMode == false &&
        message.embeds[0]?.footer?.text?.includes("Incense")
      )
        return;

      // Send a hint message
      let hintMessages = ["h", "hint"];
      message.channel.send(
        "<@716390085896962058> " + hintMessages[Math.round(Math.random())]
      );

      // Handle incense-specific logic
      if (
        config.incense.IncenseMode == true &&
        message.embeds[0]?.footer?.text?.includes("Incense")
      ) {
        // Log and manage spamming state based on incense detection
        if (getSpamming() == true) {
          setSpamming(false);
          sendLog(client.user.username, "Detected incense.", "incense");
        }
        // Handle the end of incense and possibly buy a new one
        if (message.embeds[0]?.footer.text.includes("Spawns Remaining: 0.")) {
          if (
            config.incense.AutoIncenseBuy == true &&
            message.channel.id == config.incense.IncenseChannel
          ) {
            sendLog(
              client.user.username,
              "Incense ran out, buying next one.",
              "auto-incense"
            );
            return message.channel.send(
              "<@716390085896962058> incense buy 30m 10s --y"
            );
          }
          setSpamming(true);
          sendLog(
            client.user.username,
            "Detected the end of the incense.",
            "incense"
          );
        }
      }
    } else if (message.content.includes("The pokémon is")) {
      // Handle hint-based Pokémon catching
      const pokemon = await solveHint(message);
      if (pokemon[0]) {
        // Check if the Pokémon is in the shiny hunting list
        if (
          config.shinyHunting.HuntPokemons.includes(pokemon[0] || pokemon[1])
        ) {
          const shinyHunter = new ShinyHunter(config.shinyHunting.HuntToken);
          shinyHunter.login();
          shinyHunter.catch(message.guild.id, message.channel.id, pokemon[0]);
        } else {
          // Attempt to catch the Pokémon based on the hint
          pokemonRandom = await getName({
            name: pokemon[0],
            inputLanguage: "English",
          });
          if (!pokemonRandom) {
            pokemonRandom = pokemon[0];
          }
          await message.channel.send(
            "<@716390085896962058> c " + pokemonRandom
          );
        }
        // Handle incorrect catch attempts
        checkIfWrong = await message.channel
          .createMessageCollector({ time: 5000 })
          .on("collect", async (msg) => {
            if (msg.content.includes("That is the wrong pokémon!")) {
              checkIfWrong.stop();
              await msg.channel.send("<@716390085896962058> c " + pokemon[1]);

              checkIfWrong2 = await msg.channel
                .createMessageCollector({ time: 5000 })
                .on("collect", async (msg) => {
                  if (msg.content.includes("That is the wrong pokémon!")) {
                    checkIfWrong2.stop();
                    let hintMessages = ["h", "hint"];
                    msg.channel.send(
                      "<@716390085896962058> " +
                        hintMessages[Math.round(Math.random())]
                    );
                  }
                });
            }
          });
      }
    } else if (message.content.startsWith("Please pick a starter pokémon")) {
      // Handle starter Pokémon selection
      let starters = ["bulbasaur", "charmander", "squirtle"];
      await wait(300);
      await message.channel.send(
        "<@716390085896962058> pick " + starters[randomInteger(0, 2)]
      );
    } else if (
      message?.embeds[0]?.footer &&
      message?.embeds[0].footer.text.includes("Terms") &&
      message?.components[0]?.components[0]
    ) {
      // Handle terms acceptance and initial setup
      const messages = await message.channel.messages
        .fetch({ limit: 2, around: message.id })
        .catch(() => null);
      const newMessage = Array.from(messages.values());
      // [...messages.values()];
      if (!newMessage[1]?.content.includes("pick")) return;
      message.clickButton();
      await wait(3000);
      message.channel.send("<@716390085896962058> i");
      await wait(2000);
      message.channel.send("<@716390085896962058> sh solosis");
      await wait(2000);
      message.channel.send("<@716390085896962058> order iv");
    } else if (
      config.logging.LogCatches &&
      message.content.includes("Congratulations <@" + client.user.id + ">")
    ) {
      // Log successful catches
      if (config.logging.LogCatches) {
        let match = message.content.match(
          /Level (\d+) ([^<]+)(<:[^>]+>) \(([^)]+%)\)/
        );
        const level = match[1];
        const name = match[2].trim();
        const gender = match[3];
        const iv = match[4];

        if (message.content.includes("✨")) {
          shiny = true;
        } else {
          shiny = false;
        }

        sendCatch(
          client.user.username,
          name,
          level,
          iv,
          gender,
          shiny,
          await getImage(name, shiny)
        );
      }
    }

    /*if (
      config.logging.LogCatches &&
      message.embeds[0]?.footer &&
      message.embeds[0].footer.text.includes("Displaying")
    ) {
      const messages = await message.channel.messages
        .fetch({ limit: 2, around: message.id })
        .catch(() => null);
      const newMessage = Array.from(messages.values());
      [...messages.values()];

      if (
        (message.embeds[0].thumbnail.url.includes(client.user.id) ||
          newMessage[1].author.id == client.user.id) &&
        newMessage[1].content.includes("i l")
      ) {
        const iv = message.embeds[0]?.fields[1].value
          .split(" ")[28]
          .substring(
            0,
            message.embeds[0]?.fields[1].value.split(" ")[28].length - 1
          );

        const number = message.embeds[0]?.footer.text
          .split(" ")[2]
          .substring(
            0,
            message.embeds[0]?.footer.text.split(" ")[2].length - 5
          );

        if (message.embeds[0].title.includes("✨")) {
          name = message.embeds[0]?.title.split(" ").slice(3).join(" ");
          level = message.embeds[0]?.title.split(" ")[2];
          shiny = true;
        }
        name = message.embeds[0]?.title.split(" ").slice(2).join(" ");
        level = message.embeds[0]?.title.split(" ")[1];
        shiny = false;

        sendCatch(client.user.username, name, level, iv, number, shiny, message.embeds[0].image.url);
      }
    }*/
  }

  // Handle messages from the bot itself for special cases like chocolate box opening
  if (message.author.id == "716390085896962058") {
    
    // Handle chocolate box opening (past valentines event)
    /*if (message?.embeds[0]?.fields[0]?.name.includes("Chocolate")) {
      const messages = await message.channel.messages
        .fetch({ limit: 2, around: message.id })
        .catch(() => null);
      const newMessage = Array.from(messages.values());
      // [...messages.values()];

      if (newMessage[1].author.id == client.user.id) {
        let boxAmount = parseInt(message.embeds[0].fields[0].value);
        openInterval = setInterval(async () => {
          if (boxAmount > 0) {
            if (boxAmount >= 15) {
              message.channel.send(`<@716390085896962058> valentines open 15`);
              boxAmount -= 15;
            } else {
              message.channel.send(
                `<@716390085896962058> valentines open ${boxAmount}`
              );
              boxAmount = 0;
              clearInterval(openInterval);
            }
          }
        }, 1000);
      }
    } else*/ if (
      message.content.includes(
        `https://verify.poketwo.net/captcha/${client.user.id}`
      )
    ) {
      // Handle captcha detection and notification
      if (getWaiting() == true) return;
      setWaiting(true);
      sendLog(client.user.username, "Detected captcha.", "captcha");
      config.ownership.OwnerIDs.forEach((id) => {
        if (id.length <= 16) return;
        client.users.fetch(id).then(async (user) => {
          dmChannel = await client.channels.fetch(user.dmChannel.id);
          lastMessage = await dmChannel.messages.fetch(dmChannel.lastMessageId);
          if (
            lastMessage?.content.includes("captcha") &&
            lastMessage?.author.id == client.user.id &&
            lastMessage?.createdTimestamp > Date.now() - 86400000
          ) {
            return;
          } else {
            sendWebhook(await getMentions(), {
              title: `Captcha Found!`,
              color: "#FF5600",
              url: `https://verify.poketwo.net/captcha/${client.user.id}`,
              footer: {
                text: "CatchTwo by @kyan0045",
                icon_url:
                  "https://cdn.discordapp.com/icons/1133853334944632832/1cb8326e5b0e60e40c8b830803604a6b.png",
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
