<p align="center">
  <a href="https://kyanbosman.com"><img width="200" src="https://res.cloudinary.com/dppthk8lt/image/upload/v1719331169/catchtwo_bjvlqi.png" alt="CatchTwo logo"></a>
</p>

<h1 align="center">CatchTwo</h1>

<p align="center">
  <i>Open-source Pokétwo autocatcher with a local AI catch model.</i>
</p>

<p align="center">
  <a href="https://discord.gg/tXa2Hw5jHy"><img src="https://img.shields.io/discord/1133853334944632832?label=Discord&logo=discord&logoColor=white&style=for-the-badge" alt="Discord"></a>
  <a href="https://github.com/kyan0045/CatchTwo/stargazers"><img src="https://img.shields.io/github/stars/kyan0045/CatchTwo?style=for-the-badge&logo=github&color=blue" alt="Stars"></a>
  <a href="https://github.com/kyan0045/CatchTwo/releases"><img src="https://img.shields.io/github/v/release/kyan0045/CatchTwo?style=for-the-badge&logo=github" alt="Release"></a>
  <a href="https://www.nodejs.org/"><img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white" alt="Node.js"></a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#commands">Commands</a> •
  <a href="#support">Support</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#related">Related</a>
</p>

<p align="center">
  <b>If CatchTwo helps you, consider starring the repository.</b>
</p>

