module.exports = {
  name: "click",
  aliases: ["buttonclick", "clickbutton"],
  async execute(client, message, args) {
    let msg;
    let buttonId = 0;

    try {
      if (args[0]?.length > 10) {
        msg = await message.channel.messages.fetch(args[0]);
        buttonId = parseInt(args[1]) - 1;
        if (args[2]) {
          rowId = parseInt(args[2]) - 1;
        } else {
          rowId = 0;
        }
      } else if (message.reference) {
        msg = await message.channel.messages.fetch(message.reference.messageId);
        buttonId = parseInt(args[0]) - 1;
        if (args[1]) {
          rowId = parseInt(args[1]) - 1;
        } else {
          rowId = 0;
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error(err);
      return message.reply(
        `Please reply to the message that the button is attached to, or specify the message ID.`
      );
    }

    try {
      await msg.clickButton({ X: isNaN(buttonId) ? 0 : buttonId, Y: 0 });
      message.react("✅");
    } catch (err) {
      console.error(err);
      message.react("❌");
    }
  },
};
