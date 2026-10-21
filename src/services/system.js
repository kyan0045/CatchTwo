// @ts-check
const config = require("../../config.js");
const { sendLog } = require("./logging.js");
const chalk = require("chalk");

/**
 * @param {number} timeInMs
 * @returns {Promise<void>}
 */
function wait(timeInMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeInMs);
  });
}

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInteger(min, max) {
  if (min === max) {
    return min;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function logMemoryUsage() {
  if (!config.debug) return;
  /**
   * @param {number} bytes
   * @returns {string}
   */
  function bytesToMB(bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }

  const memoryData = process.memoryUsage();
  const rss = memoryData.rss;
  const heapUsed = memoryData.heapUsed;
  const external = memoryData.external;

  setTimeout(logMemoryUsage, 60000);

  sendLog(
    null,
    chalk.bold.underline(`Memory Usage\n`) +
      `                 Total (RSS): ${bytesToMB(rss)}\n` +
      `                 JavaScript Heap: ${bytesToMB(heapUsed)}\n` +
      `                 C++ Objects: ${bytesToMB(external)}`,
    "debug"
  );
}

module.exports = { wait, randomInteger, logMemoryUsage };
