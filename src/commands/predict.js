// Import necessary modules for AI prediction
const data = require("../data/ai.json");
const axios = require("axios");
const path = require("path");

// Define global variables
let model;
let tfLib;
let sharpLib;
let modelLoadPromise;

async function loadAiDependencies() {
  if (!tfLib) {
    if (process.platform === "win32") {
      const tensorflowLibPath = path.resolve(
        "node_modules/@tensorflow/tfjs-node/deps/lib"
      );
      process.env.PATH = `${tensorflowLibPath}${path.delimiter}${process.env.PATH}`;
    }
    tfLib = require("@tensorflow/tfjs-node");
  }
  if (!sharpLib) {
    sharpLib = require("sharp");
  }

  return { tf: tfLib, sharp: sharpLib };
}

// Preprocess image for TensorFlow model
async function preprocessImage(url) {
  const { tf, sharp } = await loadAiDependencies();
  const response = await axios({
    url,
    responseType: "arraybuffer",
  });

  // Apply normalization to automatically correct contrast and remove haze/color cast
  // Then apply a gentle saturation boost to restore color vibrancy
  const imageBuffer = await sharp(Buffer.from(response.data))
    .normalize() // Step 1: Automatically correct contrast and remove haze/color cast
    .modulate({
      saturation: 1.2, // Step 2: Apply a gentle saturation boost after normalization
    })
    .resize(64, 64)
    .toBuffer();

  return tf.tidy(() => {
    const decodedImage = tf.node.decodeImage(imageBuffer, 3);
    const normalizedImage = tf.divNoNan(decodedImage, tf.scalar(255.0));
    const expandedTensor = tf.expandDims(normalizedImage, 0);
    return expandedTensor;
  });
}

// Get top 5 predictions with confidence percentages
async function getTopPredictions(url, topK = 5) {
  const { tf } = await loadAiDependencies();

  if (!model) {
    modelLoadPromise =
      modelLoadPromise ||
      tf.loadLayersModel("file://./src/data/model/model.json");
    model = await modelLoadPromise;
  }

  const imageTensor = await preprocessImage(url);

  // Use tf.tidy to automatically dispose intermediate tensors
  const predictions = tf.tidy(() => {
    const prediction = model.predict(imageTensor);
    return prediction.dataSync();
  });

  // Manually dispose the input tensor
  imageTensor.dispose();

  const keys = Object.keys(data);

  // Create array of predictions with indices
  const predictionArray = Array.from(predictions).map((confidence, index) => ({
    name: keys[index],
    confidence: confidence * 100, // Convert to percentage
    index: index,
  }));

  // Sort by confidence descending and take top K
  const topPredictions = predictionArray
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, topK);

  return topPredictions;
}

// This module exports a "predict" command for CatchTwo
module.exports = {
  name: "predict", // Command name
  aliases: ["ai", "guess"], // Command aliases for easier access
  // Asynchronous function to handle the command execution
  async execute(client, message, args) {
    console.log("[PREDICT] Command executed");
    console.log("[PREDICT] User:", message.author.username);
    console.log("[PREDICT] Args:", args);

    try {
      let imageUrl;

      // Check if there's an image attachment
      if (message.attachments.length > 0) {
        const attachment = message.attachments[0];
        imageUrl = attachment.url;
        console.log("[PREDICT] Found attachment:", imageUrl);
      }
      // Check if replying to a message with an image
      else if (message.data?.message_reference) {
        console.log("[PREDICT] Found message reference");
        const referencedMessage = await message.fetchReference();

        // Check for attachments in referenced message
        if (referencedMessage.attachments.length > 0) {
          imageUrl = referencedMessage.attachments[0].url;
          console.log(
            "[PREDICT] Found attachment in referenced message:",
            imageUrl,
          );
        }
        // Check for embeds with images in referenced message
        else if (referencedMessage.embeds[0]?.image?.url) {
          imageUrl = referencedMessage.embeds[0].image.url;
          console.log(
            "[PREDICT] Found embed image in referenced message:",
            imageUrl,
          );
        }
      }
      // Check if URL is provided as argument
      else if (
        args[0] &&
        (args[0].startsWith("http://") || args[0].startsWith("https://"))
      ) {
        imageUrl = args[0];
        console.log("[PREDICT] Using URL from args:", imageUrl);
      }

      if (!imageUrl) {
        console.log("[PREDICT] No image URL found");
        return message.reply(
          "Please provide an image by attaching it, replying to a message with an image, or providing an image URL.",
        );
      }

      console.log("[PREDICT] Sending loading message...");
      // Send a loading message
      const loadingMsg = await message.reply("🔄 Analyzing image...");
      console.log("[PREDICT] Loading message sent");

      // Get predictions
      console.log("[PREDICT] Starting prediction...");
      const startTime = Date.now();
      const topPredictions = await getTopPredictions(imageUrl, 5);
      const timeTaken = Date.now() - startTime;
      console.log("[PREDICT] Prediction completed in", timeTaken, "ms");

      // Format the response
      let response = `**Top 5 Predictions:**\n\n`;
      topPredictions.forEach((pred, index) => {
        const bar =
          "█".repeat(Math.round(pred.confidence / 5)) +
          "░".repeat(20 - Math.round(pred.confidence / 5));
        response += `${index + 1}. **${pred.name}** - ${pred.confidence.toFixed(
          2,
        )}%\n`;
        response += `${bar}\n\n`;
      });
      response += `*Analysis took ${timeTaken}ms*`;

      console.log("[PREDICT] Formatting response...");
      console.log("[PREDICT] Editing loading message with results...");
      // Edit the loading message with results
      await loadingMsg.edit(response);
      console.log("[PREDICT] Command completed successfully");
    } catch (error) {
      console.error("[PREDICT] Error in predict command:", error);
      console.error("[PREDICT] Error stack:", error.stack);
      try {
        await message.reply(
          "❌ Failed to analyze the image. Please make sure it's a valid Pokémon image.",
        );
      } catch (replyError) {
        console.error("[PREDICT] Failed to send error message:", replyError);
      }
    }
  },
};
