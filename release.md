# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-beta.5] - 2026-11-25

### Highlights

Beta.5 moves to a smaller 382k catch model, improves multi-channel queue scheduling, hardens captcha and pause handling, and switches the license to GPL-3.0-or-later.

### Added

- Compact 382k GAP-to-1303 catch model with logit temperature scaling (`T = 0.538`). The model ships as a single float16 shard (~748 KB, down from ~3.3 MB across two shards).
- Start wrapper (`scripts/start.js`) that tunes Linux glibc malloc arena and trim settings and forwards `SIGINT`/`SIGTERM`.
- Catch-name mappings for `Mime Jr.`, `MissingNo.`, `Type: Null`, `Unown` forms, `Dudunsparce`, `Toxtricity`, and `Maushold`.

### Changed

- Switched the project license to `GPL-3.0-or-later`.
- `HuntPokemons` matches both exact form names and collapsed base species, and sends the mapped catch name to the hunt account.
- Suspension owner alerts now use existing cached DM channels only, matching captcha alerts.
- Console logs keep the account username prefix on `info`, `warning`, and `error` messages.
- Updated README config defaults (`Pokemon`, `LogWebhook`, `debug`, `Ping`) and documented that setting `captchaSolving.key` sends your Discord token and user ID to `captchasolver.kyanbosman.com`.

### Fixed

- Ready sends on other channels are no longer blocked by a rate-limited channel, and urgent or cross-channel sends wake a sleeping queue immediately.
- Refused spam sends drop cleanly after max attempts instead of rejecting.
- High/low IV special catches now record rarity stats, combine IV and rarity labels, and respect both `SpecialCatches` and IV logging/ping settings.
- `getMentions` and owner ID checks accept valid 17-digit snowflakes via shared `isSnowflake`.
- Incense end and buy failures no longer clear the paused/waiting state, and catch/hint/setup sends check `canSend` before sending.
- Captcha DM deduplication parses ISO `message.timestamp`, and captcha solver polling exits immediately when resumed, stopped, or suspended.
- Non-Poketwo messages and non-string contents are ignored in `misc.js` quest and coin handlers.
- `!click` and `!predict` resolve replies via `fetchReference()` when `message.reference` is null, and `!predict` falls back to a URL argument if the replied message has no image.
- `scripts/mergeConfig.js` handles CRLF and both `// Debug` and `// Debug mode` anchors; `start.bat` resets `STASHED_CONFIG` after `git stash pop`.

## [2.0.0-beta.4] - 2026-11-17

### Highlights

Beta.4 hardens captcha recovery, gateway reconnects, and button clicking.

### Added

- `!click` accepts Discord message links, including messages in other channels.
- Help and README examples cover the message link form.

### Changed

- Captcha result polling uses incremental backoff from 45 seconds to 5.5 minutes, with 10 requests instead of 20 fixed polls.
- Captcha DMs only use an existing cached DM channel. CatchTwo no longer calls `createDM()` for alerts.
- Updated `discord-self-lite` to 0.2.3.
- Gateway reconnects without a maximum attempt limit. Fatal gateway errors tear down the catcher.
- Rate-limit lookup uses the library's resolved bucket key.

### Fixed

- Resume incense after solver success and after `!solved`.
- Send the resume command through a configured incense channel and fall back to the captcha channel.
- Use the command guild for fetched messages, fixing `Unknown Integration`.
- Report fatal login failures once with account and `tokens.txt` line context.
- Log when a captcha DM is skipped because no existing DM channel is present.

## [2.0.0-beta.3] - 2026-11-02

### Highlights

Beta.3 updates the catch model, reduces runtime memory and install size, and removes several runtime dependencies.

### Added

- New 1,303-class model from run `20261102T141243Z-sepconv-accuracy-ft`, with 1,646,551 parameters and 99.8847% top-1 on the cleaned 26,014-image audit split.
- Catch-name mapping for Arceus, Silvally, and Alcremie forms. The model keeps the form classes, but catch commands use the base species.
- CI verification for the float16 model bundle, including exact hashes for `model.json`, both shards, and `labels.json`.

### Changed

- Model weights now ship as float16 and load as float32 at runtime. The model directory is about 3.3MB.
- The vendored TensorFlow.js bundle now includes only `tfjs-core`, `tfjs-layers`, and the CPU backend. It is about 1.14MB, down from 2.07MB.
- The AI model unloads after 15 minutes without a spawn and reloads on demand.
- Catchers start concurrently with a 250ms delay instead of one second per account.
- Runtime dependencies now use native `fetch`, `node:fs`, and a local `HH:mm` formatter. Removed axios, fs-extra, and date-and-time.
- The start scripts set `--max-old-space-size=256`.
- Finizen, Palafin, and Hero Palafin now fall back to hints instead of attempting a direct catch.
- The beta README installs the `dev` branch and links to `main` for the stable release.

### Removed

- Runtime dependency on figlet. The startup banner is now pre-rendered at build time.
- The `Type` and `Beta Sentret` model classes.

### Fixed

- Quest track completions that reward a background now log the correct reward type instead of an unknown badge.

### Breaking

- The model class set changed. Use the bundled `model.json`, weight shards, and `labels.json` together.

## [2.0.0-beta.2] - 2026-10-23

2.0.0-beta.2 is a follow-up to beta.1. It lowers installation memory use, which mitigates failures on small VPS hosts, and splits event and regional pings from rares.

### Added

- `logging.Ping.Event` and `logging.Ping.Regional` flags, so event and regional catches can ping separately from rares.
- `npm run build:tfjs` and a CI check that rebuilds `src/vendor/tfjs.cjs` and fails if the committed bundle is stale.
- Third-party license texts and `THIRD_PARTY_NOTICES.md` for the vendored TensorFlow.js bundle.

### Changed

- TensorFlow.js now ships as a 2.1MB `src/vendor/tfjs.cjs` bundle. Production installs use `npm install --omit=dev`, keep `node_modules` at about 75MB, and no longer download the 272MB npm tree. This lowers install memory use and mitigates OOM failures on small VPS hosts with 256MB of memory.
- `Rares` now covers Legendary, Mythical, and Ultra Beast catches only.
- Quest pings follow `logging.Quests`. `logging.Ping.Quests` was removed.
- Captcha solver submission and result polling use the updated `captchasolver.kyanbosman.com`.
- Incense purchase logs include the channel name alongside the channel ID.

### Fixed

- Failed token logins now report the account number, `tokens.txt` line, and a short token prefix. The full token is redacted from the error text.
- `tokens.txt` is parsed line by line, so unpaired values report the offending line.
- The README Ping example no longer lists `Quests`.

### Breaking

- Add `Event` and `Regional` to `logging.Ping`, and remove `Ping.Quests`. Existing `Ping` blocks must be updated.
