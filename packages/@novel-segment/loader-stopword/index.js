"use strict";
/**
 * 分隔詞載入器模組
 * Stopword (Separator) Loader Module
 *
 * 用於載入分隔詞字典檔案的載入器。
 * 每行內容會在加入字典前進行修剪。
 *
 * Loader for stopword (separator) dictionary files.
 * Each line is trimmed before being added to the dictionary.
 *
 * Created by user on 2018/4/14/014.
 *
 * @module @novel-segment/loader-stopword
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = exports.stringifyLine = exports.parseLine = exports.loadStreamSync = exports.loadStream = exports.loadSync = exports.load = void 0;
const dict_loader_core_1 = require("@novel-segment/dict-loader-core");
/**
 * 分隔詞載入器實例
 * Stopword (Separator) Loader Instance
 *
 * 已配置分隔詞載入功能的載入器實例，包含修剪功能。
 * Loader instance configured for stopword (separator) loading with trimming.
 */
const libLoader = new dict_loader_core_1.LoaderClass({
    /**
     * 解析一行
     * Parse a Line
     *
     * 過濾後直接返回該行內容。
     * Returns the line as-is after filtering.
     */
    parseLine(input) {
        return input;
    },
    /**
     * 過濾一行
     * Filter a Line
     *
     * 修剪該行的空白字元。
     * Trims whitespace from the line.
     */
    filter(input) {
        return input.trim();
    },
});
/**
 * 非同步載入分隔詞字典
 * Load Stopword (Separator) Dictionary Asynchronously
 */
exports.load = libLoader.load;
/**
 * 同步載入分隔詞字典
 * Load Stopword (Separator) Dictionary Synchronously
 */
exports.loadSync = libLoader.loadSync;
/**
 * 以串流方式載入分隔詞字典
 * Load Stopword (Separator) Dictionary as Stream
 */
exports.loadStream = libLoader.loadStream;
/**
 * 以同步串流方式載入分隔詞字典
 * Load Stopword (Separator) Dictionary as Stream (Synchronous)
 */
exports.loadStreamSync = libLoader.loadStreamSync;
/**
 * 解析單行
 * Parse a Single Line
 */
exports.parseLine = libLoader.parseLine;
/**
 * 字串化資料行
 * Stringify a Data Row
 */
exports.stringifyLine = libLoader.stringifyLine;
/**
 * 載入器實例
 * Loader Instance
 */
exports.Loader = libLoader;
exports.default = libLoader.load;
//# sourceMappingURL=index.js.map