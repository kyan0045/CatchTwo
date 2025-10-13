const accountStates = {};

function setSpamming(id, value) {
  if (!accountStates[id]) {
    accountStates[id] = { spamming: true, waiting: false };
  }
  accountStates[id].spamming = value;
}

function setWaiting(id, value) {
  if (!accountStates[id]) {
    accountStates[id] = { spamming: true, waiting: false };
  }
  accountStates[id].waiting = value;
}

function getSpamming(id) {
  return accountStates[id] ? accountStates[id].spamming : true;
}

function getWaiting(id) {
  return accountStates[id] ? accountStates[id].waiting : false;
}

module.exports = { setSpamming, getSpamming, setWaiting, getWaiting };
