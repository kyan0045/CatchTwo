const chalk = require("chalk");
const { solveHint, getImage } = require("pokehint");

const config = require("../config.json");

const { wait, randomInteger } = require("../utils/utils.js");
const { ShinyHunter } = require("../classes/clients/shinyHunter.js");
const { sendLog, sendCatch } = require("../functions/logging.js");
const { setSpamming, getSpamming, getWaiting, setWaiting } = require("../utils/states.js");

module.exports = async (client, guildId, message) => {
  

};
