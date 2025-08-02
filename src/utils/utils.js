const config = require("../../config.js");
const { sendLog } = require("../functions/logging.js");
const chalk = require("chalk");

function wait(timeInMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeInMs);
  });
}

function randomInteger(min, max) {
  if (min == max) {
    return min;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function logMemoryUsage() {
  if (!config.debug) return;
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

function getMentions(ownerIDs) {
  const mentions = ownerIDs
    .filter((ownerID) => ownerID.length >= 18)
    .map((ownerID) => `<@${ownerID}>`)
    .join(", ");

  return `${mentions}`;
}

module.exports = { wait, randomInteger, logMemoryUsage, getMentions };
