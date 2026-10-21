const { setWaiting } = require("../services/states");

module.exports = {
  name: "resume",
  aliases: ["solved", "captcha-solved", "done"],
  async execute(client, message, args) {
    const { clients } = require("../classes/catcher.js");
    if (!args.length) {
      clients.forEach((c) => {
        if (!c?.user?.id || c.stopped || c.suspended) return;
        setWaiting(c.user.id, false);
      });
      await message.react("✅");
      return;
    }

    // Accept a raw ID or a <@id> / <@!id> mention
    let userId = args[0];
    const mentionMatch = /^<@!?(\d+)>$/.exec(userId);
    if (mentionMatch) {
      userId = mentionMatch[1];
    }

    const catcher = clients.find((c) => c?.user?.id === userId);
    if (!catcher) {
      return message.reply(
        "That user is not a CatchTwo catcher running in this instance."
      );
    }

    if (catcher.stopped || catcher.suspended) {
      return message.reply("Stopped or suspended accounts cannot be resumed.");
    }

    setWaiting(catcher.user.id, false);
    await message.react("✅");
  },
};
