# iterm2-version [![Build Status](https://travis-ci.org/sindresorhus/iterm2-version.svg?branch=master)](https://travis-ci.org/sindresorhus/iterm2-version)

> Get the [iTerm2](https://www.iterm2.com) version

Note: The `2` in iTerm2 is [part of the name](https://en.wikipedia.org/wiki/ITerm2) and does not indicate the version.


## Install

```
$ npm install iterm2-version
```


## Usage

```js
const iterm2Version = require('iterm2-version');

iterm2Version();
//=> '3.0.15'
```

If you're running this on a different terminal or operating system, it will return `undefined`.


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
