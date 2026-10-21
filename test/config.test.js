const test = require("node:test");
const assert = require("node:assert/strict");

const { validateConfig } = require("../src/services/validateConfig.js");

function validConfig() {
  return {
    behavior: {
      AI: true,
      Catching: true,
      Spamming: true,
    },
    incense: {
      IncenseMode: true,
      AutoIncenseBuy: false,
      IncenseChannel: "ChannelID",
    },
    spamming: {
      SpamSpeed: 2000,
      SpamChannel: "",
    },
    logging: {
      Pokemon: false,
      Quests: true,
      LowIV: true,
      HighIV: true,
      SpecialCatches: true,
      LowIVThreshold: 15,
      HighIVThreshold: 85,
      LogWebhook: "",
    },
    ownership: {
      OwnerIDs: ["1101294362505269379", "..."],
      CommandPrefix: "!",
    },
    globalSettings: {
      GlobalCatch: false,
      BlacklistedGuilds: ["716390832034414685", "..."],
    },
    hunting: {
      HuntPokemons: ["rayquaza", "solosis"],
      HuntToken: "HuntToken",
    },
    captchaSolving: {
      key: "",
    },
    debug: true,
  };
}

function copy() {
  return structuredClone(validConfig());
}

test("a complete config validates and only warns about placeholders", () => {
  const { errors, warnings } = validateConfig(validConfig());

  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, [
    "incense.IncenseChannel still holds a placeholder value",
    "hunting.HuntToken still holds a placeholder value",
  ]);
});

test("required sections are rejected when missing", () => {
  const expected = {
    behavior:
      "behavior must be an object with AI, Catching, and Spamming booleans",
    globalSettings: "globalSettings must be an object",
    hunting: "hunting must be an object",
    captchaSolving:
      'captchaSolving must be an object (set key to "" to disable)',
  };

  for (const [section, message] of Object.entries(expected)) {
    const config = copy();
    delete config[section];
    assert.ok(
      validateConfig(config).errors.includes(message),
      `missing ${section} should report: ${message}`
    );
  }
});

test("required keys inside a section are rejected when missing", () => {
  const behavior = copy();
  delete behavior.behavior.Catching;
  assert.ok(
    validateConfig(behavior).errors.includes(
      "behavior.Catching must be a boolean"
    )
  );

  const logging = copy();
  delete logging.logging.LogWebhook;
  assert.ok(
    validateConfig(logging).errors.includes(
      "logging.LogWebhook must be a string (empty to disable)"
    )
  );
});

test("spam speed is validated as a number within range", () => {
  const tooFast = copy();
  tooFast.spamming.SpamSpeed = 500;
  assert.ok(
    validateConfig(tooFast).errors.some((error) =>
      error.includes("spamming.SpamSpeed must be between 1000 and 120000ms")
    )
  );

  const asString = copy();
  asString.spamming.SpamSpeed = "2000";
  const { errors, warnings } = validateConfig(asString);
  assert.deepEqual(errors, []);
  assert.ok(
    warnings.some((warning) =>
      warning.includes("spamming.SpamSpeed should be a Number")
    )
  );
});

test("IV thresholds must stay ordered", () => {
  const config = copy();
  config.logging.LowIVThreshold = 90;
  config.logging.HighIVThreshold = 85;

  assert.ok(
    validateConfig(config).errors.includes(
      "logging.LowIVThreshold must be below HighIVThreshold"
    )
  );
});

test("valid but notable values warn instead of failing", () => {
  const config = copy();
  config.logging.LogWebhook = "http://localhost:3000/hook";
  config.ownership.OwnerIDs = ["123"];

  const { errors, warnings } = validateConfig(config);
  assert.deepEqual(errors, []);
  assert.ok(
    warnings.some((warning) => warning.includes("does not look like a Discord"))
  );
  assert.ok(
    warnings.some((warning) => warning.includes("non-snowflake value"))
  );
});

test("placeholder values never count as configured", () => {
  const config = copy();
  config.incense.IncenseChannel = "...";
  config.hunting.HuntToken = "HuntToken";

  const { errors, warnings } = validateConfig(config);
  assert.deepEqual(errors, []);
  assert.equal(
    warnings.filter((warning) => warning.includes("placeholder")).length,
    2
  );
});
