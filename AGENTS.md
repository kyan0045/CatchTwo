# Agents

Human rules live in [CONTRIBUTING.md](CONTRIBUTING.md). Read it first.
This file only covers what applies to agents specifically.

## Required

- Disclose agent use in every PR body and name the model you ran on.
  Naming the harness is recommended, not required.
- Conventional commits, one logical change per PR.
- Commit descriptions: tight and precise. No em-dashes, no filler, no
  slopified language.
- Verify before claiming. Run `node --check` on changed JavaScript files; use an
  appropriate check for other file types. State exactly what you ran.
- Never stage `tokens.txt` or commit secrets from `config.js`. Those are
  local-only files.
- New features go to an issue or GitHub Discussions first. Do not open a
  feature PR unsolicited.

## Recommended

- Pick your harness, but always state the model.
- Keep diffs free of line-ending churn (see `.gitattributes`).
- Match the existing style of the file you are editing.
- Review your own diff before pushing: drop dead code, stray comments, and
  unrelated changes.
