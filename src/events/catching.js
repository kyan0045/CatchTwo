// Import necessary modules and their functions
const { solveHint, getImage, getName } = require("pokehint");

// Import the config file
const config = require("../../config.js");

// Import necessary functions
const { wait, randomInteger } = require("../utils/utils.js");
const { ShinyHunter } = require("../classes/shinyHunter.js");
const { sendLog, sendCatch } = require("../functions/logging.js");
const {
  setSpamming,
  setWaiting,
  getSpamming,
  getWaiting,
} = require("../utils/states.js");
const tf = require("@tensorflow/tfjs-node");
const sharp = require("sharp");
const data = require("../data/ai.json");
const axios = require("axios");

// Define global variables
let model;
let hintMessages = ["h", "hint"];

async function predict(url) {
  if (!model) {
    model = await tf.loadLayersModel("file://./src/data/model/model.json");
  }
  let startTime = new Date().getTime();
  const imageTensor = await preprocessImage(url);
  const prediction = model.predict(imageTensor);

  const predictedIndex = prediction.argMax(1).dataSync()[0];

  const keys = Object.keys(data); // Get all keys from the data object
  const name = keys[predictedIndex]; // Get the key name at the specified index

  sendLog(
    null,
    "AI prediction took " + (new Date().getTime() - startTime) + "ms.",
    "debug"
  );
  return name;
}

async function preprocessImage(url) {
  const response = await axios({
    url,
    responseType: "arraybuffer",
  });
  const imageBuffer = await sharp(Buffer.from(response.data))
    .resize(64, 64)
    .toBuffer();

  const imageTensor = tf.divNoNan(tf.node.decodeImage(imageBuffer, 3), 255);

  const expandedTensor = tf.expandDims(imageTensor, 0);

  return expandedTensor;
}

