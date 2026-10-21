const chalk = require("chalk");
const date = require("date-and-time");
const config = require("../../config");
const { checkRarity } = require("pokehint");
const { WebhookClient } = require("discord-self-lite");
const { addStat } = require("./stats");

const WEBHOOK_AVATAR =
  "https://res.cloudinary.com/dppthk8lt/image/upload/ar_1.0,c_lpad/v1719331169/catchtwo_bjvlqi.png";

function getMentions() {
  return config.ownership.OwnerIDs.filter((ownerID) => ownerID.length >= 18)
    .map((ownerID) => `<@${ownerID}>`)
    .join(", ");
}

const LOG_COLORS = {
  info: chalk.bold.blue,
  error: chalk.bold.red,
  warning: chalk.bold.yellow,
  catch: chalk.cyan,
  "special catch": chalk.bold.cyan,
  captcha: chalk.bold.red,
  incense: chalk.bold.green,
  "auto-incense": chalk.bold.green,
  quest: chalk.rgb(247, 166, 59).bold,
  debug: chalk.bold.magenta,
};

function loggingOption(name) {
  return config.logging?.[name] !== false;
}

const LOGGING_FLAGS = [
  "Pokemon",
  "Quests",
  "LowIV",
  "HighIV",
  "SpecialCatches",
];

let missingWebhookNotified = false;

// An empty LogWebhook disables webhook output; warn only when logging is enabled but no destination is set.
function getWebhookClient() {
  const url = config.logging?.LogWebhook;
  if (!url || url === "Webhook") {
    if (!missingWebhookNotified && LOGGING_FLAGS.some(loggingOption)) {
      missingWebhookNotified = true;
      sendLog(
        null,
        "Logging is enabled but logging.LogWebhook is empty; set it to a Discord webhook URL to receive webhook logs.",
        "error"
      );
    }
    return null;
  }
  return new WebhookClient(url);
}

function canPingLoggingAlerts() {
  return loggingOption("Pokemon");
}

function getWebhookMessage(content, embed, files) {
  const messageData = {
    username: "CatchTwo",
    avatarURL: WEBHOOK_AVATAR,
  };

  if (content !== undefined) {
    messageData.content = content;
  }

  if (embed !== undefined) {
    messageData.embeds = [embed];
  }

  if (files !== undefined) {
    messageData.files = files;
  }

  return messageData;
}

function sendLog(username, message, type = "info") {
  const typeLower = type.toLowerCase();
  if (typeLower === "debug" && !config.debug) return;

  const now = new Date();
  const timeStr = chalk.white.bold(date.format(now, "HH:mm"));
  const colorFn = LOG_COLORS[typeLower] || chalk.bold.blue;
  const tag = colorFn(`[${type.toUpperCase()}]`);

  const excludeUser = ["info", "error", "warning"].includes(typeLower);
  const userPrefix =
    username && !excludeUser ? `${chalk.bold.red(username)}: ` : "";

  console.log(`${tag} - ${timeStr}: ${userPrefix}${message}`);
}

async function sendWebhook(content, embed) {
  try {
    const webhook = getWebhookClient();
    if (!webhook) return;
    await webhook.send(getWebhookMessage(content, embed));
  } catch (err) {
    if (err.code === "WEBHOOK_URL_INVALID") {
      sendLog(
        null,
        `Invalid webhook URL: ${config.logging.LogWebhook}`,
        "error"
      );
    } else {
      sendLog(null, `Webhook send failed: ${err.message || err}`, "error");
    }
  }
}

async function sendCommandWebhook(webhookURL, content, embed, files) {
  if (!webhookURL || webhookURL === "Webhook") return false;
  try {
    const webhook = new WebhookClient(webhookURL);
    await webhook.send(getWebhookMessage(content, embed, files));
    return true;
  } catch (err) {
    if (err.code === "WEBHOOK_URL_INVALID") {
      sendLog(null, `Invalid webhook URL: ${webhookURL}`, "error");
    } else {
      sendLog(null, `Webhook send failed: ${err.message || err}`, "error");
    }
    return false;
  }
}

async function sendCatchWebhook(
  username,
  messageUrl,
  name,
  level,
  iv,
  gender,
  rarity,
  url,
  shouldPing = Boolean(rarity)
) {
  try {
    const webhook = getWebhookClient();
    if (!webhook) return;
    const title = rarity ? `${rarity} Pokemon Caught!` : "Pokemon Caught!";
    const embed = {
      title,
      url: messageUrl,
      description:
        "**Account:** " +
        username +
        "\n" +
        "**Pokemon:** " +
        name +
        "\n" +
        "**Level:** " +
        level +
        "\n" +
        "**IV:** " +
        `${iv}%` +
        "\n" +
        "**Gender:** " +
        gender,
      color: "#313338",
      timestamp: new Date(),
      footer: {
        text: "CatchTwo by @kyan0045",
        icon_url: WEBHOOK_AVATAR,
      },
      thumbnail: {
        url: `${url}`,
      },
    };

    await webhook.send(
      getWebhookMessage(
        shouldPing && canPingLoggingAlerts() ? getMentions() : undefined,
        embed
      )
    );
  } catch (err) {
    if (err.code === "WEBHOOK_URL_INVALID") {
      sendLog(
        null,
        `Invalid webhook URL: ${config.logging.LogWebhook}`,
        "error"
      );
    } else {
      sendLog(null, `Webhook send failed: ${err.message || err}`, "error");
    }
  }
}

