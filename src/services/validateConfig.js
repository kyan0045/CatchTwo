// @ts-check
/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isSnowflake(value) {
  return typeof value === "string" && /^\d{16,20}$/.test(value);
}

/**
 * @param {unknown} input
 * @returns {{ errors: string[], warnings: string[] }}
 */
function validateConfig(input) {
  /** @type {Record<string, any>} */
  const config =
    input !== null && typeof input === "object"
      ? /** @type {Record<string, any>} */ (input)
      : {};
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];

  const behavior = config?.behavior;
  if (!behavior || typeof behavior !== "object") {
    errors.push(
      "behavior must be an object with AI, Catching, and Spamming booleans"
    );
  } else {
    for (const key of ["AI", "Catching", "Spamming"]) {
      if (typeof behavior[key] !== "boolean") {
        errors.push(`behavior.${key} must be a boolean`);
      }
    }
  }

  const incense = config?.incense ?? {};
  for (const key of ["IncenseMode", "AutoIncenseBuy"]) {
    if (typeof incense[key] !== "boolean") {
      errors.push(`incense.${key} must be a boolean`);
    }
  }
  if (typeof incense.IncenseChannel !== "string") {
    errors.push("incense.IncenseChannel must be a string");
  } else if (
    incense.IncenseChannel === "ChannelID" ||
    incense.IncenseChannel === "..."
  ) {
    warnings.push("incense.IncenseChannel still holds a placeholder value");
  }

  const rawSpeed = config?.spamming?.SpamSpeed;
  const speed = Number(rawSpeed);
  if (!Number.isFinite(speed)) {
    errors.push(
      `spamming.SpamSpeed must be a number of milliseconds (got ${JSON.stringify(rawSpeed)})`
    );
  } else if (speed < 1000 || speed > 120000) {
    errors.push(
      `spamming.SpamSpeed must be between 1000 and 120000ms (got ${speed})`
    );
  } else if (typeof rawSpeed !== "number") {
    warnings.push(
      `spamming.SpamSpeed should be a Number, not ${typeof rawSpeed} - setInterval coerces strings, but NaN becomes 1ms`
    );
  }
  if (
    config?.spamming?.SpamChannel === undefined ||
    typeof config.spamming.SpamChannel !== "string"
  ) {
    errors.push("spamming.SpamChannel must be a string");
  }

  const logging = config?.logging ?? {};
  for (const key of [
    "Pokemon",
    "Quests",
    "LowIV",
    "HighIV",
    "SpecialCatches",
  ]) {
    if (typeof logging[key] !== "boolean") {
      errors.push(`logging.${key} must be a boolean`);
    }
  }
  for (const key of ["LowIVThreshold", "HighIVThreshold"]) {
    if (
      typeof logging[key] !== "number" ||
      logging[key] < 0 ||
      logging[key] > 100
    ) {
      errors.push(`logging.${key} must be a number 0-100`);
    }
  }
  if (
    typeof logging.LowIVThreshold === "number" &&
    typeof logging.HighIVThreshold === "number" &&
    logging.LowIVThreshold >= logging.HighIVThreshold
  ) {
    errors.push("logging.LowIVThreshold must be below HighIVThreshold");
  }
  if (
    logging.LogWebhook === undefined ||
    typeof logging.LogWebhook !== "string"
  ) {
    errors.push("logging.LogWebhook must be a string (empty to disable)");
  } else if (
    logging.LogWebhook !== "Webhook" &&
    logging.LogWebhook.length > 0 &&
    !logging.LogWebhook.startsWith("https://discord.com/api/webhooks/")
  ) {
    warnings.push(
      "logging.LogWebhook does not look like a Discord webhook URL"
    );
  }

  const ownership = config?.ownership ?? {};
  if (!Array.isArray(ownership.OwnerIDs) || ownership.OwnerIDs.length === 0) {
    errors.push("ownership.OwnerIDs must be a non-empty array of user IDs");
  } else {
    for (const id of ownership.OwnerIDs) {
      if (id === "...") continue;
      if (!isSnowflake(id)) {
        warnings.push(`ownership.OwnerIDs contains non-snowflake value: ${id}`);
      }
    }
  }
  if (
    typeof ownership.CommandPrefix !== "string" ||
    ownership.CommandPrefix.length === 0
  ) {
    errors.push("ownership.CommandPrefix must be a non-empty string");
  }

  const globalSettings = config?.globalSettings;
  if (!globalSettings || typeof globalSettings !== "object") {
    errors.push("globalSettings must be an object");
  } else {
    if (typeof globalSettings.GlobalCatch !== "boolean") {
      errors.push("globalSettings.GlobalCatch must be a boolean");
    }
    if (!Array.isArray(globalSettings.BlacklistedGuilds)) {
      errors.push("globalSettings.BlacklistedGuilds must be an array");
    }
  }

  const hunting = config?.hunting;
  if (!hunting || typeof hunting !== "object") {
    errors.push("hunting must be an object");
  } else {
    if (!Array.isArray(hunting.HuntPokemons)) {
      errors.push("hunting.HuntPokemons must be an array");
    }
    if (typeof hunting.HuntToken !== "string") {
      errors.push("hunting.HuntToken must be a string");
    } else if (
      hunting.HuntToken === "HuntToken" ||
      hunting.HuntToken === "..."
    ) {
      warnings.push("hunting.HuntToken still holds a placeholder value");
    }
  }

  const captchaSolving = config?.captchaSolving;
  if (!captchaSolving || typeof captchaSolving !== "object") {
    errors.push('captchaSolving must be an object (set key to "" to disable)');
  } else if (typeof captchaSolving.key !== "string") {
    errors.push("captchaSolving.key must be a string");
  }

  if (config?.debug !== undefined && typeof config.debug !== "boolean") {
    errors.push("debug must be a boolean when present (omit to default false)");
  }

  return { errors, warnings };
}

/**
 * @param {unknown} config
 * @returns {void}
 */
function assertValidConfig(config) {
  const { errors, warnings } = validateConfig(config);
  for (const warning of warnings) {
    console.warn(`[CONFIG] Warning: ${warning}`);
  }
  if (errors.length > 0) {
    throw new Error(`Invalid config:\n- ${errors.join("\n- ")}`);
  }
}

module.exports = { validateConfig, assertValidConfig };
