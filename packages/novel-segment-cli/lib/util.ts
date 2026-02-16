/**
 * 工具函數模組
 * Utility Functions Module
 *
 * 提供除錯控制台、快取路徑管理、記憶體釋放等工具函數。
 * Provides debug console, cache path management, memory release and other utility functions.
 */
import { getCachePath, findNpmCachePath, findPkgModulePath, findOSTempPath } from 'cache-path';

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
export const console = new Console();

import PACKAGE_JSON from '../package.json';

// 設定主控制台的檢視選項 / Set inspect options for main console
console.inspectOptions = {
	colors: console.enabledColor
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
export const debugConsole = new Console(null, {
	label: true,
	time: true,
});

// 設定除錯控制台的檢視選項 / Set inspect options for debug console
debugConsole.inspectOptions = {
	colors: debugConsole.enabledColor
};

// 預設停用除錯模式 / Debug mode disabled by default
debugConsole.enabled = false;

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
export function enableDebug(bool?: boolean)
{
	if (bool || typeof bool === 'undefined')
	{
		debugConsole.enabled = true;
	}
	else if (bool === false)
	{
		debugConsole.enabled = false;
	}

	return debugConsole.enabled;
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
export function getCacheDirPath(useGlobal?: boolean): string
{
	return getCachePath({
		name: PACKAGE_JSON.name,
		create: true,
		// 若使用全域快取，則依序使用 NPM 快取、系統暫存、專案目錄
		// If using global cache, use NPM cache, system temp, project directory in order
		fnOrder: useGlobal ? [
			findNpmCachePath,
			findOSTempPath,
			findPkgModulePath,
		]: null,
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
export function freeGC(): boolean
{
	if (global && typeof global.gc === 'function')
	{
		try
		{
			global.gc();

			return true;
		}
		catch (e)
		{
			console.error(e);
		}
	}

	return false;
}

export default exports as typeof import('./util');
