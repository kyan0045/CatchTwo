const test = require("node:test");
const assert = require("node:assert/strict");

const POKETWO_ID = "716390085896962058";

test("initialized catchers stop terminally and cannot be resumed", async (t) => {
  const { Client } = require("discord-self-lite");
  const states = require("../src/services/states.js");
  const previousTokens = process.env.TOKENS;
  process.env.TOKENS = "test-token test-guild";
  t.after(() => {
    if (previousTokens === undefined) delete process.env.TOKENS;
    else process.env.TOKENS = previousTokens;
  });
  t.mock.method(global, "fetch", async () => {
    throw new Error("Unexpected network request");
  });
  t.mock.method(global, "setTimeout", (callback) => {
    queueMicrotask(callback);
    return 0;
  });
  t.mock.method(Client.prototype, "login", async function () {
    this.user = { id: "teardown-test", username: "test" };
  });
  const disconnect = t.mock.method(Client.prototype, "destroy", () => {});
  const {
    createCatchers,
    catchers,
  } = require("../src/services/createCatchers.js");
  const { clients } = require("../src/classes/catcher.js");
  const oldCatchers = [...catchers];
  const oldClients = [...clients];
  t.after(() => {
    catchers.splice(0, catchers.length, ...oldCatchers);
    clients.splice(0, clients.length, ...oldClients);
  });

  await createCatchers();
  const catcher = catchers.find(
    (entry) => entry.client?.user?.id === "teardown-test"
  );
  assert.ok(catcher);
  catcher.destroy();
  catcher.destroy();
  assert.equal(disconnect.mock.callCount(), 1);
  assert.equal(catcher.client.stopped, true);
  assert.equal(catchers.includes(catcher), false);
  assert.equal(clients.includes(catcher.client), false);

  await require("../src/commands/resume.js").execute(
    null,
    { react: async () => {} },
    []
  );
  states.setWaiting("teardown-test", false);
  states.setSpamming("teardown-test", true);
  assert.equal(states.getWaiting("teardown-test"), true);
  assert.equal(states.getSpamming("teardown-test"), false);
});

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

function lifecycleFixture(t, id, owners = []) {
  const logging = require("../src/services/logging.js");
  t.mock.method(console, "log", () => {});
  t.mock.method(console, "error", () => {});
  t.mock.method(logging, "sendLog", () => {});
  t.mock.method(logging, "getMentions", () => "");
  const webhook = t.mock.method(logging, "sendWebhook", async () => {});
  t.mock.method(global, "fetch", async () => {
    throw new Error("Unexpected network request");
  });
  const { Client } = require("discord-self-lite");
  t.mock.method(Client.prototype, "login", async () => {
    throw new Error("Unexpected login");
  });
  const disconnect = t.mock.method(
    Client.prototype,
    "destroy",
    function (reason) {
      this.rest?.destroy?.(reason);
    }
  );
  const { Catcher, clients } = require("../src/classes/catcher.js");
  const { catchers } = require("../src/services/createCatchers.js");
  const config = require("../config.js");
  const previousOwners = config.ownership.OwnerIDs;
  const previousClients = clients.splice(0);
  const previousCatchers = catchers.splice(0);
  config.ownership.OwnerIDs = owners;
  const catcher = new Catcher("offline-test-token", "offline-guild");
  catcher.listen();
  const client = catcher.client;
  client.user = { id, username: "offline-test" };
  client.rest = {
    destroyed: false,
    _poketwoQueue: [],
    destroy(reason) {
      this.destroyed = true;
      this.destroyReason = reason;
    },
    request: async () => {
      throw new Error("Unexpected REST request");
    },
    makeRequest: async () => {
      throw new Error("Unexpected REST request");
    },
  };
  clients.push(client);
  catchers.push(catcher);
  t.after(() => {
    catcher.destroy();
    clients.splice(0, clients.length, ...previousClients);
    catchers.splice(0, catchers.length, ...previousCatchers);
    config.ownership.OwnerIDs = previousOwners;
  });
  const fetchUser = t.mock.method(client, "fetchUser", async () => {
    throw new Error("Owner unavailable");
  });
  const message = {
    id: "suspension-message",
    author: { id: POKETWO_ID },
    content: "",
    embeds: [{ title: "Account Suspended" }],
    channel: {
      fetchMessages: t.mock.fn(async () => [
        { id: "trigger-message", author: { id } },
      ]),
    },
  };
  const misc = freshLifecycleModule(t, "../src/events/misc.js");
  return {
    catcher,
    client,
    clients,
    catchers,
    webhook,
    disconnect,
    fetchUser,
    execute: () => misc.execute(client, "offline-guild", message),
  };
}

