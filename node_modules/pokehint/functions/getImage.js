async function getImage(pokemon, shiny) {
  const pokemonName = pokemon.toLowerCase();
  const shinyState = shiny ? true : false;

  if (!pokemonName)
    throw new Error(
      "[PokeHint] Could not find a pokemon name to get the image of."
    );

  const images = require("../data/images/images.json");
  let image = images[pokemonName];
  if (!image)
    throw new Error(
      `[PokeHint] Unable to find an image for the Pokemon: ${pokemonName}`
    );
  if (shinyState == true) {
    image = image.replace("images", "shiny");
  }
  return image;
}

module.exports = getImage;