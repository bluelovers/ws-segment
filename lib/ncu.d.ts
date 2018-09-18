import PACKAGE_JSON = require('../package.json');
import updateNotifier = require('update-notifier');
export declare function checkUpdateSelf(): updateNotifier.UpdateNotifier;
export declare function checkUpdate(name: string): updateNotifier.UpdateNotifier;
export declare function findPackagePath(name: string): string;
export declare function readPackageJson<T>(name: string): T & typeof PACKAGE_JSON;
