module.exports = {
  name: "ping",
  aliases: ["latency", "ms", "pong"],
  async execute(client, message, _args) {
    const startTime = Date.now();
    const sentMessage = await message.channel.send("Pinging...");
    if (!sentMessage) return;
    const latency = Date.now() - startTime;
    await sentMessage.edit(`Pong! Latency: ${latency} ms`);
  },
};
