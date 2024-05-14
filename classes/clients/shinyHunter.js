const { Client } = require("discord.js-selfbot-v13");

class ShinyHunter {
  constructor(token) {
    this.token = token;
    this.pokemon = {};
  }

  login() {
    const client = new Client({ checkUpdate: false, readyStatus: false });
    client.login(this.token);
    this.shinyHunterClient = client;
  }

  async catch(spawnedGuild, spawnedChannel, spawnedPokemon) {
    let guild = await this.shinyHunterClient.guilds.fetch(spawnedGuild)
    let channel = await guild.channels.fetch(
      spawnedChannel
    );
    if (!channel)
      return console.error(
        "Your main account does not have access to every channel/server."
      );
    
    let catchMessage = ["c", "catch"];
    channel
      .send(
        `<@716390085896962058> ${
          catchMessage[Math.round(Math.random())]
        } ${spawnedPokemon}`
      )
      .then(() => {
        if (this.pokemon[spawnedPokemon.toLowerCase()])
          pokemon[spawnedPokemon]++;
        else this.pokemon[spawnedPokemon.toLowerCase()] = 1;
      });
  }
}

module.exports = { ShinyHunter };