// Main function to handle message creation events
module.exports = async (client, guildId, message) => {
  // Return if the bot is set to waiting
  if (getWaiting(client.user.username) == true) return;

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

      if (config.behavior.AI == true) {
        sendLog(
          client.user.username,
          "AI enabled, trying to predict the pokémon.",
          "debug"
        );
        predict(message.embeds[0].image.url)
          .then(async (result) => {
            if (config.hunting.HuntPokemons.includes(result.split("\r\n")[0])) {
              const shinyHunter = new ShinyHunter(config.hunting.HuntToken);
              shinyHunter.login();
              shinyHunter.catch(
                message.guild.id,
                message.channel.id,
                await getName({
                  name: result.split("\r\n")[0],
                  inputLanguage: "English",
                })
              );
            } else if (result[0] && typeof result[0] === "string") {
              let pokemonRandom = await getName({
                name: result.split("\r\n")[0],
                inputLanguage: "English",
              });
              if (!pokemonRandom) {
                pokemonRandom = result;
              }
              checkIfWrong = await message.channel
                .createMessageCollector({ time: 5000 })
                .on("collect", async (msg) => {
                  if (
                    msg.content.includes("That is the wrong pokémon!")
                  ) {
                    checkIfWrong.stop();
                    setTimeout(async () => {
                      msg.channel.send(
                        "<@716390085896962058> " +
                          hintMessages[Math.round(Math.random())]
                      );
                    }, 500);
                  }
                });
              await message.channel.send(
                "<@716390085896962058> c " + pokemonRandom
              );
            } else {
              message.channel.send(
                "<@716390085896962058> " +
                  hintMessages[Math.round(Math.random())]
              );
            }
          })
          .catch((error) => {
            console.error(error);
            // Send a hint message if the prediction fails

            message.channel.send(
              "<@716390085896962058> " + hintMessages[Math.round(Math.random())]
            );
          });
      } else {
        message.channel.send(
          "<@716390085896962058> " + hintMessages[Math.round(Math.random())]
        );
      }

      // Handle incense-specific logic
      if (
        config.incense.IncenseMode == true &&
        message.embeds[0]?.footer?.text?.includes("Incense")
      ) {
        // Log and manage spamming state based on incense detection
        if (getSpamming(client.user.username) == true) {
          setSpamming(client.user.username, false);
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
            message.channel.send(
              "<@716390085896962058> incense buy 30m 10s -y"
            );
            await message.channel
              .createMessageCollector({ time: 5000 })
              .on("collect", async (msg) => {
                if (
                  msg.content.includes("You don't have enough shards for that!")
                ) {
                  setSpamming(client.user.username, true);
                  setWaiting(client.user.username, false);
                }
              });
          } else {
            setSpamming(client.user.username, true);
            setWaiting(client.user.username, false);
            sendLog(
              client.user.username,
              "Detected the end of the incense.",
              "incense"
            );
          }
        }
      }
    } else if (message.content.includes("The pokémon is")) {
      // Handle hint-based Pokémon catching
      const pokemon = await solveHint(message);
      if (pokemon[0] && typeof pokemon[0] === "string") {
        // Check if the Pokémon is in the shiny hunting list
        if (
          config.hunting.HuntPokemons.map((huntName) =>
            huntName.toLowerCase()
          ).includes(pokemon[0]?.toLowerCase() || pokemon[1]?.toLowerCase())
        ) {
          const shinyHunter = new ShinyHunter(config.hunting.HuntToken);
          shinyHunter.login();
          shinyHunter.catch(message.guild.id, message.channel.id, pokemon[0]);
        } else {
          // Attempt to catch the Pokémon based on the hint
          let pokemonRandomLanguage = await getName({
            name: pokemon[0],
            inputLanguage: "English",
          });
          if (!pokemonRandomLanguage) {
            pokemonRandomLanguage = pokemon[0];
          }
          await message.channel.send(
            "<@716390085896962058> c " + pokemonRandomLanguage
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
                  if (
                    msg.content.includes("That is the wrong pokémon!") &&
                    getSpamming(client.user.username) == true
                  ) {
                    checkIfWrong2.stop();

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
      [...messages.values()];
      if (!newMessage[1]?.content.includes("pick")) return;
      message.clickButton();
      await wait(3000);
      message.channel.send("<@716390085896962058> i");
      await wait(2000);
      message.channel.send("<@716390085896962058> sh solosis");
      await wait(2000);
      message.channel.send("<@716390085896962058> order iv");
    } else if (config.behavior.Daycare && message.content.includes("in the daycare have produced a")) {
      console.log("Daycare condition triggered.");
    
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    
      // Send message to the Fletch channel or fallback to spam channel if not found
      const sendInChannel = async (msg) => {
        const channelID = config.logging.daycareID;
        const channel = channelID
          ? message.guild.channels.cache.get(channelID)
          : message.guild.channels.cache.find((channel) => channel.name.toLowerCase() === "spam");
        if (channel) {
          console.log(`Sending message to ${channel.name} channel.`);
          await channel.send(msg);
          return channel;
        } else {
          console.log("No valid channel found. Sending in the current channel.");
          await message.channel.send(msg);
          return message.channel;
        }
      };
    
      try {
        
        const pokemonName = config.daycare?.pokemon ? `--n ${config.daycare.pokemon}` : "";
        
        const activeChannel = await sendInChannel(`<@716390085896962058> p${pokemonName ? ` ${pokemonName}` : ""} --b`);

    
        const filter = (m) => m.author.id === "716390085896962058" && m.embeds.length > 0;
        
        const collectMessage = async () => {
          console.log("🔄 Waiting for confirmation message...");
      
          let attempts = 0;
          const maxAttempts = 5; // Retry up to 5 times
      
          while (attempts < maxAttempts) {
              attempts++;
      
              // Fetch the latest 20 messages
              const messages = await activeChannel.messages.fetch({ limit: 20 }).catch(() => null);
      
              if (messages) {
                  // Find a message that contains the confirmation text
                  const confirmationMessage = messages.find(msg => 
                      msg.content.includes("Are you sure you want to add"));
      
                  if (confirmationMessage) {
                      console.log(`✅ Found confirmation message on attempt ${attempts}.`);
                      return confirmationMessage;
                  }
              }
      
              console.log(`❌ No confirmation found. Attempt ${attempts}/${maxAttempts}. Retrying...`);
              await sleep(1000); // Wait before retrying
          }
      
          console.log("❌ No confirmation message found after max attempts.");
          return null;
      }      
    
        const collectEmbed = async () => {
          console.log("🔄 Waiting for embed...");
      
          let collected;
          let attempts = 0;
          const maxAttempts = 300; // Retry for 5 minutes (300 x 1 sec)
      
          // Step 1: Get the latest bot command message
          const botMessages = await activeChannel.messages.fetch({ limit: 20 }).catch(() => null);
          const lastBotMessage = botMessages?.find(msg => msg.author.id === "716390085896962058");
      
          if (!lastBotMessage) {
              console.log("❌ No recent bot messages found.");
              return null;
          }
      
          console.log("🔎 Found bot command message. Searching for embed...");
      
          while (attempts < maxAttempts) {
              attempts++;
      
              // Step 2: Fetch the latest 50 messages again
              const messages = await activeChannel.messages.fetch({ limit: 50 }).catch(() => null);
      
              if (messages) {
                  // Step 3: Find an embed message AFTER the last bot command
                  const embedMessage = messages
                      .filter(msg => msg.createdTimestamp > lastBotMessage.createdTimestamp) // Ignore messages before bot's response
                      .find(msg => msg.embeds.length > 0);
      
                  if (embedMessage) {
                      console.log("✅ Found embed message.");
                      return embedMessage;
                  }
              }
      
              console.log(`❌ No embed found. Attempt ${attempts}/${maxAttempts}. Retrying...`);
              await sleep(1000);
          }
      
          console.log("❌ No embed received after 5 minutes.");
          return null;
      };
      

      const extractPokemonInfo = (line) => {
        console.log("\nProcessing line:", line);
    
        
        const numMatch = line.match(/`\s*(\d+)\s*`/);
        const num = numMatch ? numMatch[1].trim() : null;
    
        if (!num) {
            console.log("❌ No valid number found, returning null");
            return null;
        }
    
        
        const nameMatch = line.match(/\*\*<:.*?>\s*([\w\s-]+)/);
        const species = nameMatch ? nameMatch[1].trim().toLowerCase() : null;
    
        if (!species) {
            console.log("❌ No valid species found, returning null");
            return null;
        }
    
        // Detect gender (male, female, unknown)
        let gender = "unknown";
        const genderMatch = line.match(/<:(male|female|unknown):\d+>/);
        if (genderMatch) gender = genderMatch[1];
    
        console.log("✅ Extracted info:", { num, species, gender });
        return { num, species, gender };
    };
    
    
        const processPage = async (embedMessage) => {
          console.log("Processing page...");
          let embedTitle = embedMessage.embeds[0]?.title;
    
          // Retry until we find an embed with the title that contains "Your Pokémon"
          while (!embedTitle || !embedTitle.includes("Your pokémon")) {
            console.log("Embed title doesn't match. Retrying...");
            embedMessage = await collectEmbed();
            if (!embedMessage) return null;
            embedTitle = embedMessage.embeds[0]?.title;
          }
    
          console.log("Found the correct embed title with 'Your Pokémon'.");
    
          const embedDescription = embedMessage.embeds[0]?.description;
          if (!embedDescription) {
            console.log("No description found in embed.");
            return { malePokemon: [], femalePokemon: [] };
          }
    
const lines = embedDescription.trim().split("\n");
          let malePokemon = [];
          let femalePokemon = [];
    
          for (const line of lines) {
            const info = extractPokemonInfo(line);
            if (info.num && info.species) {
              if (info.gender === "male") {
                malePokemon.push(info);
              } else if (info.gender === "female") {
                femalePokemon.push(info);
              }
            }
          }
    
          console.log(`Found ${malePokemon.length} male and ${femalePokemon.length} female Pokemon.`);
          return { malePokemon, femalePokemon };
        };
    
        const findPairs = (malePokemon, femalePokemon) => {
          console.log("Finding pairs...");
          const pairs = [];
          const usedFemales = new Set();
    
          malePokemon.forEach((male) => {
            const femaleMatch = femalePokemon.find((female) => 
              female.species === male.species && !usedFemales.has(female.num)
            );
            if (femaleMatch) {
              pairs.push({ male, female: femaleMatch });
              usedFemales.add(femaleMatch.num);
              console.log(`Same Species Pair: Male ${male.species} (${male.num}) & Female ${femaleMatch.species} (${femaleMatch.num})`);
            }
          });
    
          malePokemon.forEach((male) => {
            if (!pairs.some((pair) => pair.male.num === male.num)) {
              const anyFemale = femalePokemon.find((female) => !usedFemales.has(female.num));
              if (anyFemale) {
                pairs.push({ male, female: anyFemale });
                usedFemales.add(anyFemale.num);
                console.log(`Different Species Pair: Male ${male.species} (${male.num}) & Female ${anyFemale.species} (${anyFemale.num})`);
              }
            }
          });
    
          console.log(`Total pairs found: ${pairs.length}`);
          return pairs;
        };
    
        const clickYesButton = async (msg) => {
          let buttonId = 0; // Default button ID
          let rowId = 0;
          //const button = msg.components[0]?.components.find(comp => comp.style === 3); // Style 3 = Green (Yes)
          if (msg.content.includes("Are you sure you want to")) {
            console.log("Clicking the Yes button...");
            await msg.clickButton({ X: isNaN(buttonId) ? 0 : buttonId, Y: rowId }); //button.click();
          } else {
            console.log("Yes button not found.");
          }
        };
    
        let pairs = [];
        while (pairs.length === 0) {
          const embedMessage = await collectEmbed();
          if (!embedMessage) break;
    
          const { malePokemon, femalePokemon } = await processPage(embedMessage);
          pairs = findPairs(malePokemon, femalePokemon);
        }
    
        if (pairs.length === 0) {
          console.log("No suitable pairs found.");
          return;
        }
    
      
        for (const pair of pairs) {
          console.log(`Attempting to add Pair (Male: ${pair.male.num}, Female: ${pair.female.num})`);
      
          // Step 1: Add Male Pokémon
          await activeChannel.send(`<@716390085896962058> daycare add ${pair.male.num}`);
          await sleep(3000); // Wait before checking messages
      
          let confirmationMessage = await collectMessage(); // Wait for up to 5 attempts to find confirmation
      
          if (confirmationMessage && confirmationMessage.content.includes("Are you sure you want to add")) {
              await clickYesButton(confirmationMessage);
              console.log(`Confirmed Male Pokémon: ${pair.male.num}`);
          } else {
              console.log(`Failed to confirm Male Pokémon: ${pair.male.num}, skipping this pair.`);
              continue; // Skip this pair if confirmation not found
          }
      
          await sleep(5000); // Natural delay before adding the female Pokémon
      
          // Step 2: Add Female Pokémon
          await activeChannel.send(`<@716390085896962058> daycare add ${pair.female.num}`);
          await sleep(3000); // Wait before checking messages
      
          confirmationMessage = await collectMessage(); // Wait again for up to 5 attempts
      
          if (confirmationMessage && confirmationMessage.content.includes("Are you sure you want to add")) {
              await clickYesButton(confirmationMessage);
              console.log(`Confirmed Female Pokémon: ${pair.female.num}`);
          } else {
              console.log(`Failed to confirm Female Pokémon: ${pair.female.num}, skipping this pair.`);
              continue;
          }
      
          console.log(`Pair successfully added to daycare! (Male: ${pair.male.num}, Female: ${pair.female.num})`);
          await sleep(5000);
          break;
      }      
      
      } catch (err) {
        console.error("Error in daycare process:", err);
      }
    }  else if (
      config.logging.LogCatches &&
      message.content.includes(
        "Congratulations <@" + client.user.id + ">! You caught"
      )
    ) {
      // Log successful catches
      if (config.logging.LogCatches) {
        let match = message.content.match(
          /Level (\d+) ([^<]+)(<:[^>]+>) \(([^)]+%)\)/
        );
        const [, level, unTrimmedName, gender, iv] = match;
        const name = unTrimmedName.trim();
        const shiny = message.content.includes("✨");

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
  }
};
