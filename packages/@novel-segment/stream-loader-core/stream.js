"use strict";
/**
 * 非同步串流載入器模組
 * Asynchronous Stream Loader Module
 *
 * 提供字典檔案的非同步串流載入功能。
 * 此模組是字典載入器的核心元件，用於高效處理大型字典檔案。
 *
 * Provides asynchronous stream loading functionality for dictionary files.
 * This module is a core component of dictionary loaders for efficient handling of large dictionary files.
 *
 * @module @novel-segment/stream-loader-core/stream
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoadStream = createLoadStream;
const line_1 = require("./line");
/**
 * 建立載入串流
 * Create a load stream
 *
 * 建立一個可讀串流，載入檔案並收集解析後的資料。
 * 此函式是字典載入器的主要進入點，用於非同步載入字典檔案。
 *
 * Creates a readable stream that loads a file and collects parsed data.
 * This function is the main entry point for dictionary loaders to asynchronously load dictionary files.
 *
 * @template T - 資料類型 / Data type
 * @param {string} file - 檔案路徑 / File path
 * @param {Object} options - 串流選項 / Stream options
 * @param {Function} [options.mapper] - 每行轉換函式 / Line mapper function
 * @param {Function} [options.ondata] - 資料事件處理器 / Data event handler
 * @param {ICallback<T>} [options.callback] - 完成回呼函式 / Completion callback
 * @param {Function} [options.onready] - 就緒事件處理器 / Ready event handler
 * @returns {IStreamLineWithValue<T>} 帶值的串流 / Stream with value
 */
function createLoadStream(file, options = {}) {
    // 預設的就緒處理器：初始化值陣列
    // Default ready handler: initialize value array
    options.onready = options.onready || function (src, ...argv) {
        // @ts-ignore
        this.value = this.value || [];
    };
    // 預設的轉換函式：原樣返回每行資料
    // Default mapper: return line as-is
    options.mapper = options.mapper || function (data) {
        return data;
    };
    // 預設的資料處理器：將資料推入值陣列
    // Default data handler: push to value array
    options.ondata = options.ondata || function (data) {
        // @ts-ignore
        this.value = this.value || [];
        // @ts-ignore
        this.value.push(data);
    };
    let stream = (0, line_1.createStreamLine)(file, options.mapper, {
        onready: options.onready,
        ondata: options.ondata,
        /**
         * 關閉處理器：以已載入的資料呼叫回呼函式
         * Close handler: call callback with loaded data
         */
        onclose() {
            if (options.callback) {
                options.callback.call(this, null, stream.value, stream);
            }
        },
    });
    return stream;
}
exports.default = createLoadStream;
//# sourceMappingURL=stream.js.map