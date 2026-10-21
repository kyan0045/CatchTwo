const { Catcher } = require("../classes/catcher.js");
const { wait } = require("./system.js");

const fs = require("fs-extra");

let catchers = [];

// Parse tokens.txt (or TOKENS) into one { token, guildId } pair per account.
function readTokens() {
  let data;
  try {
    data = process.env.TOKENS
      ? process.env.TOKENS
      : fs.readFileSync("./tokens.txt", "utf-8");
  } catch (error) {
    throw new Error(`Unable to read tokens.txt: ${error.message}`, {
      cause: error,
    });
  }

  if (!data || !data.trim()) {
    throw new Error(
      "tokens.txt is empty. Add one 'token guildId' pair per account."
    );
  }

  const parts = data.split(/\s+/).filter(Boolean);
  if (parts.length % 2 !== 0) {
    throw new Error(
      "tokens.txt must contain token and guild ID pairs; one value is missing a partner."
    );
  }

  const tokens = [];
  for (let index = 0; index < parts.length; index += 2) {
    const token = parts[index].trim();
    const guildId = parts[index + 1].trim();
    if (token && guildId) tokens.push({ token, guildId });
  }

  if (tokens.length === 0) {
    throw new Error("tokens.txt has no complete token/guild ID pairs.");
  }

  return tokens;
}

async function createCatchers() {
  for (const { token, guildId } of readTokens()) {
    await createCatcher(token, guildId);
    await wait(1000);
  }
}

async function createCatcher(token, guildId) {
  const catcher = new Catcher(token, guildId);
  catchers.push(catcher);
  catcher.listen();
  catcher.login();
}

module.exports = { catchers, createCatchers, readTokens };