function assertLifecycleStopped({ catcher, client, clients, catchers }) {
  const states = require("../src/services/states.js");
  assert.equal(catcher.stopped, true);
  assert.equal(client.stopped, true);
  assert.equal(clients.includes(client), false);
  assert.equal(catchers.includes(catcher), false);
  assert.equal(client.rest.destroyed, true);
  assert.equal(client.rest.destroyReason?.code, "CLIENT_STOPPED");
  states.setWaiting(client.user.id, false);
  states.setSpamming(client.user.id, true);
  assert.equal(states.getWaiting(client.user.id), true);
  assert.equal(states.getSpamming(client.user.id), false);
}

function lifecycleTimers(t) {
  const timers = new Map();
  t.mock.method(global, "setTimeout", (callback, delay) => {
    const timer = { unref() {} };
    timers.set(timer, { callback, delay });
    return timer;
  });
  t.mock.method(global, "clearTimeout", (timer) => timers.delete(timer));
  return timers;
}

async function flushLifecyclePromises() {
  for (let i = 0; i < 20; i++) await Promise.resolve();
}

test("client destroy synchronously clears timers and terminally stops its catcher", (t) => {
  const fixture = lifecycleFixture(t, "lifecycle-destroy");
  const { catcher, client, disconnect } = fixture;
  const interval = {};
  const clearInterval = t.mock.method(global, "clearInterval", () => {});
  client.spamInterval = interval;
  assert.equal(client.catcher, catcher);
  client.destroy();
  assert.equal(client.spamInterval, null);
  assert.deepEqual(clearInterval.mock.calls[0].arguments, [interval]);
  assertLifecycleStopped(fixture);
  catcher.destroy();
  client.destroy();
  catcher.listen();
  assert.equal(catcher.client, client);
  assert.equal(disconnect.mock.callCount(), 1);
});

test("suspension tears down with zero owners", async (t) => {
  const fixture = lifecycleFixture(t, "lifecycle-no-owners");
  await fixture.execute();
  assert.equal(fixture.client.suspended, true);
  assert.equal(fixture.webhook.mock.callCount(), 1);
  assert.equal(fixture.fetchUser.mock.callCount(), 0);
  assertLifecycleStopped(fixture);
  await fixture.execute();
  assert.equal(fixture.webhook.mock.callCount(), 1);
  assert.equal(fixture.disconnect.mock.callCount(), 1);
});

test("suspension tears down despite failed webhook and owner notifications", async (t) => {
  const fixture = lifecycleFixture(t, "lifecycle-failed-notifications", [
    "100000000000000001",
  ]);
  fixture.webhook.mock.mockImplementation(async () => {
    throw new Error("Webhook unavailable");
  });
  await fixture.execute();
  assert.equal(fixture.webhook.mock.callCount(), 1);
  assert.equal(fixture.fetchUser.mock.callCount(), 1);
  assert.equal(fixture.disconnect.mock.callCount(), 1);
  assertLifecycleStopped(fixture);
});

