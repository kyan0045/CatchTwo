// @ts-check
const WRONG_POKEMON_MESSAGE = "That is the wrong pokémon!";

const HINT_MESSAGES = ["h", "hint"];

/**
 * @param {string} userId
 * @returns {string}
 */
function caughtMessage(userId) {
  return `Congratulations <@${userId}>! You caught`;
}

const CAUGHT_MESSAGE_PATTERN = /Level (\d+) ([^<]+)(<:[^>]+>) \(([^)]+%)\)/;

/**
 * @param {string} content
 * @returns {boolean}
 */
function isWrongPokemonMessage(content) {
  return typeof content === "string" && content.includes(WRONG_POKEMON_MESSAGE);
}

/**
 * @param {string} content
 * @param {string} userId
 * @returns {boolean}
 */
function isCaughtMessage(content, userId) {
  return typeof content === "string" && content.includes(caughtMessage(userId));
}

/**
 * @typedef {object} ParsedCatch
 * @property {string} level
 * @property {string} name
 * @property {string} gender
 * @property {number} iv
 * @property {boolean} shiny
 * @property {boolean} gigantamax
 */

// Parse a Pokétwo "You caught" message, or return null when it does not match.
/**
 * @param {string} content
 * @returns {ParsedCatch | null}
 */
function parseCatchMessage(content) {
  if (typeof content !== "string") return null;
  const match = content.match(CAUGHT_MESSAGE_PATTERN);
  if (!match) return null;

  const [, level, unTrimmedName, gender, ivPercent] = match;
  if (!level || !unTrimmedName || !gender || !ivPercent) return null;

  return {
    level,
    name: unTrimmedName.trim(),
    gender,
    iv: Number.parseFloat(ivPercent),
    shiny: content.includes("✨"),
    gigantamax: content.includes("Gigantamax"),
  };
}

module.exports = {
  HINT_MESSAGES,
  WRONG_POKEMON_MESSAGE,
  CAUGHT_MESSAGE_PATTERN,
  caughtMessage,
  isWrongPokemonMessage,
  isCaughtMessage,
  parseCatchMessage,
};
