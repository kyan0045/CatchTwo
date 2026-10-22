const test = require("node:test");
const assert = require("node:assert/strict");

const fs = require("fs-extra");
const { readTokens } = require("../src/services/createCatchers.js");

function restoreTokens(t, previous) {
  t.after(() => {
    if (previous === undefined) delete process.env.TOKENS;
    else process.env.TOKENS = previous;
  });
}

function useTokens(t, value) {
  const previous = process.env.TOKENS;
  process.env.TOKENS = value;
  restoreTokens(t, previous);
}

function useTokensFile(t, value) {
  const previous = process.env.TOKENS;
  delete process.env.TOKENS;
  restoreTokens(t, previous);
  t.mock.method(fs, "readFileSync", () => value);
}

test("readTokens parses one token and guild ID per account", (t) => {
  useTokens(t, "token-one guild-one\ntoken-two guild-two");

  assert.deepEqual(readTokens(), [
    { token: "token-one", guildId: "guild-one", lineNumber: null },
    { token: "token-two", guildId: "guild-two", lineNumber: null },
  ]);
});

test("readTokens records line numbers from tokens.txt", (t) => {
  useTokensFile(t, "token-one guild-one\n\ntoken-two guild-two\n");

  assert.deepEqual(readTokens(), [
    { token: "token-one", guildId: "guild-one", lineNumber: 1 },
    { token: "token-two", guildId: "guild-two", lineNumber: 3 },
  ]);
});

test("readTokens rejects an empty file", (t) => {
  useTokens(t, "   ");
  assert.throws(() => readTokens(), /tokens\.txt is empty/);
});

test("readTokens reports the line with an unpaired token", (t) => {
  useTokensFile(t, "token-one guild-one\ntoken-without-guild\n");
  assert.throws(
    () => readTokens(),
    /tokens\.txt line 2 must contain token and guild ID pairs/
  );
});
