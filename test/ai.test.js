const test = require("node:test");
const assert = require("node:assert/strict");

const {
  decide,
  CONFIDENCE_FLOOR,
  UNRELIABLE_CLASSES,
} = require("../src/services/ai.js");

test("prediction decisions accept a confident, reliable class", () => {
  const result = decide(
    ["Pikachu", "Eevee"],
    Float32Array.from([0.82, 0.18]),
    2
  );

  assert.equal(result.name, "Pikachu");
  assert.equal(result.accepted, true);
  assert.equal(result.reason, "ok");
  assert.ok(result.confidence >= 0 && result.confidence <= 1);
  assert.ok(result.margin >= 0 && result.margin <= 1);
});

test("low confidence abstains instead of catching", () => {
  const probs = Float32Array.from([CONFIDENCE_FLOOR - 0.1, 0.2]);
  const result = decide(["Pikachu", "Eevee"], probs, 2);

  assert.equal(result.accepted, false);
  assert.equal(result.reason, "low-confidence");
});

test("unreliable classes abstain regardless of confidence", () => {
  const unreliable = [...UNRELIABLE_CLASSES][0];
  const result = decide(
    [unreliable, "Pikachu"],
    Float32Array.from([0.99, 0.01]),
    2
  );

  assert.equal(result.accepted, false);
  assert.equal(result.reason, "unreliable-class");
});

test("center crop recreates the training framing", () => {
  const { computeCenterCrop } = require("../src/services/ai.js");

  assert.equal(computeCenterCrop(64, 64), null);
  assert.equal(computeCenterCrop(128, 128), null);

  // Live spawn scenes are cropped around the centered subject
  assert.deepEqual(computeCenterCrop(800, 500), {
    left: 200,
    top: 50,
    width: 400,
    height: 400,
  });
  assert.deepEqual(computeCenterCrop(800, 800), {
    left: 80,
    top: 80,
    width: 640,
    height: 640,
  });
  assert.deepEqual(computeCenterCrop(1024, 768), {
    left: 205,
    top: 77,
    width: 614,
    height: 614,
  });

  assert.equal(computeCenterCrop(undefined, 500), null);
});
