# Third-party notices

`src/vendor/tfjs.cjs` is a generated bundle of TensorFlow.js 4.22.0 and its
runtime dependencies. It is committed to the repository so production installs
do not download the TensorFlow.js npm tree.

## Bundled packages

| Package                          | Version | License            | License text                                         |
| -------------------------------- | ------- | ------------------ | ---------------------------------------------------- |
| `@tensorflow/tfjs`               | 4.22.0  | Apache-2.0         | `LICENSES/Apache-2.0.txt`                            |
| `@tensorflow/tfjs-core`          | 4.22.0  | Apache-2.0         | `LICENSES/Apache-2.0.txt`                            |
| `@tensorflow/tfjs-layers`        | 4.22.0  | Apache-2.0 AND MIT | `LICENSES/Apache-2.0.txt`, `LICENSES/MIT-google.txt` |
| `@tensorflow/tfjs-converter`     | 4.22.0  | Apache-2.0         | `LICENSES/Apache-2.0.txt`                            |
| `@tensorflow/tfjs-data`          | 4.22.0  | Apache-2.0         | `LICENSES/Apache-2.0.txt`                            |
| `@tensorflow/tfjs-backend-cpu`   | 4.22.0  | Apache-2.0         | `LICENSES/Apache-2.0.txt`                            |
| `@tensorflow/tfjs-backend-webgl` | 4.22.0  | Apache-2.0         | `LICENSES/Apache-2.0.txt`                            |
| `long`                           | 4.0.0   | Apache-2.0         | `LICENSES/Apache-2.0.txt`                            |
| `node-fetch`                     | 2.6.13  | MIT                | `LICENSES/MIT-node-fetch.txt`                        |
| `whatwg-url`                     | 5.0.0   | MIT                | `LICENSES/MIT-whatwg-url.txt`                        |
| `tr46`                           | 0.0.3   | MIT                | `LICENSES/MIT-tr46.txt`                              |
| `webidl-conversions`             | 3.0.1   | BSD-2-Clause       | `LICENSES/BSD-2-Clause-webidl-conversions.txt`       |
| `seedrandom`                     | 3.0.5   | MIT                | `LICENSES/MIT-seedrandom.txt`                        |
| `alea` (embedded in tfjs-layers) | n/a     | MIT                | `LICENSES/MIT-alea.txt`                              |

The Apache-2.0 license headers of the TensorFlow.js sources are also preserved
at the end of the generated bundle.

Rebuild the bundle with `npm run build:tfjs`.
