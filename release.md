# Changelog

All notable changes to CatchTwo are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-beta.2] - 2026-10-21

### Highlights

CatchTwo 2.0 brings the AI catcher to Android and makes the send path more reliable.

- **AI catching on Android:** the AI now runs through TensorFlow.js without native binaries, so it works on Android with Termux.
- **A better model:** the new 1,279-class model reaches 99.451% validation top-1.
- **Lower memory:** TensorFlow.js loads only when AI is enabled, so AI-disabled runs use about half the memory.
- **Catches come first:** catches, hints, commands, and spam share one priority queue. A full route queue is retried instead of silently dropping the send.
- **More commands:** `ping` and `support` are new, and `predict`, `stats`, `version`, and `help` were reworked.

### Added

- Local AI catch model (`sepconv-1279-real-ft`) with 1,279 classes, 1,621,951 parameters, and 64x64 RGB input. Validation top-1 is 99.451% and top-5 is 99.870%.
- Center-crop preprocessing for live spawn images. The center 0.8x of the shorter side is cropped before the 64x64 resize, and images at or below 128 px are left as-is.
- `CatchTwoRestManager`, a priority send queue for Pokétwo traffic. Catches outrank hints, hints outrank commands, and spam runs last.
- `incense.IncenseChannel` accepts one channel ID or an array of channel IDs for auto-buy.
- Optional nested `logging.Ping` object with boolean flags for shiny, Gigantamax, rare, event, regional, and IV catches, so shinies can ping without pinging every event form. Quest pings follow `logging.Quests`.
- Startup config validation and idempotent config migration.
- `ping` and `support` commands, plus reworked `predict`, `version`, `help`, and `stats` commands.
- Cross-platform setup for Windows, Linux, macOS, and Android (Termux).
- TypeScript `checkJs` coverage for opt-in modules, Prettier, ESLint, and a Node 22/24/26 CI matrix.
- 69 `node:test` tests covering services, commands, queueing, and lifecycle behavior.

### Changed

- **Breaking:** Migrated from `discord.js-selfbot-v13` to `discord-self-lite@0.2.0`. Clients use the library's `restClass` injection, and the queue uses `RestManager.destroy()`, `RouteQueueFullError`, and the gateway channel cache.
- **Breaking:** Stats and account state are keyed by user ID instead of username. Existing username-keyed stats do not carry over.
- **Breaking:** `spamming.SpamSpeed` is a number (default 2000, valid range 1000 to 120000). `logging.LogCatches` is split into `Pokemon`, `Quests`, `LowIV`, `HighIV`, and `SpecialCatches`, with `LowIVThreshold` and `HighIVThreshold`.
- **Breaking:** `logging.Ping` has separate `Event` and `Regional` flags. Quest pings now follow `logging.Quests`, and `Ping.Quests` is removed. Existing `Ping` blocks must add the two new flags.
- **Breaking:** `incense.IncenseMode` now disables spam while enabled. When disabled, incense spawns are ignored. `AutoIncenseBuy` requires `IncenseMode`.
- **Breaking:** The model bundle and `labels.json` must be copied as a set. A model/label mismatch fails before inference.
- Switched from `@tensorflow/tfjs-node` to a vendored `@tensorflow/tfjs` bundle, loaded lazily so AI-disabled runs use about half the memory.
- Vendored TensorFlow.js into a 2.1MB `src/vendor/tfjs.cjs` bundle. Production installs use `npm install --omit=dev` and no longer download its 272MB npm tree, reducing a production `node_modules` to about 75MB. This removes the install OOM on 256MB hosts.
- Replaced the old model weights with the 1,279-class `model.json` bundle and its two shards.
- Outbound Pokétwo traffic now uses a bounded priority queue with per-class deadlines, bucket-aware pacing, and catch protection. Spam yields to catches and is dropped when paused.
- A `null` REST response now means only `204 No Content`. Full route queues reject with `RouteQueueFullError` and are retried before the item's deadline.
- The confidence floor is 0.5. Known weak classes always go to the hint path instead of being caught.
- The 2.0 beta installs from `dev`. The new `start.bat` follows `dev` and switches existing checkouts to it. `npm run update` updates the checked-out branch and preserves local `config.js` and `tokens.txt` changes.
- `package-lock.json` is tracked and CI runs `npm ci`.
- The supported Node baseline is `>=22.13.0`.

### Deprecated

- `incense.IncenseChannel` is still required for `AutoIncenseBuy`, but the setting is deprecated.

### Removed

- `behavior.Sleeping`.
- The assisted-catch path from the 1.3.x `main` branch. The local AI model replaces it.
- `discord.js-selfbot-v13`, `@tensorflow/tfjs-node`, the old `weights.bin`, `src/data/ai.json`, `src/data/levelup.json`, and the old logo assets.
- The per-message channel cache workaround in `listenEvents.js`.
- Temporary spawn calibration logging and analysis scripts.

### Fixed

- Full-scene spawn images are center-cropped to the training framing instead of being squashed, which restores confidence on live 800x500 attachments.
- Queued Pokétwo sends are retried on `RouteQueueFullError` instead of treating a `null` response as a dropped send.
- REST shutdown aborts in-flight requests and rejects queued sends and pending sleeps.
- The 50013 permission check reads `DiscordAPIError.code` instead of `fullError.code`.
- Event handlers no longer fetch and cache each message channel themselves.
- `npm run update` and `npm run force-update` preserve local `config.js` and `tokens.txt` changes.

## Model

- Production run: `20260723T122145Z-sepconv-1279-real-ft` from the `kyan0045/poketwo-ai` repository. Checkpoint SHA-256 starts with `b49e33c3`.
- Live validation at the 0.5 floor: 184 spawns, 182 caught (98.9%). On caught spawns, 180/182 were top-1 (98.9%) and 174/176 were accepted (98.9%).
- Known weak classes always use hints: `Type Null`, `Type`, `Galarian Articuno`, `Galarian Zapdos`, `MissingNo`, `Regieleki`, `Scolipede`, and `Xurkitree`.
