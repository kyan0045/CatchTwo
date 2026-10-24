// Bundle only the pieces this project uses: core ops, layers, and the CPU
// backend.
const core = require("@tensorflow/tfjs-core");
require("@tensorflow/tfjs-backend-cpu");
const layers = require("@tensorflow/tfjs-layers");

module.exports = Object.assign({}, core, layers);
