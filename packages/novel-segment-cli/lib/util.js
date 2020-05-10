"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freeGC = exports.getCacheDirPath = exports.enableDebug = exports.debugConsole = exports.console = void 0;
const cache_path_1 = require("cache-path");
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
function getCacheDirPath(useGlobal) {
    return cache_path_1.getCachePath({
        name: PACKAGE_JSON.name,
        create: true,
        fnOrder: useGlobal ? [
            cache_path_1.findNpmCachePath,
            cache_path_1.getOSTempPath,
            cache_path_1.findPkgModulePath,
        ] : null,
    });
}
exports.getCacheDirPath = getCacheDirPath;
function freeGC() {
    if (global && typeof global.gc === 'function') {
        try {
            global.gc();
            return true;
        }
        catch (e) {
            exports.console.error(e);
        }
    }
    return false;
}
exports.freeGC = freeGC;
exports.default = exports;
//# sourceMappingURL=util.js.map