var version = "1.3.8";
// Version 1.3.8
// EVERYTHING can be set up in config.json, no need to change anything here :)!

const { Client, Permissions } = require("discord.js-selfbot-v13");
const axios = require("axios");
const date = require("date-and-time");
const express = require("express");
const app = express();
const fs = require("fs-extra");
const chalk = require("chalk");
const { solveHint, checkRarity } = require("pokehint");
const { Webhook, MessageBuilder } = require("discord-webhook-node");
const config = process.env.CONFIG
  ? JSON.parse(process.env.CONFIG)
  : require("./config.json");
let log;
if (config.logWebhook.length > 25) {
  log = new Webhook(config.logWebhook);
  log.setUsername("CatchTwo Logs");
  log.setAvatar(
    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
  );
}
const { exec } = require("child_process");

// CODE, NO NEED TO CHANGE

spamMessageCount = 0;
pokemonCount = 0;
legendaryCount = 0;
mythicalCount = 0;
ultrabeastCount = 0;
shinyCount = 0;

axios
  .get("https://raw.githubusercontent.com/kyan0045/catchtwo/main/index.js")
  .then(function (response) {
    var d = response.data;
    let v = d.match(/Version ([0-9]*\.?)+/)[0]?.replace("Version ", "");
    if (v) {
      console.log(chalk.bold("Version " + version));
      if (v !== version) {
        console.log(
          chalk.bold.bgRed(
            "There is a new version available: " +
              v +
              "\nPlease update.                         " +
              chalk.underline("\nhttps://github.com/kyan0045/catchtwo") +
              `\nRun "git pull https://github.com/kyan0045/catchtwo" to update.`
          )
        );

        log?.send(
          new MessageBuilder()
            .setTitle("New Version")
            .setURL("https://github.com/kyan0045/catchtwo")
            .setDescription(
              "Current version:** " +
                version +
                "**\nNew version: **" +
                v +
                "**\nPlease update: " +
                "https://github.com/kyan0045/CatchTwo"
            )
            .setFooter(
              `Run "git pull https://github.com/kyan0045/catchtwo" to update.`
            )
            .setColor("#E74C3C")
        );
      }
    }
  })
  .catch(function (error) {
    console.log(error);
  });

let data = process.env.TOKENS;
if (!data) data = fs.readFileSync("./tokens.txt", "utf-8");
if (!data) throw new Error(`Unable to find your tokens.`);
const tokensAndGuildIds = data.split(/\s+/);
config.tokens = [];

/* if (tokensAndGuildIds.length % 2 !== 0) {
  if (!process.env.TOKENS)
    throw new Error(
      `Invalid number of tokens and guild IDs, please check if ./tokens.txt has an empty line, and if so, remove it.`
    );
  throw new Error(`Invalid number of tokens and guild IDs.`);
} */

for (let i = 0; i < tokensAndGuildIds.length; i += 2) {
  if (tokensAndGuildIds[i + 1]) {
    const token = tokensAndGuildIds[i].trim();
    const guildId = tokensAndGuildIds[i + 1].trim();

    if (token && guildId) {
      config.tokens.push({ token, guildId });
    }
  }
}

if (process.env.REPLIT_DB_URL && (!process.env.TOKENS || !process.env.CONFIG))
  console.log(
    `You are running on replit, please use it's secret feature, to prevent your tokens and webhook from being stolen and misused.\nCreate a secret variable called "CONFIG" for your config, and a secret variable called "TOKENS" for your tokens.`
  );

app.get("/", async function (req, res) {
  res.send(`CURRENTLY RUNNING ON ${config.tokens.length} ACCOUNT(S)!`);
});

app.listen(20040, async () => {
  console.log(chalk.bold.bgRed(`SERVER STATUS: ONLINE`));
});

