const { Catcher } = require("../classes/clients/catcher.js");
const fs = require("fs-extra");

async function createCatchers() {
  let data = process.env.TOKENS
    ? process.env.TOKENS
    : fs.readFileSync("./tokens.txt", "utf-8");
  if (!data) throw new Error(`Unable to find your tokens.`);
  const tokensAndGuildIds = data.split(/\s+/);
  tokens = [];

  for (let i = 0; i < tokensAndGuildIds.length; i += 2) {
    if (tokensAndGuildIds[i + 1]) {
      const token = tokensAndGuildIds[i].trim();
      const guildId = tokensAndGuildIds[i + 1].trim();

      if (token && guildId) {
        tokens.push({ token, guildId });
      }
    }
  }

  for (var i = 0; i < tokens.length; i++) {
    await createCatcher(tokens[i].token, tokens[i].guildId);
  }
}

async function createCatcher(token, guildId) {
  const catcher = new Catcher(token, guildId);
  catcher.listen();
  catcher.login();
  setTimeout(() => {
    catcher.start();
  }, 3000);
}

module.exports = { createCatchers };
