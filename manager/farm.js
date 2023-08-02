const { Client } = require("discord.js-selfbot-v13");
class ShinyHunter {
  constructor(token) {
    this.token = token;
    this.pokes = {};
  }
  login() {
    const client = new Client({ checkUpdate: false, readyStatus: false });
    client.login(this.token);
    this.client = client;
  }
  async catch(channel, pokemon) {
    const cnl = await this.client.channels.cache.get(channel);
    if (!cnl)
      return console.error(
        "Seems like the main account isn't added to every server! Please check again..."
      );
    let msg = ["c", "catch"];
    cnl
      .send(
        `<@716390085896962058> ${msg[Math.round(Math.random())]} ${pokemon}`
      )
      .then(() => {
        if (this.pokes[pokemon.toLowerCase()]) pokes[pokemon]++;
        else this.pokes[pokemon.toLowerCase()] = 1;
      });
  }
}

module.exports = { ShinyHunter };
