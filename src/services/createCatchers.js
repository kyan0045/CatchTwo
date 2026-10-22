const { Catcher } = require("../classes/catcher.js");
const { wait } = require("./system.js");

const fs = require("fs-extra");

let catchers = [];

// Parse tokens.txt (or TOKENS) into one { token, guildId, lineNumber } pair per account.
function readTokens() {
  const fromEnv = Boolean(process.env.TOKENS);
  let data;
  try {
    data = fromEnv
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

  const lines = fromEnv ? [data] : data.split(/\r?\n/);
  const tokens = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;

    const parts = line.split(/\s+/).filter(Boolean);
    if (parts.length % 2 !== 0) {
      const where = fromEnv ? "tokens.txt" : `tokens.txt line ${index + 1}`;
      throw new Error(
        `${where} must contain token and guild ID pairs; one value is missing a partner.`
      );
    }

    for (let part = 0; part < parts.length; part += 2) {
      const token = parts[part].trim();
      const guildId = parts[part + 1].trim();
      if (token && guildId) {
        tokens.push({
          token,
          guildId,
          lineNumber: fromEnv ? null : index + 1,
        });
      }
    }
  }

  if (tokens.length === 0) {
    throw new Error("tokens.txt has no complete token/guild ID pairs.");
  }

  return tokens;
}

async function createCatchers() {
  const tokens = readTokens();
  for (let index = 0; index < tokens.length; index += 1) {
    const { token, guildId, lineNumber } = tokens[index];
    await createCatcher(token, guildId, {
      accountNumber: index + 1,
      lineNumber,
    });
    await wait(1000);
  }
}

async function createCatcher(token, guildId, account = {}) {
  const catcher = new Catcher(token, guildId, account);
  catchers.push(catcher);
  catcher.listen();
  catcher.login();
}

module.exports = { catchers, createCatchers, readTokens };
