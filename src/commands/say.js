module.exports = {
  name: "say",
  aliases: ["repeat", "respond", "echo"],
  async execute(client, message, args) {
    if (!args.length) return message.reply("Please provide a message to echo.");
    const sentMessage = await message.channel.send(args.join(" "));
    if (!sentMessage) return;
    // React only after the message was successfully sent
    await message.react("✅");
  },
};
