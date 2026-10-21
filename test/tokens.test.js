const test = require("node:test");
const assert = require("node:assert/strict");

const { readTokens } = require("../src/services/createCatchers.js");

function useTokens(t, value) {
  const previous = process.env.TOKENS;
  process.env.TOKENS = value;
  t.after(() => {
    if (previous === undefined) delete process.env.TOKENS;
    else process.env.TOKENS = previous;
  });
}

test("readTokens parses one token and guild ID per account", (t) => {
  useTokens(t, "token-one guild-one\ntoken-two guild-two");

  assert.deepEqual(readTokens(), [
    { token: "token-one", guildId: "guild-one" },
    { token: "token-two", guildId: "guild-two" },
  ]);
});

test("readTokens rejects an empty file", (t) => {
  useTokens(t, "   ");
  assert.throws(() => readTokens(), /tokens\.txt is empty/);
});

test("readTokens rejects an unpaired token", (t) => {
  useTokens(t, "token-without-guild");
  assert.throws(() => readTokens(), /pairs/);
});
