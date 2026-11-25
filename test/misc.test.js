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

const POKETWO_ID = "716390085896962058";

function freshMiscModule(t, name) {
  const modulePath = require.resolve(name);
  const cached = require.cache[modulePath];
  delete require.cache[modulePath];
  t.after(() => {
    if (cached) require.cache[modulePath] = cached;
    else delete require.cache[modulePath];
  });
  return require(modulePath);
}

test("non-Poketwo quest and Pokecoin messages are ignored", async (t) => {
  const logging = require("../src/services/logging.js");
  const stats = require("../src/services/stats.js");
  const { setWaiting } = require("../src/services/states.js");
  t.mock.method(console, "log", () => {});
  t.mock.method(logging, "sendLog", () => {});
  const questWebhook = t.mock.method(
    logging,
    "sendQuestWebhook",
    async () => {}
  );
  t.mock.method(global, "fetch", async () => {
    throw new Error("Unexpected network request");
  });

  const misc = freshMiscModule(t, "../src/events/misc.js");
  const userId = "100000000000000011";
  stats.createAccountStats(userId);
  setWaiting(userId, false);
  const fetchMessages = t.mock.fn(async () => []);
  const client = {
    user: { id: userId, username: "misc-test" },
    channels: new Map(),
  };

  await misc.execute(client, "guild-1", {
    author: { id: "999999999999999999" },
    content:
      "You have completed the quest **Catch 25 Fire-type pokémon** and received **1,250** Pokécoins!",
    embeds: [],
    channel: { fetchMessages },
  });
  await misc.execute(client, "guild-1", {
    author: { id: "999999999999999999" },
    content: `You received **1,000** Pokécoins <@${userId}>!`,
    embeds: [],
    channel: { fetchMessages },
  });

  assert.equal(fetchMessages.mock.callCount(), 0);
  assert.equal(questWebhook.mock.callCount(), 0);
  assert.equal(stats.getAccountStat(userId, "coins"), 0);

  await misc.execute(client, "guild-1", {
    author: { id: POKETWO_ID },
    content: `You received **1,000** Pokécoins <@${userId}>!`,
    embeds: [],
    channel: { fetchMessages },
  });
  assert.equal(stats.getAccountStat(userId, "coins"), 1000);
});

test("captcha DM deduplication parses ISO message timestamp", async (t) => {
  const logging = require("../src/services/logging.js");
  const states = require("../src/services/states.js");
  const config = require("../config.js");
  const prevOwners = config.ownership.OwnerIDs;
  const prevKey = config.captchaSolving.key;
  const prevIncense = config.incense.IncenseMode;
  t.after(() => {
    config.ownership.OwnerIDs = prevOwners;
    config.captchaSolving.key = prevKey;
    config.incense.IncenseMode = prevIncense;
  });

  config.ownership.OwnerIDs = ["100000000000000012"];
  config.captchaSolving.key = "";
  config.incense.IncenseMode = false;

  t.mock.method(console, "log", () => {});
  t.mock.method(logging, "sendLog", () => {});
  t.mock.method(logging, "sendWebhook", async () => {});
  t.mock.method(global, "fetch", async () => {
    throw new Error("Unexpected network request");
  });

  const misc = freshMiscModule(t, "../src/events/misc.js");
  const userId = "100000000000000013";
  let lastDm = {
    author: { id: userId },
    content: "DETECTED A CAPTCHA\nI've detected a captcha.",
    timestamp: new Date(Date.now() - 60_000).toISOString(),
  };
  const dmSend = t.mock.fn(async () => {});
  const dmChannel = {
    type: 1,
    recipients: [{ id: "100000000000000012" }],
    lastMessageId: "dm-last",
    fetchMessage: async () => lastDm,
    send: dmSend,
  };
  const client = {
    user: { id: userId, username: "dm-dedup-test" },
    channels: new Map([["dm-1", dmChannel]]),
  };
  const captchaMsg = {
    author: { id: POKETWO_ID },
    content: `https://verify.poketwo.net/captcha/${userId}`,
    embeds: [],
  };

  states.setWaiting(userId, false);
  await misc.execute(client, "guild-1", captchaMsg);
  assert.equal(dmSend.mock.callCount(), 0);

  lastDm = {
    author: { id: userId },
    content: "DETECTED A CAPTCHA\nI've detected a captcha.",
    timestamp: new Date(Date.now() - 86_400_001).toISOString(),
  };
  states.setWaiting(userId, false);
  await misc.execute(client, "guild-1", captchaMsg);
  assert.equal(dmSend.mock.callCount(), 1);
});

test("captcha solver polling exits immediately when resumed or stopped", async (t) => {
  const logging = require("../src/services/logging.js");
  const states = require("../src/services/states.js");
  const incense = require("../src/services/incense.js");
  const config = require("../config.js");
  const prevOwners = config.ownership.OwnerIDs;
  const prevKey = config.captchaSolving.key;
  const prevIncense = config.incense.IncenseMode;
  t.after(() => {
    config.ownership.OwnerIDs = prevOwners;
    config.captchaSolving.key = prevKey;
    config.incense.IncenseMode = prevIncense;
  });

  config.ownership.OwnerIDs = [];
  config.captchaSolving.key = "test-solver-key";
  config.incense.IncenseMode = false;

  t.mock.method(console, "log", () => {});
  t.mock.method(logging, "sendLog", () => {});
  const webhook = t.mock.method(logging, "sendWebhook", async () => {});
  const resumeMock = t.mock.method(incense, "resumeIncense", async () => true);

  let resultPolls = 0;
  t.mock.method(global, "fetch", async (url) => {
    if (String(url).endsWith("/solve-captcha")) {
      return { ok: true, json: async () => ({ requestId: "task-1" }) };
    }
    resultPolls++;
    return { ok: true, json: async () => ({ status: "completed" }) };
  });

  const misc = freshMiscModule(t, "../src/events/misc.js");
  const userId = "100000000000000014";
  states.setWaiting(userId, false);
  const client = {
    token: "tok",
    user: { id: userId, username: "poll-abort-test" },
    channels: new Map(),
    rest: {
      sleep: async () => {
        states.setWaiting(userId, false);
      },
    },
  };

  await misc.execute(client, "guild-1", {
    author: { id: POKETWO_ID },
    content: `https://verify.poketwo.net/captcha/${userId}`,
    embeds: [],
    channel: {},
  });

  assert.equal(resultPolls, 0);
  assert.equal(resumeMock.mock.callCount(), 0);
  assert.equal(webhook.mock.callCount(), 1);
});
