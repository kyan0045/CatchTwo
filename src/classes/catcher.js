const { Client } = require("discord.js-selfbot-v13");
const fs = require("fs-extra");
const { sendLog } = require("../functions/logging.js");
const clients = [];

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
      .readdirSync("./src/commands")
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(`../commands/${file}`);
      client.commands.set(command.name, command);
    }
    this.client = client;
    this.client.guildId = this.guildId;

    const { listenEvents } = require("../functions/listenEvents.js");
    listenEvents(this.client, this.guildId);
  }

  login() {
    this.client
      .login(this.token)
      .then(() => {
        const { createAccountStats } = require("../utils/stats.js");
        createAccountStats(this.client.user.username);
      })
      .catch((error) => {
        sendLog(
          null,
          `Failed to login to token: ${this.token}\n\t\t ${error}`,
          "error"
        );
      });
    clients.push(this.client);
  }

  start() {
    const { spam } = require("../functions/spam.js");
    this.spamChannel = spam(this.client, this.guildId);
  }
}

module.exports = { Catcher, clients };