async function sendQuestWebhook(
  username,
  quest,
  reward,
  badge,
  shouldPing = false
) {
  try {
    const webhook = getWebhookClient();
    if (!webhook) return;
    const embed = {
      title: badge ? "Quest Track Completed!" : "Quest Completed!",
      description: badge
        ? `**Account:** ${username}\n**Badge:** ${badge}`
        : `**Account:** ${username}\n**Quest:** ${quest}\n**Reward:** ${reward} Pokecoins`,
      color: "#f7a63b",
      timestamp: new Date(),
      footer: {
        text: "CatchTwo by @kyan0045",
        icon_url: WEBHOOK_AVATAR,
      },
    };

    await webhook.send(
      getWebhookMessage(
        shouldPing && canPingLoggingAlerts() ? getMentions() : undefined,
        embed
      )
    );
  } catch (err) {
    if (err.code === "WEBHOOK_URL_INVALID") {
      sendLog(
        null,
        `Invalid webhook URL: ${config.logging.LogWebhook}`,
        "error"
      );
    } else {
      sendLog(null, `Webhook send failed: ${err.message || err}`, "error");
    }
  }
}

async function sendCatch(
  id,
  username,
  messageUrl,
  name,
  level,
  iv,
  gender,
  shiny,
  gigantamax,
  url
) {
  let genderEmoji = "?";
  if (gender.includes("female")) {
    genderEmoji = "Female";
  } else if (gender.includes("male")) {
    genderEmoji = "Male";
  }

  const shouldPingAlerts = canPingLoggingAlerts();

  if (shiny) {
    addStat(id, "shiny");
    if (loggingOption("SpecialCatches")) {
      sendLog(
        username,
        `Caught a Shiny ${name} (Level ${level}) with ${iv}% IV!`,
        "special catch"
      );
      await sendCatchWebhook(
        username,
        messageUrl,
        name,
        level,
        iv,
        gender,
        "Shiny",
        url,
        shouldPingAlerts
      );
    }
    return;
  }

  if (gigantamax) {
    addStat(id, "gigantamax");
    if (loggingOption("SpecialCatches")) {
      sendLog(
        username,
        `Caught a Gigantamax ${name} (Level ${level}) with ${iv}% IV!`,
        "special catch"
      );
      await sendCatchWebhook(
        username,
        messageUrl,
        name,
        level,
        iv,
        gender,
        "Gigantamax",
        url,
        shouldPingAlerts
      );
    }
    return;
  }

  if (Number(iv) >= config.logging.HighIVThreshold) {
    addStat(id, "catches");
    if (loggingOption("HighIV")) {
      sendLog(
        username,
        `Caught a ${genderEmoji} High IV ${name} (Level ${level}) with ${iv}% IV!`,
        "special catch"
      );
      await sendCatchWebhook(
        username,
        messageUrl,
        name,
        level,
        iv,
        gender,
        "High IV",
        url,
        shouldPingAlerts
      );
    }
    return;
  }

  if (Number(iv) <= config.logging.LowIVThreshold) {
    addStat(id, "catches");
    if (loggingOption("LowIV")) {
      sendLog(
        username,
        `Caught a ${genderEmoji} Low IV ${name} (Level ${level}) with ${iv}% IV!`,
        "special catch"
      );
      await sendCatchWebhook(
        username,
        messageUrl,
        name,
        level,
        iv,
        gender,
        "Low IV",
        url,
        shouldPingAlerts
      );
    }
    return;
  }

  // A rarity lookup failure shouldn't drop the catch: it's counted as a regular catch instead.
  const rarity = await checkRarity(name).catch(() => null);
  const isRegular = !rarity || rarity === "Regular";
  const statKey = isRegular ? "catches" : rarity.toLowerCase().replace(" ", "");
  addStat(id, statKey);

  if (isRegular && !loggingOption("Pokemon")) {
    sendLog(
      username,
      `Caught ${name} (Level ${level}, ${iv}% IV) but logging.Pokemon is disabled.`,
      "debug"
    );
    return;
  }
  if (!isRegular && !loggingOption("SpecialCatches")) return;

  const logType = isRegular ? "catch" : "special catch";
  const logPrefix = isRegular ? "" : `${rarity} `;

  sendLog(
    username,
    `Caught a ${genderEmoji} ${logPrefix}${name} (Level ${level}) with ${iv}% IV!`,
    logType
  );

  await sendCatchWebhook(
    username,
    messageUrl,
    name,
    level,
    iv,
    gender,
    isRegular ? undefined : rarity,
    url,
    !isRegular && shouldPingAlerts
  );
}

module.exports = {
  sendLog,
  sendCatch,
  sendWebhook,
  sendCommandWebhook,
  sendCatchWebhook,
  sendQuestWebhook,
  getMentions,
  loggingOption,
  canPingLoggingAlerts,
};
