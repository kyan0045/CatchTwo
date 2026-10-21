const { sendLog } = require("../services/logging.js");

module.exports = {
  name: "click",
  aliases: ["buttonclick", "clickbutton"],
  async execute(client, message, args) {
    let msg;
    let buttonId;
    let rowId = null;

    try {
      if (args[0]?.length > 10) {
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
      return message.reply(
        `Please reply to the message that the button is attached to, or specify the message ID.`
      );
    }

    try {
      if (!msg?.components || msg?.components?.length === 0) {
        return message.reply("This message doesn't have any buttons to click.");
      }

      let targetButton = null;

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
      sendLog(
        client?.user?.username,
        `Click command failed: ${err.message || err}`,
        "error"
      );
      message.react("❌");
      message.reply(`Failed to click button: ${err.message}`);
    }
  },
};
