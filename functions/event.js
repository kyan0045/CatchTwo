const fs = require("fs-extra");
const messages = fs
  .readFileSync("./data/messages/spam.txt", "utf-8")
  .split("\n");
const { Permissions } = require("discord.js-selfbot-v13");
const { getSpamming, setSpamming } = require("../utils/states.js");
const config = require("../config.json");
const { sendLog } = require("./logging.js");

async function eventOpen(client, channel_id) {
    /*const channel = client.channels.cache.get(channel_id);
    sendLog(client.user.username, `Action sent: opening event boxes`, "debug");
    channel.send(`<@716390085896962058> event`);*/
}

module.exports = { eventOpen };