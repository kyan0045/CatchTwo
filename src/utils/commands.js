// @ts-check
// Resolve a command by canonical name or alias
/**
 * @typedef {object} Command
 * @property {string} [name]
 * @property {string[]} [aliases]
 */

/**
 * @param {{ commands: Map<string, Command> }} client
 * @param {string | undefined} name
 * @returns {Command | null}
 */
function findCommand(client, name) {
  if (!name) return null;
  const query = name.toLowerCase();
  return (
    client.commands.get(query) ??
    [...client.commands.values()].find((command) =>
      command?.aliases?.includes(query)
    ) ??
    null
  );
}

module.exports = { findCommand };
