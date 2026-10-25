const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseCoinAmount,
  parseQuestCompletion,
  parseQuestTrackReward,
} = require("../src/events/misc.js");

test("coin and quest parsing normalize formatted rewards", () => {
  assert.equal(parseCoinAmount("1,250"), 1250);
  assert.equal(parseCoinAmount("invalid"), 0);

  const result = parseQuestCompletion(
    "You have completed the quest **Catch 25 Fire-type pok\u00e9mon** and received **1,250** Pok\u00e9coins!"
  );
  assert.equal(result.amount, "25");
  assert.equal(result.target, "Fire-type pokemon");
  assert.equal(result.pokecoins, 1250);
});

test("quest track rewards distinguish badges and backgrounds", () => {
  assert.deepEqual(
    parseQuestTrackReward(
      "You have completed this quest track and received the **Poison** backgrounds!"
    ),
    { name: "Poison", type: "background" }
  );
  assert.deepEqual(
    parseQuestTrackReward(
      "You have completed this quest track and received the **Bug** badge!"
    ),
    { name: "Bug", type: "badge" }
  );
  assert.deepEqual(
    parseQuestTrackReward(
      "You have completed this quest track and received the Poison background!"
    ),
    { name: "Poison", type: "background" }
  );
  assert.equal(parseQuestTrackReward("not a quest track"), null);
});
