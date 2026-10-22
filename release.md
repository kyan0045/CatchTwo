# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
