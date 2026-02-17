"use strict";
/**
 * OpenCC 字典載入器模組
 * OpenCC Dictionary Loader Module
 *
 * 提供 OpenCC（開放中文轉換）格式字典檔案的載入功能。
 * OpenCC 字典格式為以 Tab 分隔的詞彙對應表。
 *
 * Provides loading functionality for OpenCC (Open Chinese Convert) format dictionary files.
 * OpenCC dictionary format is a tab-separated vocabulary mapping table.
 *
 * 格式範例 / Format Example:
 * - 詞彙1	詞彙2	（以 Tab 分隔 / Tab-separated）
 *
 * @module @novel-segment/loaders/opencc
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = exports.serialize = exports.stringifyLine = exports.parseLine = exports.loadStreamSync = exports.loadStream = exports.loadSync = exports.load = void 0;
const dict_loader_core_1 = require("@novel-segment/dict-loader-core");
/**
 * OpenCC 字典載入器實例
 * OpenCC Dictionary Loader Instance
 *
 * 使用 LoaderClass 配置的 OpenCC 格式載入器。
 * Loader instance configured for OpenCC format.
 */
const libLoader = new dict_loader_core_1.LoaderClass({
    /**
     * 解析一行字典
     * Parse a single line
     *
     * 將 Tab 分隔的行解析為字串陣列。
     * Parses a tab-separated line into a string array.
     *
     * @param {string} input - 原始行資料 / Raw line data
     * @returns {IDictRow} 解析後的行資料 / Parsed row data
     * @throws {Error} 當行格式無效（少於 2 個元素）時 / When line format is invalid (less than 2 elements)
     */
    parseLine(input) {
        let data = input.split(/\t/);
        if (data.length < 2) {
            throw new Error();
        }
        return data;
    },
    /**
     * 過濾行
     * Filter a line
     *
     * 移除行首尾空白。
     * Removes leading and trailing whitespace.
     *
     * @param {string} input - 原始行資料 / Raw line data
     * @returns {string} 過濾後的行 / Filtered line
     */
    filter(input) {
        return input.trim();
    },
});
/**
 * 非同步載入 OpenCC 字典
 * Load OpenCC dictionary asynchronously
 */
exports.load = libLoader.load;
/**
 * 同步載入 OpenCC 字典
 * Load OpenCC dictionary synchronously
 */
exports.loadSync = libLoader.loadSync;
/**
 * 非同步載入 OpenCC 字典串流
 * Load OpenCC dictionary as stream (asynchronous)
 */
exports.loadStream = libLoader.loadStream;
/**
 * 同步載入 OpenCC 字典串流
 * Load OpenCC dictionary as stream (synchronous)
 */
exports.loadStreamSync = libLoader.loadStreamSync;
/**
 * 解析單行
 * Parse a single line
 */
exports.parseLine = libLoader.parseLine;
/**
 * 將資料行轉換回字串
 * Stringify a data row
 */
exports.stringifyLine = libLoader.stringifyLine;
/**
 * 序列化資料陣列
 * Serialize data array
 */
exports.serialize = libLoader.serialize;
/**
 * 載入器實例
 * Loader instance
 */
exports.Loader = libLoader;
exports.default = libLoader.load;
//# sourceMappingURL=index.js.map