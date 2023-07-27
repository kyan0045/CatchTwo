var version = "1.2.1"
// Version 1.2.1
// EVERYTHING can be set up in config.json, no need to change anything here :)!

const { Client, Permissions } = require("discord.js-selfbot-v13")
const date = require("date-and-time")
const nl = require("date-and-time/locale/nl")
const axios = require("axios")
const express = require("express")
const app = express()
const fs = require("fs-extra")
const chalk = require("chalk")
const { solveHint, checkRarity } = require("pokehint")
const { Webhook, MessageBuilder } = require("discord-webhook-node")
const config = process.env.JSON
  ? JSON.parse(process.env.JSON)
  : require("./config.json")
let log
if (config.logWebhook.length > 25) {
  log = new Webhook(config.logWebhook)
  log.setUsername("CatchTwo Logs")
  log.setAvatar(
    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
  )
}
const { exec } = require("child_process")

// CODE, NO NEED TO CHANGE

channelCount = 0
messageCount = 0

axios
  .get("https://raw.githubusercontent.com/kyan0045/catchtwo/main/index.js")
  .then(function (response) {
    var d = response.data
    let v = d.match(/Version ([0-9]*\.?)+/)[0]?.replace("Version ", "")
    if (v) {
      console.log(chalk.bold("Version " + version))
      if (v !== version) {
        console.log(
          chalk.bold.bgRed(
            "There is a new version available: " +
              v +
              "\nPlease update.                         " +
              chalk.underline("\nhttps://github.com/kyan0045/catchtwo") +
              "   "
          )
        )

        if (log)
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
          )
      }
    }
  })
  .catch(function (error) {
    console.log(error)
  })

data = fs.readFileSync("./tokens.txt", "utf-8")
config.tokens = data.split("\n").reduce((previousTokens, line) => {
  let [token, guildId] = line.replace("\r", "").split(" ")
  return [...previousTokens, { token, guildId }]
}, [])

app.get("/", async function (req, res) {
  res.send(`CURRENTLY RUNNING ON ${config.tokens.length} ACCOUNT!`)
})

app.listen(3000, async () => {
  console.log(chalk.bold.bgRed(`SERVER STATUS: ONLINE`))
})

