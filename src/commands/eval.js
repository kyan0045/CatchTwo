const { MessageAttachment } = require("discord-self-lite");
const config = require("../../config.js");
const { sendLog } = require("../services/logging.js");

module.exports = {
  name: "eval",
  aliases: ["evaluate"],
  async execute(client, message, args) {
    if (config.debug !== true) {
      return message.reply("Eval command is only available in debug mode.");
    }
    if (args.length === 0) {
      return message.reply("Please specify code to evaluate.");
    }

    const code = args.join(" ");
    let result;

    try {
      result = await eval(code);
    } catch (err) {
      sendLog(null, `Eval failed: ${err.message || err}`, "error");
      return message.reply(
        `An error occurred while evaluating the code:\n\`${err}\``
      );
    }

    result = require("util").inspect(result, { depth: 0 });

    if (result.length > 2000) {
      const buffer = Buffer.from(result, "utf8");
      const attachment = new MessageAttachment(buffer, "result.js");
      return message.reply({
        content: "The result was too long to send in a message.",
        files: [attachment],
      });
    } else {
      return message.reply(`\`\`\`js\n${result}\n\`\`\``);
    }
  },
};
