"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const findCacheDir = require("find-cache-dir");
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
    return findCacheDir({
        name: PACKAGE_JSON.name,
        create: true,
    });
}
exports.getCacheDirPath = getCacheDirPath;
const self = require("./util");
exports.default = self;
