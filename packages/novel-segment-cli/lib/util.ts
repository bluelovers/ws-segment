import { getCachePath, findNpmCachePath, getOSTempPath, findPkgModulePath } from 'cache-path';

import { Console } from 'debug-color2';
export const console = new Console();

import PACKAGE_JSON from '../package.json';

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

export function getCacheDirPath(useGlobal?: boolean): string
{
	return getCachePath({
		name: PACKAGE_JSON.name,
		create: true,
		fnOrder: useGlobal ? [
			findNpmCachePath,
			getOSTempPath,
			findPkgModulePath,
		]: null,
	});
}

export function freeGC(): boolean
{
	if (global && typeof global.gc === 'function')
	{
		try
		{
			global.gc();

			return true;
		}
		catch (e)
		{
			console.error(e);
		}
	}

	return false;
}

export default exports as typeof import('./util');
