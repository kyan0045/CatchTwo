const chalk = require("chalk");
const date = require("date-and-time");
const config = require("../../config");
const { checkRarity } = require("pokehint");
const { WebhookClient } = require("discord-self-lite");
const { addStat } = require("../utils/stats");

function isInvalidWebhookError(error) {
  return (
    error.message === "Invalid webhook URL" ||
    error.status === 401 ||
    error.status === 404 ||
    error.fullError?.code === 10015
  );
}

async function getMentions() {
  const mentions = config.ownership.OwnerIDs.filter(
    (ownerID) => ownerID.length >= 18
  )
    .map((ownerID) => `<@${ownerID}>`)
    .join(", ");

  return mentions;
}

function sendLog(username, message, type) {
  let now = new Date();

  switch (type.toLowerCase()) {
    case "info":
      console.log(
        chalk.bold.blue(`[${type.toUpperCase()}]`) +
          ` - ` +
          chalk.white.bold(date.format(now, "HH:mm")) +
          `: ` +
          message
      );
      break;
    case "error":
      console.log(
        chalk.bold.red(`[${type.toUpperCase()}]`) +
          ` - ` +
          chalk.white.bold(date.format(now, "HH:mm")) +
          `: ` +
          message
      );
      break;
    case "warning":
      console.log(
        chalk.bold.yellow(`[${type.toUpperCase()}]`) +
          ` - ` +
          chalk.white.bold(date.format(now, "HH:mm")) +
          `: ` +
          message
      );
      break;
    case "catch":
      console.log(
        chalk.cyan(`[${type.toUpperCase()}]`) +
          ` - ` +
          chalk.white.bold(date.format(now, "HH:mm")) +
          `: ` +
          chalk.bold.red(username) +
          `: ` +
          message
      );
      break;
    case "special catch":
      console.log(
        chalk.bold.cyan(`[${type.toUpperCase()}]`) +
          ` - ` +
          chalk.white.bold(date.format(now, "HH:mm")) +
          `: ` +
          chalk.bold.red(username) +
          `: ` +
          message
      );
      break;
    case "captcha":
      console.log(
        chalk.bold.red(`[${type.toUpperCase()}]`) +
          ` - ` +
          chalk.white.bold(date.format(now, "HH:mm")) +
          `: ` +
          chalk.bold.red(username) +
          `: ` +
          message
      );
      break;
    case "incense" || "auto-incense":
      console.log(
        chalk.bold.green(`[${type.toUpperCase()}]`) +
          ` - ` +
          chalk.white.bold(date.format(now, "HH:mm")) +
          `: ` +
          chalk.bold.red(username) +
          `: ` +
          message
      );
      break;
    case "quest":
      console.log(
        chalk.rgb(247, 166, 59).bold(`[${type.toUpperCase()}]`) +
          ` - ` +
          chalk.white.bold(date.format(now, "HH:mm")) +
          `: ` +
          chalk.bold.red(username) +
          `: ` +
          message
      );
      break;
    case "debug":
      if (config?.debug === false || config?.debug === undefined) return;
      console.log(
        chalk.bold.magenta(`[${type.toUpperCase()}]`) +
          ` - ` +
          chalk.white.bold(date.format(now, "HH:mm")) +
          `: ` +
          (username ? `${chalk.bold.red(username)}: ` : "") +
          message
      );
      break;
    default:
      console.log(
        chalk.bold.blue(`[${type.toUpperCase()}]`) +
          ` - ` +
          chalk.white.bold(date.format(now, "HH:mm")) +
          `: ` +
          chalk.bold.red(username) +
          `: ` +
          message
      );
  }
}

async function sendWebhook(content, embed) {
  try {
    const webhook = new WebhookClient({ url: config.logging.LogWebhook });

    const messageData = {
      username: "CatchTwo",
      avatarURL:
        "https://res.cloudinary.com/dppthk8lt/image/upload/ar_1.0,c_lpad/v1719331169/catchtwo_bjvlqi.png",
    };

    if (content !== undefined) {
      messageData.content = content;
    }

    if (embed !== undefined) {
      messageData.embeds = [embed];
    }

    await webhook.send(messageData);
  } catch (err) {
    if (isInvalidWebhookError(err)) {
      sendLog(
        null,
        `Invalid webhook URL: ${config.logging.LogWebhook}`,
        "error"
      );
    } else {
      console.log(err);
    }
  }
}

