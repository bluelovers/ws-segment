"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPackageJson = exports.findPackagePath = exports.checkUpdate = exports.checkUpdateSelf = exports.notNpxMaybe = void 0;
const path_1 = __importDefault(require("path"));
const pkg_up_1 = __importDefault(require("pkg-up"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const update_notifier_1 = require("@yarn-tool/update-notifier");
Object.defineProperty(exports, "notNpxMaybe", { enumerable: true, get: function () { return update_notifier_1.notNpxMaybe; } });
function checkUpdateSelf() {
    return update_notifier_1.updateNotifier(path_1.default.join(__dirname, '..'));
}
exports.checkUpdateSelf = checkUpdateSelf;
function checkUpdate(name) {
    return update_notifier_1.updateNotifier(findPackagePath(name));
}
exports.checkUpdate = checkUpdate;
function findPackagePath(name) {
    return pkg_up_1.default.sync({
        cwd: require.resolve(name)
    });
}
exports.findPackagePath = findPackagePath;
function readPackageJson(name) {
    let pkg = fs_extra_1.default.readJSONSync(findPackagePath(name));
    if (pkg.name != name) {
        throw new Error(`package name not match, '${pkg.name}' != '${name}'`);
    }
    return pkg;
}
exports.readPackageJson = readPackageJson;
//# sourceMappingURL=ncu.js.map