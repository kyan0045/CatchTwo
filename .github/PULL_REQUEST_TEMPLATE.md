<!--
Read CONTRIBUTING.md first, then AGENTS.md if an agent wrote any of this.
Keep this PR to one logical change. Fill every section; delete only what does not apply.
-->

## What changed

<!-- One or two sentences. Say what changed, not why it matters. -->

## Why

<!-- Link the issue or discussion, or explain the motivation. -->
<!-- New features need an issue/discussion first. Small fixes do not. -->

## Verification

<!-- State exactly what you ran. Do not claim anything you did not actually check. -->

```
# examples
node --check src/<changed>.js
npm run format:check
npm run lint
npm test
```

## Agent use

Delete this section if no agent was involved.

- Model:
- Harness (recommended, not required):

## Checklist

- [ ] One logical change; not mixed with a refactor or unrelated docs
- [ ] Conventional commit message(s): `fix:`, `feat:`, `docs:`, `chore:`, `refactor:`, `perf:`, `test:`
- [ ] Comments describe the code as it is now (no references to a previous state)
- [ ] No secrets staged (`tokens.txt`, local `config.js` values)
- [ ] No line-ending churn (see `.gitattributes`)