async function sendCommandWebhook(webhookURL, content, embed, files) {
  try {
    const webhook = new WebhookClient({ url: webhookURL });

    const messageData = {
      username: "CatchTwo",
      avatarURL:
        "https://res.cloudinary.com/dppthk8lt/image/upload/ar_1.0,c_lpad/v1719331169/catchtwo_bjvlqi.png",
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

    await webhook.send(messageData);
  } catch (err) {
    if (isInvalidWebhookError(err)) {
      sendLog(null, `Invalid webhook URL: ${webhookURL}`, "error");
    } else {
      console.log(err);
    }
  }
}

async function sendCatchWebhook(
  username,
  name,
  level,
  iv,
  gender,
  rarity,
  url
) {
  try {
    const webhook = new WebhookClient({ url: config.logging.LogWebhook });
    const title = rarity ? `${rarity} Pokemon Caught!` : "Pokemon Caught!";
    let embed = {
      title: title,
      url: "https://github.com/kyan0045/CatchTwo",
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
        iv +
        "\n" +
        "**Gender:** " +
        gender,
      color: "#313338",
      timestamp: new Date(),
      footer: {
        text: "CatchTwo by @kyan0045",
        icon_url:
          "https://res.cloudinary.com/dppthk8lt/image/upload/ar_1.0,c_lpad/v1719331169/catchtwo_bjvlqi.png",
      },
      thumbnail: {
        url: `${url}`,
      },
    };
    if (rarity) {
      await webhook.send({
        username: "CatchTwo",
        avatarURL:
          "https://res.cloudinary.com/dppthk8lt/image/upload/ar_1.0,c_lpad/v1719331169/catchtwo_bjvlqi.png",
        content: `${await getMentions()}`,
        embeds: [embed],
      });
    } else {
      await webhook.send({
        username: "CatchTwo",
        avatarURL:
          "https://res.cloudinary.com/dppthk8lt/image/upload/ar_1.0,c_lpad/v1719331169/catchtwo_bjvlqi.png",
        embeds: [embed],
      });
    }

  } catch (err) {
    if (isInvalidWebhookError(err)) {
      sendLog(null, `Invalid webhook URL: ${config.logging.LogWebhook}`, "error");
    } else {
      console.log(err);
    }
  }
}

async function sendCatch(
  username,
  name,
  level,
  iv,
  gender,
  shiny,
  gigantamax,
  url,
  logCatch = true
) {
  let genderSymbol;
  let stat;
  let label;
  let logType = "special catch";
  let webhookRarity;

  if (gender.includes("female")) {
    genderSymbol = "♀";
  } else if (gender.includes("male")) {
    genderSymbol = "♂";
  }

  if (shiny) {
    stat = "shiny";
    label = "✨";
    webhookRarity = "Shiny";
  } else if (gigantamax) {
    stat = "gigantamax";
    label = "Gigantamax";
    webhookRarity = "Gigantamax";
  } else {
    const rarity = await checkRarity(name).catch(() => "Regular");
    const rarityStat = rarity.toLowerCase().replace(/\s/g, "");
    stat = rarityStat === "regular" ? "catches" : rarityStat;

    if (parseFloat(iv) >= config.logging.HighIVThreshold) {
      label = "High IV";
      webhookRarity = "High IV";
    } else if (parseFloat(iv) <= config.logging.LowIVThreshold) {
      label = "Low IV";
      webhookRarity = "Low IV";
    } else if (rarity === "Regular") {
      label = "";
      logType = "catch";
    } else {
      label = rarity;
      webhookRarity = rarity;
    }
  }

  addStat(username, stat);

  if (!logCatch) return;

  const article = /^[aeiou]/i.test(label || name) ? "an" : "a";
  const catchName = [genderSymbol, label, name]
    .filter(Boolean)
    .join(" ");
  sendLog(
    username,
    `Caught ${article} ${catchName} (Level ${level}) with ${iv} IV!`,
    logType
  );
  sendCatchWebhook(
    username,
    name,
    level,
    iv,
    gender,
    webhookRarity,
    url
  );
}

module.exports = {
  sendLog,
  sendCatch,
  sendWebhook,
  sendCommandWebhook,
  sendCatchWebhook,
  getMentions,
};
