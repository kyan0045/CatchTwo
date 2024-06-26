module.exports = {
  name: "say",
  aliases: ["repeat", "respond", "echo"],
  async execute(client, message, args) {
    message.channel.send(args.join(" ")).then(message.react("✅"));
  },
};