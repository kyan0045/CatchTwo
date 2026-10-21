const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getRandomHint,
  isIncenseSpawn,
  shouldCatchSpawn,
  shouldHandleCatchMessage,
} = require("../src/events/catching.js");

const POKETWO_ID = "716390085896962058";

function settings({ catching = true, globalCatch = false } = {}) {
  return {
    behavior: { Catching: catching },
    globalSettings: {
      GlobalCatch: globalCatch,
      BlacklistedGuilds: ["blocked"],
    },
  };
}

test("catch handling respects the master toggle and guild policy", () => {
  const localMessage = { author: { id: POKETWO_ID }, guild: { id: "local" } };
  const remoteMessage = { author: { id: POKETWO_ID }, guild: { id: "remote" } };
  const blockedMessage = {
    author: { id: POKETWO_ID },
    guild: { id: "blocked" },
  };

  assert.equal(
    shouldHandleCatchMessage(localMessage, "local", settings()),
    true
  );
  assert.equal(
    shouldHandleCatchMessage(
      localMessage,
      "local",
      settings({ catching: false })
    ),
    false
  );
  assert.equal(
    shouldHandleCatchMessage(remoteMessage, "local", settings()),
    false
  );
  assert.equal(
    shouldHandleCatchMessage(
      remoteMessage,
      "local",
      settings({ globalCatch: true })
    ),
    true
  );
  assert.equal(
    shouldHandleCatchMessage(
      blockedMessage,
      "local",
      settings({ globalCatch: true })
    ),
    false
  );
});

test("random hint selection stays within array bounds", () => {
  assert.equal(
    getRandomHint(() => 0),
    "h"
  );
  assert.equal(
    getRandomHint(() => 0.999999),
    "hint"
  );
});

test("global catch accepts guild-less messages", () => {
  const guildless = { author: { id: POKETWO_ID } };
  assert.equal(
    shouldHandleCatchMessage(
      guildless,
      "local",
      settings({ globalCatch: true })
    ),
    true
  );
  assert.equal(shouldHandleCatchMessage(guildless, "local", settings()), false);
});

test("IncenseMode controls whether incense spawns are caught", () => {
  const incense = {
    embeds: [{ footer: { text: "Incense: 2 spawns remaining" } }],
  };
  const normal = { embeds: [{ footer: { text: "Wild pokémon" } }] };

  assert.equal(isIncenseSpawn(incense), true);
  assert.equal(isIncenseSpawn(normal), false);
  assert.equal(
    shouldCatchSpawn(incense, { incense: { IncenseMode: true } }),
    true
  );
  assert.equal(
    shouldCatchSpawn(incense, { incense: { IncenseMode: false } }),
    false
  );
  assert.equal(
    shouldCatchSpawn(normal, { incense: { IncenseMode: false } }),
    true
  );
});

test("hunt targets fall back to the main account without a usable token", () => {
  const { resolveHuntToken } = require("../src/classes/shinyHunter.js");

  assert.equal(resolveHuntToken(""), null);
  assert.equal(resolveHuntToken("   "), null);
  assert.equal(resolveHuntToken("HuntToken"), null);
  assert.equal(resolveHuntToken("..."), null);
  assert.equal(resolveHuntToken("abc.def.ghi"), "abc.def.ghi");
});

test("a caught message is only counted once", async (t) => {
  const logging = require("../src/services/logging.js");
  const originalSendCatch = logging.sendCatch;
  const calls = [];
  logging.sendCatch = async (...args) => {
    calls.push(args);
  };

  const catchingPath = require.resolve("../src/events/catching.js");
  const cached = require.cache[catchingPath];
  delete require.cache[catchingPath];
  t.after(() => {
    logging.sendCatch = originalSendCatch;
    delete require.cache[catchingPath];
    if (cached) require.cache[catchingPath] = cached;
  });

  const { handleCaughtResponse } = require(catchingPath);
  const client = { user: { id: "1321835351358050437", username: "tester" } };
  const message = { id: "catch-message-1" };
  const parsedCatch = {
    name: "Squawkabilly",
    level: "15",
    iv: 36.56,
    gender: "<:female:1207734084210532483>",
    shiny: false,
    gigantamax: false,
  };

  await handleCaughtResponse(client, message, parsedCatch);
  // The awaited reply and the general handler can both see this message
  await handleCaughtResponse(client, message, parsedCatch);

  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "1321835351358050437");
});