async function Login(token, Client, guildId) {
  if (!token) {
    console.log(
      chalk.redBright("You must specify a (valid) token.") +
        chalk.white(` ${token} is invalid.`)
    );
  }

  if (!guildId) {
    console.log(
      chalk.redBright(
        "You must specify a (valid) guild ID for all your tokens. This is the guild in which they will spam."
      )
    );
  }

  if (guildId && guildId.length > 21) {
    console.log(
      chalk.redBright(
        `You must specify a (valid) guild ID, ${guildId} is too long!`
      )
    );
  }

  var isOnBreak = false;
  var captcha = false;
  const client = new Client({ checkUpdate: false, readyStatus: false });

  if (!isOnBreak && !captcha) {
    client.on("ready", async () => {
      console.log(`Logged in to ` + chalk.red(client.user.tag) + `!`);
      client.user.setStatus("invisible");
      accountCheck = client.user.username;
      spamMessages = fs
        .readFileSync(__dirname + "/messages/messages.txt", "utf-8")
        .split("\n");

      async function interval(intervals) {
        if (!isOnBreak && !captcha) {
          if (guildId) {
            /*const guild = client.guilds.cache.get(guildId)
            const spamChannels = guild.channels.cache.filter(
              (channel) =>
                channel.type === "GUILD_TEXT" &&
                channel.name.includes("spam") &&
                channel
                  .permissionsFor(guild.members.me)
                  .has([
                    Permissions.FLAGS.VIEW_CHANNEL,
                    Permissions.FLAGS.SEND_MESSAGES,
                  ])
            )

            if (spamChannels.size === 0) {
              throw new Error(
                `Couldn't find a channel called 'spam' in the guild specified for ${client.user.username}. Please create one.`
              )
            }

            spamChannel = spamChannels.random()*/
            const spamMessage =
              spamMessages[Math.floor(Math.random() * spamMessages.length)];

            if (spamMessage?.length > 0) {
              await spamChannel.send(spamMessage);
              spamMessageCount++;
            }
          }

          if (randomInteger(0, 2500) === 400 && config.sleeping) {
            let sleepTimeInMilliseconds = randomInteger(600000, 4000000);
            isOnBreak = true;

            setTimeout(async () => {
              isOnBreak = false;
              now = new Date();

              log?.send(
                new MessageBuilder()
                  .setTitle("⏯️ ``-`` Resumed")
                  .setURL("https://github.com/kyan0045/catchtwo")
                  .setDescription("**Account: **" + client.user.tag)
                  .setColor("#7ff889")
              );
              console.log(
                date.format(now, "HH:mm") +
                  `: ` +
                  chalk.red(client.user.username) +
                  `: ` +
                  chalk.bold.green(`SLEEPING`) +
                  ` - Resumed`
              );
            }, sleepTimeInMilliseconds);

            const sleepTimeInSeconds = sleepTimeInMilliseconds / 1000;
            sleepTimeInMinutes = sleepTimeInSeconds / 60;

            const roundedSleepTimeInMinutes = sleepTimeInMinutes.toFixed(2);

            log?.send(
              new MessageBuilder()
                .setTitle("⏸️ ``-`` Sleeping")
                .setURL("https://github.com/kyan0045/catchtwo")
                .setDescription(
                  "**Account: **" +
                    client.user.tag +
                    "\n**Minutes: **" +
                    roundedSleepTimeInMinutes +
                    " minutes"
                )
                .setColor("#EEC60E")
            );
            now = new Date();
            console.log(
              date.format(now, "HH:mm") +
                `: ` +
                chalk.red(client.user.username) +
                `: ` +
                chalk.bold.yellow(`SLEEPING`) +
                ` - Sleeping for ` +
                roundedSleepTimeInMinutes +
                ` minutes`
            );
          }
        }
      }

      let levelup = fs.readFileSync("./data/levelup.json", "utf-8");
      let data = JSON.parse(levelup);

      if (!data.hasOwnProperty(client.user.username)) {
        data[client.user.username] = [];
      }

      let modifiedLevelup = JSON.stringify(data, null, 2);
      fs.writeFileSync("./data/levelup.json", modifiedLevelup);

      const guild = client.guilds.cache.get(guildId);
      const spamChannels = guild.channels.cache.filter(
        (channel) =>
          channel.type === "GUILD_TEXT" &&
          channel.name.includes("spam") &&
          channel
            .permissionsFor(guild.members.me)
            .has([
              Permissions.FLAGS.VIEW_CHANNEL,
              Permissions.FLAGS.SEND_MESSAGES,
            ])
      );

      if (spamChannels.size === 0 && !config.globalCatch) {
        throw new Error(
          `Couldn't find a channel called 'spam' in the guild specified for ${client.user.username}. Please create one.`
        );
      }

      const spamChannel = spamChannels.random();

      spamChannel.send("<@716390085896962058> i");

      intervals = Math.floor(Math.random() * (5000 - 1500 + 1)) + 1500;
      setInterval(() => interval(intervals), intervals);

      setInterval(() => {
        intervals = Math.floor(Math.random() * (5000 - 1500 + 1)) + 1500;
      }, 15000);

      startTime = Date.now();
    });
  }

  client.on("messageCreate", async (message) => {
    if (
      (message.guild?.id == guildId &&
        message.author.id == "716390085896962058") ||
      (config.globalCatch &&
        message.author.id == "716390085896962058" &&
        !config.blacklistedGuilds.includes(message.guild?.id))
    ) {
      const messages = await message.channel.messages
        .fetch({ limit: 2, around: message.id })
        .catch(() => null);
      const newMessage = Array.from(messages.values());
      [...messages.values()];

      if (
        message.embeds[0]?.title?.includes("wild pokémon has appeared") &&
        !captcha
      ) {
        if (
          config.incenseMode == false &&
          message.embeds[0]?.footer?.text?.includes("Incense")
        )
          return;
        if (
          config.incenseMode == true &&
          message.embeds[0]?.footer?.text?.includes("Incense")
        ) {
          if (isOnBreak == false) {
            isOnBreak = true;
            now = new Date();
            console.log(
              date.format(now, "HH:mm") +
                `: ` +
                chalk.red(client.user.username) +
                `: ` +
                chalk.bold.yellow(`INCENSE`) +
                ` - Detected incense, paused spamming.`
            );
          }
          if (message.embeds[0]?.footer.text.includes("Spawns Remaining: 0.")) {
            isOnBreak = false;
            now = new Date();
            console.log(
              date.format(now, "HH:mm") +
                `: ` +
                chalk.red(client.user.username) +
                `: ` +
                chalk.bold.green(`INCENSE`) +
                ` - End of incense, resumed spamming.`
            );
          }
        }
        let hintMessages = ["h", "hint"];
        message.channel.send(
          "<@716390085896962058> " + hintMessages[Math.round(Math.random())]
        );
        spawned_embed = message.embeds[0];
      } else if (message.content.includes("The pokémon is") && !captcha) {
        const pokemon = await solveHint(message);
        if (pokemon[0]) {
          await sleep(300);
          await message.channel.send("<@716390085896962058> c " + pokemon[0]);
          checkIfWrong = await message.channel
            .createMessageCollector({ time: 5000 })
            .on("collect", async (msg) => {
              if (msg.content.includes("That is the wrong pokémon!")) {
                checkIfWrong.stop();
                await msg.channel.send("<@716390085896962058> c " + pokemon[1]);

                checkIfWrong2 = await msg.channel
                  .createMessageCollector({ time: 5000 })
                  .on("collect", async (msg) => {
                    if (msg.content.includes("That is the wrong pokémon!")) {
                      checkIfWrong2.stop();
                      let hintMessages = ["h", "hint"];
                      msg.channel.send(
                        "<@716390085896962058> " +
                          hintMessages[Math.round(Math.random())]
                      );
                    }
                  });
              }
            });

          await sleep(5000);
          if (config.reactAfterCatch) {
            const caughtMessages = fs
              .readFileSync(__dirname + "/messages/caughtMessages.txt", "utf-8")
              .split("\n");
            const caughtMessage =
              caughtMessages[Math.floor(Math.random() * caughtMessages.length)];
            if (caughtMessage?.length > 0) {
              message.channel.send(caughtMessage);
            }
          }
        } else {
          const words = message.content.split(" ");
          let lastWord = words[words.length - 1];
          if (words[3].includes("_") && words[4]) {
            lastWord = words[3] + " " + words[4];
          }
          now = new Date();
          console.log(
            date.format(now, "HH:mm") +
              `: ` +
              chalk.red(client.user.username) +
              `: Could not identify ` +
              lastWord
          );
          await sleep(8000)
          let hintMessages = ["h", "hint"];
          message.channel.send(
            "<@716390085896962058> " + hintMessages[Math.round(Math.random())]
          );
        }
      } else if (
        message.content.includes("Congratulations <@" + client.user.id + ">")
      ) {
        pokemonCount++;
        if (config.logCatches) {
          message.channel.send("<@716390085896962058> i l");
        }
      } else if (message.content.includes("Please pick a starter pokémon")) {
          message.channel.send("<@716390085896962058> pick charmander");
      } else if (
        message.embeds[0]?.footer &&
        message.embeds[0].footer.text.includes("Terms") &&
        newMessage[1].content.includes("pick")
        && message?.components[0]?.components[0]
      ) {
        message.clickButton(message.components[0].components[0])
        setTimeout(() => {
          message.channel.send("<@716390085896962058> i")
        }, 3000)
      } else if (
        message.embeds[0]?.footer &&
        message.embeds[0].footer.text.includes("Displaying") &&
        (message.embeds[0].thumbnail.url.includes(client.user.id) || newMessage[1].author.id == client.user.id) &&
        newMessage[1].content.includes("i l")
      ) {
        const str = message.embeds[0]?.fields[1].value;
        const words = str.split(" ");
        iv = words[28];
        IV = iv.substring(0, iv.length - 1);

        const footerStr = message.embeds[0]?.footer.text;
        const footerWords = footerStr.split(" ");
        number = footerWords[2].substring(0, footerWords[2].length - 5);

        const titleStr = message.embeds[0]?.title;
        const titleWords = titleStr.split(" ");
        if (titleWords[3]) latestName = titleWords[2] + " " + titleWords[3];
        if (!titleWords[3]) latestName = titleWords[2];
        latestLevel = titleWords[1];
        link = message.url;
        now = new Date();

        if (titleWords[0] == "✨" && config.logCatches) {
          shinyCount++;
          if (titleWords[4]) latestName = titleWords[3] + " " + titleWords[4];
          if (!titleWords[4]) latestName = titleWords[3];
          latestLevel = titleWords[2];
          message.channel.send(
            `<@716390085896962058> market search --n ${latestName} --sh --o price`
          );
          await sleep(2000);
          const channel = client.channels.cache.get(message.channel.id);
          const marketDescription = channel.lastMessage.embeds[0].description;
          const marketWords = marketDescription.split("\n");
          const marketValues = marketWords[0].split(" ");
          const marketFinal = marketValues[4].split("•");
          if (link == undefined) {
            link = "https://github.com/kyan0045/CatchTwo";
          }
          log?.send(
            new MessageBuilder()
              .setText(await getMentions(config.ownerID))
              .setTitle("✨ ``-`` Shiny Caught")
              .setURL(link)
              .setDescription(
                "**Account: **" +
                  client.user.tag +
                  "\n**Pokemon: **" +
                  latestName +
                  "\n**Level: **" +
                  latestLevel +
                  "\n**IV: **" +
                  iv +
                  "\n**Number: **" +
                  number +
                  "\n**Lowest Market Worth: **" +
                  marketFinal[2].replace("　", "")
              )
              .setColor("#EEC60E")
          );
          console.log(
            date.format(now, "HH:mm") +
              `: ` +
              chalk.red(client.user.username) +
              `: ✨ Caught a level ` +
              latestLevel +
              " Shiny " +
              latestName +
              "!"
          );
        } else if (config.logCatches) {
          rarity = await checkRarity(`${latestName}`);
          if (rarity !== "Regular") {
            if (IV < config.lowIVLog) {
              log?.send(
                new MessageBuilder()
                  .setText(await getMentions(config.ownerID))
                  .setTitle(`Low IV ${rarity} Caught`)
                  .setURL(link)
                  .setDescription(
                    "**Account: **" +
                      client.user.tag +
                      "\n**Pokemon: **" +
                      latestName +
                      "\n**Level: **" +
                      latestLevel +
                      "\n**IV: **" +
                      iv +
                      "\n**Number: **" +
                      number
                  )
                  .setColor("#E74C3C")
              );
              console.log(
                date.format(now, "HH:mm") +
                  `: ` +
                  chalk.red(client.user.username) +
                  `: ` +
                  chalk.bold.blue(`${rarity.toUpperCase()} &  LOW IV`) +
                  ` - Caught a level ` +
                  latestLevel +
                  ` ${IV}% ` +
                  latestName +
                  "!"
              );
            } else if (IV > config.highIVLog) {
              log?.send(
                new MessageBuilder()
                  .setText(await getMentions(config.ownerID))
                  .setTitle(`High IV ${rarity} Caught`)
                  .setURL(link)
                  .setDescription(
                    "**Account: **" +
                      client.user.tag +
                      "\n**Pokemon: **" +
                      latestName +
                      "\n**Level: **" +
                      latestLevel +
                      "\n**IV: **" +
                      iv +
                      "\n**Number: **" +
                      number
                  )
                  .setColor("#E74C3C")
              );
              console.log(
                date.format(now, "HH:mm") +
                  `: ` +
                  chalk.red(client.user.username) +
                  `: ` +
                  chalk.bold.blue(`${rarity.toUpperCase()} & HIGH IV`) +
                  ` - Caught a level ` +
                  latestLevel +
                  ` ${IV}% ` +
                  latestName +
                  "!"
              );
            } else {
              log?.send(
                new MessageBuilder()
                  .setText(await getMentions(config.ownerID))
                  .setTitle(`${rarity} Caught`)
                  .setURL(link)
                  .setDescription(
                    "**Account: **" +
                      client.user.tag +
                      "\n**Pokemon: **" +
                      latestName +
                      "\n**Level: **" +
                      latestLevel +
                      "\n**IV: **" +
                      iv +
                      "\n**Number: **" +
                      number
                  )
                  .setColor("#E74C3C")
              );
              console.log(
                date.format(now, "HH:mm") +
                  `: ` +
                  chalk.red(client.user.username) +
                  `: ` +
                  chalk.bold.blue(`${rarity.toUpperCase()}`) +
                  ` - Caught a level ` +
                  latestLevel +
                  " " +
                  latestName +
                  "!"
              );
            }
          } else {
            if (IV < config.lowIVLog) {
              log?.send(
                new MessageBuilder()
                  .setText(await getMentions(config.ownerID))
                  .setTitle("Low IV Caught")
                  .setURL(link)
                  .setDescription(
                    "**Account: **" +
                      client.user.tag +
                      "\n**Pokemon: **" +
                      latestName +
                      "\n**Level: **" +
                      latestLevel +
                      "\n**IV: **" +
                      iv +
                      "\n**Number: **" +
                      number
                  )
                  .setColor("#E74C3C")
              );
              console.log(
                date.format(now, "HH:mm") +
                  `: ` +
                  chalk.red(client.user.username) +
                  `: ` +
                  chalk.bold.blue(`LOW IV`) +
                  ` - Caught a level ` +
                  latestLevel +
                  ` ${IV}% ` +
                  latestName +
                  "!"
              );
            } else if (IV > config.highIVLog) {
              log?.send(
                new MessageBuilder()
                  .setText(await getMentions(config.ownerID))
                  .setTitle("High IV Caught")
                  .setURL(link)
                  .setDescription(
                    "**Account: **" +
                      client.user.tag +
                      "\n**Pokemon: **" +
                      latestName +
                      "\n**Level: **" +
                      latestLevel +
                      "\n**IV: **" +
                      iv +
                      "\n**Number: **" +
                      number
                  )
                  .setColor("#E74C3C")
              );
              console.log(
                date.format(now, "HH:mm") +
                  `: ` +
                  chalk.red(client.user.username) +
                  `: ` +
                  chalk.bold.blue(`HIGH IV`) +
                  ` - Caught a level ` +
                  latestLevel +
                  ` ${IV}% ` +
                  latestName +
                  "!"
              );
            } else {
              log?.send(
                new MessageBuilder()
                  .setTitle("Pokemon Caught")
                  .setURL(link)
                  .setDescription(
                    "**Account: **" +
                      client.user.tag +
                      "\n**Pokemon: **" +
                      latestName +
                      "\n**Level: **" +
                      latestLevel +
                      "\n**IV: **" +
                      iv +
                      "\n**Number: **" +
                      number
                  )
                  .setColor("#2e3236")
              );
              console.log(
                date.format(now, "HH:mm") +
                  `: ` +
                  chalk.red(client.user.username) +
                  `: ` +
                  chalk.bold.cyan(`${rarity.toUpperCase()}`) +
                  ` - Caught a level ` +
                  latestLevel +
                  ` ` +
                  latestName +
                  "!"
              );
            }
          }
          if (rarity == "Legendary") {
            legendaryCount++;
          } else if (rarity == "Mythical") {
            mythicalCount++;
          } else if (rarity == "Ultra Beast") {
            ultrabeastCount++;
          }
        }

        const caught =
          "Account: " +
          client.user.tag +
          " || Name: " +
          latestName +
          " || Level: " +
          latestLevel +
          " || IV: " +
          iv +
          " || Number: " +
          number +
          " || Rarity: " +
          rarity;

        const contents = fs.readFileSync("./data/catches.txt", "utf-8");

        if (contents.includes(caught)) {
          return;
        }

        fs.appendFile("./data/catches.txt", caught + "\n", (err) => {
          if (err) throw err;
        });
      } else if (
        message.content.includes(
          `https://verify.poketwo.net/captcha/${client.user.id}`
        )
      ) {
        const now = new Date();
        console.log(
          date.format(now, "HH:mm") +
            `: ` +
            chalk.red(client.user.username) +
            `: ` +
            chalk.bold.red(`CAPTCHA`) +
            ` - Encountered a captcha ( https://verify.poketwo.net/captcha/${client.user.id} )`
        );

        log?.send(
          new MessageBuilder()
            .setText(await getMentions(config.ownerID))
            .setTitle("Captcha Found -> Sleeping for 1 hour")
            .setFooter(`Run ${config.prefix}solved to resume immediately.`)
            .setURL(`https://verify.poketwo.net/captcha/${client.user.id}`)
            .setDescription(
              "**Account: **" +
                client.user.tag +
                "\n**Link: **" +
                `https://verify.poketwo.net/captcha/${client.user.id}`
            )
            .setColor("#FF5600")
        );
        isOnBreak = true;
        captcha = true;
        setTimeout(async function () {
          isOnBreak = false;
          captcha = false;
        }, 1000 * 3600);
        config.ownerID.forEach(async (ownerID) => {
          try {
            if (ownerID !== client.user.id) {
              const user = await client.users.fetch(ownerID);
              if (!user.dmChannel.lastMessage?.content?.includes("detected")) {
              user.send(
                `## DETECTED A CAPTCHA\n> I've detected a captcha. The autocatcher has been paused. To continue, please solve the captcha below.\n* https://verify.poketwo.net/captcha/${client.user.id}\n\n### SOLVED?\n> Once solved, run the command \`\`${config.prefix}solved\`\` to continue catching.`
              );
              }
            }
          } catch (err) {
            console.log(err);
          }
        });
      } else if (
        message.embeds[0]?.footer &&
        message.embeds[0].footer.text.includes("Displaying") &&
        message.embeds[0].thumbnail.url.includes(client.user.id) &&
        newMessage[1].content == "<@716390085896962058> i"
      ) {
        const str = message.embeds[0]?.fields[1].value;
        const words = str.split(" ");
        iv = words[28];
        IV = iv.substring(0, iv.length - 1);

        const footerStr = message.embeds[0]?.footer.text;
        const footerWords = footerStr.split(" ");
        number = footerWords[2].substring(0, footerWords[2].length - 5);

        const titleStr = message.embeds[0]?.title;
        const titleWords = titleStr.split(" ");
        if (titleWords[3]) latestName = titleWords[2] + " " + titleWords[3];
        if (!titleWords[3]) latestName = titleWords[2];
        latestLevel = titleWords[1];

        if (latestLevel === "100") {
          let levelup = fs.readFileSync("./data/levelup.json", "utf-8");
          let data = JSON.parse(levelup);

          const index = data[client.user.username].indexOf(parseFloat(number));

          if (index !== -1) {
            data[client.user.username].splice(index, 1);
            log?.send(
              new MessageBuilder()
                .setTitle("Leveling Completed")
                .setURL(link)
                .setDescription(
                  "**Account: **" +
                    client.user.tag +
                    "\n**Pokemon: **" +
                    latestName +
                    "\n**Level: **" +
                    latestLevel +
                    "\n**IV: **" +
                    iv +
                    "\n**Number: **" +
                    number
                )
                .setColor("#00A0FF")
            );
          } else {
            const firstNumber = data[client.user.username].shift();
            const now = new Date();
            if (firstNumber) {
              message.channel.send(`<@716390085896962058> s ${firstNumber}`);
            } else {
              console.log(
                date.format(now, "HH:mm") +
                  `: ` +
                  chalk.red(client.user.username) +
                  `: ` +
                  chalk.magenta.bold(`LEVELING`) +
                  ` - ${latestName} is level 100! Your levelup list is now empty.`
              );
            }
          }

          let modifiedLevelup = JSON.stringify(data, null, 2);
          fs.writeFileSync("./data/levelup.json", modifiedLevelup);
        } else if (latestLevel !== "100") {
          now = new Date();
          console.log(
            date.format(now, "HH:mm") +
              `: ` +
              chalk.red(client.user.username) +
              `: ` +
              chalk.magenta.bold(`LEVELING`) +
              ` - Currently leveling ${IV}% ${latestName}! Progress: ${latestLevel}/100`
          );
        }

        if (titleWords[0] == "✨") {
          if (titleWords[4]) latestName = titleWords[3] + " " + titleWords[4];
          if (!titleWords[4]) latestName = titleWords[3];
          latestLevel = titleWords[2];
          if (latestLevel === "100") {
            let levelup = fs.readFileSync("./data/levelup.json", "utf-8");
            let data = JSON.parse(levelup);

            const index = data[client.user.username].indexOf(
              parseFloat(number)
            );

            if (index !== -1) {
              data[client.user.username].splice(index, 1);
              log?.send(
                new MessageBuilder()
                  .setTitle("Leveling Completed")
                  .setURL(link)
                  .setDescription(
                    "**Account: **" +
                      client.user.tag +
                      "\n**Pokemon: **" +
                      latestName +
                      "\n**Level: **" +
                      latestLevel +
                      "\n**IV: **" +
                      iv +
                      "\n**Number: **" +
                      number
                  )
                  .setColor("#00A0FF")
              );
            } else {
              const firstNumber = data[client.user.username].shift();
              const now = new Date();
              if (firstNumber) {
                message.channel.send(`<@716390085896962058> s ${firstNumber}`);
              } else {
                console.log(
                  date.format(now, "HH:mm") +
                    `: ` +
                    chalk.red(client.user.username) +
                    `: ` +
                    chalk.magenta.bold(`LEVELING`) +
                    ` - ${latestName} is level 100! Your levelup list is now empty.`
                );
              }
            }

            let modifiedLevelup = JSON.stringify(data, null, 2);
            fs.writeFileSync("./data/levelup.json", modifiedLevelup);
          }
        }
      } else if (
        message.content.includes(`Couldn't find that pokemon!`) &&
        newMessage[1].author.id == client.user.id &&
        newMessage[1].content.includes(`<@716390085896962058> s`)
      ) {
        selectedNumber = newMessage[1].content.split(" ");
        let levelup = fs.readFileSync("./data/levelup.json", "utf-8");
        let data = JSON.parse(levelup);

        const index = data[client.user.username].indexOf(parseFloat(args[2]));

        if (index !== -1) {
          data[client.user.username].splice(index, 1);
        } else {
          const firstNumber = data[client.user.username].shift();
          const now = new Date();
          if (firstNumber) {
            message.channel.send(`<@716390085896962058> s ${firstNumber}`);
          } else {
            console.log(
              date.format(now, "HH:mm") +
                `: ` +
                chalk.red(client.user.username) +
                `: ` +
                `Couldn't find the pokemon with the number ${selectedNumber}. Your levelup list is now empty.`
            );
          }
        }

        let modifiedLevelup = JSON.stringify(data, null, 2);
        fs.writeFileSync("./data/levelup.json", modifiedLevelup);
      } else if (
        message.embeds[0]?.title &&
        message.embeds[0]?.title.includes(
          `Congratulations ${client.user.username}!`
        )
      ) {
        if (message.embeds[0]?.description.includes(`level 100!`)) {
          message.channel.send(`<@716390085896962058> i`);
          const descriptionArgs = message.embeds[0]?.description.split(" ");
          console.log(
            date.format(now, "HH:mm") +
              `: ` +
              chalk.red(client.user.username) +
              `${descriptionArgs[2]} reached level 100!`
          );
        }
      } else if (
        message.embeds[0]?.title == "Account Suspended" &&
        newMessage[1].author.id == client.user.id
      ) {
        isOnBreak = true;
        captcha = true;
        log?.send(
          new MessageBuilder()
            .setText(await getMentions(config.ownerID))
            .setTitle("Account Suspended")
            .setURL(message.url)
            .setDescription("**Account: **" + client.user.tag)
            .setColor("#FF5600")
        );
      }
    }

    if (message.channel && message.content) {
      prefix = `<@${client.user.id}>`;
      if (
        (message.content.startsWith(config.prefix) &&
          config.ownerID.includes(message.author.id) &&
          !message.author.bot) ||
        (message.content.startsWith(config.prefix) &&
          message.author.id == client.user.id &&
          !message.author.bot) ||
        (message.content.startsWith(prefix) &&
          config.ownerID.includes(message.author.id) &&
          !message.author.bot) ||
        (message.content.startsWith(prefix) &&
          message.author.id == client.user.id &&
          !message.author.bot)
      ) {
        if (message.content.startsWith(prefix)) {
          args = message.content.slice(prefix.length).trim().split(/ +/g);
        } else if (message.content.startsWith(config.prefix)) {
          args = message.content
            .slice(config.prefix.length)
            .trim()
            .split(/ +/g);
        }
        const command = args.shift().toLowerCase();
        const commandReceivedTimestamp = Date.now();

        if (command == "say") {
          try {
            message.channel.send(`${args.join(" ")}`);
            message.react("✅");
          } catch (err) {
            console.error(err);
            message.react("❌");
          }
        } else if (command == "react") {
          let msg;
          let channelID;

          try {
            if (args[0]?.length > 10) {
              channelID = 0;
              msg = await client.channels.cache
                .get(message.channelId)
                .messages.fetch(args[0]);
            } else {
              msg = await client.channels.cache
                .get(message?.reference.channelId)
                .messages.fetch(message?.reference?.messageId);
            }
          } catch (err) {
            message.reply(
              `Please reply to the message with the emoji, or specify a message ID.`
            );
          }

          if (msg) {
            try {
              console.log(msg.reactions.cache.first()?._emoji.name);
              if (msg.reactions.cache.first()?._emoji) {
                msg.react(msg.reactions.cache.first()._emoji.name);
              }
              message.react("✅");
            } catch (err) {
              message.react("❌");
              console.log(err);
            }
          }
        } else if (command == "click") {
          let msg;
          let channelID;

          try {
            if (args[0].length > 10) {
              channelID = 0;
              msg = await client.channels.cache
                .get(message.channelId)
                .messages.fetch(args[0]);
            } else {
              msg = await client.channels.cache
                .get(message?.reference.channelId)
                .messages.fetch(message?.reference?.messageId);
            }
          } catch (err) {
            message.reply(
              `Please reply to the message that the button is attached to, or specify the message ID.`
            );
          }

          if (msg) {
            try {
              let buttonId = +parseInt(args[0]) - +1;
              if (channelID) {
                buttonId = +parseInt(args[1]) - +1;
              }
              if (!isNaN(buttonId) && buttonId >= 0) {
                let button = msg.components[0].components[buttonId];
                await button.click(msg).then(async (e) => {
                  if (config.reactOnSuccess === true) message.react(`👊`);
                });
              } else if (!isNaN(buttonId) && buttonId < 0) {
                let button = msg.components[0].components[0];
                await button.click(msg);
              }
              message.react("✅");
            } catch (err) {
              message.react("❌");
            }
          }
        } else if (command == "help") {
          try {
            webhooks = await message.channel.fetchWebhooks();
          } catch (err) {
            if (err.code == "50013") {
              webhooks = config.logWebhook;
            } else {
              console.log(err);
            }
          }
          if (webhooks.size > 0) {
            webhook = new Webhook(webhooks?.first().url);
            webhook.setUsername("CatchTwo");
            webhook.setAvatar(
              "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
            );
          } else {
            try {
              newWebhook = await message.channel.createWebhook("CatchTwo", {
                avatar:
                  "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                reason: "CatchTwo Commands",
              });
            } catch (err) {
              if (err.code == "50013") {
                newWebhook = config.logWebhook;
              }
            }
            webhook = new Webhook(newWebhook);
            webhook.setUsername("CatchTwo");
            webhook.setAvatar(
              "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
            );
          }
          webhook.send(
            new MessageBuilder()
              .setText(`<@${message.author.id}>`)
              .setTitle("CatchTwo Command Help")
              .setFooter("©️ CatchTwo ~ @kyan0045")
              .setURL(`https://github.com/kyan0045/CatchTwo`)
              .setDescription(
                `CatchTwo is a simple and easy to use PokéTwo selfbot, you can find available commands below.`
              )
              .addField(
                "!help",
                "This is the command you're looking at right now.",
                true
              )
              .addField(
                "!say",
                "This can be used to make the selfbot repeat a message you specify.",
                true
              )
              .addField(
                "!click",
                "This can be used to make the selfbot click a button you specify.",
                true
              )
              .addField(
                "!react",
                "This can be used to make the selfbot react to a message you specify.",
                true
              )
              .addField(
                "!restart",
                "This can be used to make the selfbot restart.",
                true
              )
              .addField(
                "!support",
                "This can be used to get a link to our support server.",
                true
              )
              .addField(
                "!config [view, set]",
                "This can be used to view and change values in your config.",
                true
              )
              .addField(
                "!stats [pokemon]",
                "This can be used to view your stats.",
                true
              )
              .addField(
                "!ping",
                "This can be used to check the bot's response time.",
                true
              )
              .addField(
                "!solved",
                "This can be used to resume the bot after completing a captcha.",
                true
              )
              .addField(
                "!setup [new]",
                "This can be used to automatically set up a new CatchTwo server.",
                true
              )
              .addField(
                "!levelup [add, list]",
                "This can be used to manage your levelup list.",
                true
              )
              .addField(
                "!duel",
                "This can be used to get a list of duelish pokemon.",
                true
              )
              .setColor("#E74C3C")
          );
        } else if (command == "restart") {
          message.reply("Restarting...");

          log?.send(
            new MessageBuilder()
              .setTitle("Restarting...")
              .setURL("https://github.com/kyan0045/catchtwo")
              .setColor("#E74C3C")
          );

          setTimeout(() => {
            exec("node restart.js", (error, stdout, stderr) => {
              if (error) {
                console.error(`Error during restart: ${error.message}`);
                return;
              }
              console.log(`Restart successful. ${stdout}`);
            });

            setTimeout(() => {
              client.destroy(token);
              process.exit();
            }, 1000);
          }, 1000);
        } else if (command == "support") {
          try {
            webhooks = await message.channel.fetchWebhooks();
          } catch (err) {
            if (err.code == "50013") {
              webhooks = config.logWebhook;
            } else {
              console.log(err);
            }
          }
          if (webhooks.size > 0) {
            webhook = new Webhook(webhooks?.first().url);
            await webhook.setUsername("CatchTwo");
            await webhook.setAvatar(
              "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
            );
          } else {
            try {
              newWebhook = await message.channel.createWebhook("CatchTwo", {
                avatar:
                  "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                reason: "CatchTwo Commands",
              });
            } catch (err) {
              if (err.code == "50013") {
                newWebhook = config.logWebhook;
              }
            }
            webhook = new Webhook(newWebhook);
            webhook.setUsername("CatchTwo");
            webhook.setAvatar(
              "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
            );
          }
          webhook.send(
            new MessageBuilder()
              .setText(`<@${message.author.id}> https://discord.gg/tXa2Hw5jHy`)
              .setTitle("CatchTwo Support Server")
              .setFooter("©️ CatchTwo ~ @kyan0045")
              .setURL(`https://discord.gg/tXa2Hw5jHy`)
              .setDescription(
                `If you need any support, or have questions, please join our support server here.`
              )
              .setColor("#f5b3b3")
          );
        } else if (command == "config") {
          if (!args[0]) {
            try {
              webhooks = await message.channel.fetchWebhooks();
            } catch (err) {
              if (err.code == "50013") {
                webhooks = config.logWebhook;
              } else {
                console.log(err);
              }
            }
            if (webhooks.size > 0) {
              webhook = new Webhook(webhooks?.first().url);
              await webhook.setUsername("CatchTwo");
              await webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            } else {
              try {
                newWebhook = await message.channel.createWebhook("CatchTwo", {
                  avatar:
                    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                  reason: "CatchTwo Commands",
                });
              } catch (err) {
                if (err.code == "50013") {
                  newWebhook = config.logWebhook;
                }
              }
              webhook = new Webhook(newWebhook);
              webhook.setUsername("CatchTwo");
              webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            }
            webhook.send(
              new MessageBuilder()
                .setText(`<@${message.author.id}>`)
                .setTitle("CatchTwo Config Help")
                .setFooter("©️ CatchTwo ~ @kyan0045")
                .setURL(`https://discord.gg/tXa2Hw5jHy`)
                .setDescription(
                  `You can change properties in your config using \`\`${config.prefix}config set [property] [value]\`\`\nIf you wish to view your current config, use \`\`${config.prefix}config view\`\` instead.\n\`\`Note:\`\` Changes only take effect after the selfbot has restarted.`
                )
                .setColor("#f5b3b3")
            );
          }
          if (args[0] == "view") {
            const config = await fs.readFileSync("./config.json", "utf-8");
            try {
              webhooks = await message.channel.fetchWebhooks();
            } catch (err) {
              if (err.code == "50013") {
                webhooks = config.logWebhook;
              } else {
                console.log(err);
              }
            }
            if (!webhooks)
              return message.reply(
                `<@${message.author.id}>\n\`\`\`json\n${config}\n\`\`\``
              );
            if (webhooks.size > 0) {
              webhook = new Webhook(webhooks?.first().url);
              await webhook.setUsername("CatchTwo");
              await webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            } else {
              try {
                newWebhook = await message.channel.createWebhook("CatchTwo", {
                  avatar:
                    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                  reason: "CatchTwo Commands",
                });
              } catch (err) {
                if (err.code == "50013") {
                  newWebhook = config.logWebhook;
                }
              }
              webhook = new Webhook(newWebhook);
              webhook.setUsername("CatchTwo");
              webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            }
            if (webhook)
              webhook.send(
                `<@${message.author.id}>\n\`\`\`json\n${config}\n\`\`\``
              );
          }
          if (args[0] == "set" && !args[1]) {
            try {
              webhooks = await message.channel.fetchWebhooks();
            } catch (err) {
              if (err.code == "50013") {
                webhooks = config.logWebhook;
              } else {
                console.log(err);
              }
            }
            if (webhooks.size > 0) {
              webhook = new Webhook(webhooks?.first().url);
              await webhook.setUsername("CatchTwo");
              await webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            } else {
              try {
                newWebhook = await message.channel.createWebhook("CatchTwo", {
                  avatar:
                    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                  reason: "CatchTwo Commands",
                });
              } catch (err) {
                if (err.code == "50013") {
                  newWebhook = config.logWebhook;
                }
              }
              webhook = new Webhook(newWebhook);
              webhook.setUsername("CatchTwo");
              webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            }
            webhook.send(
              new MessageBuilder()
                .setText(`<@${message.author.id}>`)
                .setTitle("CatchTwo Config Help")
                .setFooter("©️ CatchTwo ~ @kyan0045")
                .setURL(`https://discord.gg/tXa2Hw5jHy`)
                .setDescription(
                  `You can change properties in your config using \`\`${config.prefix}config set [property] [value]\`\`\n\`\`Note:\`\` Changes only take effect after the selfbot has restarted.`
                )
                .setColor("#f5b3b3")
            );
          }
          if (args[0] == "set" && args[1]) {
            let property = args[1];
            let value = args[2];

            const rawData = fs.readFileSync("./config.json");
            let config = JSON.parse(rawData);

            if (!(property in config)) {
              message.reply(
                `Property \`${property}\` does not exist in the config.`
              );
              return;
            }

            if (typeof config[property] === "boolean") {
              value = value.toLowerCase() === "true";
            } else if (typeof config[property] === "number") {
              value = Number(value);
            }

            config[property] = value;

            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));
            message.reply(
              `Property \`${property}\` updated with value \`${value}\`.`
            );
          }
        } else if (command == "stats") {
          try {
            webhooks = await message.channel.fetchWebhooks();
          } catch (err) {
            if (err.code == "50013") {
              webhooks = config.logWebhook;
            } else {
              console.log(err);
            }
          }
          if (webhooks.size > 0) {
            webhook = new Webhook(webhooks?.first().url);
            await webhook.setUsername("CatchTwo");
            await webhook.setAvatar(
              "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
            );
          } else {
            try {
              newWebhook = await message.channel.createWebhook("CatchTwo", {
                avatar:
                  "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                reason: "CatchTwo Commands",
              });
            } catch (err) {
              if (err.code == "50013") {
                newWebhook = config.logWebhook;
              }
            }
            webhook = new Webhook(newWebhook);
            await webhook.setUsername("CatchTwo");
            await webhook.setAvatar(
              "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
            );
          }

          function getElapsedTimeInSeconds() {
            currentTime = Date.now();
            const elapsedTimeInMilliseconds = currentTime - startTime;
            const elapsedTimeInSeconds = elapsedTimeInMilliseconds / 1000;
            elapsedTimeInMinutes = elapsedTimeInSeconds / 60;

            const roundedElapsedTimeInMinutes = elapsedTimeInMinutes.toFixed(2);

            return roundedElapsedTimeInMinutes + " minutes";
          }

          function getRate(number, elapsedTime) {
            const rate = (number / elapsedTime) * 60;
            return rate.toFixed(2) + " per hour";
          }

          timeSinceStart = getElapsedTimeInSeconds();
          const clientUptime = +new Date() - +client.uptime;
          const uptime = Math.round(+clientUptime / 1000);

          if (!args[0]) {
            webhook.send(
              new MessageBuilder()
                .setText(`<@${message.author.id}>`)
                .setTitle("CatchTwo Stats")
                .setFooter("©️ CatchTwo ~ @kyan0045")
                .setURL(`https://discord.gg/tXa2Hw5jHy`)
                .setDescription(`**Started:** <t:${uptime}:R>`)
                .addField("Runtime", timeSinceStart, true)
                .addField(" ", " ", true)
                .addField(" ", " ", true)
                .addField("Messages Spammed", spamMessageCount, true)
                .addField("Pokemon Caught", pokemonCount, true)
                .addField(" ", " ", true)
                .addField(
                  "Spammed Messages Rate",
                  getRate(spamMessageCount, elapsedTimeInMinutes),
                  true
                )
                .addField(
                  "Pokemon Catch Rate",
                  getRate(pokemonCount, elapsedTimeInMinutes),
                  true
                )
                .addField(" ", " ", true)
                .setColor("#f5b3b3")
            );
          } else if (args[0] && args[0] == "pokemon") {
            webhook.send(
              new MessageBuilder()
                .setText(`<@${message.author.id}>`)
                .setTitle("CatchTwo Pokemon Stats")
                .setFooter("©️ CatchTwo ~ @kyan0045")
                .setURL(`https://discord.gg/tXa2Hw5jHy`)
                .setDescription(`**Started:** <t:${uptime}:R>`)
                .addField("Runtime", timeSinceStart, false)
                .addField("Pokemon Caught", pokemonCount, true)
                .addField(
                  "Pokemon Catch Rate",
                  getRate(pokemonCount, elapsedTimeInMinutes),
                  true
                )
                .addField(" ", " ", true)
                .addField("Legendaries Caught", legendaryCount, true)
                .addField(
                  "Legendary Catch Rate",
                  getRate(legendaryCount, elapsedTimeInMinutes),
                  true
                )
                .addField(" ", " ", true)
                .addField("Mythicals Caught", mythicalCount, true)
                .addField(
                  "Mythical Catch Rate",
                  getRate(mythicalCount, elapsedTimeInMinutes),
                  true
                )
                .addField(" ", " ", true)
                .addField("Ultra Beasts Caught", ultrabeastCount, true)
                .addField(
                  "Ultra Beast Catch Rate",
                  getRate(ultrabeastCount, elapsedTimeInMinutes),
                  true
                )
                .addField(" ", " ", true)
                .addField("Shinies Caught", shinyCount, true)
                .addField(
                  "Shiny Catch Rate",
                  getRate(shinyCount, elapsedTimeInMinutes),
                  true
                )
                .addField(" ", " ", true)
                .setColor("#f5b3b3")
            );
          }
        } else if (command == "ping") {
          try {
            webhooks = await message.channel.fetchWebhooks();
          } catch (err) {
            if (err.code == "50013") {
              webhooks = config.logWebhook;
            } else {
              console.log(err);
            }
          }
          if (webhooks.size > 0) {
            webhook = new Webhook(webhooks?.first().url);
            await webhook.setUsername("CatchTwo");
            await webhook.setAvatar(
              "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
            );
          } else {
            try {
              newWebhook = await message.channel.createWebhook("CatchTwo", {
                avatar:
                  "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                reason: "CatchTwo Commands",
              });
            } catch (err) {
              if (err.code == "50013") {
                newWebhook = config.logWebhook;
              }
            }
            webhook = new Webhook(newWebhook);
            webhook.setUsername("CatchTwo");
            webhook.setAvatar(
              "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
            );
          }

          webhook.send(
            new MessageBuilder()
              .setText(`<@${message.author.id}>`)
              .setTitle("CatchTwo Ping")
              .setFooter("©️ CatchTwo ~ @kyan0045")
              .setURL(`https://discord.gg/tXa2Hw5jHy`)
              .setDescription(
                `**Current Ping:** \`\`${
                  Date.now() - commandReceivedTimestamp
                } ms\`\``
              )
              .setColor("#f5b3b3")
          );
        } else if (command == "solved" || command == "resume") {
          try {
            isOnBreak = false;
            captcha = false;
            message.react("✅");
          } catch (err) {
            message.react("❌");
          }
        } else if (command == "setup") {
          if (!args[0]) {
            try {
              webhooks = await message.channel.fetchWebhooks();
            } catch (err) {
              if (err.code == "50013") {
                webhooks = config.logWebhook;
              } else {
                console.log(err);
              }
            }
            if (webhooks.size > 0) {
              webhook = new Webhook(webhooks?.first().url);
              await webhook.setUsername("CatchTwo");
              await webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            } else {
              try {
                newWebhook = await message.channel.createWebhook("CatchTwo", {
                  avatar:
                    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                  reason: "CatchTwo Commands",
                });
              } catch (err) {
                if (err.code == "50013") {
                  newWebhook = config.logWebhook;
                }
              }
              webhook = new Webhook(newWebhook);
              webhook.setUsername("CatchTwo");
              webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            }
            webhook.send(
              new MessageBuilder()
                .setText(
                  `<@${message.author.id}> https://discord.gg/tXa2Hw5jHy`
                )
                .setTitle("CatchTwo Setup Information")
                .setFooter("©️ CatchTwo ~ @kyan0045")
                .setURL(`https://discord.gg/tXa2Hw5jHy`)
                .setDescription(
                  `To setup a new autocatching server, run \`\`${config.prefix}setup new\`\`.\nThis will automatically create a server with log, catch, and command channels, attempt to add Pokétwo, and create a logging webhook.`
                )
                .setColor("#f5b3b3")
            );
          }
          if (args[0] && args[0] == "new") {
            const template = await client.fetchGuildTemplate(
              "https://discord.new/dpxCRxf4K9Qj"
            );
            const createdGuild = await template.createGuild(
              `CatchTwo || ${client.user.username}`
            );
            createdGuild.setIcon(
              "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
            );
            const introductionChannel =
              await createdGuild.channels.cache.filter(
                (channel) =>
                  channel.type === "GUILD_TEXT" &&
                  channel.name.includes("introduction")
              );
            introductionChannel
              .first()
              .send(
                `**CATCHTWO: POKÉTWO AUTOCATCHER**\n\nCatchTwo is a simple pokétwo autocatcher, with no price tag! Easy to setup and configure, start right away. Runnable on multiple accounts at the same time!\n\nGithub: https://github.com/kyan0045/catchtwo\nDiscord: https://discord.gg/NRHcUuD3jg`
              );
            createdInvite = await introductionChannel.first().createInvite();
            const loggingChannel = await createdGuild.channels.cache.filter(
              (channel) =>
                channel.type === "GUILD_TEXT" && channel.name.includes("logs")
            );
            createdWebhook = await loggingChannel
              .first()
              .createWebhook("CatchTwo Logging");
            const catchChannels = await createdGuild.channels.cache.filter(
              (channel) =>
                channel.type === "GUILD_TEXT" && channel.name.includes("catch")
            );
            const catchChannelsArray = Array.from(catchChannels.values());
            try {
              await client
                .authorizeURL(
                  "https://discord.com/api/oauth2/authorize?client_id=716390085896962058&permissions=387144&scope=bot%20applications.commands",
                  {
                    guild_id: createdGuild.id,
                    permissions: "387144",
                    authorize: true,
                  }
                )
                .then(async () => {
                  const commandChannel =
                    await createdGuild.channels.cache.filter(
                      (channel) =>
                        channel.type === "GUILD_TEXT" &&
                        channel.name.includes("commands")
                    );

                  commandChannel
                    .first()
                    .send(
                      `<@716390085896962058> redirect ${catchChannelsArray[0].id} ${catchChannelsArray[1].id} ${catchChannelsArray[2].id}`
                    );
                  message.reply(
                    `## SUCCESFULLY CREATED SERVER\n* I succesfully setup a server for you.'n${createdInvite}\n\n### CONFIG VALUES\n\`\`\`json\n{\n"logWebhook": "${createdWebhook.url}",\n"guildId": "${createdGuild.id}"\n}`
                  );
                });
            } catch (err) {
              console.log(`Failed to add Pokétwo to ${createdGuild.name}`);
            }
            message.reply(
              `## SUCCESFULLY CREATED SERVER\n* I succesfully setup a server for you.\n${createdInvite}\n\n* Failed to invite Pokétwo, please invite it with the following link:\nhttps://discord.com/api/oauth2/authorize?client_id=716390085896962058&permissions=387144&scope=bot%20applications.commands&guild_id=${createdGuild.id}\nOnce invited run the following command: \`\`<@716390085896962058> redirect ${catchChannelsArray[0].id} ${catchChannelsArray[1].id} ${catchChannelsArray[2].id}\`\`\n### CONFIG VALUES\n\`\`\`json\n{\n"logWebhook": "${createdWebhook.url}",\n"guildId": "${createdGuild.id}"\n}\`\`\``
            );
          }
        } else if (command == "levelup") {
          if (!args[0]) {
            try {
              webhooks = await message.channel.fetchWebhooks();
            } catch (err) {
              if (err.code == "50013") {
                webhooks = config.logWebhook;
              } else {
                console.log(err);
              }
            }
            if (webhooks.size > 0) {
              webhook = new Webhook(webhooks?.first().url);
              await webhook.setUsername("CatchTwo");
              await webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            } else {
              try {
                newWebhook = await message.channel.createWebhook("CatchTwo", {
                  avatar:
                    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                  reason: "CatchTwo Commands",
                });
              } catch (err) {
                if (err.code == "50013") {
                  newWebhook = config.logWebhook;
                }
              }
              webhook = new Webhook(newWebhook);
              webhook.setUsername("CatchTwo");
              webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            }
            webhook.send(
              new MessageBuilder()
                .setText(`<@${message.author.id}>`)
                .setTitle("CatchTwo Levelup Information")
                .setFooter("©️ CatchTwo ~ @kyan0045")
                .setURL(`https://discord.gg/tXa2Hw5jHy`)
                .setDescription(
                  `To add pokemon to the levelup list, run \`\`${config.prefix}levelup add <@${client.user.id}> [pokemon number(s)]\`\`.\nTo view the current levelup list, run \`\`${config.prefix}levelup list\`\`.`
                )
                .setColor("#f5b3b3")
            );
          }
          if (
            args[0] &&
            args[0] == "add" &&
            !args[1]?.includes(client.user.id)
          ) {
            try {
              webhooks = await message.channel.fetchWebhooks();
            } catch (err) {
              if (err.code == "50013") {
                webhooks = config.logWebhook;
              } else {
                console.log(err);
              }
            }
            if (webhooks.size > 0) {
              webhook = new Webhook(webhooks?.first().url);
              await webhook.setUsername("CatchTwo");
              await webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            } else {
              try {
                newWebhook = await message.channel.createWebhook("CatchTwo", {
                  avatar:
                    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                  reason: "CatchTwo Commands",
                });
              } catch (err) {
                if (err.code == "50013") {
                  newWebhook = config.logWebhook;
                }
              }
              webhook = new Webhook(newWebhook);
              webhook.setUsername("CatchTwo");
              webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            }
            webhook.send(
              new MessageBuilder()
                .setText(`<@${message.author.id}>`)
                .setTitle("CatchTwo Levelup Error")
                .setFooter("©️ CatchTwo ~ @kyan0045")
                .setURL(`https://discord.gg/tXa2Hw5jHy`)
                .setDescription(
                  `You must mention the user to who's level list it should be added to. Correct use case: \`\`${config.prefix}levelup add <@${client.user.id}> [pokemon number(s)]\`\``
                )
                .setColor("#f5b3b3")
            );
          }
          if (
            args[0] &&
            args[0] == "add" &&
            args[1] &&
            args[1].includes(client.user.id) &&
            !args[2]
          ) {
            try {
              webhooks = await message.channel.fetchWebhooks();
            } catch (err) {
              if (err.code == "50013") {
                webhooks = config.logWebhook;
              } else {
                console.log(err);
              }
            }
            if (webhooks.size > 0) {
              webhook = new Webhook(webhooks?.first().url);
              await webhook.setUsername("CatchTwo");
              await webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            } else {
              try {
                newWebhook = await message.channel.createWebhook("CatchTwo", {
                  avatar:
                    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                  reason: "CatchTwo Commands",
                });
              } catch (err) {
                if (err.code == "50013") {
                  newWebhook = config.logWebhook;
                }
              }
              webhook = new Webhook(newWebhook);
              webhook.setUsername("CatchTwo");
              webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            }
            webhook.send(
              new MessageBuilder()
                .setText(`<@${message.author.id}>`)
                .setTitle("CatchTwo Levelup Error")
                .setFooter("©️ CatchTwo ~ @kyan0045")
                .setURL(`https://discord.gg/tXa2Hw5jHy`)
                .setDescription(
                  `You must specify the number(s) of the pokemon to add to the level list. Correct use case: \`\`${config.prefix}levelup add <@${client.user.id}> [pokemon number(s)]\`\``
                )
                .setColor("#f5b3b3")
            );
          }
          if (
            args[0] &&
            args[0] == "add" &&
            args[1] &&
            args[1].includes(client.user.id) &&
            args[2]
          ) {
            let levelup = fs.readFileSync("./data/levelup.json", "utf-8");
            let data = JSON.parse(levelup);

            const validNumbers = args.slice(2).filter((arg) => {
              const num = parseFloat(arg);
              return !isNaN(num) && num < 1000000;
            });

            data[client.user.username].push(
              ...validNumbers.filter(
                (num) => !data[client.user.username].includes(num)
              )
            );

            let modifiedLevelup = JSON.stringify(data, null, 2);

            fs.writeFileSync("./data/levelup.json", modifiedLevelup);

            const formattedNumbers = validNumbers.join(", ");

            try {
              webhooks = await message.channel.fetchWebhooks();
            } catch (err) {
              if (err.code == "50013") {
                webhooks = config.logWebhook;
              } else {
                console.log(err);
              }
            }
            if (webhooks.size > 0) {
              webhook = new Webhook(webhooks?.first().url);
              await webhook.setUsername("CatchTwo");
              await webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            } else {
              try {
                newWebhook = await message.channel.createWebhook("CatchTwo", {
                  avatar:
                    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                  reason: "CatchTwo Commands",
                });
              } catch (err) {
                if (err.code == "50013") {
                  newWebhook = config.logWebhook;
                }
              }
              webhook = new Webhook(newWebhook);
              webhook.setUsername("CatchTwo");
              webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            }
            await webhook.send(
              new MessageBuilder()
                .setText(`<@${message.author.id}>`)
                .setTitle("CatchTwo Levelup")
                .setFooter("©️ CatchTwo ~ @kyan0045")
                .setURL(`https://discord.gg/tXa2Hw5jHy`)
                .setDescription(
                  `**${client.user.username}:** Succesfully added pokemon \`\`${formattedNumbers}\`\` to \`\`./data/levelup.json\`\``
                )
                .setColor("#f5b3b3")
            );
            message.channel.send("<@716390085896962058> i");
          }
          if (args[0] && args[0] == "list") {
            try {
              webhooks = await message.channel.fetchWebhooks();
            } catch (err) {
              if (err.code == "50013") {
                webhooks = config.logWebhook;
              } else {
                console.log(err);
              }
            }
            if (webhooks.size > 0) {
              webhook = new Webhook(webhooks?.first().url);
              await webhook.setUsername("CatchTwo");
              await webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            } else {
              try {
                newWebhook = await message.channel.createWebhook("CatchTwo", {
                  avatar:
                    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                  reason: "CatchTwo Commands",
                });
              } catch (err) {
                if (err.code == "50013") {
                  newWebhook = config.logWebhook;
                }
              }
              webhook = new Webhook(newWebhook);
              webhook.setUsername("CatchTwo");
              webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              );
            }
            webhook.sendFile("./data/levelup.json");
          }
        } else if (command === "duel") {
          try {
            message.react("✅");

            const messages = [
              "<@716390085896962058> p --leg --myt --ub --spdiv 31 --atk >20 --hp >10",
              "<@716390085896962058> p --leg --myt --ub --spdiv 31 --spatk >20 --hp >10",
              "<@716390085896962058> p --leg --myt --ub --iv >70 --spdiv 31",
              "<@716390085896962058> p  --spdiv 31 --atk >20 --def >15 --hp >10",
              "<@716390085896962058> p  --spdiv 31 --spatk >20 --spdef >15 --hp >10",
              "<@716390085896962058> p  --triple 31",
              "<@716390085896962058> p  --iv >90",
            ];

            let counter = 0;

            function sendRandomMessage() {
              if (counter < messages.length) {
                const randomDelay = Math.floor(Math.random() * 2000) + 5000;
                setTimeout(() => {
                  message.channel.send(messages[counter]);
                  counter++;
                  sendRandomMessage();
                }, randomDelay);
              }
            }

            sendRandomMessage();
          } catch (err) {
            console.error(err);
            message.react("❌");
          }
        } //Duel Command Contribution by ViwesBot/Akshad :3
      }
    }
  });

  client.on(`rateLimit`, async (message) => {
    console.log(
      `${chalk.redBright(
        "[RATELIMIT]"
      )} Your IP has been ratelimited by Discord.`
    );
    let rateLimitPauses = [`900000`, `1000000`, `1100000`, `1200000`];

    let rateLimitPause =
      rateLimitPauses[Math.floor(Math.random() * rateLimitPauses.length)];

    await sleep(rateLimitPause);
  });

  client.login(token).catch((err) => {
    console.log(
      `${chalk.redBright("[ERROR]")} Invalid token ${chalk.red(token)}`
    );
  });
}

