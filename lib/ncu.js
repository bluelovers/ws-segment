"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PACKAGE_JSON = require("../package.json");
const updateNotifier = require("update-notifier");
const pkgUp = require("pkg-up");
const fs = require("fs-extra");
function checkUpdateSelf() {
    let data = updateNotifier({
        pkg: PACKAGE_JSON,
    });
    return data;
}
exports.checkUpdateSelf = checkUpdateSelf;
function checkUpdate(name) {
    let data = updateNotifier({
        pkg: readPackageJson(name),
    });
    return data;
}
exports.checkUpdate = checkUpdate;
function findPackagePath(name) {
    return pkgUp.sync(require.resolve(name));
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
