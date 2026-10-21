module.exports = {
  name: "support",
  aliases: ["howto", "guide"],
  async execute(client, message, _args) {
    await message.channel
      .send(
        "For support, please join the CatchTwo support server: https://discord.gg/RtnQavFVRq"
      )
      .catch(() => null);
  },
};
