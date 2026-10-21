const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseCatchMessage,
  isCaughtMessage,
  isWrongPokemonMessage,
} = require("../src/utils/messages.js");

test("parseCatchMessage extracts name, level, numeric IV, and special flags", () => {
  const userId = "100000000000000001";
  const content = `Congratulations <@${userId}>! You caught a Level 42 Gengar <:female:1234> (87.3%)`;
  assert.equal(isCaughtMessage(content, userId), true);
  const parsed = parseCatchMessage(content);
  assert.equal(parsed.name, "Gengar");
  assert.equal(parsed.level, "42");
  assert.equal(parsed.iv, 87.3);
  assert.equal(typeof parsed.iv, "number");
  assert.equal(parsed.gender, "<:female:1234>");
  assert.equal(parsed.shiny, false);
  assert.equal(parsed.gigantamax, false);
});

test("parseCatchMessage flags shiny and gigantamax catches", () => {
  const content =
    "Congratulations <@100000000000000001>! You caught a Level 42 Pikachu " +
    "<:male:1> (50.0%) ✨ Gigantamax";
  const parsed = parseCatchMessage(content);
  assert.equal(parsed.name, "Pikachu");
  assert.equal(parsed.shiny, true);
  assert.equal(parsed.gigantamax, true);
});

test("parseCatchMessage returns null for non-catch messages", () => {
  assert.equal(parseCatchMessage("That is the wrong pokémon!"), null);
  assert.equal(parseCatchMessage(undefined), null);
});

test("catch message helpers are scoped to the given user id", () => {
  const content =
    "Congratulations <@100000000000000002>! You caught a Level 5 Pikachu";
  assert.equal(isWrongPokemonMessage("That is the wrong pokémon!"), true);
  assert.equal(isWrongPokemonMessage("You caught a Pikachu"), false);
  assert.equal(isCaughtMessage(content, "100000000000000002"), true);
  assert.equal(isCaughtMessage(content, "999999999999999999"), false);
});

test("parseCatchMessage handles no space before the gender emoji", () => {
  const content =
    "Congratulations <@1321835351358050437>! You caught a Level 15 " +
    "Squawkabilly<:female:1207734084210532483> (36.56%)!";
  const parsed = parseCatchMessage(content);

  assert.equal(parsed.name, "Squawkabilly");
  assert.equal(parsed.level, "15");
  assert.equal(parsed.iv, 36.56);
  assert.equal(parsed.gender, "<:female:1207734084210532483>");
});
