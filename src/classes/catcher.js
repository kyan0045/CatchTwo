const { Client } = require("discord-self-lite");
const fs = require("fs-extra");
const path = require("path");
const { sendLog } = require("../services/logging.js");
const { listenEvents } = require("../services/listenEvents.js");
const { createAccountStats } = require("../services/stats.js");
const { spam } = require("../services/spam.js");
const { stopAccount } = require("../services/states.js");
const { CatchTwoRestManager, stoppedError } = require("../services/queue.js");

const clients = [];

const preloadedCommands = [];
try {
  const commandFiles = fs
    .readdirSync(path.join(__dirname, "..", "commands"))
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    try {
      preloadedCommands.push(require(`../commands/${file}`));
    } catch (error) {
      console.error(`Error preloading command ${file}:`, error);
    }
  }
} catch (error) {
  console.error("Error reading commands directory:", error);
}

function removeClient(client) {
  const index = clients.indexOf(client);
  if (index !== -1) {
    clients.splice(index, 1);
  }
}

class Catcher {
  constructor(
    token,
    guildId,
    { accountNumber = null, lineNumber = null } = {}
  ) {
    this.token = token;
    this.guildId = guildId;
    this.accountNumber = accountNumber;
    this.lineNumber = lineNumber;
    this.stopped = false;
  }

  listen() {
    if (this.stopped || this.client) return;
    const client = new Client({ restClass: CatchTwoRestManager });
    client.catcher = this;
    client.stopped = false;
    this.destroyClient = client.destroy.bind(client);
    client.destroy = () => this.destroy();
    client.commands = new Map();

    for (const command of preloadedCommands) {
      if (command?.name) client.commands.set(command.name, command);
    }
    this.client = client;
    this.client.guildId = this.guildId;

    listenEvents(this.client, this.guildId);
  }

  login() {
    if (this.stopped || this.loginPromise) return this.loginPromise;
    clients.push(this.client);
    const login = this.client.login(this.token);
    this.loginPromise = login
      .then(() => {
        if (this.stopped) return;
        createAccountStats(this.client.user.id);
      })
      .catch((error) => {
        if (this.stopped) return;
        const token = String(this.token ?? "");
        const tokenHint = token ? `${token.slice(0, 12)}…` : "unknown";
        const account = this.accountNumber
          ? ` to account ${this.accountNumber}`
          : "";
        const where = this.lineNumber
          ? ` (tokens.txt line ${this.lineNumber})`
          : "";
        const rawError = error instanceof Error ? error.message : String(error);
        const safeError = token
          ? rawError.replaceAll(token, "[REDACTED]")
          : rawError;
        sendLog(
          null,
          `Failed to login${account}${where}: ${tokenHint}\n\t\t ${safeError}`,
          "error"
        );
        this.destroy();
      });
    return this.loginPromise;
  }

  start() {
    if (this.stopped || !this.client || this.client.stopped) return;
    this.spamChannel = spam(this.client, this.guildId).catch((error) => {
      sendLog(
        this.client?.user?.username ?? null,
        `Failed to start spammer: ${error.message || error}`,
        "error"
      );
      return null;
    });
  }

  destroy() {
    if (this.stopped || !this.client) return;
    this.stopped = true;
    this.client.stopped = true;
    if (this.client.user?.id) stopAccount(this.client.user.id);
    this.spamChannel = null;
    if (this.client.spamInterval) {
      clearInterval(this.client.spamInterval);
      this.client.spamInterval = null;
    }
    removeClient(this.client);
    const { catchers } = require("../services/createCatchers.js");
    const index = catchers.indexOf(this);
    if (index !== -1) catchers.splice(index, 1);
    try {
      this.destroyClient?.(stoppedError());
    } finally {
      if (this.client.ws) clearInterval(this.client.ws.heartbeatInterval);
    }
  }
}

module.exports = { Catcher, clients };
