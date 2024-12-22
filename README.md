      
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

# 4. Configure the bot (config.js & tokens.txt)

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

| Category          | Name                | Type      | Default Value                                         | Description                                                                                                                                                                |
| :---------------- | :------------------ | :-------- | :---------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Behavior**      | `AI`                | `Boolean` | `true`| Enables or disables the use of AI in the autocatcher. When set to `true`, the autocatcher will use AI logic for improved catching.                                    |
|                   | `Catching`          | `Boolean` | `true`| Enables or disables catching behavior globally. When set to `true`, the bot will attempt to catch Pokémon in specified channels or guilds.                          |
|                   | `Spamming`          | `Boolean` | `true`| Enables or disables spamming behavior globally. When set to `true`, the bot will send messages at a set interval in the designated spam channel.                      |
| **Incense**       | `IncenseMode`       | `Boolean` | `true`| Enables or disables incense mode. When set to `true`, the bot will use incense when available, as specified by the Incense Channel.                                     |
|                   | `AutoIncenseBuy`    | `Boolean` | `false`| Enables or disables automatic incense buying. When set to `true`, the bot will automatically purchase incense when it runs out.                                           |
|                   | `IncenseChannel`    | `String`  | `""`| Specifies the channel ID where the bot will use incense. (Optional)|
| **Spamming**      | `SpamSpeed`         | `Number`  | `1500`| Sets the speed of spamming in milliseconds (e.g., 1500 = 1.5 seconds between each message).                                                                            |
|                   | `SpamChannel`       | `String`  | `""`| Specifies the channel ID where the bot will send spam messages. (Optional)|
| **Logging**       | `LogCatches`        | `Boolean` | `true`| Enables or disables logging of catches. When set to `true`, the bot will log all caught Pokémon.                                                                       |
|                   | `LowIVThreshold`    | `Number`  | `15.00`| Sets the threshold for logging a Pokémon as low IV (e.g., 15.00 means Pokémon with IV below 15% will be logged as low IV).                                                |
|                   | `HighIVThreshold`   | `Number`  | `85.00`| Sets the threshold for logging a Pokémon as high IV (e.g., 85.00 means Pokémon with IV above 85% will be logged as high IV).                                               |
|                   | `LogWebhook`        | `String`  | `""` | Specifies the webhook URL where logs will be sent.|
| **Ownership**     | `OwnerIDs`          | `Array`   | `["1101294362505269379", ""]`| Lists the user IDs that have owner-level control over the bot. You can add more user IDs, separated by commas.|
|                   | `CommandPrefix`     | `String`  | `"!` | Sets the prefix for bot commands (e.g., !help, !stats). Make sure this prefix is not used by any other bot in the same server!|
| **Global Settings** | `GlobalCatch`       | `Boolean` | `false`| Enables or disables global catching. When set to `true`, the bot will attempt to catch Pokémon in all channels it has access to, except those in the blacklisted guilds. |
|                   | `BlacklistedGuilds` | `Array`   | `["716390832034414685", ""]`| Lists the server (guild) IDs where the bot should not catch Pokémon.|
| **Hunting** | `HuntPokemons`      | `Array`   | `["rayquaza", "solosis"]`| Lists the names of Pokémon to hunt, this means your HuntToken will catch these pokemon.|
|                   | `HuntToken`         | `String`  | `""`| Specifies the token to use for hunting. This should be a different token than your main bot token.|
| **Debug**         | `debug`             | `Boolean` | `true`| Enables or disables debug mode. When set to `true`, the bot will output additional information for debugging purposes.     

<!-- Commands Section -->
<h2 align="">Commands</h2>
<p align="">
  Take control of CatchTwo with these powerful commands:
</p>


| Command   | Options         | Description                                                                                     |
| :-------- | :-------------- | :---------------------------------------------------------------------------------------------- |
| `help`    | `[command]`     | Provides a list of available commands. Use `help [command]` for details on a specific command. |
| `say`     | `<content>`     | Makes the bot repeat the given text.                                                            |
| `click`   | `<messageId>`   | Simulates a button click on the specified message.                                                |
| `pause`   | `[account]`     | Pauses the bot's operations. If an account is specified, it pauses only that account.         |
| `react`   | `<messageId>`   | Reacts to the specified message with the first available emoji.                               |
| `restart` |                 | Restarts the bot.                                                                                |
| `resume`  | `[account]`     | Resumes the bot's operations. If an account is specified, it resumes only that account.      |
| `alias`   | `[command]`     | List all the aliases for commands.     


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

- **[PokeHint](https://github.com/kyan0045/pokehint):** The <b>industry-standard</b>, open-source library for Pokétwo hint solving and rarity checking. This efficient package provides the underlying logic and comprehensive database that powers multiple autocatchers, including CatchTwo. If you're building a Pokétwo bot, you need PokeHint.

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
