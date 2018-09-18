"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const findCacheDir = require("find-cache-dir");
const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const child_process_1 = require("child_process");
const debug_color2_1 = require("debug-color2");
exports.console = new debug_color2_1.Console();
const PACKAGE_JSON = require("../package.json");
exports.console.inspectOptions = {
    colors: exports.console.enabledColor
};
exports.debugConsole = new debug_color2_1.Console(null, {
    label: true,
    time: true,
});
exports.debugConsole.inspectOptions = {
    colors: exports.debugConsole.enabledColor
};
exports.debugConsole.enabled = false;
function enableDebug(bool) {
    if (bool || typeof bool === 'undefined') {
        exports.debugConsole.enabled = true;
    }
    else if (bool === false) {
        exports.debugConsole.enabled = false;
    }
    return exports.debugConsole.enabled;
}
exports.enableDebug = enableDebug;
function getCacheDirPath() {
    let ret = findCacheDir({
        name: PACKAGE_JSON.name,
        create: true,
    });
    if (!ret) {
        let k = getNpmCacheEnv();
        if (k && fs.existsSync(k)) {
            ret = k;
        }
        else if (k = os.homedir()) {
            ret = k;
        }
        else {
            ret = process.cwd();
        }
        if (ret) {
            ret = path.join(k, '.cache', PACKAGE_JSON.name);
            fs.ensureDirSync(ret);
        }
    }
    return ret;
}
exports.getCacheDirPath = getCacheDirPath;
function getNpmCacheEnv() {
    let k = child_process_1.execSync('npm config get cache');
    return k.toString().trim();
}
exports.getNpmCacheEnv = getNpmCacheEnv;
const self = require("./util");
exports.default = self;
