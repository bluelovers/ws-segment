"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPackageJson = exports.findPackagePath = exports.checkUpdate = exports.checkUpdateSelf = exports.notNpxMaybe = void 0;
const tslib_1 = require("tslib");
const path_1 = require("path");
const pkg_up_1 = (0, tslib_1.__importDefault)(require("pkg-up"));
const fs_extra_1 = require("fs-extra");
const update_notifier_1 = require("@yarn-tool/update-notifier");
Object.defineProperty(exports, "notNpxMaybe", { enumerable: true, get: function () { return update_notifier_1.notNpxMaybe; } });
function checkUpdateSelf() {
    return (0, update_notifier_1.updateNotifier)((0, path_1.join)(__dirname, '..'));
}
exports.checkUpdateSelf = checkUpdateSelf;
function checkUpdate(name) {
    return (0, update_notifier_1.updateNotifier)(findPackagePath(name));
}
exports.checkUpdate = checkUpdate;
function findPackagePath(name) {
    return pkg_up_1.default.sync({
        cwd: require.resolve(name)
    });
}
exports.findPackagePath = findPackagePath;
function readPackageJson(name) {
    let pkg = (0, fs_extra_1.readJSONSync)(findPackagePath(name));
    if (pkg.name != name) {
        throw new Error(`package name not match, '${pkg.name}' != '${name}'`);
    }
    return pkg;
}
exports.readPackageJson = readPackageJson;
//# sourceMappingURL=ncu.js.map