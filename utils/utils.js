const config = require("../config.json");
const { sendLog } = require("../functions/logging.js");

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
  function bytesToMB(bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }
  const memoryUsage = process.memoryUsage.rss();
  setTimeout(logMemoryUsage, 60000);
  sendLog(null, `Memory Usage: ${bytesToMB(memoryUsage)}`, "debug");
}



module.exports = { wait, randomInteger, logMemoryUsage };