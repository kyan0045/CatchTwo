// @ts-check
const POKETWO_ID = "716390085896962058";
const POKETWO_MENTION = `<@${POKETWO_ID}>`;

/**
 * @param {unknown} value
 * @returns {value is string}
 */
function isSnowflake(value) {
  return typeof value === "string" && /^\d{16,20}$/.test(value);
}

module.exports = {
  POKETWO_ID,
  POKETWO_MENTION,
  isSnowflake,
};
