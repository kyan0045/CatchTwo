var version = '1.2.1';
// Version 1.1
// EVERYTHING can be set up in config.json, no need to change anything here :)!

const { Client, Permissions } = require('discord.js-selfbot-v13');
const date = require('date-and-time');
const nl = require('date-and-time/locale/nl');
const axios = require("axios");
const express = require('express');
const app = express();
const fs = require("fs-extra");
const fs1 = require("fs");
const chalk = require("chalk");
const { hint, solveHint, shinyHunt } = require('autocatcher');
const { Webhook, MessageBuilder } = require("discord-webhook-node");
const config = process.env.JSON
  ? JSON.parse(process.env.JSON)
  : require("./config.json");

const log = new Webhook(config.logWebhook);

axios
  .get("https://raw.githubusercontent.com/kyan0045/catchtwo/main/index.js")
  .then(function(response) {
    var d = response.data;
    let v = d.match(/Version ([0-9]*\.?)+/)[0]?.replace("Version ", "");
    if (v) {
      console.log(chalk.bold("Version " + version));
      if (v !== version) {
        console.log(
          chalk.bold.bgRed(
            "There is a new version available: " +
            v +
            "\nPlease update.                       " +
            chalk.underline(
              "https://github.com/kyan0045/catchtwo"
            ) + '  '
          )
        );

        log.send(
          new MessageBuilder()
            .setTitle("New Version")
            .setURL("https://github.com/kyan0045/catchtwo")
            .setDescription(
              "Current version:** " +
              version +
              "**\nNew version: **" +
              v +
              "**\nPlease update: " +
              "https://github.com/Kyan0045/CatchTwo"
            )
            .setColor("#E74C3C")
        );
      }
    }
  })
  .catch(function(error) {
    console.log(error);
  });


// INFO: Load batch token file if enabled
if (config.isBatchTokenFile) {
  let data = process.env.TOKENS;
  if (!data) data = fs.readFileSync("./batch_token.cfg", "utf-8");
  config.tokens = data.split("\n").reduce((previousTokens, line) => {
    let [guildId, token] = line.replace("\r", "").split(" ");
    return [...previousTokens, { guildId, token }];
  }, []);
}

function sleep(timeInMs) {
  return new Promise(resolve => {
    setTimeout(resolve, timeInMs)
  })
}

app.get('/', function(req, res) {
  res.send(`CURRENTLY RUNNING ON ${config.tokens.length} ACCOUNT!`)
});

/* app.get("/", async (req, res) => {
  //res.render(path.resolve("./static"), {
  //   "progressValue": pr
  // });
  res.sendFile(__dirname + '/static/index.html');
}); 

app.get("/api", async (req, res) => {
  res.json({

    "tokenCount": config.tokens.length,
    "messageCount": messageCount,
    "membersDMED": membersDMED,
    "dmCount": dmsReceived,
    "channelCount": channelCount,
    "startDate": startDate,
  })
}) */

app.listen(3000, () => {
  console.log(chalk.bold.bgRed(`SERVER STATUS: ONLINE`))
});

