/**
 * 更新通知模組
 * Update Notifier Module
 *
 * 提供檢查套件更新的功能，支援自我檢查與指定套件檢查。
 * Provides functionality to check for package updates, supports self-check and specified package check.
 */
import PACKAGE_JSON from '../package.json';
import { notNpxMaybe, IUpdateNotifierObject } from '@yarn-tool/update-notifier';
/**
 * 檢查是否非 npx 執行環境
 * Check if not running from npx
 *
 * 用於判斷是否需要顯示更新通知。
 * Used to determine whether to show update notifications.
 *
 * @see notNpxMaybe
 */
export { notNpxMaybe };
/**
 * 檢查自我更新
 * Check self update
 *
 * 檢查 novel-segment-cli 本身是否有可用的更新。
 * Checks if there is an available update for novel-segment-cli itself.
 *
 * @returns 更新通知物件 / Update notification object
 */
export declare function checkUpdateSelf(): IUpdateNotifierObject;
/**
 * 檢查指定套件更新
 * Check specified package update
 *
 * 檢查指定 NPM 套件是否有可用的更新。
 * Checks if there is an available update for the specified NPM package.
 *
 * @param name - 套件名稱 / Package name
 * @returns 更新通知物件 / Update notification object
 */
export declare function checkUpdate(name: string): IUpdateNotifierObject;
/**
 * 尋找套件路徑
 * Find package path
 *
 * 根據套件名稱解析其在系統中的安裝路徑。
 * Resolves the installation path of a package in the system based on its name.
 *
 * @param name - 套件名稱 / Package name
 * @returns 套件根目錄路徑 / Package root directory path
 */
export declare function findPackagePath(name: string): string;
/**
 * 讀取套件 package.json
 * Read package.json
 *
 * 讀取指定套件的 package.json 檔案內容。
 * Reads the package.json file content of the specified package.
 *
 * @param name - 套件名稱 / Package name
 * @returns package.json 內容 / package.json content
 */
export declare function readPackageJson<T>(name: string): T & typeof PACKAGE_JSON;
