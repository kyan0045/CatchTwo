      
<!-- Badges (Top) -->
<p align="center">
  <a href="https://kyan.space"><img width="200px" src="https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png" alt="Logo"></a>
  <h1 align="center">CatchTwo</h1>
</p>


<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#installation">How To Use</a> •
  <a href="#configurations">Configurations</a> •
  <a href="#commands">Commands</a> •
  <a href="#support">Support</a> •
  <a href="#related">Related</a>
</p>

  <p align="center">
  <a href="https://discord.gg/tXa2Hw5jHy"><img src="https://img.shields.io/discord/1133853334944632832?label=Discord&logo=discord&logoColor=white&style=for-the-badge" alt="Discord"></a>
  <a href="https://github.com/kyan0045/CatchTwo/stargazers"><img src="https://img.shields.io/github/stars/kyan0045/CatchTwo?style=for-the-badge&logo=github&color=blue" alt="Stars"></a>
  <a href="https://github.com/kyan0045/CatchTwo/releases"><img src="https://img.shields.io/github/v/release/kyan0045/CatchTwo?style=for-the-badge&logo=github" alt="Release"></a>
  <a href="https://www.nodejs.org/"><img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white" alt="made-with-python"></a>
</p>


<p align="center">
  <b>Enjoying CatchTwo? Give this project a ⭐ on GitHub to show your support!</b>
</p>

<!-- Title & Subtitle -->
<p align="center">
  <i>The Revolutionary, Open-Source Autocatcher That Puts You in Control</i>
</p>

<img src="https://res.cloudinary.com/dppthk8lt/image/upload/v1734823547/image_fx__4_cacczd.png">

<!-- About Section -->
<h2 align="">About CatchTwo</h2>
<p align="">
  CatchTwo is not just another Pokétwo bot. It's a <b>cutting-edge, AI-powered autocatcher</b> designed to give you the ultimate advantage. Built with contributions from the community, for the community, CatchTwo is <b>completely free and open-source</b>. Run it on <b>multiple accounts</b>, customize it to your liking, and watch your Pokédex grow faster than ever before.
</p>

<!-- Features Section -->
<h2 align="">Key Features</h2>
<p align="">
  <ul>
    <li>⚡ <b>Blazing Fast AI Catching:</b> Catch more Pokémon with fewer captchas.</li>
    <li>🔧 <b>Fully Customizable:</b> Tailor every aspect of the bot to your needs.</li>
    <li>👥 <b>Multi-Account Support:</b> Run CatchTwo on as many accounts as you want.</li>
    <li>💖 <b>Open-Source & Free:</b> No hidden costs, no premium features, just pure Pokétwo domination.</li>
    <li>📈 <b>Detailed Statistics:</b> Keep track of your progress with in-depth stats.</li>
    <li>🤖 <b>Advanced Commands:</b> Control every aspect of your catching experience.</li>
    <li>🛡️ <b>Safe & Reliable:</b> Designed to avoid detection and keep your accounts secure.</li>
  </ul>
</p>

<!-- Installation Section -->
<h2 align="">Installation</h2>
<p align="">
  Getting started with CatchTwo is easy! Follow our detailed guides for your preferred platform, (and star the Github!):
</p>
<p align="">
  <a href="https://youtu.be/Zfy2OQjAX3g">
    <img src="https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Windows Installation Guide">
  </a>
  <a href="https://discord.gg/tXa2Hw5jHy">
    <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android Installation Guide">
  </a>
 <!-- <a href="[LINK_TO_REPLIT_GUIDE]">
    <img src="https://img.shields.io/badge/Replit-F26207?style=for-the-badge&logo=replit&logoColor=white" alt="Replit Installation Guide">
  </a> -->
</p>
<p align="">Or, for the experienced users, follow these quick steps:</p>