start();

async function start() {
  for (var i = 0; i < config.tokens.length; i++) {
    await Login(config.tokens[i].token, Client, config.tokens[i].guildId);
  }

  log?.send(
    new MessageBuilder()
      .setTitle("Started!")
      .setURL("https://github.com/kyan0045/catchtwo")
      .setDescription(`Found ${config.tokens.length} token(s).`)
      .setColor("#7ff889")
  );
}

process.on("unhandledRejection", (reason, p) => {
  const ignoreErrors = [
    "MESSAGE_ID_NOT_FOUND",
    "INTERACTION_TIMEOUT",
    "BUTTON_NOT_FOUND",
  ];
  if (ignoreErrors.includes(reason.code || reason.message)) return;
  console.log(" [Anti Crash] >>  Unhandled Rejection/Catch");
  console.log(reason, p);
});

process.on("uncaughtException", (e, o) => {
  console.log(" [Anti Crash] >>  Uncaught Exception/Catch");
  console.log(e, o);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(" [AntiCrash] >>  Uncaught Exception/Catch (MONITOR)");
  console.log(err, origin);
});

process.on("multipleResolves", (type, promise, reason) => {
  console.log(" [AntiCrash] >>  Multiple Resolves");
  console.log(type, promise, reason);
});

function randomInteger(min, max) {
  if (min == max) {
    return min;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(timeInMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeInMs);
  });
}

async function getMentions(ownerIDs) {
  const mentions = ownerIDs
    .filter((ownerID) => ownerID.length >= 18)
    .map((ownerID) => `<@${ownerID}>`)
    .join(", ");

  return mentions;
}
