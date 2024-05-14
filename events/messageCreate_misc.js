const chalk = require("chalk");
const { solveHint, getImage } = require("pokehint");

const config = require("../config.json");

const { wait, randomInteger } = require("../utils/utils.js");
const { ShinyHunter } = require("../classes/clients/shinyHunter.js");
const { sendLog, sendCatch } = require("../functions/logging.js");
const { setSpamming, getSpamming, getWaiting, setWaiting } = require("../utils/states.js");

module.exports = async (client, guildId, message) => {

  if (message.author.id == "716390085896962058" && getWaiting == false) {
    if (message?.embeds[0]?.fields[0]?.name.includes("Easter")) {
      const messages = await message.channel.messages
        .fetch({ limit: 2, around: message.id })
        .catch(() => null);
      const newMessage = Array.from(messages.values());
      [...messages.values()];

      if (newMessage[1].author.id == client.user.id) {
        let boxAmount = parseInt(message.embeds[0].fields[0].name);
        openInterval = setInterval(async () => {
          if (boxAmount > 0) {
            if (boxAmount >= 15) {
              message.channel.send(`<@716390085896962058> easter open 15`);
              boxAmount -= 15;
            } else {
              message.channel.send(
                `<@716390085896962058> easter open ${boxAmount}`
              );
              boxAmount = 0;
              clearInterval(openInterval);
            }
          }
        }, 1000);
      }
    } else if (
      message.content.includes(
        `https://verify.poketwo.net/captcha/${client.user.id}`
      )
    ) {
      setWaiting(true);
      sendLog(client.user.username, "Detected captcha.", "captcha");
      config.ownership.OwnerIDs.forEach((id) => {
        if (id.length <= 16) return;
        client.users.fetch(id).then(async (user) => {
          dmChannel = await client.channels.fetch(user.dmChannel.id);
          lastMessage = await dmChannel.messages.fetch(dmChannel.lastMessageId);
          if (
            lastMessage?.content.includes("captcha") &&
            lastMessage?.author.id == client.user.id &&
            lastMessage?.createdTimestamp > Date.now() - 86400000
          ) {
            return;
          } else {
            sendWebhook(null, {
              title: `Captcha Found!`,
              color: "#FF5600",
              url: `https://verify.poketwo.net/captcha/${client.user.id}`,
              footer: {
                text: "CatchTwo by @kyan0045",
                icon_url:
                  "https://camo.githubusercontent.com/50135c6f8c4ae4b9faa62bf3aca70ce4ee18908c0b239539b18fc26f35d5f50b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
              },
            });
            return user.send(
              `## DETECTED A CAPTCHA\n> I've detected a captcha. The autocatcher has been paused. To continue, please solve the captcha below.\n* https://verify.poketwo.net/captcha/${client.user.id}\n\n### SOLVED?\n> Once solved, run the command \`\`${config.ownership.CommandPrefix}solved\`\` to continue catching.`
            );
          }
        });
      });
    }
  }
};
