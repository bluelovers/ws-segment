"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugConsole = exports.console = void 0;
exports.enableDebug = enableDebug;
exports.getCacheDirPath = getCacheDirPath;
exports.freeGC = freeGC;
const tslib_1 = require("tslib");
/**
 * 工具函數模組
 * Utility Functions Module
 *
 * 提供除錯控制台、快取路徑管理、記憶體釋放等工具函數。
 * Provides debug console, cache path management, memory release and other utility functions.
 */
const cache_path_1 = require("cache-path");
const debug_color2_1 = require("debug-color2");
/**
 * 主控制台輸出物件
 * Main console output object
 *
 * 用於一般訊息的輸出，支援顏色與格式化。
 * Used for general message output, supports colors and formatting.
 *
 * @example
 * console.info('訊息');
 * console.warn('警告');
 */
exports.console = new debug_color2_1.Console();
const package_json_1 = tslib_1.__importDefault(require("../package.json"));
// 設定主控制台的檢視選項 / Set inspect options for main console
exports.console.inspectOptions = {
    colors: exports.console.enabledColor
};
/**
 * 除錯控制台輸出物件
 * Debug console output object
 *
 * 用於除錯訊息的輸出，包含時間標記與標籤。
 * Used for debug message output, includes time stamp and label.
 *
 * @example
 * debugConsole.debug('除錯訊息');
 */
exports.debugConsole = new debug_color2_1.Console(null, {
    label: true,
    time: true,
});
// 設定除錯控制台的檢視選項 / Set inspect options for debug console
exports.debugConsole.inspectOptions = {
    colors: exports.debugConsole.enabledColor
};
// 預設停用除錯模式 / Debug mode disabled by default
exports.debugConsole.enabled = false;
/**
 * 啟用或停用除錯模式
 * Enable or disable debug mode
 *
 * 控制除錯控制台的輸出開關。
 * Controls debug console output toggle.
 *
 * @param bool - 布林值，true 啟用，false 停用，若為 undefined 则切換 / Boolean, true to enable, false to disable, undefined to toggle
 * @returns 目前的除錯狀態 / Current debug status
 */
function enableDebug(bool) {
    if (bool || typeof bool === 'undefined') {
        exports.debugConsole.enabled = true;
    }
    else if (bool === false) {
        exports.debugConsole.enabled = false;
    }
    return exports.debugConsole.enabled;
}
/**
 * 取得快取目錄路徑
 * Get cache directory path
 *
 * 取得用於儲存快取的目錄路徑，可選擇使用全域快取目錄。
 * Gets the directory path for storing cache, can choose to use global cache directory.
 *
 * @param useGlobal - 是否使用全域快取 / Whether to use global cache
 * @returns 快取目錄路徑 / Cache directory path
 */
function getCacheDirPath(useGlobal) {
    return (0, cache_path_1.getCachePath)({
        name: package_json_1.default.name,
        create: true,
        // 若使用全域快取，則依序使用 NPM 快取、系統暫存、專案目錄
        // If using global cache, use NPM cache, system temp, project directory in order
        fnOrder: useGlobal ? [
            cache_path_1.findNpmCachePath,
            cache_path_1.findOSTempPath,
            cache_path_1.findPkgModulePath,
        ] : null,
    });
}
/**
 * 強制執行垃圾回收
 * Force garbage collection
 *
 * 嘗試呼叫 Node.js 的 gc() 函數釋放記憶體。
 * Attempts to call Node.js gc() function to free memory.
 *
 * @returns 是否成功執行垃圾回收 / Whether garbage collection was successful
 */
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
exports.default = exports;
//# sourceMappingURL=util.js.map