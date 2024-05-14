# PokeHint

NPM package to automatically solve hints & check the rarity of pokemon, made for pokemon discord bots like Pokétwo

[![](https://img.shields.io/npm/v/pokehint.svg)](https://www.npmjs.com/package/pokehint)

## Installation

Use the package manager [npm](https://www.npmjs.com/package/pokehint) to install the module.

```bash
npm i pokehint
```

## Usage

```javascript
const { solveHint, checkRarity, getName, getImage } = require("pokehint");

// Solving hints
var hint = "The pokémon is Ch_r__n__r.";
console.log(solveHint(hint)); // Logs 'Charmander'.

// Checking the rarity
var pokemonName = "Moltres";
console.log(checkRarity(pokemonName)); // Logs Moltres' rarity: 'Legendary'.

// Converting a name to a different language
console.log(
  getName({
    name: "Charmander",
    language: "French",
    inputLanguage: "English",
  })
); // Logs the French name of Charmander: 'Salamèche'.

// Getting the Pokétwo image sprite of a specified pokemon
console.log(getImage("charmander", false)); // Logs 'https://cdn.poketwo.net/images/4.png'.
```

## Links

- [NPM](https://www.npmjs.com/package/pokehint)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
