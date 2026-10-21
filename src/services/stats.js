// Stats are intentionally in-memory only and reset on restart
const accountStats = {};

function getAccountStat(id, stat) {
  if (!accountStats[id]) createAccountStats(id);

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
  if (!accountStats[id]) createAccountStats(id);
  const value = amount === undefined ? 1 : Number(amount);
  if (!Number.isFinite(value)) {
    console.warn(
      `[STATS] Ignoring non-numeric amount "${amount}" for "${stat}".`
    );
    return;
  }

  const catchTypes = [
    "shiny",
    "gigantamax",
    "legendary",
    "mythical",
    "ultrabeast",
    "event",
    "regional",
  ];

  if (catchTypes.includes(stat)) {
    accountStats[id].catches[stat] += value;
    accountStats[id].catches.total += value;
    accountStats[id].general.lastCatch = Date.now();
  } else if (stat === "catches") {
    accountStats[id].catches.total += value;
    accountStats[id].general.lastCatch = Date.now();
  } else if (stat === "coins" || stat === "spamMessages") {
    accountStats[id].general[stat] += value;
  } else {
    console.warn(`[STATS] Unknown stat "${stat}" not counted.`);
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
