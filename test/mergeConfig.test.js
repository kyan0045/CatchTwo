const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  getMissingPaths,
  mergeConfigFiles,
} = require("../scripts/mergeConfig.js");

test("configuration migration adds defaults and preserves user values", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "catchtwo-config-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const upstreamPath = path.join(directory, "upstream.js");
  const userPath = path.join(directory, "user.js");

  fs.writeFileSync(
    upstreamPath,
    `const config = {
  behavior: {
    AI: true,
    Catching: true,
  },
  debug: false,
};

module.exports = config;
`
  );
  fs.writeFileSync(
    userPath,
    `const config = {
  behavior: {
    AI: false,
  },
};

module.exports = config;
`
  );

  assert.equal(mergeConfigFiles(upstreamPath, userPath), true);
  delete require.cache[require.resolve(userPath)];
  const merged = require(userPath);

  assert.equal(merged.behavior.AI, false);
  assert.equal(merged.behavior.Catching, true);
  assert.equal(merged.debug, false);
  assert.deepEqual(getMissingPaths(require(upstreamPath), merged), []);
});

test("configuration migration preserves trailing comments when inserting nested keys", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "catchtwo-config-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const upstreamPath = path.join(directory, "upstream.js");
  const userPath = path.join(directory, "user.js");

  fs.writeFileSync(
    upstreamPath,
    `const config = {
  behavior: {
    AI: true,
    Catching: true,
  },
};

module.exports = config;
`
  );
  fs.writeFileSync(
    userPath,
    `const config = {
  behavior: {
    AI: false, // keep off
  },
};

module.exports = config;
`
  );

  assert.equal(mergeConfigFiles(upstreamPath, userPath), true);
  delete require.cache[require.resolve(userPath)];
  const merged = require(userPath);

  assert.equal(merged.behavior.AI, false);
  assert.equal(merged.behavior.Catching, true);
  assert.match(fs.readFileSync(userPath, "utf8"), /\/\/ keep off/);
});

test("configuration migration ignores the optional nested ping block", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "catchtwo-config-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const upstreamPath = path.join(directory, "upstream.js");
  const userPath = path.join(directory, "user.js");

  fs.writeFileSync(
    upstreamPath,
    `const config = {
  logging: {
    Pokemon: true,
    Quests: true,
    Ping: {
      Shiny: true,
      Rares: true,
    },
  },
};

module.exports = config;
`
  );
  fs.writeFileSync(
    userPath,
    `const config = {
  logging: {
    Pokemon: false,
  },
};

module.exports = config;
`
  );

  assert.equal(mergeConfigFiles(upstreamPath, userPath), true);
  delete require.cache[require.resolve(userPath)];
  const merged = require(userPath);

  assert.equal(merged.logging.Pokemon, false);
  assert.equal(merged.logging.Quests, true);
  assert.equal(merged.logging.Ping, undefined);
  assert.doesNotMatch(fs.readFileSync(userPath, "utf8"), /Ping:/);
});

test("configuration migration is idempotent when run twice", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "catchtwo-config-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const upstreamPath = path.join(directory, "upstream.js");
  const userPath = path.join(directory, "user.js");

  fs.writeFileSync(
    upstreamPath,
    `const config = {
  behavior: {
    AI: true,
    Catching: true,
  },
  debug: false,
};

module.exports = config;
`
  );
  fs.writeFileSync(
    userPath,
    `const config = {
  behavior: {
    AI: false,
  },
};

module.exports = config;
`
  );

  assert.equal(mergeConfigFiles(upstreamPath, userPath), true);
  const firstPass = fs.readFileSync(userPath, "utf8");

  assert.equal(mergeConfigFiles(upstreamPath, userPath), false);
  assert.equal(fs.readFileSync(userPath, "utf8"), firstPass);
  assert.equal((firstPass.match(/Catching:/g) || []).length, 1);

  delete require.cache[require.resolve(userPath)];
  const merged = require(userPath);
  assert.equal(merged.behavior.Catching, true);
});
