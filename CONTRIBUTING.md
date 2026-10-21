# Contributing to CatchTwo

Thanks for wanting to help out, it's always appreciated :)
If you want to chat, find me on Discord at @kyan0045.

## Discuss big changes first

New features and behavior changes should be discussed before any code is written.
Open an [issue](https://github.com/kyan0045/CatchTwo/issues) or a
[discussion](https://github.com/kyan0045/CatchTwo/discussions) with what you want
to add and why. This saves you from building something that doesn't fit the
project.

Small fixes (bugs, typos, dependency updates) don't need a pre-discussion,
just send the PR.

## Pull requests

- One logical change per PR. Don't mix a refactor with a feature with a docs
  fix.
- Keep commits atomic, one change per commit.
- Use conventional commits: `fix:`, `feat:`, `docs:`, `chore:`, `refactor:`,
  `perf:`, `test:`. Scope is optional, e.g. `fix(catching): ...`.
- Write a clear log message. One line is fine for small changes, bigger changes
  get a short body saying what changed and why.
- Say what you actually ran. If the PR claims something is verified, show how:
  `node --check src/...`, a smoke run, a test command. No unverified claims.
- Keep dependency updates isolated. Include `package-lock.json` when it changes,
  and report the checks you ran for the update.
- Don't commit line-ending noise. The repo normalizes via `.gitattributes`, so
  keep diffs to real content changes.
- Never commit secrets. `tokens.txt` and your local `config.js` values stay out
  of the repo.
- Be patient. PRs are reviewed when there is time, not 24/7.

## Generated files

`src/vendor/tfjs.cjs` is a generated TensorFlow.js bundle. Do not edit it by
hand. Rebuild it with `npm run build:tfjs` after changing the pinned
`@tensorflow/tfjs` version.

## Coding conventions

Read the existing code and follow it. We optimize for readability.

- This is open source. Consider the people who will read your code and make the
  ride as smooth as possible.
- Describe what you're adding with comments where it genuinely helps a reader.
- Comments describe the code as it is now. Do not reference a previous state or
  explain what a change fixed; whoever reads the code has never seen the old
  version. If a comment only makes sense next to the code it replaced, it does
  not belong.
- Match the formatting and naming already used in the file you're touching.

## Using AI agents

Agents are allowed, but they must be disclosed.

- State in the PR body that an agent was used, and name the model it ran on.
  Naming the harness (OpenCode, Claude Code, etc.) is recommended but not
  required.
- You are responsible for the agent's output. Read the diff before you submit.
- Agent-written commit descriptions must be tight and precise: no em-dashes, no
  filler, no slopified language. Plain sentences that say what changed.

Thanks,
Kyan Bosman
