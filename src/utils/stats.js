const accountStats = {};

function getAccountStat(username, stat) {
  if (!accountStats[username] && username !== null)
    createAccountStats(username);

  switch (stat) {
    case "shiny":
      return accountStats[username].catches.shiny;
    case "legendary":
      return accountStats[username].catches.legendary;
    case "mythical":
      return accountStats[username].catches.mythical;
    case "ultrabeast":
      return accountStats[username].catches.ultrabeast;
    case "event":
      return accountStats[username].catches.event;
    case "regional":
      return accountStats[username].catches.regional;
    case "total":
      return accountStats[username].catches.total;
    case "coins":
      return accountStats[username].general.coins;
    case "spamMessages":
      return accountStats[username].general.spamMessages;
    case "lastCatch":
      return accountStats[username].general.lastCatch;
    default:
      return accountStats[username];
  }
}

function getTotalStats() {
  const totalStat = {
    catches: {
      shiny: 0,
      legendary: 0,
      mythical: 0,
      ultrabeast: 0,
      event: 0,
      regional: 0,
      total: 0,
    },
    general: { coins: 0, spamMessages: 0, lastCatch: 0 },
  };

  if (Object.keys(accountStats).length === 0) return totalStat;
  if (Object.keys(accountStats).length === 1)
    return accountStats[Object.keys(accountStats)[0]];
  Object.values(accountStats).forEach((account) => {
    totalStat.catches.shiny += account.catches.shiny;
    totalStat.catches.legendary += account.catches.legendary;
    totalStat.catches.mythical += account.catches.mythical;
    totalStat.catches.ultrabeast += account.catches.ultrabeast;
    totalStat.catches.event += account.catches.event;
    totalStat.catches.regional += account.catches.regional;
    totalStat.catches.total += account.catches.total;
    totalStat.general.coins += account.general.coins;
    totalStat.general.spamMessages += account.general.spamMessages;
    totalStat.general.lastCatch = Math.max(
      totalStat.general.lastCatch,
      account.general.lastCatch
    );
  });

  return totalStat;
}

function addStat(username, stat, amount) {
  if (!accountStats[username] && username !== null)
    createAccountStats(username);
  if (!amount) amount = 1;

  switch (stat) {
    case "shiny":
      accountStats[username].catches.shiny += amount;
      accountStats[username].catches.total += amount;
      accountStats[username].general.lastCatch = Date.now();
      break;
    case "legendary":
      accountStats[username].catches.legendary += amount;
      accountStats[username].catches.total += amount;
      accountStats[username].general.lastCatch = Date.now();
      accountStats[username].general.lastCatch = Date.now();
      break;
    case "mythical":
      accountStats[username].catches.mythical += amount;
      accountStats[username].catches.total += amount;
      accountStats[username].general.lastCatch = Date.now();
      break;
    case "ultrabeast":
      accountStats[username].catches.ultrabeast += amount;
      accountStats[username].catches.total += amount;
      accountStats[username].general.lastCatch = Date.now();
      break;
    case "event":
      accountStats[username].catches.event += amount;
      accountStats[username].catches.total += amount;
      accountStats[username].general.lastCatch = Date.now();
      break;
    case "regional":
      accountStats[username].catches.regional += amount;
      accountStats[username].catches.total += amount;
      accountStats[username].general.lastCatch = Date.now();
      break;
    case "catches":
      accountStats[username].catches.total += amount;
      accountStats[username].general.lastCatch = Date.now();
      break;
    case "coins":
      accountStats[username].general.coins += +amount;
      break;
    case "spamMessages":
      accountStats[username].general.spamMessages += amount;
      break;
    default:
      return;
  }
}

function createAccountStats(username) {
  accountStats[username] = {
    catches: {
      shiny: 0,
      legendary: 0,
      mythical: 0,
      ultrabeast: 0,
      event: 0,
      regional: 0,
      total: 0,
    },
    general: { coins: 0, spamMessages: 0, lastCatch: 0 },
  };
}

module.exports = { getAccountStat, getTotalStats, addStat, createAccountStats };
