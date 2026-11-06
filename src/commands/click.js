const { sendLog } = require("../services/logging.js");

const MESSAGE_LINK_PATTERN =
  /^https?:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+|@me)\/(\d+)\/(\d+)\/?$/;

function parseMessageLink(value) {
  const match = MESSAGE_LINK_PATTERN.exec(value);
  if (!match) return null;
  return {
    guildId: match[1] === "@me" ? null : match[1],
    channelId: match[2],
    messageId: match[3],
  };
}

module.exports = {
  name: "click",
  aliases: ["buttonclick", "clickbutton"],
  async execute(client, message, args) {
    let msg;
    let buttonId;
    let rowId = null;
    let targetButton = null;
    let usedMessageId = false;

    try {
      const linked = parseMessageLink(args[0]);
      if (linked) {
        const channel =
          linked.channelId === message.channel.id
            ? message.channel
            : await client.resolveChannel(linked.channelId);
        if (!channel) throw new Error("Could not resolve the linked channel.");
        msg = await channel.fetchMessage(linked.messageId);
        msg.guildId =
          linked.guildId || msg.guildId || channel.guildId || message.guildId;
        buttonId = parseInt(args[1]) - 1;
        if (args[2]) {
          rowId = parseInt(args[2]) - 1;
        }
      } else if (args[0]?.length > 10) {
        usedMessageId = true;
        msg = await message.channel.fetchMessage(args[0]);
        buttonId = parseInt(args[1]) - 1;
        if (args[2]) {
          rowId = parseInt(args[2]) - 1;
        }
      } else if (message.reference) {
        msg = await message.fetchReference();
        buttonId = parseInt(args[0]) - 1;
        if (args[1]) {
          rowId = parseInt(args[1]) - 1;
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      sendLog(
        client?.user?.username,
        `Click command failed: ${err.message || err}`,
        "error"
      );
      if (usedMessageId) {
        return message.reply(
          "That message ID was not found in this channel. Use the full message link for a message in another channel."
        );
      }
      return message.reply(
        "Please reply to the message that the button is attached to, specify the message ID, or provide a message link."
      );
    }

    try {
      if (msg && !msg.guildId) msg.guildId = message.guildId;

      if (!msg?.components || msg?.components?.length === 0) {
        return message.reply("This message doesn't have any buttons to click.");
      }

      if (rowId !== null) {
        const row = msg.components[rowId];
        if (!row) {
          return message.reply("Row not found at the specified position.");
        }
        const rowButtons = row.components.filter(
          (component) => component.type === 2 && component.customId
        );
        if (!(buttonId >= 0 && buttonId < rowButtons.length)) {
          return message.reply("Button not found at the specified position.");
        }
        targetButton = rowButtons[buttonId];
      } else {
        const buttons = msg.components.flatMap((row) =>
          row.components.filter(
            (component) => component.type === 2 && component.customId
          )
        );
        if (!(buttonId >= 0 && buttonId < buttons.length)) {
          return message.reply("Button not found at the specified position.");
        }
        targetButton = buttons[buttonId];
      }

      if (!targetButton || !targetButton.customId) {
        return message.reply("Button not found at the specified position.");
      }

      await msg.clickButton(targetButton.customId);
      message.react("✅").catch(() => null);
    } catch (err) {
      const applicationId = msg?.applicationId || msg?.author?.id || "unknown";
      sendLog(
        client?.user?.username,
        `Click command failed: ${err.message || err} (message ${msg?.id || "unknown"}, guild ${msg?.guildId || message.guildId || "unknown"}, app ${applicationId}, button ${targetButton?.customId || "unknown"})`,
        "error"
      );
      message.react("❌");
      message.reply(`Failed to click button: ${err.message}`);
    }
  },
};
