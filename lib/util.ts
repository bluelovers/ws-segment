import findCacheDir = require('find-cache-dir');
import path = require('path');
import * as fs from 'fs-extra';
import * as os from 'os';
import { exec, execSync } from 'child_process';

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
	let ret = findCacheDir({
		name: PACKAGE_JSON.name,
		create: true,
	});

	if (!ret)
	{
		let k = getNpmCacheEnv();

		if (k && fs.existsSync(k))
		{
			ret = k;
		}
		else if (k = os.homedir())
		{
			ret = k;
		}
		else
		{
			ret = process.cwd();
		}

		if (ret)
		{
			ret = path.join(k, '.cache', PACKAGE_JSON.name);

			fs.ensureDirSync(ret);
		}
	}

	return ret;
}

export function getNpmCacheEnv()
{
	let k = execSync('npm config get cache');
	return k.toString().trim();
}

import * as self from './util';
export default self;
