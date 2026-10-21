const path = require("path");
const fs = require("fs");
const axios = require("axios");

// Production model: sepconv-1279-real-ft (20260723 run), from https://github.com/kyan0045/poketwo-ai.

let LABELS = null;
function loadLabels() {
  if (LABELS) return LABELS;
  const dataDir = path.resolve(__dirname, "../data");
  const labelsPath = path.join(dataDir, "labels.json");
  const raw = JSON.parse(fs.readFileSync(labelsPath, "utf8"));
  const classes = Array.isArray(raw) ? raw : raw.classes;
  if (!Array.isArray(classes) || classes.length === 0) {
    throw new Error(
      `Invalid labels.json: expected non-empty classes array at ${labelsPath}`
    );
  }
  LABELS = classes;
  return LABELS;
}

/*
Measured on the 17,659-image validation set for sepconv-1279-real-ft:
top-1 median 0.927, mean 0.911; correct mean 0.913, wrong median 0.631.
0.70 gives 98.4% coverage at 99.76% accepted accuracy (baseline 99.45%).
Live hints share a 30s cooldown, so an abstain often misses the spawn
outright. On a 1,272-image stratified sample, 0.50 accepts 99.06% of
images at 99.21% accuracy, versus 96.2% at 99.59% for 0.70. The small
accuracy cost buys far fewer hint requests. Floors at or above 0.90
collapse coverage under label smoothing 0.1 (71% at 0.90, 25% at 0.95),
so do not raise this without new measurements.
*/
const CONFIDENCE_FLOOR = 0.5;
const MARGIN_WARN = 0.25;
// Classes the model cannot reliably predict.
const UNRELIABLE_CLASSES = new Set([
  "Type  Null",
  "Type",
  "Galarian Articuno",
  "Galarian Zapdos",
  "MissingNo",
  "Regieleki",
  "Scolipede",
  "Xurkitree",
]);

let model = null;
let tfLib = null;
let sharpLib = null;
let modelLoadPromise = null;

async function loadAiDependencies() {
  if (!tfLib) {
    tfLib = require("@tensorflow/tfjs");
    tfLib.enableProdMode();
  }
  if (!sharpLib) {
    sharpLib = require("sharp");
  }
  return { tf: tfLib, sharp: sharpLib };
}

async function loadLayersModelFromDisk(modelDir) {
  const { tf } = await loadAiDependencies();
  const modelJsonPath = path.join(modelDir, "model.json");
  const modelJson = JSON.parse(
    await fs.promises.readFile(modelJsonPath, "utf8")
  );

  function scrubSeparableConv2D(config) {
    if (Array.isArray(config)) config.forEach(scrubSeparableConv2D);
    else if (config && typeof config === "object") {
      if (config.class_name === "SeparableConv2D" && config.config) {
        delete config.config.kernel_initializer;
        delete config.config.kernel_regularizer;
        delete config.config.kernel_constraint;
      }
      Object.values(config).forEach(scrubSeparableConv2D);
    }
  }
  scrubSeparableConv2D(modelJson.modelTopology);

  const allWeightSpecs = [];
  const shardBuffers = [];

  for (const group of modelJson.weightsManifest || []) {
    if (Array.isArray(group.weights)) {
      allWeightSpecs.push(...group.weights);
    }

    for (const relPath of group.paths || []) {
      const absPath = path.join(modelDir, relPath);
      const shard = await fs.promises.readFile(absPath);
      shardBuffers.push(shard);
    }
  }

  const weightDataBuffer = Buffer.concat(shardBuffers);
  const weightData = weightDataBuffer.buffer.slice(
    weightDataBuffer.byteOffset,
    weightDataBuffer.byteOffset + weightDataBuffer.byteLength
  );

  const loaded = await tf.loadLayersModel({
    load: async () => ({
      modelTopology: modelJson.modelTopology,
      format: modelJson.format,
      generatedBy: modelJson.generatedBy,
      convertedBy: modelJson.convertedBy,
      weightsManifest: modelJson.weightsManifest,
      weightSpecs: allWeightSpecs,
      weightData,
    }),
  });

  // Fail before inference on a model/labels mismatch instead of silently mislabeling every catch.
  const expected = loadLabels().length;
  const outputs = loaded.outputs[0].shape[loaded.outputs[0].shape.length - 1];
  if (outputs !== expected) {
    throw new Error(
      `Model/label mismatch: model has ${outputs} outputs for ${expected} labels. ` +
        `Copy model.json + shards + labels.json as one set from the same run.`
    );
  }
  return loaded;
}

async function getModel() {
  if (!model) {
    const modelDir = path.resolve(__dirname, "../data/model");
    modelLoadPromise = modelLoadPromise || loadLayersModelFromDisk(modelDir);
    try {
      model = await modelLoadPromise;
    } catch (error) {
      modelLoadPromise = null;
      throw error;
    }
  }
  return model;
}