- Download [NodeJS](https://nodejs.org/en/download)
- Download [Git](https://git-scm.com/downloads)

```bash
# 1. Clone the repository (v1.4-beta branch)
git clone -b v1.4-beta --single-branch https://github.com/kyan0045/catchtwo.git

# 2. Navigate to the directory
cd catchtwo

# 3. Install dependencies
npm install

# 4. Configure the bot (config.json & tokens.txt)

# 5. Start CatchTwo
npm start 
# OR
node .
```
<!-- Support Section -->
<h2 align="">Support</h2>
<p align="">
Need help? Join our <a href="https://discord.gg/tXa2Hw5jHy">Discord community</a> for support, updates, and feature requests.<br>
Alternatively, head over to the <a href="https://github.com/kyan0045/CatchTwo/discussions">Discussions</a> tab!
</p>

<!-- Configurations Section -->
<h2 align="">Configurations</h2>
<p align="">
  Customize CatchTwo to your liking with these powerful configuration options. All options are to be set in <code>config.json</code>:
</p>

| Name             | Type      | Default Value        | Description                                                                                                                   |
| :--------------- | :-------- | :------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `incenseMode`    | `Boolean` | `false`              | Tells the program whether or not to interact with incenses.                                                                   |
| `logCatches`     | `Boolean` | `true`               | Tells the program whether or not to log all catches.                                                                          |
| `lowIVLog`       | `Number`  | `15.00`              | Tells the program when to log a pokemon as low IV.                                                                            |
| `highIVLog`      | `Number`  | `85.00`              | Tells the program when to log a pokemon as high IV.                                                                           |
| `logWebhook`     | `String`  | `undefined`          | Tells the program which webhook to log to.                                                                                    |
| `ownerID`        | `Array`   | `[]`                 | The userID of your main account. Add multiple user ID's by separating them with a comma (,).                                  |
| `prefix`         | `String`  | `!` | The prefix to use for the selfbot. Make sure this prefix is not used by any other bot. |
| `globalCatch`    | `Boolean` | `false`              | Tells the program whether to catch just in the specified guild, or in all (unblacklisted) guilds.                             |
| `blacklistedGuilds` | `Array`   | `[716390832034414685]` | The server IDs of servers you do not want the bot to catch in.                                                              |

<!-- Commands Section -->
<h2 align="">Commands</h2>
<p align="">
  Take control of CatchTwo with these powerful commands:
</p>

| Command   | Options         | Description                                                                  |
| :-------- | :-------------- | :--------------------------------------------------------------------------- |
| `help`    | `<command>`          | Gives a list of these available commands.                                    |
| `say`     | `<content>`     | Can be used to make the selfbot repeat after you.                             |
| `click`   | `<messageID>`   | Can be used to click a button in Discord.                                     |
| `react`   | `<messageID>`   | Can be used to make the selfbot react to the first emoji on a message.        |
| `restart` | `none`          | Can be used to restart the selfbot.                                           |
| `support` | `none`          | Gives a link to our support server.                                          |
| `ping`    | `none`          | Gives the selfbot's response time.                                            |
| `resume`  | `<account>`          | This can be used to resume the bot                        |
| `pause`  | `<account>`          | This can be used to pause the bot.                     |


<!-- Contributing Section -->
<h2 align="">Contributing</h2>
<p align="">
CatchTwo is a community-driven project, and we welcome contributions of all kinds! Whether you're a seasoned developer or a passionate Pokétwo player, you can help make CatchTwo even better. Check out our <a href="[LINK_TO_CONTRIBUTING_GUIDE]">Contributing Guide</a> to get started.
</p>

<!-- Related -->
<h2>Related</h2>
<p align="">
  At the heart of multiple Pokétwo autocatchers lies <b>PokeHint</b>, an efficient open-source package created by <a href="https://github.com/kyan0045"> @kyan0045</a>:
</p>

- **[PokeHint](https://github.com/kyan0045/pokehint):** The <b>industry-standard</b>, open-source library for Pokétwo hint solving and rarity checking. This powerful package provides the underlying logic and comprehensive database that powers numerous autocatchers, including CatchTwo. If you're building a Pokétwo bot, you need PokeHint.

<p align="">
  Other projects by me you might be interested in:
</p>

- **[Spammer](https://github.com/kyan0045/spammer):** A versatile Discord spammer. Use with caution! (or maybe don't, who am I to judge?)
- **[And More!](https://github.com/kyan0045?tab=repositories)** Explore <a href="https://github.com/kyan0045"> @kyan0045</a>'s GitHub profile for a variety of other projects, including experimental tools, utilities, and who knows what else!


<!-- License -->
<h2 align="">License</h2>
<p align="">
CatchTwo is released under a <a href="https://github.com/kyan0045/CatchTwo/blob/main/LICENSE">custom license</a>.
</p>
