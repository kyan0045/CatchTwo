const chalk = require("chalk");
const date = require("date-and-time");
const config = require("../../config");
const { checkRarity } = require("pokehint");
const { WebhookClient, MessageAttachment } = require("discord.js-selfbot-v13");
const { addStat } = require("../utils/stats");

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
    webhook.destroy();
  } catch (err) {
    if (err.code == "WEBHOOK_URL_INVALID") {
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
    webhook.destroy();
  } catch (err) {
    if (err.code == "WEBHOOK_URL_INVALID") {
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

    webhook.destroy();
  } catch (err) {
    if (err.code == "WEBHOOK_URL_INVALID") {
      sendLog(null, `Invalid webhook URL: ${config.logging.LogWebhook}`, "error");
    } else {
      console.log(err);
    }
  }
}

function sendCatch(username, name, level, iv, gender, shiny, url) {
  if (gender.includes("female")) {
    genderEmoji = "♂️";
    genderEmoji = "♀️";
  } else if (gender.includes("male")) {
    genderEmoji = "♂️";
  } else {
    genderEmoji = "❔";
  }

  if (shiny) {
    sendLog(
      username,
      `Caught a ✨ ${name} (Level ${level}) with ${iv} IV!`,
      "special catch"
    );
    sendCatchWebhook(username, name, level, iv, gender, "Shiny", url);
    addStat(username, "shiny");
    return;
  }

  if (parseFloat(iv) >= config.logging.HighIVThreshold) {
    sendLog(
      username,
      `Caught a ${genderEmoji} High IV ${name} (Level ${level}) with ${iv} IV!`,
      "special catch"
    );
    sendCatchWebhook(username, name, level, iv, gender, "High IV", url);
    return;
  }

  if (parseFloat(iv) <= config.logging.LowIVThreshold) {
    sendLog(
      username,
      `Caught a ${genderEmoji} Low IV ${name} (Level ${level}) with ${iv} IV!`,
      "special catch"
    );
    sendCatchWebhook(username, name, level, iv, gender, "Low IV", url);
    return;
  }

  checkRarity(name).then((rarity) => {
    addStat(
      username,
      rarity.toLowerCase().replace(" ", "") === "regular"
        ? "catches"
        : rarity.toLowerCase().replace(" ", "")
    );
    if (rarity == "Legendary") {
      sendLog(
        username,
        `Caught a ${genderEmoji} Legendary ${name} (Level ${level}) with ${iv} IV!`,
        "special catch"
      );
      sendCatchWebhook(username, name, level, iv, gender, rarity, url);
      return;
    } else if (rarity == "Mythical") {
      sendLog(
        username,
        `Caught a ${genderEmoji} Mythical ${name} (Level ${level}) with ${iv} IV!`,
        "special catch"
      );
      sendCatchWebhook(username, name, level, iv, gender, rarity, url);
      return;
    } else if (rarity == "Ultra Beast") {
      sendLog(
        username,
        `Caught an ${genderEmoji} Ultra Beast ${name} (Level ${level}) with ${iv} IV!`,
        "special catch"
      );
      sendCatchWebhook(username, name, level, iv, gender, rarity, url);
      return;
    } else if (rarity == "Event") {
      sendLog(
        username,
        `Caught an ${genderEmoji} Event ${name} (Level ${level}) with ${iv} IV!`,
        "special catch"
      );
      sendCatchWebhook(username, name, level, iv, gender, rarity, url);
      return;
    } else if (rarity == "Regional") {
      sendLog(
        username,
        `Caught a ${genderEmoji} Regional ${name} (Level ${level}) with ${iv} IV!`,
        "special catch"
      );
      sendCatchWebhook(username, name, level, iv, gender, rarity, url);
      return;
    } else if (rarity == "Regular") {
      sendLog(
        username,
        `Caught a ${genderEmoji} ${name} (Level ${level}) with ${iv} IV!`,
        "catch"
      );
      sendCatchWebhook(username, name, level, iv, gender, undefined, url);
      return;
    }
  });
}

module.exports = {
  sendLog,
  sendCatch,
  sendWebhook,
  sendCommandWebhook,
  sendCatchWebhook,
  getMentions,
};