![CatchTwo banner](https://res.cloudinary.com/dppthk8lt/image/upload/v1734823547/image_fx__4_cacczd.png)

## About

CatchTwo catches Pokémon for you on Pokétwo. Run one or more accounts from a single instance. A bundled local image model catches most spawns without waiting for a hint.

CatchTwo is a self-bot. Using it may violate Discord's or Pokétwo's terms of service, and accounts can be restricted. Use it at your own risk.

## Features

- **Local AI catching:** a 64x64 classifier runs on your machine and predicts each spawn. Hint solving is the fallback, and no image is sent to a third party.
- **Multi-account:** run any number of accounts from one instance.
- **Cross-platform:** runs on Windows, Linux, macOS and Android (Termux).
- **Configurable:** catching, spamming, incense, logging and hunting live in `config.js`.
- **Statistics:** per-account and combined catch, coin and spam counters.
- **Owner commands:** pause, resume, stats, predict and version.
- **Free:** no paid tiers and no hidden limits.

## Installation

Requires Node.js 22.13.0 or newer and Git.

Windows and Android guides:

<p align="center">
  <a href="https://youtu.be/Zfy2OQjAX3g">
    <img src="https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Windows installation guide">
  </a>
  <a href="https://discord.gg/tXa2Hw5jHy">
    <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android installation guide">
  </a>
</p>

Quick start on Linux, macOS or Windows (stable `main`):

```bash
# 1. Clone the repository
git clone https://github.com/kyan0045/CatchTwo.git

# 2. Enter the directory
cd CatchTwo

# 3. Install dependencies
npm install --omit=dev

# 4. Fill in config.js and tokens.txt

# 5. Start CatchTwo
npm start
```

Run `npm start` from the repository root. `tokens.txt` is read relative to the working directory.

On Windows, `start.bat` is a launcher that installs portable Git and Node when missing, follows the `dev` beta branch, merges new config keys and restarts after a crash.

## Beta builds

CatchTwo 2.0.0 is currently in beta on the `dev` branch. On Windows, `start.bat` follows `dev` automatically and switches existing checkouts to it. To install the beta manually:

```bash
git clone --branch dev https://github.com/kyan0045/CatchTwo.git
cd CatchTwo
npm install --omit=dev

# Fill in config.js and tokens.txt, then start
npm start
```

Use `npm run update` to update the current branch. It preserves `config.js` and `tokens.txt` and merges new config defaults. `npm run force-update` resets the current branch to its remote and also preserves both files.

## Configuration

All settings live in `config.js`. `tokens.txt` holds one `token guildId` pair per account, separated by whitespace. Defaults are shown for reference; restart after editing.

| Category            | Setting             | Type              | Default                          | Description                                                                                                          |
| :------------------ | :------------------ | :---------------- | :------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **Behavior**        | `AI`                | `Boolean`         | `true`                           | Try the local model before falling back to hints.                                                                    |
|                     | `Catching`          | `Boolean`         | `true`                           | Master switch for catching.                                                                                          |
|                     | `Spamming`          | `Boolean`         | `true`                           | Master switch for spamming. IncenseMode disables it when on.                                                         |
| **Incense**         | `IncenseMode`       | `Boolean`         | `true`                           | Catch incense spawns and stop spamming. When off, incense spawns are ignored.                                        |
|                     | `AutoIncenseBuy`    | `Boolean`         | `false`                          | Buy a new incense when the current one runs out. Requires IncenseMode.                                               |
|                     | `IncenseChannel`    | `String or Array` | `"ChannelID"`                    | One channel ID or an array of channel IDs for automatic purchases. Required when `AutoIncenseBuy` is on. Deprecated. |
| **Spamming**        | `SpamSpeed`         | `Number`          | `2000`                           | Milliseconds between spam messages. Range 1000 to 120000.                                                            |
|                     | `SpamChannel`       | `String`          | `""`                             | Channel ID to spam in. Empty auto-detects a channel named "spam".                                                    |
| **Logging**         | `Pokemon`           | `Boolean`         | `false`                          | Log regular catches.                                                                                                 |
|                     | `Quests`            | `Boolean`         | `true`                           | Log completed quests.                                                                                                |
|                     | `LowIV`             | `Boolean`         | `true`                           | Log catches at or below `LowIVThreshold`.                                                                            |
|                     | `HighIV`            | `Boolean`         | `true`                           | Log catches at or above `HighIVThreshold`.                                                                           |
|                     | `SpecialCatches`    | `Boolean`         | `true`                           | Log shiny, Gigantamax and other special catches.                                                                     |
|                     | `Ping`              | `Object`          | see example                      | Per-category owner pings. Set each category to `true` or `false`.                                                    |
|                     | `LowIVThreshold`    | `Number`          | `15.00`                          | IV percentage at or below this counts as low IV.                                                                     |
|                     | `HighIVThreshold`   | `Number`          | `85.00`                          | IV percentage at or above this counts as high IV.                                                                    |
|                     | `LogWebhook`        | `String`          | `""`                             | Discord webhook URL. Empty or `Webhook` disables webhook output.                                                     |
| **Ownership**       | `OwnerIDs`          | `Array`           | `["1101294362505269379", "..."]` | Discord user IDs allowed to run commands.                                                                            |
|                     | `CommandPrefix`     | `String`          | `"!"`                            | Command prefix, for example `!help`. Must not clash with another bot in the same server.                             |
| **Global Settings** | `GlobalCatch`       | `Boolean`         | `false`                          | Catch in every visible channel except blacklisted guilds.                                                            |
|                     | `BlacklistedGuilds` | `Array`           | `["716390832034414685", "..."]`  | Guild IDs where CatchTwo never catches.                                                                              |
| **Hunting**         | `HuntPokemons`      | `Array`           | `["rayquaza", "solosis"]`        | Species the hunt account should catch.                                                                               |
|                     | `HuntToken`         | `String`          | `"HuntToken"`                    | Hunt account token. Empty, `HuntToken` or `...` uses the main account.                                               |
| **Captcha Solving** | `key`               | `String`          | `""`                             | CatchTwo captcha solver API key. Empty disables solving.                                                             |
| **Debug**           | `debug`             | `Boolean`         | `true`                           | Print extra diagnostic output.                                                                                       |

`logging.Ping` controls owner mentions independently from logging:

```js
Ping: {
  Shiny: true,
  Gigantamax: false,
  Rares: false,
  HighIV: false,
  LowIV: false,
}
```

All six categories must be present. Omit `Ping` entirely to keep the legacy `Pokemon`-based ping behavior.

## Commands

All commands are owner-only and use the configured prefix, `!` by default.

| Command   | Options                              | Description                                                                                                                           |
| :-------- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| `help`    | `[command]`                          | List commands, or show details for one command.                                                                                       |
| `say`     | `<message>`                          | Repeat a message.                                                                                                                     |
| `click`   | `[messageID] <button> [row]`         | Click a button on a message.                                                                                                          |
| `pause`   | `[@user\|userID]`                    | Pause catching for all accounts, or for one account.                                                                                  |
| `react`   | `[messageID] [emoji]`                | React to a message with an emoji, or with its first existing reaction.                                                                |
| `restart` |                                      | Restart CatchTwo.                                                                                                                     |
| `resume`  | `[@user\|userID]`                    | Resume catching for all accounts, or for one account. Alias: `solved`.                                                                |
| `alias`   | `<command>`                          | List the aliases of a command.                                                                                                        |
| `stats`   | `[pokemon\|general] [@user\|userID]` | Show combined stats, or stats for one account. A bare mention defaults to the general view.                                           |
| `join`    | `<invite/invitecode>`                | **Currently unavailable.** Attempts to join the server for the invite code you specify. Will return once invite joining is supported. |
| `predict` | `[imageURL]`                         | Predict the Pokémon in an attached image, a replied-to message, or a linked image.                                                    |
| `ping`    |                                      | Check the bot's latency.                                                                                                              |
| `support` |                                      | Send the CatchTwo support server invite.                                                                                              |
| `version` |                                      | Show CatchTwo, Node.js and discord-self-lite versions.                                                                                |
| `eval`    | `<code>`                             | Evaluate JavaScript. Debug mode only.                                                                                                 |

## Support

Join the [Discord server](https://discord.gg/tXa2Hw5jHy) for help, updates and feature requests, or use [Discussions](https://github.com/kyan0045/CatchTwo/discussions).

## Contributing

Contributions are welcome. New features and behavior changes need an issue or discussion first.

- Read the [Contributing Guide](./CONTRIBUTING.md) before you start.
- Writing code with an AI agent? Read [AGENTS.md](./AGENTS.md) and disclose the model in your pull request.
- Report bugs, request features or ask anything else through the issue templates in [`.github/ISSUE_TEMPLATE/`](./.github/ISSUE_TEMPLATE/). Dependency updates are handled weekly by `.github/dependabot.yml`.
- Run `npm test`, `npm run lint` and `npm run format:check` before opening a pull request.

## Related

[@kyan0045](https://github.com/kyan0045) also maintains [PokeHint](https://github.com/kyan0045/pokehint), the open-source library for Pokétwo hint solving and rarity checks that CatchTwo depends on.

Other projects:

- **[Spammer](https://github.com/kyan0045/spammer):** A Discord spammer. Use it responsibly.
- **[More projects](https://github.com/kyan0045?tab=repositories):** Tools and utilities from the same author.

## License

CatchTwo is released under a [custom license](https://github.com/kyan0045/CatchTwo/blob/main/LICENSE).
