# app-path [![Build Status](https://travis-ci.org/sindresorhus/app-path.svg?branch=master)](https://travis-ci.org/sindresorhus/app-path)

> Get the path to an app *(macOS)*


## Install

```
$ npm install --save app-path
```


## Usage

```js
const appPath = require('app-path');

appPath('Safari').then(path => {
	console.log(path);
	//=> '/Applications/Safari.app'
});

appPath('com.apple.Safari').then(path => {
	console.log(path);
	//=> '/Applications/Safari.app'
});

console.log(appPath('Safari'));
//=> '/Applications/Safari.app'
```



## Related

- [app-path-cli](https://github.com/sindresorhus/app-path-cli) - CLI for this module


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
