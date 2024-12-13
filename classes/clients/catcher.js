const { Client } = require("discord.js-selfbot-v13");
const fs = require("fs-extra");

class Catcher {
  constructor(token, guildId) {
    this.token = token;
    this.guildId = guildId;
    this.pokemon = {};
  }

  listen() {
    const client = new Client({ checkUpdate: false, readyStatus: false });
    client.commands = new Map();

    const commandFiles = fs
      .readdirSync("./commands")
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(`../../commands/${file}`);
      client.commands.set(command.name, command);
    }
    this.client = client;

    const { listenEvents } = require("../../functions/listenEvents.js");
    listenEvents(this.client, this.guildId);
  }

  login() {
    this.client.login(this.token).catch((error) => {
      sendLog(null, `Failed to login to token: ${this.token}\n\t\t ${error}`, "error");
    });
  }

  start() {
    const { spam } = require("../../functions/spam.js");
    this.spamChannel = spam(this.client, this.guildId);

    const { eventOpen } = require("../../functions/event.js");
    /*setTimeout(() => {
      eventOpen(this.client, this.guildId);
    }, 5000);

    setInterval(() => {
      eventOpen(this.client, this.guildId);
    }, 1000 * 60 * 30);*/
  }
}

module.exports = { Catcher };
