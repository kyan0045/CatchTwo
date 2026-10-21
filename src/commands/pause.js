const { setWaiting } = require("../services/states");

module.exports = {
  name: "pause",
  aliases: ["wait", "stop"],
  async execute(client, message, args) {
    const { clients } = require("../classes/catcher.js");
    if (!args.length) {
      clients.forEach((c) => {
        if (!c?.user?.id) return;
        setWaiting(c.user.id, true);
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

    setWaiting(catcher.user.id, true);
    await message.react("✅");
  },
};
