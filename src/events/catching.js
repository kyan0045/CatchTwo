const { solveHint, getImage, getName } = require("pokehint");

const config = require("../../config.js");

const { wait, randomInteger } = require("../services/system.js");
const { huntPokemon } = require("../classes/shinyHunter.js");
const { sendLog, sendCatch } = require("../services/logging.js");
const { setWaiting, getWaiting } = require("../services/states.js");
const { POKETWO_ID, POKETWO_MENTION } = require("../constants.js");
const {
  HINT_MESSAGES,
  isWrongPokemonMessage,
  isCaughtMessage,
  parseCatchMessage,
} = require("../utils/messages.js");

const { predict } = require("../services/ai.js");

function getRandomHint(random = Math.random) {
  return HINT_MESSAGES[Math.floor(random() * HINT_MESSAGES.length)];
}

function sendHint(channel, client) {
  return channel
    .send(`${POKETWO_MENTION} ${getRandomHint()}`)
    .catch((error) =>
      sendLog(
        client.user.username,
        `Failed to send hint: ${error.message || error}`,
        "error"
      )
    );
}

// Get a caught Pokémon and forward it to the catch logger
async function handleCaughtResponse(client, response, parsedCatch) {
  // The awaited reply and the general message handler can both see the same catch, so only process each message id once
  const messageId = response?.id;
  if (messageId) {
    if (!client._handledCatchIds) client._handledCatchIds = new Set();
    if (client._handledCatchIds.has(messageId)) return;
    client._handledCatchIds.add(messageId);
    if (client._handledCatchIds.size > 500) {
      const [oldest] = client._handledCatchIds;
      client._handledCatchIds.delete(oldest);
    }
  }

  await sendCatch(
    client.user.id,
    client.user.username,
    response.url,
    parsedCatch.name,
    parsedCatch.level,
    parsedCatch.iv,
    parsedCatch.gender,
    parsedCatch.shiny,
    parsedCatch.gigantamax,
    await getImage(parsedCatch.name, parsedCatch.shiny, parsedCatch.gigantamax)
  );
}

function shouldHandleCatchMessage(message, guildId, settings = config) {
  if (settings.behavior.Catching !== true) return false;
  if (message?.author.id !== POKETWO_ID) return false;

  return (
    message.guild?.id === guildId ||
    (settings.globalSettings.GlobalCatch &&
      !settings.globalSettings.BlacklistedGuilds.includes(message.guild?.id))
  );
}

function canSend(client) {
  return (
    !client.stopped && !client.suspended && getWaiting(client.user.id) !== true
  );
}

function isIncenseSpawn(message) {
  return message?.embeds?.[0]?.footer?.text?.includes("Incense") === true;
}

function shouldCatchSpawn(message, settings = config) {
  return settings.incense?.IncenseMode !== false || !isIncenseSpawn(message);
}

