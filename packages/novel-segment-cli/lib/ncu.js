"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notNpxMaybe = void 0;
exports.checkUpdateSelf = checkUpdateSelf;
exports.checkUpdate = checkUpdate;
exports.findPackagePath = findPackagePath;
exports.readPackageJson = readPackageJson;
const tslib_1 = require("tslib");
const path_1 = require("path");
const pkg_up_1 = tslib_1.__importDefault(require("pkg-up"));
const fs_extra_1 = require("fs-extra");
const update_notifier_1 = require("@yarn-tool/update-notifier");
Object.defineProperty(exports, "notNpxMaybe", { enumerable: true, get: function () { return update_notifier_1.notNpxMaybe; } });
/**
 * 檢查自我更新
 * Check self update
 *
 * 檢查 novel-segment-cli 本身是否有可用的更新。
 * Checks if there is an available update for novel-segment-cli itself.
 *
 * @returns 更新通知物件 / Update notification object
 */
function checkUpdateSelf() {
    return (0, update_notifier_1.updateNotifier)((0, path_1.join)(__dirname, '..'));
}
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
function checkUpdate(name) {
    return (0, update_notifier_1.updateNotifier)(findPackagePath(name));
}
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
function findPackagePath(name) {
    return pkg_up_1.default.sync({
        cwd: require.resolve(name)
    });
}
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
function readPackageJson(name) {
    let pkg = (0, fs_extra_1.readJSONSync)(findPackagePath(name));
    if (pkg.name != name) {
        throw new Error(`package name not match, '${pkg.name}' != '${name}'`);
    }
    return pkg;
}
//# sourceMappingURL=ncu.js.map