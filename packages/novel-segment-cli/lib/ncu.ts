
import PACKAGE_JSON from '../package.json';
import { join } from 'path';
import pkgUp from 'pkg-up';
import { readJSONSync } from "fs-extra";
import { updateNotifier as updateNotifier2, notNpxMaybe, IUpdateNotifierObject } from '@yarn-tool/update-notifier';

export { notNpxMaybe }

export function checkUpdateSelf(): IUpdateNotifierObject
{
	return updateNotifier2(join(__dirname, '..'));
}

export function checkUpdate(name: string): IUpdateNotifierObject
{
	return updateNotifier2(findPackagePath(name));
}

export function findPackagePath(name: string): string
{
	return pkgUp.sync({
		cwd: require.resolve(name)
	});
}

export function readPackageJson<T>(name: string): T & typeof PACKAGE_JSON
{
	let pkg = readJSONSync(findPackagePath(name));

	if (pkg.name != name)
	{
		throw new Error(`package name not match, '${pkg.name}' != '${name}'`);
	}

	return pkg;
}
