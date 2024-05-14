'use strict';
const execa = require('execa');

function tweakErr(err) {
	if (err.code === 2) {
		err.message = 'Couldn\'t find the app';
	}

	throw err;
}

module.exports = app => {
	if (process.platform !== 'darwin') {
		return Promise.reject(new Error('macOS only'));
	}

	if (typeof app !== 'string') {
		return Promise.reject(new Error('Please supply an app name or bundle identifier'));
	}

	return execa.stdout('./main', [app], {cwd: __dirname}).catch(tweakErr);
};

module.exports.sync = app => {
	if (process.platform !== 'darwin') {
		throw new Error('macOS only');
	}

	if (typeof app !== 'string') {
		throw new Error('Please supply an app name or bundle identifier');
	}

	let stdout = '';

	try {
		stdout = execa.sync('./main', [app], {cwd: __dirname}).stdout;
	} catch (err) {
		tweakErr(err);
	}

	return stdout;
};