async function Login(token, Client, guildId) {
  if (!token) {
    console.log(chalk.redBright("You must specify a (valid) token."))
  }

/*  if (!guildId) {
    return console.log(
      chalk.redBright(
        "You must specify a (valid) guild ID for all your tokens."
      )
    )
  }

  if (guildId.length > 21) {
    console.log(
      chalk.redBright(
        `You must specify a (valid) guild ID, ${guildId} is too long!`
      )
    )
  } */

  var isOnBreak = false
  const client = new Client({ checkUpdate: false, readyStatus: false })

  if (!isOnBreak) {
    client.on("ready", async () => {
      console.log(`Logged in to ` + chalk.red(client.user.tag) + `!`)
      client.user.setStatus("invisible")
      accountCheck = client.user.username

      async function interval() {
        if (!isOnBreak) {
          const guild = client.guilds.cache.get(guildId)
          const spamChannels = guild.channels.cache
            .filter(
              (channel) =>
                channel.type == "GUILD_TEXT" &&
                channel.name.includes(`spam`) &&
                channel
                  .permissionsFor(guild.members.me)
                  .has(
                    Permissions.FLAGS.VIEW_CHANNEL,
                    Permissions.FLAGS.SEND_MESSAGES
                  )
            )
            .map((channel) => channel.id)
          let spamChannelUnCached= spamChannels[Math.floor(Math.random() * spamChannels.length)]
          let spamChannel = client.channels.cache.get(spamChannelUnCached)
          const spamMessages = fs
            .readFileSync(__dirname + "/messages/messages.txt", "utf-8")
            .split("\n")
          let spamMessage = spamMessages[Math.floor(Math.random() * spamMessages.length)]
          await spamChannel.send(spamMessage)
          messageCount = messageCount + 1

          await sleep(intervals)
          if (randomInteger(0, 1700) == 400) {
            let sleeptime = randomInteger(600000, 4000000)
            let sleeptimes = sleeptime / 1000 / 60
            const now = new Date()
            console.log(
              date.format(now, "HH:mm") +
                `: ` +
                chalk.red(client.user.username) +
                `: Sleeptime: ${sleeptimes} minutes`
            )
            isOnBreak = true
            setTimeout(async function () {
              isOnBreak = false
              Login(token, Client, guildId)
            }, sleeptime)
            if (log) log.send(`Sleeping for ${sleeptimes} minutes`)
          }
        }
      }
    if (guildId) {
      const guild = client.guilds.cache.get(guildId)
      const spam = guild.channels.cache
        .filter(
          (channel) =>
            channel.type == "GUILD_TEXT" &&
            channel.name.includes(`spam`) &&
            channel
              .permissionsFor(guild.members.me)
              .has(
                Permissions.FLAGS.VIEW_CHANNEL,
                Permissions.FLAGS.SEND_MESSAGES
              )
        )
        .map((channel) => channel.id)
      let spamShit = spam[Math.floor(Math.random() * spam.length)]
      let spamChannel = client.channels.cache.get(spamShit)
      const hi = fs
        .readFileSync(__dirname + "/messages/messages.txt", "utf-8")
        .split("\n")
      let spamMessage = hi[Math.floor(Math.random() * hi.length)]
      await spamChannel.send(spamMessage)
      channelCount = channelCount + spam.length
      messageCount = messageCount + 1
      let intervals = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000 //2-5 Seconds are enough to bypass anti-bot

      Interval = setInterval(interval, intervals)

      setInterval(async () => {
        intervals = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000 //2-5 Seconds are enough to bypass anti-bot
        clearInterval(Interval)
        Interval = setInterval(interval, intervals)
      }, 15000)
    }
    })
  }

  client.on("messageCreate", async (message) => {
    if (
      message.guild?.id == guildId || !guildId &&
      message.author.id == "716390085896962058" && !config.blacklistedGuilds.includes(message.guild?.id)
    ) {
      const messages = await message.channel.messages
        .fetch({ limit: 2, around: message.id })
        .catch(() => null)
      const newMessage = Array.from(messages.values())
      ;[...messages.values()]

      if (
        message.embeds[0]?.title &&
        message.embeds[0].title.includes("wild pokémon has appeared")
      ) {
        message.channel.send("<@716390085896962058> h")
        spawned_embed = message.embeds[0]
      } else if (message.content.includes("The pokémon is")) {
        const pokemon = await solveHint(message)
        if (pokemon) {
          await sleep(1000)
          await message.channel.send("<@716390085896962058> c " + pokemon)
          await sleep(5000)
          if (config.reactAfterCatch) {
            const caughtMessages = fs
              .readFileSync(__dirname + "/messages/caughtMessages.txt", "utf-8")
              .split("\n")
            const caughtMessage =
              caughtMessages[Math.floor(Math.random() * caughtMessages.length)]
            message.channel.send(caughtMessage)
          }
        } else {
          console.log("Unknown pokemon found...")
        }
      } else if (message.content.includes("That is the wrong pokémon!")) {
        await sleep(8000)
        message.channel.send("<@716390085896962058> h")
      } else if (
        message.content.includes("Congratulations <@" + client.user.id + ">")
      ) {
        const str = message.content
        const words = str.split(" ")
        level = words[6]
        if (words[8] && !words[8].includes("Add" || " "))
          name = words[7] + " " + words[8].substring(0, words[8].length - 1)
        if (words[8] && words[8]?.includes("Add"))
          name = words[7].substring(0, words[7].length - 1)
        if (!words[8]) name = words[7].substring(0, words[7].length - 1)
        const now = new Date()
        console.log(
          date.format(now, "HH:mm") +
            `: ` +
            chalk.red(client.user.username) +
            `: Caught a level ` +
            level +
            " " +
            name
        )

        await sleep(1000)
        message.channel.send("<@716390085896962058> info latest")
      } else if (
        message.embeds[0]?.footer &&
        message.embeds[0].footer.text.includes("Displaying") &&
        message.embeds[0].thumbnail.url.includes(client.user.id) &&
        newMessage[1].content.includes("info latest")
      ) {
        const str = message.embeds[0]?.fields[1].value
        const words = str.split(" ")
        iv = words[28]
        IV = iv.substring(0, iv.length - 2)

        const footerStr = message.embeds[0]?.footer.text
        const footerWords = footerStr.split(" ")
        number = footerWords[2].substring(0, footerWords[2].length - 5)

        const titleStr = message.embeds[0]?.title
        const titleWords = titleStr.split(" ")
        if (titleWords[3]) latestName = titleWords[2] + titleWords[3]
        if (!titleWords[3]) latestName = titleWords[2]
        latestLevel = titleWords[1]
        link = message.url

        if (titleWords[0] == "✨") {
          if (titleWords[4]) latestName = titleWords[3] + " " + titleWords[4]
          if (!titleWords[4]) latestName = titleWords[3]
          latestLevel = titleWords[2]
          message.channel.send(
            `<@716390085896962058> market search --n ${latestName} --sh --o price`
          )
          await sleep(2000)
          const channel = client.channels.cache.get(message.channel.id)
          const marketDescription = channel.lastMessage.embeds[0].description
          const marketWords = marketDescription.split("\n")
          const marketValues = marketWords[0].split(" ")
          const marketFinal = marketValues[4].split("•")
          if (link == undefined) {
            link = "https://github.com/kyan0045/CatchTwo"
          }
          if (log)
            log.send(
              new MessageBuilder()
                .setText("@everyone")
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
                .setColor("#E74C3C")
            )
        } else if (IV < config.lowIVLog) {
          if (log)
            log.send(
              new MessageBuilder()
                .setText("@everyone")
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
            )
        } else if (IV > config.highIVLog) {
          if (log)
            log.send(
              new MessageBuilder()
                .setText("@everyone")
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
            )
        } else {
          rarity = await checkRarity(`${name}`)

          if (rarity == "legendary") {
            if (log)
              log.send(
                new MessageBuilder()
                  .setText("@everyone")
                  .setTitle("Legendary Caught")
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
              )
          } else if (rarity == "mythical") {
            if (log)
              log.send(
                new MessageBuilder()
                  .setText("@everyone")
                  .setTitle("Mythical Caught")
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
              )
          } else if (rarity == "ultra_beast") {
            if (log)
              log.send(
                new MessageBuilder()
                  .setText("@everyone")
                  .setTitle("Ultra Beast Caught")
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
              )
          } else if (rarity == "regular") {
            if (log)
              log.send(
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
              )
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
          number

        const contents = fs.readFileSync("./catches.txt", "utf-8")

        if (contents.includes(caught)) {
          return
        }

        fs.appendFile("./catches.txt", caught + "\n", (err) => {
          if (err) throw err
        })
      } else if (
        message.content.includes(
          `https://verify.poketwo.net/captcha/${client.user.id}`
        )
      ) {
        if (log)
          log.send(
            new MessageBuilder()
              .setText("@everyone")
              .setTitle("Captcha Found -> Sleeping for 1 hour")
              .setFooter("Restart your application to resume immediately.")
              .setURL(`https://verify.poketwo.net/captcha/${client.user.id}`)
              .setDescription(
                "**Account: **" +
                  client.user.tag +
                  "\n**Link: **" +
                  `https://verify.poketwo.net/captcha/${client.user.id}`
              )
              .setColor("#E74C3C")
          )
        isOnBreak = true
        setTimeout(async function () {
          isOnBreak = false
          Login(token, Client, guildId)
        }, 1000 * 3600)
      }
    }

    if (message.channel.name && message.content) {
      if (
        message.content.startsWith(config.prefix) &&
        config.ownerID.includes(message.author.id) &&
        !message.author.bot
      ) {
        const args = message.content
          .slice(config.prefix.length)
          .trim()
          .split(/ +/g)
        const command = args.shift().toLowerCase()

        if (command == "say") {
          try {
            message.channel.send(`${args.join(" ")}`)
            message.react("✅")
          } catch (err) {
            console.error(err)
            message.react("❌")
          }
        } else if (command == "react") {
          let msg
          let channelID

          try {
            if (args[0]?.length > 10) {
              channelID = 0
              msg = await client.channels.cache
                .get(message.channelId)
                .messages.fetch(args[0])
            } else {
              msg = await client.channels.cache
                .get(message?.reference.channelId)
                .messages.fetch(message?.reference?.messageId)
            }
          } catch (err) {
            message.reply(
              `Please reply to the message with the emoji, or specify a message ID.`
            )
          }

          if (msg) {
            try {
              console.log(msg.reactions.cache.first()?._emoji.name)
              if (msg.reactions.cache.first()?._emoji) {
                msg.react(msg.reactions.cache.first()._emoji.name)
              }
              message.react("✅")
            } catch (err) {
              message.react("❌")
              console.log(err)
            }
          }
        } else if (command == "click") {
          let msg
          let channelID

          try {
            if (args[0].length > 10) {
              channelID = 0
              msg = await client.channels.cache
                .get(message.channelId)
                .messages.fetch(args[0])
            } else {
              msg = await client.channels.cache
                .get(message?.reference.channelId)
                .messages.fetch(message?.reference?.messageId)
            }
          } catch (err) {
            message.reply(
              `Please reply to the message that the button is attached to, or specify the message ID.`
            )
          }

          if (msg) {
            try {
              let buttonId = +parseInt(args[0]) - +1
              if (channelID) {
                buttonId = +parseInt(args[1]) - +1
              }
              if (!isNaN(buttonId) && buttonId >= 0) {
                let button = msg.components[0].components[buttonId]
                await button.click(msg).then(async (e) => {
                  if (config.reactOnSuccess === true) message.react(`👊`)
                })
              } else if (!isNaN(buttonId) && buttonId < 0) {
                let button = msg.components[0].components[0]
                await button.click(msg)
              }
              message.react("✅")
            } catch (err) {
              message.react("❌")
            }
          }
        } else if (command == "help") {
          try {
            webhooks = await message.channel.fetchWebhooks()
          } catch (err) {
            if (err.code == "50013") {
              webhooks = config.logWebhook
            } else {
              console.log(err)
            }
          }
          if (webhooks.size > 0) {
            webhook = new Webhook(webhooks?.first().url)
            webhook.setUsername("CatchTwo")
            webhook.setAvatar(
              "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
            )
          } else {
            try {
              newWebhook = await message.channel.createWebhook("CatchTwo", {
                avatar:
                  "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                reason: "CatchTwo Commands",
              })
            } catch (err) {
              if (err.code == "50013") {
                newWebhook = config.logWebhook
              }
            }
            webhook = new Webhook(newWebhook)
            webhook.setUsername("CatchTwo")
            webhook.setAvatar(
              "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
            )
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
              .addField("!help", "This is this command.", true)
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
                "This can be used to view and change your config.",
                true
              )
              .setColor("#E74C3C")
          )
        } else if (command == "restart") {
          message.reply("Restarting...")
          if (log)
            log.send(
              new MessageBuilder()
                .setTitle("Restarting...")
                .setURL("https://github.com/kyan0045/catchtwo")
                .setColor("#E74C3C")
            )

          setTimeout(() => {
            exec("node restart.js", (error, stdout, stderr) => {
              if (error) {
                console.error(`Error during restart: ${error.message}`)
                return
              }
              console.log(`Restart successful. ${stdout}`)
            })

            setTimeout(() => {
              client.destroy(token)
              process.exit()
            }, 1000)
          }, 1000)
        } else if (command == "support") {
          try {
            webhooks = await message.channel.fetchWebhooks()
          } catch (err) {
            if (err.code == "50013") {
              webhooks = config.logWebhook
            } else {
              console.log(err)
            }
          }
          if (webhooks.size > 0) {
            webhook = new Webhook(webhooks?.first().url)
            await webhook.setUsername("CatchTwo")
            await webhook.setAvatar(
              "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
            )
          } else {
            try {
              newWebhook = await message.channel.createWebhook("CatchTwo", {
                avatar:
                  "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                reason: "CatchTwo Commands",
              })
            } catch (err) {
              if (err.code == "50013") {
                newWebhook = config.logWebhook
              }
            }
            webhook = new Webhook(newWebhook)
            webhook.setUsername("CatchTwo")
            webhook.setAvatar(
              "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
            )
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
          )
        } else if (command == "config") {
          if (!args[0]) {
            try {
              webhooks = await message.channel.fetchWebhooks()
            } catch (err) {
              if (err.code == "50013") {
                webhooks = config.logWebhook
              } else {
                console.log(err)
              }
            }
            if (webhooks.size > 0) {
              webhook = new Webhook(webhooks?.first().url)
              await webhook.setUsername("CatchTwo")
              await webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              )
            } else {
              try {
                newWebhook = await message.channel.createWebhook("CatchTwo", {
                  avatar:
                    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                  reason: "CatchTwo Commands",
                })
              } catch (err) {
                if (err.code == "50013") {
                  newWebhook = config.logWebhook
                }
              }
              webhook = new Webhook(newWebhook)
              webhook.setUsername("CatchTwo")
              webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              )
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
            )
          }
          if (args[0] == "view") {
            const config = await fs.readFileSync("./config.json", "utf-8")
            try {
              webhooks = await message.channel.fetchWebhooks()
            } catch (err) {
              if (err.code == "50013") {
                webhooks = config.logWebhook
              } else {
                console.log(err)
              }
            }
            if (!webhooks)
              return message.reply(
                `<@${message.author.id}>\n\`\`\`json\n${config}\n\`\`\``
              )
            if (webhooks.size > 0) {
              webhook = new Webhook(webhooks?.first().url)
              await webhook.setUsername("CatchTwo")
              await webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              )
            } else {
              try {
                newWebhook = await message.channel.createWebhook("CatchTwo", {
                  avatar:
                    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                  reason: "CatchTwo Commands",
                })
              } catch (err) {
                if (err.code == "50013") {
                  newWebhook = config.logWebhook
                }
              }
              webhook = new Webhook(newWebhook)
              webhook.setUsername("CatchTwo")
              webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              )
            }
            if (webhook)
              webhook.send(
                `<@${message.author.id}>\n\`\`\`json\n${config}\n\`\`\``
              )
          }
          if (args[0] == "set" && !args[1]) {
            try {
              webhooks = await message.channel.fetchWebhooks()
            } catch (err) {
              if (err.code == "50013") {
                webhooks = config.logWebhook
              } else {
                console.log(err)
              }
            }
            if (webhooks.size > 0) {
              webhook = new Webhook(webhooks?.first().url)
              await webhook.setUsername("CatchTwo")
              await webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              )
            } else {
              try {
                newWebhook = await message.channel.createWebhook("CatchTwo", {
                  avatar:
                    "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67",
                  reason: "CatchTwo Commands",
                })
              } catch (err) {
                if (err.code == "50013") {
                  newWebhook = config.logWebhook
                }
              }
              webhook = new Webhook(newWebhook)
              webhook.setUsername("CatchTwo")
              webhook.setAvatar(
                "https://camo.githubusercontent.com/1c34a30dc74c8cb780498c92aa4aeaa2e0bcec07a94b7a55d5377786adf43a5b/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313033333333343538363936363535323636362f313035343839363838373834323438383432322f696d6167652e706e67"
              )
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
            )
          }
          if (args[0] == "set" && args[1]) {
            let property = args[1]
            let value = args[2]

            const rawData = fs.readFileSync("./config.json")
            let config = JSON.parse(rawData)

            if (!(property in config)) {
              message.reply(
                `Property \`${property}\` does not exist in the config.`
              )
              return
            }

            if (typeof config[property] === "boolean") {
              value = value.toLowerCase() === "true"
            } else if (typeof config[property] === "number") {
              value = Number(value)
            }

            config[property] = value

            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2))
            message.reply(
              `Property \`${property}\` updated with value \`${value}\`.`
            )
          }
        }
      }
    }
  })

  client.on(`rateLimit`, async (message) => {
    let rateLimitPauses = [`900000`, `1000000`, `1100000`, `1200000`]

    let rateLimitPause =
      rateLimitPauses[Math.floor(Math.random() * rateLimitPauses.length)]

    await sleep(rateLimitPause)
  })

  client.login(token, (bot = false))
}

