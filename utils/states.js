let spamming = true;
let waiting = false;

function setSpamming(value) {
  spamming = value;
}

function setWaiting(value) {
  waiting = value;
}

function getSpamming() {
  return spamming;
}

function getWaiting() {
  return waiting;
}

module.exports = { setSpamming, getSpamming, setWaiting, getWaiting};
