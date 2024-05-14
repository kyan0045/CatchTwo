async function checkRarity(pokemonName) {
  const pokemon = require("../data/main/pokemon.json");
  const legendaries = require("../data/main/legendary.json");
  const mythicals = require("../data/main/mythical.json");
  const ultra_beasts = require("../data/main/ultra-beast.json");
  const regionals = require("../data/main/regional.json");
  const events = require("../data/main/event.json");

  if (!pokemon.includes(pokemonName)) throw new Error(`[PokeHint] Unable to identify the rarity of that pokemon (${pokemonName}).`);
  
  if (legendaries.includes(pokemonName)) return "Legendary";
  if (mythicals.includes(pokemonName)) return "Mythical";
  if (ultra_beasts.includes(pokemonName)) return "Ultra Beast";
  if (regionals.includes(pokemonName)) return "Regional";
  if (events.includes(pokemonName)) return "Event";

  if (pokemon.includes(pokemonName)) return "Regular";
}

module.exports = checkRarity;
