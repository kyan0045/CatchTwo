const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");

const {
  catchNameForPrediction,
  isIncenseSpawn,
  shouldCatchSpawn,
  shouldHandleCatchMessage,
} = require("../src/events/catching.js");
const { buyIncense } = require("../src/services/incense.js");

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

test("catch names collapse supported forms to the base species", () => {
  assert.equal(catchNameForPrediction("Bug Arceus"), "Arceus");
  assert.equal(catchNameForPrediction("Arceus"), "Arceus");
  assert.equal(catchNameForPrediction("Fairy Silvally"), "Silvally");
  assert.equal(catchNameForPrediction("Silvally"), "Silvally");
  assert.equal(
    catchNameForPrediction("Vanilla Cream Star Sweet Alcremie"),
    "Alcremie"
  );
  assert.equal(catchNameForPrediction("Alcremie"), "Alcremie");
  assert.equal(catchNameForPrediction("Unown"), "Unown");
  assert.equal(catchNameForPrediction("Unown H"), "Unown");
  assert.equal(catchNameForPrediction("Unown Question"), "Unown");
  assert.equal(
    catchNameForPrediction("Three-Segment Dudunsparce"),
    "Dudunsparce"
  );
  assert.equal(catchNameForPrediction("Dudunsparce"), "Dudunsparce");
  assert.equal(catchNameForPrediction("Amped Toxtricity"), "Toxtricity");
  assert.equal(catchNameForPrediction("Low Key Toxtricity"), "Toxtricity");
  assert.equal(catchNameForPrediction("Family of Three Maushold"), "Maushold");
  assert.equal(catchNameForPrediction("Maushold"), "Maushold");
  assert.equal(catchNameForPrediction("Mime Jr"), "Mime Jr.");
  assert.equal(catchNameForPrediction("MissingNo"), "MissingNo.");
  assert.equal(catchNameForPrediction("Type  Null"), "Type: Null");

  assert.equal(catchNameForPrediction("Finizen"), "Finizen");
  assert.equal(catchNameForPrediction("Palafin"), "Palafin");
  assert.equal(catchNameForPrediction("Hero Palafin"), "Hero Palafin");
  assert.equal(catchNameForPrediction("Pikachu"), "Pikachu");
  assert.equal(catchNameForPrediction(undefined), undefined);
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

test("incense purchase accepts a plain Poketwo response", async () => {
  const events = new EventEmitter();
  let waiterAttached = false;
  const channel = {
    awaitMessage({ filter, time }) {
      waiterAttached = true;
      return new Promise((resolve) => {
        const timer = setTimeout(() => resolve(null), time);
        events.once("message", (message) => {
          clearTimeout(timer);
          resolve(filter(message) ? message : null);
        });
      });
    },
    async send() {
      assert.equal(waiterAttached, true);
      events.emit("message", {
        author: { id: POKETWO_ID },
        content: "You don't have enough shards for that!",
      });
      return { id: "sent" };
    },
  };

  const result = await buyIncense(channel, { timeout: 100 });

  assert.equal(result.error, undefined);
  assert.equal(result.sent.id, "sent");
  assert.equal(result.reason, "no-shards");
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

test("hunt targets match collapsed base species and exact form names", () => {
  const { matchesHuntTarget } = require("../src/events/catching.js");

  assert.equal(matchesHuntTarget("Bug Arceus", ["arceus"]), true);
  assert.equal(matchesHuntTarget("Unown H", ["unown"]), true);
  assert.equal(matchesHuntTarget("Type  Null", ["type: null"]), true);
  assert.equal(matchesHuntTarget("Hero Palafin", ["hero palafin"]), true);
  assert.equal(matchesHuntTarget("Hero Palafin", ["palafin"]), false);
  assert.equal(matchesHuntTarget("Pikachu", ["raichu"]), false);
});

test("wrong-pokemon retry and incense end respect pause state", async (t) => {
  const ai = require("../src/services/ai.js");
  const pokehint = require("pokehint");
  const incense = require("../src/services/incense.js");
  const logging = require("../src/services/logging.js");
  const states = require("../src/services/states.js");
  const config = require("../config.js");

  const prevAi = config.behavior.AI;
  const prevCatching = config.behavior.Catching;
  const prevHunt = config.hunting.HuntPokemons;
  const prevIncenseMode = config.incense.IncenseMode;
  const prevAutoBuy = config.incense.AutoIncenseBuy;
  const prevIncenseCh = config.incense.IncenseChannel;
  t.after(() => {
    config.behavior.AI = prevAi;
    config.behavior.Catching = prevCatching;
    config.hunting.HuntPokemons = prevHunt;
    config.incense.IncenseMode = prevIncenseMode;
    config.incense.AutoIncenseBuy = prevAutoBuy;
    config.incense.IncenseChannel = prevIncenseCh;
  });

  config.behavior.AI = true;
  config.behavior.Catching = true;
  config.hunting.HuntPokemons = [];
  config.incense.IncenseMode = true;
  config.incense.AutoIncenseBuy = true;
  config.incense.IncenseChannel = "ch-incense";

  t.mock.method(console, "log", () => {});
  t.mock.method(logging, "sendLog", () => {});
  t.mock.method(ai, "predict", async () => ({
    name: "Pikachu",
    confidence: 0.99,
    margin: 0.9,
    accepted: true,
    reason: "ok",
  }));
  t.mock.method(pokehint, "getName", async () => "Pikachu");

  const userId = "100000000000000020";
  t.mock.method(incense, "buyIncense", async () => {
    // Simulate a captcha arriving while awaiting buyIncense.
    states.setWaiting(userId, true);
    return { sent: { id: "s1" }, response: null, reason: "no-shards" };
  });
  t.mock.method(incense, "logIncenseResult", async () => {});

  const catchingPath = require.resolve("../src/events/catching.js");
  const cached = require.cache[catchingPath];
  delete require.cache[catchingPath];
  t.after(() => {
    if (cached) require.cache[catchingPath] = cached;
    else delete require.cache[catchingPath];
  });
  const catching = require(catchingPath);

  const scheduled = [];
  t.mock.method(global, "setTimeout", (callback, delay) => {
    scheduled.push({ callback, delay });
    return {};
  });

  const sentMessages = [];
  const channel = {
    id: "ch-incense",
    awaitMessage: async () => ({
      content: "That is the wrong pokémon!",
      channel,
    }),
    send: async (payload) => {
      sentMessages.push(payload);
      return { id: "m" };
    },
  };
  const client = { user: { id: userId, username: "pause-guard-test" } };
  states.setWaiting(userId, false);

  await catching.execute(client, "guild-1", {
    author: { id: POKETWO_ID },
    guild: { id: "guild-1" },
    channel,
    content: "",
    embeds: [
      {
        title: "A wild pokémon has appeared!",
        image: { url: "https://example.com/pika.png" },
        footer: { text: "Wild pokémon" },
      },
    ],
  });

  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(sentMessages.length, 1);
  assert.equal(scheduled.length, 1);
  states.setWaiting(userId, true);
  scheduled[0].callback();
  assert.equal(sentMessages.length, 1);

  states.setWaiting(userId, false);
  await catching.execute(client, "guild-1", {
    author: { id: POKETWO_ID },
    guild: { id: "guild-1" },
    channel,
    content: "",
    embeds: [
      {
        title: "A wild pokémon has appeared!",
        image: { url: "https://example.com/pika.png" },
        footer: { text: "Incense: Spawns Remaining: 0." },
      },
    ],
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(states.getWaiting(userId), true);
});
