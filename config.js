// Runtime configuration. Loaded once at startup; restart after editing.
const config = {
  // Behavior
  behavior: {
    AI: true, // Use the local model before falling back to hints
    Catching: true, // Catch spawns (applies to all accounts)
    Spamming: true // Send spam messages (applies to all accounts)
  },
  // Incense
  incense: {
    IncenseMode: true, // Catch incense spawns and stop spamming; off ignores incense spawns
    AutoIncenseBuy: false, // Buy a new incense when the current one runs out, requires IncenseMode
    IncenseChannel: "ChannelID", // Channel ID or array of channel IDs for automatic purchases; required when AutoIncenseBuy is on. Deprecated.
  },
  // Spamming
  spamming: {
    SpamSpeed: 2000, // Milliseconds between spam messages
    SpamChannel: "" // Channel ID to spam in --> With this empty, it auto-detects
  },
  // Logging
  logging: {
    Pokemon: true, // Log regular catches
    Quests: true, // Log completed quests; quest pings follow this flag
    LowIV: true, // Log catches at or below LowIVThreshold
    HighIV: true, // Log catches at or above HighIVThreshold
    SpecialCatches: true, // Log shiny, Gigantamax and other special catches
    Ping: {
      Shiny: true,
      Gigantamax: true,
      Rares: true,
      Event: true,
      Regional: true,
      HighIV: true,
      LowIV: true,
    },
    LowIVThreshold: 15.00, // IV percentage at or below this counts as low IV
    HighIVThreshold: 85.00, // IV percentage at or above this counts as high IV
    LogWebhook: "Webhook" // Discord webhook URL; empty or "Webhook" disables webhook output
  },
  // Ownership
  ownership: {
    OwnerIDs: ["1101294362505269379", "..."], // Discord user IDs allowed to run commands
    CommandPrefix: "!" // Prefix for commands, for example !help
  },
  // Global catching
  globalSettings: {
    GlobalCatch: false, // Catch in every visible channel except blacklisted guilds
    BlacklistedGuilds: ["716390832034414685", "..."] // Guild IDs where CatchTwo never catches
  },
  // Hunting
  hunting: {
    HuntPokemons: ["rayquaza", "solosis"], // Species the hunt account should catch
    HuntToken: "HuntToken" // Hunt account token; empty, "HuntToken" or "..." uses the main account
  },
  // Captcha solving
  captchaSolving: {
    key: "", // CatchTwo captcha solver API key; empty disables solving
  },
  // Debug
  debug: false // Print extra diagnostic output
};

module.exports = config;
