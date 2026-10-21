const { getTopPredictions } = require("../services/ai.js");
const { sendLog } = require("../services/logging.js");

module.exports = {
  name: "predict",
  aliases: ["ai", "guess"],
  async execute(client, message, args) {
    let loadingMsg = null;
    try {
      let imageUrl;

      if (message.attachments?.length > 0) {
        const attachment = message.attachments[0];
        imageUrl = attachment.url;
      } else if (message.reference) {
        const referencedMessage = await message
          .fetchReference()
          .catch(() => null);

        if ((referencedMessage?.attachments?.length ?? 0) > 0) {
          imageUrl = referencedMessage.attachments[0].url;
        } else if (referencedMessage?.embeds?.[0]?.image?.url) {
          imageUrl = referencedMessage.embeds[0].image.url;
        }
      } else if (
        args[0] &&
        (args[0].startsWith("http://") || args[0].startsWith("https://"))
      ) {
        imageUrl = args[0];
      }

      if (!imageUrl) {
        return message.reply(
          "Please provide an image by attaching it, replying to a message with an image, or providing an image URL."
        );
      }

      loadingMsg = await message.reply("🔄 Analyzing image...");

      const { topPredictions, timeTaken, accepted, reason } =
        await getTopPredictions(imageUrl, 5);

      let response = `**Top 5 Predictions:**\n\n`;
      topPredictions.forEach((pred, index) => {
        const percent = pred.confidence * 100;
        const filled = Math.min(20, Math.round(percent / 5));
        const bar = "█".repeat(filled) + "░".repeat(20 - filled);
        const flag = pred.unreliable ? " (unreliable)" : "";
        response += `${index + 1}. **${pred.name}** - ${percent.toFixed(
          2
        )}%${flag}\n`;
        response += `${bar}\n\n`;
      });
      if (accepted === false) {
        response += `Note: top prediction would abstain in auto-catch (${reason}).\n\n`;
      }
      response += `*Analysis took ${timeTaken}ms*`;

      if (loadingMsg) await loadingMsg.edit(response);
    } catch (error) {
      sendLog(
        client.user.username,
        `Predict command failed: ${error.message || error}`,
        "error"
      );
      try {
        const failure =
          "❌ Failed to analyze the image. Please make sure it's a valid Pokémon image.";
        if (loadingMsg) await loadingMsg.edit(failure).catch(() => null);
        else await message.reply(failure);
      } catch (replyError) {
        sendLog(
          client.user.username,
          `Failed to send predict error message: ${
            replyError.message || replyError
          }`,
          "error"
        );
      }
    }
  },
};
