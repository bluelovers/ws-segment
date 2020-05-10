"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPackageJson = exports.findPackagePath = exports.checkUpdate = exports.checkUpdateSelf = exports.notNpxMaybe = void 0;
const path = require("path");
const pkgUp = require("pkg-up");
const fs = require("fs-extra");
const update_notifier_1 = require("@yarn-tool/update-notifier");
Object.defineProperty(exports, "notNpxMaybe", { enumerable: true, get: function () { return update_notifier_1.notNpxMaybe; } });
function checkUpdateSelf() {
    return update_notifier_1.updateNotifier(path.join(__dirname, '..'));
}
exports.checkUpdateSelf = checkUpdateSelf;
function checkUpdate(name) {
    return update_notifier_1.updateNotifier(findPackagePath(name));
}
exports.checkUpdate = checkUpdate;
function findPackagePath(name) {
    return pkgUp.sync({
        cwd: require.resolve(name)
    });
}
exports.findPackagePath = findPackagePath;
function readPackageJson(name) {
    let pkg = fs.readJSONSync(findPackagePath(name));
    if (pkg.name != name) {
        throw new Error(`package name not match, '${pkg.name}' != '${name}'`);
    }
    return pkg;
}
exports.readPackageJson = readPackageJson;
//# sourceMappingURL=ncu.js.map