start()

async function start() {
  for (var i = 0; i < config.tokens.length; i++) {
    await Login(config.tokens[i].token, Client, config.tokens[i].guildId)
  }
  if (log)
    log.send(
      new MessageBuilder()
        .setTitle("Started!")
        .setURL("https://github.com/kyan0045/catchtwo")
        .setDescription(`Found ${config.tokens.length} token(s).`)
        .setColor("#7ff889")
    )
}

process.on("unhandledRejection", (reason, p) => {
  const ignoreErrors = [
    "MESSAGE_ID_NOT_FOUND",
    "INTERACTION_TIMEOUT",
    "BUTTON_NOT_FOUND",
  ]
  if (ignoreErrors.includes(reason.code || reason.message)) return
  console.log(" [Anti Crash] >>  Unhandled Rejection/Catch")
  console.log(reason, p)
})

process.on("uncaughtException", (e, o) => {
  console.log(" [Anti Crash] >>  Uncaught Exception/Catch")
  console.log(e, o)
})

process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(" [AntiCrash] >>  Uncaught Exception/Catch (MONITOR)")
  console.log(err, origin)
})

process.on("multipleResolves", (type, promise, reason) => {
  console.log(" [AntiCrash] >>  Multiple Resolves")
  console.log(type, promise, reason)
})

function randomInteger(min, max) {
  if (min == max) {
    return min
  }
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sleep(timeInMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeInMs)
  })
}
