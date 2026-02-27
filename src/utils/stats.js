const accountStats = {};

function getAccountStat(id, stat) {
  if (!accountStats[id] && id !== null)
    createAccountStats(id);

  switch (stat) {
    case "shiny":
      return accountStats[id].catches.shiny;
    case "gigantamax":
      return accountStats[id].catches.gigantamax;
    case "legendary":
      return accountStats[id].catches.legendary;
    case "mythical":
      return accountStats[id].catches.mythical;
    case "ultrabeast":
      return accountStats[id].catches.ultrabeast;
    case "event":
      return accountStats[id].catches.event;
    case "regional":
      return accountStats[id].catches.regional;
    case "total":
      return accountStats[id].catches.total;
    case "coins":
      return accountStats[id].general.coins;
    case "spamMessages":
      return accountStats[id].general.spamMessages;
    case "lastCatch":
      return accountStats[id].general.lastCatch;
    default:
      return accountStats[id];
  }
}

function getTotalStats() {
  const totalStat = {
    catches: {
      shiny: 0,
      gigantamax: 0,
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
    totalStat.catches.gigantamax += account.catches.gigantamax;
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

function addStat(id, stat, amount) {
  if (!accountStats[id] && id !== null)
    createAccountStats(id);
  if (!amount) amount = 1;

  switch (stat) {
    case "shiny":
      accountStats[id].catches.shiny += amount;
      accountStats[id].catches.total += amount;
      accountStats[id].general.lastCatch = Date.now();
      break;
    case "gigantamax":
      accountStats[id].catches.gigantamax += amount;
      accountStats[id].catches.total += amount;
      accountStats[id].general.lastCatch = Date.now();
      break;
    case "legendary":
      accountStats[id].catches.legendary += amount;
      accountStats[id].catches.total += amount;
      accountStats[id].general.lastCatch = Date.now();
      accountStats[id].general.lastCatch = Date.now();
      break;
    case "mythical":
      accountStats[id].catches.mythical += amount;
      accountStats[id].catches.total += amount;
      accountStats[id].general.lastCatch = Date.now();
      break;
    case "ultrabeast":
      accountStats[id].catches.ultrabeast += amount;
      accountStats[id].catches.total += amount;
      accountStats[id].general.lastCatch = Date.now();
      break;
    case "event":
      accountStats[id].catches.event += amount;
      accountStats[id].catches.total += amount;
      accountStats[id].general.lastCatch = Date.now();
      break;
    case "regional":
      accountStats[id].catches.regional += amount;
      accountStats[id].catches.total += amount;
      accountStats[id].general.lastCatch = Date.now();
      break;
    case "catches":
      accountStats[id].catches.total += amount;
      accountStats[id].general.lastCatch = Date.now();
      break;
    case "coins":
      accountStats[id].general.coins += +amount;
      break;
    case "spamMessages":
      accountStats[id].general.spamMessages += amount;
      break;
    default:
      return;
  }
}

function createAccountStats(id) {
  accountStats[id] = {
    catches: {
      shiny: 0,
      gigantamax: 0,
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
