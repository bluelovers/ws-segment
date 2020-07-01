import PACKAGE_JSON from '../package.json';
import { notNpxMaybe, IUpdateNotifierObject } from '@yarn-tool/update-notifier';
export { notNpxMaybe };
export declare function checkUpdateSelf(): IUpdateNotifierObject;
export declare function checkUpdate(name: string): IUpdateNotifierObject;
export declare function findPackagePath(name: string): string;
export declare function readPackageJson<T>(name: string): T & typeof PACKAGE_JSON;