async function Login(token, Client, guildId) {
  if (!token) {
    console.log(chalk.redBright('You must specify a (valid) token.'))
  }

  if (!guildId) {
    console.log(chalk.redBright('You must specify a (valid) guild ID.'))
  }

  if (guildId.length > 21) {
    console.log(chalk.redBright(`You must specify a (valid) guild ID, ${guildId} is too long!`))
  }
  
  const client = new Client({ checkUpdate: false, readyStatus: false });
  client.on('ready', async () => {
    let channelCount = 0, messageCount = 0;
    console.log(`Logged in to ` + chalk.red(client.user.tag) + `!`);
    client.user.setStatus('invisible');
    accountCheck = client.user.username
    let intervals_list = []; //No profit in such long interval
    
      const guild = client.guilds.cache.get(guildId)
      const spam = guild.channels.cache.filter(channel => channel.type == "GUILD_TEXT" && channel.name.includes(`spam`) && channel.permissionsFor(guild.me).has(Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES)).map(channel => channel.id)
      let spamShit = spam[Math.floor(Math.random() * spam.length)]
      let spamChannel = client.channels.cache.get(spamShit)
      const hi = fs.readFileSync(__dirname + '/messages/messages.txt', 'utf-8').split('\n')
      let spamMessage = hi[Math.floor(Math.random() * hi.length)]
      spamChannel.send(spamMessage)
      channelCount = channelCount + spam.length
      messageCount = messageCount + 1
      let intervals = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000; //2-5 Seconds are enough to bypass anti-bot
      intervalsAfter = intervals / 1000

      setInterval(async () => {
        intervals =  Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
        intervalsAfter = intervals / 1000
        clearInterval(interval)
      }, 15000)

      interval = setInterval(async () => {
        interval2 = setInterval(async () => {
          const guild = client.guilds.cache.get(guildId)
          const spamChannels = guild.channels.cache.filter(channel => channel.type == "GUILD_TEXT" && channel.name.includes(`spam`) && channel.permissionsFor(guild.me).has(Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES)).map(channel => channel.id)
          let spamShit = spamChannels[Math.floor(Math.random() * spamChannels.length)]
          let spamChannel = client.channels.cache.get(spamShit)
          const hi = fs.readFileSync(__dirname + '/messages/messages.txt', 'utf-8').split('\n')
          let spamMessage = hi[Math.floor(Math.random() * hi.length)]
          await spamChannel.send(spamMessage)
          messageCount = messageCount + 1


          await sleep(intervals)
          if ((randomInteger(0, 1700) == 400)) {
            let sleeptime = randomInteger(600000, 4000000)
            let sleeptimes = sleeptime / 1000 / 60
            const now = new Date();
            console.log(date.format(now, 'HH:mm') + `: ` + chalk.red(client.user.username) + `: Sleeptime: ${sleeptimes} minutes`)
            setTimeout(async function() {
              Login(token, Client, guildId);
            }, sleeptime);
          }
        }, intervals);
      }, 10000)
    })

  client.on('messageCreate', async (message) => {
    
    if(message.author.id ==== config.owner) {
      
      if (!message.content.startsWith(config.prefix)) return;
      const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
      const cmd = args.shift().toLowerCase();
      
      if(cmd === `say`) {
        message.channel.send(`${args.join(" ")}`)
        if(config.reactOnSuccess === true) message.react(`👊`);
      } else if(cmd === `click`) {
        let msg
        try {
          msg = await this.client.channels.cache.get(message?.reference.channelId).messages.fetch(message?.reference?.messageId)
        } catch (error) {
          message.reply(`Please use the command as a reply as the message of the target button!`)
        }
        if(msg) {
          console.log(msg.components[0]?.components)
        }
        if(msg) {
          let buttonId = parseInt(args[0])
          if(!isNaN(buttonId)) {
            let button = msg.components[0].components[buttonId]
            await button.click(msg).then(async (e) => {if(config.reactOnSuccess === true) message.react(`👊`);})
          }
        }
      }
    }
    
    if (message.guild?.id == guildId && message.author.id == '716390085896962058') {
      const messages = await message.channel.messages.fetch({ limit: 2, around: message.id })
        .catch(() => null);
      const newMessage = Array.from(messages.values());
      [...messages.values()];

      if (message.embeds[0]?.title && message.embeds[0].title.includes('wild pokémon has appeared')) {
        message.channel.send('<@716390085896962058> h')
        spawned_embed = message.embeds[0]
      } else if (message.content.includes('The pokémon is')) {
        const pokemon = await solveHint(message)
        if (pokemon) {
          await sleep(1000)
          await message.channel.send('<@716390085896962058> c ' + pokemon[0].toLowerCase())
          await sleep(8000)
          if (config.reactAfterCatch) {
            const caughtMessages = fs.readFileSync(__dirname + '/messages/caughtMessages.txt', 'utf-8').split('\n')
            const caughtMessage = caughtMessages[Math.floor(Math.random() * caughtMessages.length)]
            message.channel.send(caughtMessage)
          }
        } else {
          await sleep(3000)
          message.channel.send('idk bro')
        }
      } else if (message.content.includes('Congratulations <@' + client.user.id + '>')) {
        const str = message.content;
        const words = str.split(" ");
        level = words[6]
        name = words[7].substring(0, words[7].length - 1);
        link = message.url
        const now = new Date();
        console.log(date.format(now, 'HH:mm') + `: ` + chalk.red(client.user.username) + `: Caught a level ` + level + ' ' + name)

        await sleep(3000)
        message.channel.send('<@716390085896962058> info latest')
      } else if (message.embeds[0]?.footer && message.embeds[0].footer.text.includes('Displaying') && message.embeds[0].thumbnail.url.includes(client.user.id) && newMessage[1].content.includes('info latest')) {
        const str = message.embeds[0]?.fields[1].value
        const words = str.split(" ");
        iv = words[28]
        IV = iv.substring(0, iv.length - 2);

        const footerStr = message.embeds[0]?.footer.text
        const footerWords = footerStr.split(" ");
        number = footerWords[2].substring(0, footerWords[2].length - 5);

        const titleStr = message.embeds[0]?.title
        const titleWords = titleStr.split(" ");
        latestName = titleWords[2]
        latestLevel = titleWords[1]

       if (titleWords[0] == '✨') {
          latestName = titleWords[3]
          latestLevel = titleWords[2]
          message.channel.send(`<@716390085896962058> market search --n ${latestName} --sh --o price`)
          await sleep(2000)
          const channel = client.channels.cache.get(message.channel.id)
        const marketDescription = channel.lastMessage.embeds[0].description
        const marketWords = marketDescription.split("\n")
        const marketValues = marketWords[0].split(" ")
        const marketFinal = marketValues[4].split("•")
        if (link == undefined) {
          link = 'https://github.com/kyan0045/CatchTwo'
        }
         
        log.send(
            new MessageBuilder()
              .setText('@everyone')
              .setTitle("✨ \`\`-\`\` Shiny Caught")
              .setURL(link)
              .setDescription(
                "**Account: **" + client.user.tag +
                "\n**Pokemon: **" + latestName +
                "\n**Level: **" + latestLevel +
                "\n**IV: **" + iv +
                "\n**Number: **" + number +
                "\n**Lowest Market Worth: **" + marketFinal[2].replace('　', '')
              )
              .setColor("#E74C3C")
          );
        } else if (IV < config.lowIVLog) {
          log.send(
            new MessageBuilder()
              .setText('@everyone')
              .setTitle("Low IV Caught")
              .setURL(link)
              .setDescription(
                "**Account: **" + client.user.tag +
                "\n**Pokemon: **" + latestName +
                "\n**Level: **" + latestLevel +
                "\n**IV: **" + iv +
                "\n**Number: **" + number
              )
              .setColor("#E74C3C")
          );

        } else if (IV > config.highIVLog) {
          log.send(
            new MessageBuilder()
              .setText('@everyone')
              .setTitle("High IV Caught")
              .setURL(link)
              .setDescription(
                "**Account: **" + client.user.tag +
                "\n**Pokemon: **" + latestName +
                "\n**Level: **" + latestLevel +
                "\n**IV: **" + iv +
                "\n**Number: **" + number
              )
              .setColor("#E74C3C")
          );
        } else {
          log.send(
            new MessageBuilder()
              .setTitle("Pokemon Caught")
              .setURL(link)
              .setDescription(
                "**Account: **" + client.user.tag +
                "\n**Pokemon: **" + latestName +
                "\n**Level: **" + latestLevel +
                "\n**IV: **" + iv +
                "\n**Number: **" + number
              )
              .setColor("#2e3236")
          )
        }

        const caught = 'Account: ' + client.user.tag + ' || Name: ' + latestName + ' || Level: ' + latestLevel + ' || IV: ' + iv + ' || Number: ' + number
        // console.log(caught)

        const contents = fs1.readFileSync('./catches.txt', 'utf-8');

        if (contents.includes(caught)) {
          return;
        }

        fs1.appendFile('./catches.txt', caught + "\n", (err) => {
          if (err) throw err;
        });
      }
    }


    if (message.channel.name && message.content) {
      if (!message.content.includes('\n') && message.author.id !== client.user.id && !message.author.bot) {
        fs1.readFile('./messages/messages.txt', function(res, req) {
          //fs1.writeFile('./messages/j4jmessages.txt', message.content + `\r\n`, function(err, result) {
          //if(err) console.log('error', err);      })
          //})
          const contents = fs1.readFileSync('./messages/messages.txt', 'utf-8');

          if (contents.includes(message.content)) {
            return;
          }

          if (message.content.includes(0) || message.content.includes(1) || message.content.includes(2) || message.content.includes(3) || message.content.includes(5) || message.content.includes(6) || message.content.includes(7) || message.content.includes(8) || message.content.includes(9) || message.content.includes('ı') || message.content.includes('ü') || message.content.includes('gelin') || message.content.includes('turk') || message.content.includes('ö') || message.content.includes('gelsin') || message.content.includes('seri') || message.content.includes('ğ') || message.content.includes('ş') || message.content.includes('Turkler') || message.content.includes('https://') || message.content.toLowerCase().includes('j4j') || message.content.toLowerCase().includes('join') || message.content.toLowerCase().includes('!') || message.mentions.everyone) {
            return;
          }

          if (client.user.username !== accountCheck) {
            return;
          }

          fs1.appendFile('./messages/messages.txt', "\n" + message.content, (err) => {
            if (err) throw err;
          });

        })
      }
    }
  })

  client.on(`rateLimit`, async (message) => {
    let rateLimitPauses = [
      `900000`,
      `1000000`,
      `1100000`,
      `1200000`
    ];

    let rateLimitPause = rateLimitPauses[Math.floor(Math.random() * rateLimitPauses.length)]

    await sleep(rateLimitPause)
  })




  client.login(token, bot = false);
}

start();

async function start() {
  for (var i = 0; i < config.tokens.length; i++) {
    await Login(
      config.tokens[i].token,
      Client,
      config.tokens[i].guildId
    );
  }
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
  return new Promise(resolve => {
    setTimeout(resolve, timeInMs)
  })
}
