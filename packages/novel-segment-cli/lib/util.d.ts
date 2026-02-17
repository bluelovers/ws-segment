import { Console } from 'debug-color2';
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
export declare const console: Console;
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
export declare const debugConsole: Console;
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
export declare function enableDebug(bool?: boolean): boolean;
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
export declare function getCacheDirPath(useGlobal?: boolean): string;
/**
 * 強制執行垃圾回收
 * Force garbage collection
 *
 * 嘗試呼叫 Node.js 的 gc() 函數釋放記憶體。
 * Attempts to call Node.js gc() function to free memory.
 *
 * @returns 是否成功執行垃圾回收 / Whether garbage collection was successful
 */
export declare function freeGC(): boolean;
declare const _default: typeof import("./util");
export default _default;
