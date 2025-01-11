// Importing necessary functions/classes
const { Catcher } = require("../classes/catcher.js");
const { wait } = require("../utils/utils.js");

// Importing necessary modules
const fs = require("fs-extra");

let catchers = [];

async function createCatchers() {
  let data = process.env.TOKENS
    ? process.env.TOKENS
    : fs.readFileSync("./tokens.txt", "utf-8");
  if (!data) throw new Error(`Unable to find your tokens.`);
  const tokensAndGuildIds = data.split(/\s+/);
  let tokens = [];

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
    await wait(1000)
  }
}

async function createCatcher(token, guildId) {
  const catcher = new Catcher(token, guildId);
  catchers.push(catcher);
  catcher.listen();
  catcher.login();
  setTimeout(() => {
    //catcher.start();
  }, 3000);
}

module.exports = { catchers, createCatchers };
