# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