module.exports = {
  name: "messageCreate",
  getRandomHint,
  shouldHandleCatchMessage,
  isIncenseSpawn,
  shouldCatchSpawn,
  handleCaughtResponse,
  execute: async (client, guildId, message) => {
    if (getWaiting(client.user.id) === true) return;

    // Only handle Pokétwo messages in the guild specified in tokens.txt, or globally if allowed
    if (shouldHandleCatchMessage(message, guildId)) {
      if (message?.embeds?.[0]?.title?.includes("wild pokémon has appeared")) {
        if (!shouldCatchSpawn(message)) {
          sendLog(
            client.user.username,
            "IncenseMode is off; ignoring incense spawn.",
            "debug"
          );
          return;
        }

        if (config.behavior.AI === true) {
          sendLog(
            client.user.username,
            "AI enabled, trying to predict the pokémon.",
            "debug"
          );
          const wildImageUrl = message.embeds?.[0]?.image?.url;
          if (!wildImageUrl) {
            if (canSend(client)) sendHint(message.channel, client);
            return;
          }
          predict(wildImageUrl, { returnDetails: true })
            .then(async (pred) => {
              if (!canSend(client)) return;
              if (!pred || !pred.accepted) {
                const reason = pred?.reason ?? "no-result";
                const conf =
                  typeof pred?.confidence === "number"
                    ? ` conf ${(pred.confidence * 100).toFixed(1)}%`
                    : "";
                const margin =
                  typeof pred?.margin === "number"
                    ? ` margin ${(pred.margin * 100).toFixed(1)}%`
                    : "";
                // Name the top guess so a near miss is diagnosable in debug
                const guess = pred?.name ? `; guess ${pred.name}` : "";
                sendLog(
                  client.user.username,
                  `AI abstained (${reason}${conf}${margin}${guess}) - asking for hint.`,
                  "debug"
                );
                if (canSend(client)) sendHint(message.channel, client);
                return;
              }

              const predictedPokemon = pred.name;
              const isHuntTarget = config.hunting.HuntPokemons.map((huntName) =>
                huntName.toLowerCase()
              ).includes(predictedPokemon.toLowerCase());
              const hunted =
                isHuntTarget &&
                (await huntPokemon(
                  predictedPokemon,
                  message.guild.id,
                  message.channel.id
                ));
              if (!hunted) {
                let pokemonRandom = await getName({
                  name: predictedPokemon,
                  inputLanguage: "English",
                }).catch(() => null);
                if (!pokemonRandom) {
                  pokemonRandom = predictedPokemon;
                }
                try {
                  /*
                  Register the waiter before sending: awaitMessage only sees messages
                  dispatched after it is attached, and Poketwo can answer before the
                  send request resolves.
                  */
                  const responsePromise = message.channel.awaitMessage({
                    filter: (msg) =>
                      msg.author.id === POKETWO_ID &&
                      (isWrongPokemonMessage(msg.content) ||
                        isCaughtMessage(msg.content, client.user.id)),
                    time: 5000,
                    errors: false,
                  });

                  await message.channel.send(
                    `${POKETWO_MENTION} c ${pokemonRandom}`
                  );

                  const response = await responsePromise;

                  if (response) {
                    if (isWrongPokemonMessage(response.content)) {
                      setTimeout(() => {
                        sendHint(response.channel, client);
                      }, 500);
                    } else if (
                      isCaughtMessage(response.content, client.user.id)
                    ) {
                      const parsedCatch = parseCatchMessage(response.content);
                      if (parsedCatch) {
                        await handleCaughtResponse(
                          client,
                          response,
                          parsedCatch
                        );
                      }
                    }
                  }
                } catch (error) {
                  sendLog(
                    client.user.username,
                    `Error during pokemon catch: ${error.message || error}`,
                    "error"
                  );
                }
              }
            })
            .catch((error) => {
              sendLog(
                client.user.username,
                `AI prediction failed: ${error.message || error}`,
                "error"
              );

              if (canSend(client)) sendHint(message.channel, client);
            });
        } else {
          if (canSend(client)) sendHint(message.channel, client);
        }

        if (config.incense.IncenseMode === true && isIncenseSpawn(message)) {
          if (!client._incenseActive) {
            client._incenseActive = true;
            sendLog(client.user.username, "Detected incense.", "incense");
          }
          if (message.embeds[0]?.footer.text.includes("Spawns Remaining: 0.")) {
            client._incenseActive = false;
            if (
              canSend(client) &&
              config.incense.AutoIncenseBuy === true &&
              message.channel.id === config.incense.IncenseChannel
            ) {
              sendLog(
                client.user.username,
                "Incense ran out, buying next one.",
                "auto-incense"
              );
              message.channel
                .send(`${POKETWO_MENTION} incense buy 30m 10s -y`)
                .catch((error) =>
                  sendLog(
                    client.user.username,
                    `Failed to buy incense: ${error.message || error}`,
                    "error"
                  )
                );
              const msg = await message.channel.awaitMessage({
                filter: (message) =>
                  message.content.includes(
                    "You don't have enough shards for that!"
                  ),
                time: 5000,
                errors: false,
              });

              if (msg) {
                setWaiting(client.user.id, false);
              }
            } else {
              setWaiting(client.user.id, false);
              sendLog(
                client.user.username,
                "Detected the end of the incense.",
                "incense"
              );
            }
          }
        }
      } else if (message.content.includes("The pokémon is")) {
        const pokemon = await solveHint(message);
        if (!canSend(client)) return;
        if (pokemon[0] && typeof pokemon[0] === "string") {
          // Check whether any hint candidate is a hunt target
          const huntList = config.hunting.HuntPokemons.map((huntName) =>
            huntName.toLowerCase()
          );
          const huntMatch = [pokemon[0], pokemon[1], pokemon[2]].find((name) =>
            huntList.includes(name?.toLowerCase())
          );
          const hunted =
            huntMatch &&
            (await huntPokemon(
              huntMatch,
              message.guild.id,
              message.channel.id
            ));
          if (hunted) return;

          let pokemonRandomLanguage = await getName({
            name: pokemon[0],
            inputLanguage: "English",
          }).catch(() => null);
          if (pokemonRandomLanguage) {
            pokemon[0] = pokemonRandomLanguage;
          }

          const maxAttempts = 3;
          const pokemonOptions = [pokemon[0], pokemon[1], pokemon[2]];

          for (let i = 0; i < maxAttempts && i < pokemonOptions.length; i++) {
            if (!canSend(client)) break;
            if (pokemonOptions[i]) {
              const responsePromise = message.channel.awaitMessage({
                filter: (msg) =>
                  msg.author.id === POKETWO_ID &&
                  (isWrongPokemonMessage(msg.content) ||
                    isCaughtMessage(msg.content, client.user.id)),
                time: 5000,
                errors: false,
              });

              await message.channel.send(
                `${POKETWO_MENTION} c ${pokemonOptions[i]}`
              );

              const response = await responsePromise;

              if (!response || !isWrongPokemonMessage(response.content)) {
                if (
                  response &&
                  isCaughtMessage(response.content, client.user.id)
                ) {
                  const parsedCatch = parseCatchMessage(response.content);
                  if (parsedCatch) {
                    await handleCaughtResponse(client, response, parsedCatch);
                  }
                }
                break;
              }

              if (i === maxAttempts - 1 || !pokemonOptions[i + 1]) {
                await message.channel.send(
                  `${POKETWO_MENTION} ${getRandomHint()}`
                );
              }
            }
          }
        }
      } else if (message.content.startsWith("Please pick a starter pokémon")) {
        let starters = ["bulbasaur", "charmander", "squirtle"];
        await wait(300);
        if (canSend(client)) {
          await message.channel.send(
            `${POKETWO_MENTION} pick ${starters[randomInteger(0, 2)]}`
          );
        }
      } else if (
        message?.embeds[0]?.footer &&
        message?.embeds[0].footer.text.includes("Terms") &&
        message?.components[0]?.components[0]
      ) {
        // Handle terms acceptance and initial setup
        const referencedMessage =
          message.reference || (await message.fetchReference());
        let originalCommand = referencedMessage?.content || "";

        if (!originalCommand) {
          const messages = await message.channel
            .fetchMessages({ limit: 2, around: message.id })
            .catch((error) => {
              sendLog(
                client.user.username,
                `Failed to fetch surrounding messages: ${error.message || error}`,
                "error"
              );
              return [];
            });
          originalCommand =
            messages.find((m) => m.id !== message.id)?.content || "";
        }

        if (
          !originalCommand ||
          !["pick", "catch", "c", "hint"].some((kw) =>
            originalCommand.includes(kw)
          )
        ) {
          return;
        }

        await message.clickButton();
        if (message?.embeds[0].title.includes("Updated")) return;
        await wait(3000);
        message.channel
          .send(`${POKETWO_MENTION} i`)
          .catch((error) =>
            sendLog(
              client.user.username,
              `Failed to send inventory command: ${error.message || error}`,
              "error"
            )
          );
        await wait(2000);
        message.channel
          .send(`${POKETWO_MENTION} sh solosis`)
          .catch((error) =>
            sendLog(
              client.user.username,
              `Failed to send hunt command: ${error.message || error}`,
              "error"
            )
          );
        await wait(2000);
        message.channel
          .send(`${POKETWO_MENTION} order iv`)
          .catch((error) =>
            sendLog(
              client.user.username,
              `Failed to send order command: ${error.message || error}`,
              "error"
            )
          );
      } else if (isCaughtMessage(message.content, client.user.id)) {
        const parsedCatch = parseCatchMessage(message.content);
        if (parsedCatch) {
          await handleCaughtResponse(client, message, parsedCatch);
        }
      }
    }
  },
};
