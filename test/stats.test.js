const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getGeneralFields,
  getPokemonFields,
} = require("../src/commands/stats.js");
const {
  addStat,
  createAccountStats,
  getAccountStat,
  getTotalStats,
} = require("../src/services/stats.js");
const { parseCoinAmount } = require("../src/events/misc.js");

test("zero-value rewards do not increment coin statistics", () => {
  const accountId = "zero-reward-test";
  createAccountStats(accountId);
  addStat(accountId, "coins", parseCoinAmount("invalid"));
  assert.equal(getAccountStat(accountId, "coins"), 0);
});

test("statistics use a 3600-second hour", () => {
  const catches = {
    total: 10,
    shiny: 1,
    legendary: 2,
    mythical: 0,
    ultrabeast: 0,
    event: 0,
    regional: 0,
    gigantamax: 0,
  };

  const fields = getPokemonFields(catches, 1800);
  assert.equal(
    fields.find((field) => field.name === "Catch Rate").value,
    "20 catches per hour"
  );
});

test("per-user general fields do not use aggregate labels", () => {
  const fields = getGeneralFields(
    {
      catches: { total: 3 },
      general: { coins: 25, spamMessages: 7 },
    },
    true
  );

  assert.deepEqual(
    fields.map((field) => field.name),
    ["Catches", "Coins Gained", "Spam Messages"]
  );
});

test("total stats aggregate across accounts", () => {
  createAccountStats("aggregate-1");
  createAccountStats("aggregate-2");
  addStat("aggregate-1", "shiny");
  addStat("aggregate-1", "catches", 3);
  addStat("aggregate-2", "legendary", 2);
  addStat("aggregate-2", "coins", 250);

  const total = getTotalStats();
  assert.equal(total.catches.shiny, 1);
  assert.equal(total.catches.legendary, 2);
  assert.equal(total.catches.total, 6);
  assert.equal(total.general.coins, 250);
  assert.ok(total.general.lastCatch > 0);
});
