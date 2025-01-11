const accountStates = {};

function setSpamming(username, value) {
  if (!accountStates[username]) {
    accountStates[username] = { spamming: true, waiting: false };
  }
  accountStates[username].spamming = value;
}

function setWaiting(username, value) {
  if (!accountStates[username]) {
    accountStates[username] = { spamming: true, waiting: false };
  }
  accountStates[username].waiting = value;
}

function getSpamming(username) {
  return accountStates[username] ? accountStates[username].spamming : true;
}

function getWaiting(username) {
  return accountStates[username] ? accountStates[username].waiting : false;
}

module.exports = { setSpamming, getSpamming, setWaiting, getWaiting };
