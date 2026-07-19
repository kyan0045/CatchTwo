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
const data = require("../data/ai.json");
const axios = require("axios");
const path = require("path");

// Define global variables
let model;
let tfLib;
let sharpLib;
let modelLoadPromise;
let hintMessages = ["h", "hint"];

async function loadAiDependencies() {
  if (!tfLib) {
    if (process.platform === "win32") {
      const tensorflowLibPath = path.resolve(
        "node_modules/@tensorflow/tfjs-node/deps/lib"
      );
      process.env.PATH = `${tensorflowLibPath}${path.delimiter}${process.env.PATH}`;
    }
    tfLib = require("@tensorflow/tfjs-node");
  }
  if (!sharpLib) {
    sharpLib = require("sharp");
  }

  return { tf: tfLib, sharp: sharpLib };
}

async function preprocessImage(url) {
  const { tf, sharp } = await loadAiDependencies();
  const response = await axios({
    url,
    responseType: "arraybuffer",
  });
  const imageBuffer = await sharp(Buffer.from(response.data))
    .resize(64, 64)
    .toBuffer();

  return tf.tidy(() => {
    // Decode the image buffer into a tensor
    const decodedImage = tf.node.decodeImage(imageBuffer, 3); // 3 channels (RGB)

    // Normalize the image tensor (e.g., to [0, 1] range)
    // Using tf.scalar for the divisor is good practice for type consistency.
    // tf.divNoNan was used in your original, so we keep it. If 0/0 is not a concern, tf.div is also fine.
    const normalizedImage = tf.divNoNan(decodedImage, tf.scalar(255.0));

    // Expand dimensions to add the batch dimension (e.g., [64, 64, 3] -> [1, 64, 64, 3])
    const expandedTensor = tf.expandDims(normalizedImage, 0);

    return expandedTensor;
  });
}
async function predict(url) {
  const { tf } = await loadAiDependencies();

  if (!model) {
    modelLoadPromise =
      modelLoadPromise ||
      tf.loadLayersModel("file://./src/data/model/model.json");
    model = await modelLoadPromise;
  }
  let startTime = new Date().getTime();
  const imageTensor = await preprocessImage(url);

  // Use tf.tidy to automatically dispose intermediate tensors
  const predictedIndex = tf.tidy(() => {
    const prediction = model.predict(imageTensor);
    const argMaxTensor = prediction.argMax(1);
    return argMaxTensor.dataSync()[0];
  });

  // Manually dispose the input tensor
  imageTensor.dispose();

  const keys = Object.keys(data); // Get all keys from the data object
  const name = keys[predictedIndex]; // Get the key name at the specified index

  // Log TensorFlow memory usage in debug mode
  if (config.debug) {
    const memory = tf.memory();
    sendLog(
      null,
      `TF memory — tensors: ${memory.numTensors}, bytes: ${memory.numBytes}`,
      "debug",
    );
  }

  sendLog(
    null,
    "AI prediction took " + (new Date().getTime() - startTime) + "ms.",
    "debug",
  );
  return name;
}

