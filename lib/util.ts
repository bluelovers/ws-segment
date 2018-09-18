import findCacheDir = require('find-cache-dir');

import { Console } from 'debug-color2';
export const console = new Console();

import PACKAGE_JSON = require('../package.json');

console.inspectOptions = {
	colors: console.enabledColor
};

export const debugConsole = new Console(null, {
	label: true,
	time: true,
});

debugConsole.inspectOptions = {
	colors: debugConsole.enabledColor
};

debugConsole.enabled = false;

export function enableDebug(bool?: boolean)
{
	if (bool || typeof bool === 'undefined')
	{
		debugConsole.enabled = true;
	}
	else if (bool === false)
	{
		debugConsole.enabled = false;
	}

	return debugConsole.enabled;
}

export function getCacheDirPath(): string
{
	return findCacheDir({
		name: PACKAGE_JSON.name,
		create: true,
	});
}

import * as self from './util';
export default self;
