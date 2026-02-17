"use strict";
/**
 * 行式載入器模組
 * Line Loader Module
 *
 * 用於載入簡單的文字檔案，每行作為獨立的項目。
 * 適用於載入每行一個詞條的簡單字典檔案。
 *
 * Simple loader for text files where each line is a separate entry.
 * Used for loading simple dictionary files with one word per line.
 *
 * Created by user on 2018/4/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = exports.serialize = exports.stringifyLine = exports.parseLine = exports.loadStreamSync = exports.loadStream = exports.loadSync = exports.load = void 0;
const dict_loader_core_1 = require("@novel-segment/dict-loader-core");
/**
 * 行式載入器實例
 * Line Loader Instance
 *
 * 已配置為逐行載入的載入器實例。
 * Loader instance configured for simple line-by-line loading.
 */
const libLoader = new dict_loader_core_1.LoaderClass({
    /**
     * 解析一行
     * Parse a Line
     *
     * 直接返回該行內容，不進行任何轉換。
     * Returns the line as-is without any transformation.
     */
    parseLine(input) {
        return input;
    }
});
/**
 * 非同步載入字典
 * Load Dictionary Asynchronously
 */
exports.load = libLoader.load;
/**
 * 同步載入字典
 * Load Dictionary Synchronously
 */
exports.loadSync = libLoader.loadSync;
/**
 * 以串流方式載入字典
 * Load Dictionary as Stream
 */
exports.loadStream = libLoader.loadStream;
/**
 * 以同步串流方式載入字典
 * Load Dictionary as Stream (Synchronous)
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
 * 序列化資料陣列
 * Serialize Data Array
 */
exports.serialize = libLoader.serialize;
/**
 * 載入器實例
 * Loader Instance
 */
exports.Loader = libLoader;
exports.default = libLoader.load;
//# sourceMappingURL=index.js.map