// Main function to handle message creation events
module.exports = async (client, guildId, message) => {
  // Return if the bot is set to waiting
  if (getWaiting(client.user.username) == true) return;

  // Check if the message is from the bot itself in the specified guild or if global catch is enabled and the guild is not blacklisted
  if (
    (config.behavior.Catching == true &&
      message.guild?.id == guildId &&
      message?.author.id == "716390085896962058") ||
    (config.globalSettings.GlobalCatch &&
      message?.author.id == "716390085896962058" &&
      !config.globalSettings.BlacklistedGuilds.includes(message.guild?.id))
  ) {
    // Handle wild Pokémon appearance
    if (message?.embeds[0]?.title?.includes("wild pokémon has appeared")) {
      // Return if IncenseMode is off and the message includes "Incense"
      if (
        config.incense.IncenseMode == false &&
        message?.embeds[0]?.footer?.text?.includes("Incense")
      )
        return;

      if (config.behavior.AI == true) {
        sendLog(
          client.user.username,
          "AI enabled, trying to predict the pokémon.",
          "debug",
        );
        predict(message.embeds[0].image.url)
          .then(async (result) => {
            if (config.hunting.HuntPokemons.includes(result.split("\r\n")[0])) {
              const shinyHunter = new ShinyHunter(config.hunting.HuntToken);
              await shinyHunter.login();
              await shinyHunter.catch(
                message.guild.id,
                message.channel.id,
                await getName({
                  name: result.split("\r\n")[0],
                  inputLanguage: "English",
                }),
              );
            } else if (result[0] && typeof result[0] === "string") {
              let pokemonRandom = await getName({
                name: result.split("\r\n")[0],
                inputLanguage: "English",
              });
              if (!pokemonRandom) {
                pokemonRandom = result;
              }
              const wrongMessagePromise = message.channel.awaitMessage({
                time: 5000,
                errors: false,
                filter: (msg) =>
                  msg.content.includes("That is the wrong pokémon!"),
              });
              await message.channel.send(
                "<@716390085896962058> c " + pokemonRandom
              );
              const wrongMessage = await wrongMessagePromise;
              if (wrongMessage) {
                await wait(500);
                await wrongMessage.channel.send(
                  "<@716390085896962058> " +
                    hintMessages[Math.round(Math.random())]
                );
              }
            } else {
              message.channel.send(
                "<@716390085896962058> " +
                  hintMessages[Math.round(Math.random())],
              );
            }
          })
          .catch((error) => {
            console.error(error);
            // Send a hint message if the prediction fails

            message.channel.send(
              "<@716390085896962058> " +
                hintMessages[Math.round(Math.random())],
            );
          });
      } else {
        message.channel.send(
          "<@716390085896962058> " + hintMessages[Math.round(Math.random())],
        );
      }

      // Handle incense-specific logic
      if (
        config.incense.IncenseMode == true &&
        message.embeds[0]?.footer?.text?.includes("Incense")
      ) {
        // Log and manage spamming state based on incense detection
        if (getSpamming(client.user.id) == true) {
          setSpamming(client.user.id, false);
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
              "auto-incense",
            );
            const responsePromise = message.channel.awaitMessage({
              time: 5000,
              errors: false,
              filter: (msg) =>
                msg.content.includes("You don't have enough shards for that!"),
            });
            await message.channel.send(
              "<@716390085896962058> incense buy 30m 10s -y",
            );
            const response = await responsePromise;
            if (response) {
              setSpamming(client.user.id, true);
              setWaiting(client.user.id, false);
            }
          } else {
            setSpamming(client.user.id, true);
            setWaiting(client.user.id, false);
            sendLog(
              client.user.username,
              "Detected the end of the incense.",
              "incense",
            );
          }
        }
      }
    } else if (message.content.includes("The pokémon is")) {
      // Handle hint-based Pokémon catching
      const pokemon = await solveHint(message);
      if (pokemon[0] && typeof pokemon[0] === "string") {
        let wrongMessagePromise;
        // Check if the Pokémon is in the shiny hunting list
        if (
          config.hunting.HuntPokemons.map((huntName) =>
            huntName.toLowerCase(),
          ).includes(pokemon[0]?.toLowerCase() || pokemon[1]?.toLowerCase())
        ) {
          const shinyHunter = new ShinyHunter(config.hunting.HuntToken);
          await shinyHunter.login();
          wrongMessagePromise = message.channel.awaitMessage({
            time: 5000,
            errors: false,
            filter: (msg) => msg.content.includes("That is the wrong pokémon!"),
          });
          await shinyHunter.catch(message.guild.id, message.channel.id, pokemon[0]);
        } else {
          // Attempt to catch the Pokémon based on the hint
          let pokemonRandomLanguage = await getName({
            name: pokemon[0],
            inputLanguage: "English",
          });
          if (!pokemonRandomLanguage) {
            pokemonRandomLanguage = pokemon[0];
          }
          wrongMessagePromise = message.channel.awaitMessage({
            time: 5000,
            errors: false,
            filter: (msg) => msg.content.includes("That is the wrong pokémon!"),
          });
          await message.channel.send(
            "<@716390085896962058> c " + pokemonRandomLanguage
          );
        }
        // Handle incorrect catch attempts
        const wrongMessage = await wrongMessagePromise;
        if (wrongMessage) {
          if (!pokemon[1]) {
            return wrongMessage.channel.send(
              "<@716390085896962058> " +
                hintMessages[Math.round(Math.random())]
            );
          }
          const secondWrongMessagePromise = wrongMessage.channel.awaitMessage({
            time: 5000,
            errors: false,
            filter: (msg) =>
              msg.content.includes("That is the wrong pokémon!"),
          });
          await wrongMessage.channel.send(
            "<@716390085896962058> c " + pokemon[1]
          );
          const secondWrongMessage = await secondWrongMessagePromise;
          if (secondWrongMessage && getSpamming(client.user.id) == true) {
            await secondWrongMessage.channel.send(
              "<@716390085896962058> " +
                hintMessages[Math.round(Math.random())]
            );
          }
        }
      }
    } else if (message.content.startsWith("Please pick a starter pokémon")) {
      // Handle starter Pokémon selection
      let starters = ["bulbasaur", "charmander", "squirtle"];
      await wait(300);
      await message.channel.send(
        "<@716390085896962058> pick " + starters[randomInteger(0, 2)],
      );
    } else if (
      message?.embeds[0]?.footer &&
      message?.embeds[0].footer.text.includes("Terms") &&
      message?.components[0]?.components[0]
    ) {
      // Handle terms acceptance and initial setup
      const messages = await message.channel
        .fetchMessages({ limit: 2, around: message.id })
        .catch(() => null);
      const newMessage = messages || [];
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
        const gigantamax = message.content.includes("Gigantamax");

        sendCatch(
          client.user.username,
          name,
          level,
          iv,
          gender,
          shiny,
          gigantamax,
          await getImage(name, shiny, gigantamax)
        );
      }
    }
  }
};
