
import PACKAGE_JSON = require('../package.json');
import path = require('path');
import updateNotifier = require('update-notifier');
import pkgUp = require('pkg-up');
import * as fs from "fs-extra";

export function checkUpdateSelf()
{
	let data = updateNotifier({
		pkg: PACKAGE_JSON,
	});

	return data;
}

export function checkUpdate(name: string)
{
	let data = updateNotifier({
		pkg: readPackageJson(name),
	});

	return data;
}

export function findPackagePath(name: string): string
{
	return pkgUp.sync(require.resolve(name));
}

export function readPackageJson<T>(name: string): T & typeof PACKAGE_JSON
{
	let pkg = fs.readJSONSync(findPackagePath(name));

	if (pkg.name != name)
	{
		throw new Error(`package name not match, '${pkg.name}' != '${name}'`);
	}

	return pkg;
}
