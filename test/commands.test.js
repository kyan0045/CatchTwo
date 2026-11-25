const test = require("node:test");
const assert = require("node:assert/strict");

function freshLifecycleModule(t, name) {
  const modulePath = require.resolve(name);
  const cached = require.cache[modulePath];
  delete require.cache[modulePath];
  t.after(() => {
    if (cached) require.cache[modulePath] = cached;
    else delete require.cache[modulePath];
  });
  return require(modulePath);
}

test("restart destroys a snapshot even when a catcher removes itself and throws", async (t) => {
  t.mock.method(console, "error", () => {});
  const logging = require("../src/services/logging.js");
  const webhook = t.mock.method(logging, "sendCommandWebhook", async () => {});
  const order = [];
  const exit = t.mock.method(process, "exit", (code) =>
    order.push(`exit:${code}`)
  );
  const { catchers } = require("../src/services/createCatchers.js");
  const previous = catchers.splice(0);
  t.after(() => catchers.splice(0, catchers.length, ...previous));
  for (let i = 0; i < 3; i++) {
    const catcher = {
      destroy: t.mock.fn(() => {
        order.push(i);
        catchers.splice(catchers.indexOf(catcher), 1);
        if (i === 0) throw new Error("Offline teardown failure");
      }),
    };
    catchers.push(catcher);
  }
  const snapshot = [...catchers];
  const restart = freshLifecycleModule(t, "../src/commands/restart.js");
  await restart.execute(
    null,
    { author: { id: "offline-owner" } },
    [],
    "offline-webhook"
  );
  assert.deepEqual(order, [0, 1, 2, "exit:0"]);
  assert.equal(catchers.length, 0);
  for (const catcher of snapshot)
    assert.equal(catcher.destroy.mock.callCount(), 1);
  assert.equal(webhook.mock.callCount(), 1);
  assert.equal(exit.mock.callCount(), 1);
});

test("command lookup resolves aliases", () => {
  const { findCommand } = require("../src/utils/commands.js");
  const ping = { name: "ping", aliases: ["latency", "ms"] };
  const client = { commands: new Map([["ping", ping]]) };

  assert.equal(findCommand(client, "ping"), ping);
  assert.equal(findCommand(client, "MS"), ping);
  assert.equal(findCommand(client, "nope"), null);
  assert.equal(findCommand(client, undefined), null);
});

test("click resolves a reply via fetchReference when message.reference is null", async () => {
  const click = require("../src/commands/click.js");
  const clickButton = test.mock.fn(async () => {});
  const react = test.mock.fn(async () => {});
  const fetchReference = test.mock.fn(async () => ({
    id: "target-1",
    guildId: "guild-1",
    components: [{ components: [{ type: 2, customId: "btn-1" }] }],
    clickButton,
  }));

  await click.execute(
    { user: { username: "tester" } },
    {
      guildId: "guild-1",
      reference: null,
      messageReference: { messageId: "target-1" },
      fetchReference,
      react,
    },
    ["1"]
  );

  assert.equal(fetchReference.mock.callCount(), 1);
  assert.deepEqual(clickButton.mock.calls[0].arguments, ["btn-1"]);
  assert.deepEqual(react.mock.calls[0].arguments, ["✅"]);
});

test("predict resolves a reply via fetchReference when message.reference is null", async (t) => {
  const ai = require("../src/services/ai.js");
  const getTop = t.mock.method(ai, "getTopPredictions", async () => ({
    topPredictions: [{ name: "Pikachu", confidence: 0.95, unreliable: false }],
    timeTaken: 10,
    accepted: true,
    reason: "ok",
  }));
  const predict = freshLifecycleModule(t, "../src/commands/predict.js");

  const edit = t.mock.fn(async () => {});
  const fetchReference = t.mock.fn(async () => ({
    attachments: [],
    embeds: [{ image: { url: "https://example.com/spawn.png" } }],
  }));

  await predict.execute(
    { user: { username: "tester" } },
    {
      attachments: [],
      reference: null,
      messageReference: { messageId: "spawn-1" },
      fetchReference,
      reply: async () => ({ edit }),
    },
    []
  );

  assert.equal(fetchReference.mock.callCount(), 1);
  assert.equal(
    getTop.mock.calls[0].arguments[0],
    "https://example.com/spawn.png"
  );
  assert.equal(edit.mock.callCount(), 1);
});
