const { Client } = require("discord.js-selfbot-v13");
class Catcher {
  constructor(token, guildId) {
    this.token = token;
    this.guildId = guildId;
    this.pokemon = {};
  }

  listen() {
    const client = new Client({ checkUpdate: false, readyStatus: false });
    this.client = client;

    const { listenEvents } = require("../../functions/listenEvents.js");
    listenEvents(this.client, this.guildId);
  }

  login() {
    this.client.login(this.token);
  }

  start() {
    const { spam } = require("../../functions/spam.js");
    this.spamChannel = spam(this.client, this.guildId);

    const { eventOpen } = require("../../functions/event.js");
    setTimeout(() => {
      eventOpen(this.client, this.spamChannel);
    }, 3000);

    setInterval(() => {
      eventOpen(this.client, this.spamChannel);
    }, 1000 * 60 * 30);
  }
}

module.exports = { Catcher };
