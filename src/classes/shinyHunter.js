const { Client } = require("discord-self-lite");

class ShinyHunter {
  constructor(token) {
    this.token = token;
    this.pokemon = {};
  }

  async login() {
    const client = new Client();
    this.shinyHunterClient = client;
    await client.login(this.token);
  }

  async catch(spawnedGuild, spawnedChannel, spawnedPokemon) {
    const guild = await this.shinyHunterClient.fetchGuild(spawnedGuild);
    const channel = await guild.fetchChannel(spawnedChannel);
    if (!channel)
      return console.error(
        "Your main/shinyHunter account does not have access to every channel/server."
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
