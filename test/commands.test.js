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

test("version command sends package metadata without network access", async (t) => {
  const logging = require("../src/services/logging.js");
  const pkg = require("../package.json");
  const sendWebhook = t.mock.method(
    logging,
    "sendCommandWebhook",
    async () => true
  );
  const commandPath = require.resolve("../src/commands/version.js");
  delete require.cache[commandPath];
  t.after(() => delete require.cache[commandPath]);
  const command = require(commandPath);

  await command.execute(
    null,
    { author: { id: "test-owner" } },
    [],
    "test-webhook"
  );

  assert.equal(sendWebhook.mock.callCount(), 1);
  const [webhook, content, embed] = sendWebhook.mock.calls[0].arguments;
  assert.equal(webhook, "test-webhook");
  assert.ok(content.includes(JSON.stringify(pkg, null, 2)));
  assert.ok(embed.description.includes(pkg.version));
});

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

test("version replies in-channel when the webhook is unavailable", async (t) => {
  const logging = require("../src/services/logging.js");
  t.mock.method(logging, "sendCommandWebhook", async () => false);
  const pkg = require("../package.json");
  const commandPath = require.resolve("../src/commands/version.js");
  delete require.cache[commandPath];
  t.after(() => delete require.cache[commandPath]);
  const command = require(commandPath);

  let replied;
  await command.execute(
    null,
    {
      author: { id: "test-owner" },
      reply: async (content) => {
        replied = content;
      },
    },
    [],
    null
  );

  assert.ok(replied.includes(pkg.version));
  assert.ok(replied.includes("discord-self-lite"));
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