for (const stage of ["fetchUser", "createDM", "fetchMessage"]) {
  test(`suspension deadline stops hanging ${stage} and prevents a late DM`, async (t) => {
    const fixture = lifecycleFixture(t, `lifecycle-hanging-${stage}`, [
      "100000000000000002",
    ]);
    const timers = lifecycleTimers(t);
    let resolvePending;
    const pending = new Promise((resolve) => {
      resolvePending = resolve;
    });
    const channel = {
      lastMessageId: "previous",
      fetchMessage: t.mock.fn(async () => null),
    };
    const user = {
      createDM: t.mock.fn(async () => channel),
      send: t.mock.fn(async () => {}),
    };
    fixture.fetchUser.mock.mockImplementation(() =>
      stage === "fetchUser" ? pending : Promise.resolve(user)
    );
    if (stage === "createDM")
      user.createDM.mock.mockImplementation(() => pending);
    if (stage === "fetchMessage")
      channel.fetchMessage.mock.mockImplementation(() => pending);
    fixture.webhook.mock.mockImplementation(() => pending);
    const execution = fixture.execute();
    await flushLifecyclePromises();
    assert.equal(fixture.client.suspended, true);
    assert.equal(fixture.client.stopped, false);
    const deadline = [...timers.values()].find(({ delay }) => delay === 10_000);
    assert.ok(deadline);
    const before = [
      user.createDM.mock.callCount(),
      channel.fetchMessage.mock.callCount(),
    ];
    deadline.callback();
    await execution;
    assertLifecycleStopped(fixture);
    assert.equal(timers.size, 0);
    resolvePending(
      stage === "fetchUser" ? user : stage === "createDM" ? channel : null
    );
    await flushLifecyclePromises();
    assert.deepEqual(
      [user.createDM.mock.callCount(), channel.fetchMessage.mock.callCount()],
      before
    );
    assert.equal(user.send.mock.callCount(), 0);
    assert.equal(fixture.disconnect.mock.callCount(), 1);
  });
}

test("bulk and targeted resume skip stopped and suspended clients", async (t) => {
  const fixture = lifecycleFixture(t, "100000000000000003");
  const states = require("../src/services/states.js");
  const active = { user: { id: "100000000000000004" } };
  const suspended = { user: { id: "100000000000000005" }, suspended: true };
  fixture.client.stopped = true;
  fixture.clients.push(active, suspended, { user: null });
  for (const client of [fixture.client, active, suspended])
    states.setWaiting(client.user.id, true);
  const message = {
    react: t.mock.fn(async () => {}),
    reply: t.mock.fn(async () => {}),
  };
  const resume = freshLifecycleModule(t, "../src/commands/resume.js");
  await resume.execute(null, message, []);
  assert.equal(states.getWaiting(active.user.id), false);
  for (const client of [fixture.client, suspended]) {
    assert.equal(states.getWaiting(client.user.id), true);
    for (const target of [
      client.user.id,
      `<@${client.user.id}>`,
      `<@!${client.user.id}>`,
    ]) {
      await resume.execute(null, message, [target]);
      assert.equal(states.getWaiting(client.user.id), true);
    }
  }
  assert.equal(message.reply.mock.callCount(), 6);
  assert.equal(message.react.mock.callCount(), 1);
});

test("spam produces into the shared lane and destroy stops the producer", async (t) => {
  const fixture = lifecycleFixture(t, "lifecycle-recovery");
  const { client, catcher } = fixture;
  const states = require("../src/services/states.js");
  const config = require("../config.js");
  const oldBehavior = config.behavior;
  const oldSpamming = config.spamming;
  const oldIncense = config.incense;
  config.behavior = { ...oldBehavior, Spamming: true };
  config.spamming = { ...oldSpamming, SpamChannel: "offline-channel" };
  config.incense = { ...oldIncense, IncenseMode: false };
  t.after(() => {
    config.behavior = oldBehavior;
    config.spamming = oldSpamming;
    config.incense = oldIncense;
  });

  let tick;
  t.mock.method(global, "setInterval", (callback) => {
    tick = callback;
    return {};
  });
  const clearInterval = t.mock.method(global, "clearInterval", () => {});
  t.mock.method(client, "fetchGuild", async () => ({}));
  t.mock.method(client, "fetchChannel", async () => ({
    id: "offline-channel",
    send: async () => null,
  }));

  await require("../src/services/spam.js").spam(client, "offline-guild");
  assert.equal(client.rest._poketwoQueue.length, 0);

  tick();
  assert.equal(client.rest._poketwoQueue.length, 1);
  assert.equal(client.rest._poketwoQueue[0].priority, 3);
  assert.equal(typeof client.rest._poketwoQueue[0].shouldSend, "function");

  states.setSpamming(client.user.id, false);
  tick();
  assert.equal(client.rest._poketwoQueue.length, 1);

  catcher.destroy();
  assert.equal(client.spamInterval, null);
  assert.ok(clearInterval.mock.callCount() >= 1);
});
