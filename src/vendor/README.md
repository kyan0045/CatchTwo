# Vendored TensorFlow.js

`tfjs.cjs` is a generated bundle of the pinned `@tensorflow/tfjs` version. It is
committed so production installs do not download the full TensorFlow.js
dependency tree.

Do not edit `tfjs.cjs` manually. Rebuild it with:

```bash
npm install
npm run build:tfjs
```

The bundle is loaded lazily by `src/services/ai.js` only when AI catching is
enabled. See `THIRD_PARTY_NOTICES.md` for licensing.