// Center crop live scenes to the training framing.
const CENTER_CROP_MIN_SIDE = 128;
const CENTER_CROP_RATIO = 0.8;

function computeCenterCrop(width, height) {
  if (!width || !height) return null;
  const minSide = Math.min(width, height);
  if (minSide <= CENTER_CROP_MIN_SIDE) return null;

  const size = Math.round(minSide * CENTER_CROP_RATIO);
  return {
    left: Math.round((width - size) / 2),
    top: Math.round((height - size) / 2),
    width: size,
    height: size,
  };
}

async function preprocessImage(url) {
  const { tf, sharp } = await loadAiDependencies();
  const response = await axios({
    url,
    responseType: "arraybuffer",
    timeout: 8000,
    maxContentLength: 5 * 1024 * 1024,
    maxBodyLength: 5 * 1024 * 1024,
    validateStatus: (status) => status >= 200 && status < 300,
  });

  const contentType = response.headers?.["content-type"];
  if (contentType && !contentType.startsWith("image/")) {
    throw new Error(`Unexpected content-type: ${contentType}`);
  }

  const sourceBuffer = Buffer.from(response.data);
  let pipeline = sharp(sourceBuffer);
  const metadata = await pipeline.metadata();
  const crop = computeCenterCrop(metadata.width, metadata.height);
  if (crop) pipeline = pipeline.extract(crop);

  const imageBuffer = await pipeline
    .resize(64, 64, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer();

  return tf.tidy(() => {
    const tensor = tf.tensor3d(
      new Uint8Array(imageBuffer),
      [64, 64, 3],
      "int32"
    );
    const normalizedImage = tf.cast(tensor, "float32").div(tf.scalar(255.0));
    const expandedTensor = tf.expandDims(normalizedImage, 0);
    return expandedTensor;
  });
}

function decide(names, probs, topK) {
  const order = Array.from(probs.keys()).sort((a, b) => probs[b] - probs[a]);
  const top = order.slice(0, topK).map((index) => ({
    name: names[index],
    confidence: probs[index],
    index,
  }));
  const confidence = probs[order[0]];
  const margin = order.length > 1 ? probs[order[0]] - probs[order[1]] : 1;
  const name = names[order[0]];
  let accepted = true;
  let reason = "ok";
  if (UNRELIABLE_CLASSES.has(name)) {
    accepted = false;
    reason = "unreliable-class";
  } else if (confidence < CONFIDENCE_FLOOR) {
    accepted = false;
    reason = "low-confidence";
  }
  return { name, confidence, margin, accepted, reason, top };
}

async function infer(url, { topK = 5 } = {}) {
  const { tf } = await loadAiDependencies();
  const activeModel = await getModel();
  const names = loadLabels();

  const startTime = Date.now();
  const imageTensor = await preprocessImage(url);

  let probs;
  try {
    probs = tf.tidy(() => {
      const prediction = activeModel.predict(imageTensor);
      return prediction.dataSync();
    });
  } finally {
    imageTensor.dispose();
  }

  const result = decide(names, probs, topK);
  return { ...result, timeTaken: Date.now() - startTime };
}

async function predict(url, opts = {}) {
  const config = require("../../config.js");
  const { sendLog } = require("./logging.js");
  const { returnDetails = false, topK = 5 } = opts;
  const started = Date.now();
  const result = await infer(url, { topK });

  if (config.debug) {
    const { tf } = await loadAiDependencies();
    const memory = tf.memory();
    sendLog(
      null,
      `TF memory - tensors: ${memory.numTensors}, bytes: ${memory.numBytes}`,
      "debug"
    );
  }

  if (result.margin < MARGIN_WARN) {
    sendLog(
      null,
      `Low prediction margin ${(result.margin * 100).toFixed(1)}% ` +
        `(below ${(MARGIN_WARN * 100).toFixed(0)}%); top class may be ambiguous.`,
      "debug"
    );
  }

  sendLog(
    null,
    `AI prediction took ${Date.now() - started}ms ` +
      `(conf ${(result.confidence * 100).toFixed(1)}%, ` +
      `margin ${(result.margin * 100).toFixed(1)}%, ${result.reason}).`,
    "debug"
  );

  if (returnDetails) return result;
  return result.name;
}

// Return top predictions as probabilities (0-1).
async function getTopPredictions(url, topK = 5) {
  const { top, timeTaken, name, confidence, margin, accepted, reason } =
    await infer(url, { topK });
  return {
    topPredictions: top.map((entry) => ({
      ...entry,
      unreliable: UNRELIABLE_CLASSES.has(entry.name),
    })),
    timeTaken,
    topName: name,
    topConfidence: confidence,
    topMargin: margin,
    accepted,
    reason,
  };
}

module.exports = {
  loadAiDependencies,
  predict,
  infer,
  getTopPredictions,
  computeCenterCrop,
  decide,
  CONFIDENCE_FLOOR,
  MARGIN_WARN,
  UNRELIABLE_CLASSES,
};
