const { Client } = require("discord-self-lite");
const config = require("../../config.js");
const { sendLog } = require("../services/logging.js");
const { CatchTwoRestManager } = require("../services/queue.js");
const { POKETWO_MENTION } = require("../constants.js");

class ShinyHunter {
  constructor(token) {
    this.token = token;
    this.pokemon = {};
  }

  async login() {
    const client = new Client({
      restClass: CatchTwoRestManager,
      checkUpdate: false,
      readyStatus: false,
    });
    this.shinyHunterClient = client;
    await client.login(this.token);
  }

  async catch(spawnedGuild, spawnedChannel, spawnedPokemon) {
    let guild = await this.shinyHunterClient.resolveGuild(spawnedGuild);
    let channel = await guild.fetchChannel(spawnedChannel);
    if (!channel) {
      sendLog(
        null,
        "Your main/shinyHunter account does not have access to every channel/server.",
        "error"
      );
      return false;
    }

    const catchMessage = ["c", "catch"];
    const sent = await channel.send(
      `${POKETWO_MENTION} ${
        catchMessage[Math.floor(Math.random() * catchMessage.length)]
      } ${spawnedPokemon}`
    );
    if (!sent) return false;

    const pokemonName = spawnedPokemon.toLowerCase();
    this.pokemon[pokemonName] = (this.pokemon[pokemonName] || 0) + 1;
    return true;
  }
}

function resolveHuntToken(token = config.hunting?.HuntToken) {
  const value = typeof token === "string" ? token.trim() : "";
  if (!value || value === "HuntToken" || value === "...") return null;
  return value;
}

async function huntPokemon(pokemonName, guildId, channelId) {
  const token = resolveHuntToken();
  if (!token) {
    sendLog(
      null,
      "No HuntToken configured; catching with the main account.",
      "debug"
    );
    return false;
  }

  const shinyHunter = new ShinyHunter(token);
  try {
    await shinyHunter.login();
    return await shinyHunter.catch(guildId, channelId, pokemonName);
  } catch (error) {
    sendLog(
      null,
      `Hunt account failed, catching with the main account: ${error.message || error}`,
      "error"
    );
    return false;
  } finally {
    shinyHunter.shinyHunterClient?.destroy();
  }
}

module.exports = { ShinyHunter, huntPokemon, resolveHuntToken };
