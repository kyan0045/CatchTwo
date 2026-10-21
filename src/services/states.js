// @ts-check
/** @typedef {{ spamming: boolean, waiting: boolean }} AccountState */

/** @type {Record<string, AccountState>} */
const accountStates = {};
/** @type {Set<string>} */
const stoppedAccounts = new Set();

/**
 * @param {string} id
 */
function stopAccount(id) {
  stoppedAccounts.add(id);
  accountStates[id] = { spamming: false, waiting: true };
}

/**
 * @param {string} id
 * @param {boolean} value
 */
function setSpamming(id, value) {
  if (stoppedAccounts.has(id)) return;
  const state = accountStates[id] ?? { spamming: true, waiting: false };
  state.spamming = value;
  accountStates[id] = state;
}

/**
 * @param {string} id
 * @param {boolean} value
 */
function setWaiting(id, value) {
  if (stoppedAccounts.has(id)) return;
  const state = accountStates[id] ?? { spamming: true, waiting: false };
  state.waiting = value;
  accountStates[id] = state;
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function getSpamming(id) {
  const state = accountStates[id];
  return state ? state.spamming : true;
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function getWaiting(id) {
  const state = accountStates[id];
  return state ? state.waiting : false;
}

module.exports = {
  setSpamming,
  getSpamming,
  setWaiting,
  getWaiting,
  stopAccount,
};
