const { Client } = require("discord-self-lite");
const fs = require("fs-extra");
const { sendLog } = require("../functions/logging.js");
const clients = [];

class Catcher {
  constructor(token, guildId, lineNumber) {
    this.token = token;
    this.guildId = guildId;
    this.lineNumber = lineNumber;
    this.pokemon = {};
  }

  listen() {
    const client = new Client();
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
        createAccountStats(this.client.user.id);
      })
      .catch((error) => {
        // Line number identifies the failing entry; the 12-char prefix is
        // only a visual cross-check. Never log the full secret: the error
        // text is third-party output, so redact the token from it too.
        const token = String(this.token);
        const tokenHint = token.slice(0, 12) + "…";
        const where = this.lineNumber
          ? ` (tokens.txt line ${this.lineNumber})`
          : "";
        const safeError = token
          ? String(error).replaceAll(token, "[REDACTED]")
          : String(error);
        sendLog(
          null,
          `Failed to login to token${where}: ${tokenHint}\n\t\t ${safeError}`,
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
