const config = require("../../config.js");

const {
  sendLog,
  sendWebhook,
  sendQuestWebhook,
  getMentions,
  loggingOption,
  shouldPingCategory,
} = require("../services/logging.js");
const {
  getWaiting,
  setWaiting,
  stopAccount,
} = require("../services/states.js");
const { addStat } = require("../services/stats.js");
const { resumeIncense } = require("../services/incense.js");
const { POKETWO_ID, POKETWO_MENTION } = require("../constants.js");

const POKEMON_PATTERN = "pok(?:\\u00e9|e)mon";
const POKECOINS_PATTERN = "Pok(?:\\u00e9|e)coins";
const CAPTCHA_RESULT_DELAYS_MS = [
  15_000, 15_000, 15_000, 15_000, 30_000, 30_000, 30_000, 30_000, 60_000,
  60_000,
];

function findExistingDM(client, userId) {
  for (const channel of client.channels.values()) {
    if (channel.type !== 1) continue;
    if (
      channel.recipients?.some(
        (recipient) => String(recipient.id) === String(userId)
      )
    ) {
      return channel;
    }
  }
  return null;
}

function parseCoinAmount(value) {
  const amount = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function parseQuestCompletion(content) {
  const questMatch = content.match(/\*\*(.*?)\*\*/);
  const questText = questMatch ? questMatch[1] : content;
  const amountMatch = questText.match(
    new RegExp(`Catch\\s+(\\d+).*?${POKEMON_PATTERN}`, "i")
  );
  const regionMatch = questText.match(/found in the (.*?) region/i);
  const typeMatch = questText.match(
    new RegExp(`(?:<a?:[^>]+>\\s*)?([A-Za-z]+-type)\\s+${POKEMON_PATTERN}`, "i")
  );
  const pokecoinsMatch = content.match(
    new RegExp(
      `received\\s+(?:\\*\\*)?([\\d,]+)(?:\\*\\*)?\\s+${POKECOINS_PATTERN}!?`,
      "i"
    )
  );

  let target = "pokemon";
  if (regionMatch) {
    target = `${regionMatch[1]} region pokemon`;
  } else if (typeMatch) {
    target = `${typeMatch[1]} pokemon`;
  }

  return {
    amount: amountMatch ? amountMatch[1] : "0",
    target,
    quest: questText,
    pokecoins: parseCoinAmount(pokecoinsMatch?.[1]),
  };
}

function parseQuestTrackReward(content) {
  if (typeof content !== "string") return null;

  const match = content.match(
    /received the (?:\*\*)?([^*]+?)(?:\*\*)? (badge|backgrounds?)\b/i
  );
  if (!match) return null;

  return {
    name: match[1].trim(),
    type: match[2].toLowerCase().startsWith("background")
      ? "background"
      : "badge",
  };
}

module.exports = {
  name: "messageCreate",
  parseCoinAmount,
  parseQuestCompletion,
  parseQuestTrackReward,
  execute: async (client, guildId, message) => {
    if (client.stopped || client.suspended) return;

    if (
      message?.author.id === POKETWO_ID &&
      (getWaiting(client.user.id) === false ||
        message?.embeds[0]?.title?.includes("Account Suspended"))
    ) {
      if (message?.embeds[0]?.title?.includes("Account Suspended")) {
        const messages = await message.channel
          .fetchMessages({
            limit: 2,
            around: message.id,
          })
          .catch(() => []);

        if (client.stopped || client.suspended) return;

        const otherMessage = messages.find((m) => m.id !== message.id);

        if (otherMessage?.author.id === client.user.id) {
          client.suspended = true;
          stopAccount(client.user.id);

          let timeout;
          try {
            const deadline = new Promise((resolve) => {
              timeout = setTimeout(resolve, 10_000);
            });
            sendLog(client.user.username, "Detected suspension.", "suspension");

            await Promise.race([
              deadline,
              Promise.allSettled([
                Promise.resolve().then(() => {
                  if (client.stopped) return;
                  return sendWebhook(getMentions(), {
                    title: `Account ${client.user.username} was suspended!`,
                    color: "#FF0000",
                    footer: {
                      text: "CatchTwo by @kyan0045",
                      icon_url:
                        "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
                    },
                  });
                }),
                ...config.ownership.OwnerIDs.map(async (id) => {
                  if (id.length <= 16 || client.stopped) return;

                  try {
                    const user = await client.fetchUser(id);
                    if (client.stopped) return;
                    const dmChannel = await user.createDM();
                    if (client.stopped) return;

                    const lastMessage = await dmChannel
                      .fetchMessage(dmChannel?.lastMessageId)
                      .catch(() => null);
                    if (client.stopped) return;
                    if (lastMessage?.content?.includes("suspended")) return;

                    await user.send(
                      `## ACCOUNT SUSPENDED\n> Your account has been suspended. The autocatcher has been paused. Please check your account for more information.`
                    );
                  } catch (error) {
                    if (client.stopped) return;
                    sendLog(
                      client.user.username,
                      `Error notifying owner about suspension: ${
                        error.message || error
                      }`,
                      "error"
                    );
                  }
                }),
              ]),
            ]);
          } finally {
            clearTimeout(timeout);
            client.catcher.destroy();
          }
          return;
        }
      }

      if (
        message.content.includes(
          `https://verify.poketwo.net/captcha/${client.user.id}`
        )
      ) {
        if (getWaiting(client.user.id) === true) return;
        setWaiting(client.user.id, true);
        sendLog(client.user.username, "Detected captcha.", "captcha");

        if (config.incense.IncenseMode === true) {
          message
            .reply(`${POKETWO_MENTION} incense pause all -y`)
            .catch((error) =>
              sendLog(
                client.user.username,
                `Failed to pause incense: ${error.message || error}`,
                "error"
              )
            );
        }

        await sendWebhook(config.captchaSolving.key ? null : getMentions(), {
          title: `Captcha Found!`,
          description: config.captchaSolving.key
            ? `A captcha has been detected for ${client.user.username}.`
            : `A captcha has been detected for ${client.user.username}. Please solve it to continue catching.`,
          color: "#FF5600",
          url: `https://verify.poketwo.net/captcha/${client.user.id}`,
          footer: {
            text: "CatchTwo by @kyan0045",
            icon_url:
              "https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png",
          },
        });
        for (const id of config.ownership.OwnerIDs) {
          if (!id || id.length <= 16) continue;
          const dmChannel = findExistingDM(client, id);
          if (!dmChannel) {
            sendLog(
              client.user.username,
              `Failed to send captcha DM to owner ${id}: no existing DM channel.`,
              "warning"
            );
            continue;
          }
          try {
            const lastMessage = await dmChannel
              .fetchMessage(dmChannel.lastMessageId)
              .catch(() => null);
            if (
              lastMessage?.content?.includes("captcha") &&
              lastMessage?.author?.id === client.user.id &&
              lastMessage?.createdTimestamp > Date.now() - 86400000
            ) {
              continue;
            }
            await dmChannel.send(
              `## DETECTED A CAPTCHA\n> I've detected a captcha. The autocatcher has been paused. To continue, please solve the captcha below.\n* https://verify.poketwo.net/captcha/${client.user.id}\n\n### SOLVED?\n> Once solved, run the command \`\`${config.ownership.CommandPrefix}solved\`\` to continue catching.`
            );
          } catch (error) {
            sendLog(
              client.user.username,
              `Error sending captcha DM to owner ${id}: ${error.message || error}`,
              "error"
            );
          }
        }

        if (config.captchaSolving.key) {
          let taskId;

          try {
            const response = await fetch(
              "https://captchasolver.kyanbosman.com/solve-captcha",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "api-key": `${config.captchaSolving.key}`,
                },
                body: JSON.stringify({
                  token: client.token,
                  userId: client.user.id,
                }),
                signal: AbortSignal.timeout(15_000),
              }
            );
            if (!response.ok) {
              throw new Error(
                `Captcha solver returned status ${response.status}`
              );
            }
            const submission = await response.json();
            taskId = submission?.requestId;
            if (!taskId) throw new Error("Captcha solver returned no task ID.");
          } catch (error) {
            sendLog(
              client.user.username,
              `Failed to submit captcha to solver: ${error.message}`,
              "error"
            );
            await sendWebhook(getMentions(), {
              title: "Captcha Solver Submission Failed!",
              color: "#FF0000",
            });
            return;
          }

          sendLog(client.user.username, "Solver Task ID: " + taskId, "debug");

          sendLog(
            client.user.username,
            "Sent captcha to the solver.",
            "captcha"
          );
          await new Promise((resolve) => setTimeout(resolve, 30_000));

          for (
            let attempt = 0;
            attempt < CAPTCHA_RESULT_DELAYS_MS.length;
            attempt++
          ) {
            await new Promise((resolve) =>
              setTimeout(resolve, CAPTCHA_RESULT_DELAYS_MS[attempt])
            );
            try {
              const response = await fetch(
                `https://captchasolver.kyanbosman.com/results/${taskId}`,
                {
                  headers: {
                    "api-key": `${config.captchaSolving.key}`,
                  },
                  signal: AbortSignal.timeout(15_000),
                }
              );
              if (!response.ok) {
                throw new Error(
                  `Captcha result returned status ${response.status}`
                );
              }
              const result = await response.json();

              if (result.status === "completed") {
                setWaiting(client.user.id, false);
                sendLog(
                  client.user.username,
                  "Successfully solved the captcha!",
                  "captcha"
                );
                await resumeIncense(client, message.channel);
                await sendWebhook(getMentions(), {
                  title: "Captcha Solved!",
                  color: "#00FF00",
                });
                return;
              }

              if (result.status !== "pending") {
                sendLog(
                  client.user.username,
                  `Captcha solving failed with status: ${result.status || "unknown"}.`,
                  "captcha"
                );
                await sendWebhook(getMentions(), {
                  title: `Solve with ${taskId} failed!`,
                  color: "#FF0000",
                });
                return;
              }

              sendLog(
                client.user.username,
                `Captcha solve pending (${attempt + 1}/${CAPTCHA_RESULT_DELAYS_MS.length}).`,
                "debug"
              );
            } catch (error) {
              sendLog(
                client.user.username,
                `Error checking captcha result (${attempt + 1}/${CAPTCHA_RESULT_DELAYS_MS.length}): ${error.message}`,
                "error"
              );
            }
          }

          sendLog(
            client.user.username,
            "Captcha solver timed out; account remains paused.",
            "captcha"
          );
          await sendWebhook(getMentions(), {
            title: `Solve with ${taskId} timed out!`,
            color: "#FF0000",
          });
        }
      }
    }

    if (message.content.includes(`You have completed`)) {
      const messages = await message.channel
        .fetchMessages({
          limit: 2,
          around: message.id,
        })
        .catch(() => []);

      const triggeringMessage = messages.find((m) => m.id !== message.id);

      if (
        triggeringMessage?.author.id === client.user.id ||
        (triggeringMessage?.author.id === POKETWO_ID &&
          triggeringMessage.content.includes(client.user.id))
      ) {
        if (message.content.includes(`You have completed the quest`)) {
          const { amount, target, quest, pokecoins } = parseQuestCompletion(
            message.content
          );

          if (loggingOption("Quests")) {
            sendLog(
              client.user.username,
              `Detected quest completion: Caught ${amount} ${target} and received ${pokecoins} Pokécoins.`,
              "quest"
            );
            await sendQuestWebhook(
              client.user.username,
              quest,
              pokecoins,
              null,
              shouldPingCategory("Quests")
            );
          }
          addStat(client.user.id, "coins", pokecoins);
        } else if (message.content.includes(`You have completed this quest`)) {
          const reward = parseQuestTrackReward(message.content);

          if (loggingOption("Quests")) {
            if (reward) {
              const label =
                reward.type === "background" ? "background" : "badge";
              sendLog(
                client.user.username,
                `Detected quest track completion and received the ${reward.name} ${label}.`,
                "quest"
              );
              await sendQuestWebhook(
                client.user.username,
                null,
                null,
                reward,
                shouldPingCategory("Quests")
              );
            } else {
              sendLog(
                client.user.username,
                "Detected quest track completion but could not parse the reward.",
                "warning"
              );
            }
          }
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
        addStat(client.user.id, "coins", parseCoinAmount(pokeCoins[1]));
      }
    }
  },
};
