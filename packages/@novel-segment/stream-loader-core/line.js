"use strict";
/**
 * 串流逐行讀取模組
 * Stream Line Reader Module
 *
 * 提供使用串流逐行讀取檔案的工具函式，支援非同步與同步操作。
 * 此模組是字典載入器的核心元件，用於高效處理大型字典檔案。
 *
 * Provides utilities for reading files line by line using streams.
 * Supports both asynchronous and synchronous operations.
 * This module is a core component of dictionary loaders for efficient handling of large dictionary files.
 *
 * @module @novel-segment/stream-loader-core/line
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.byLine = byLine;
exports.createStreamLine = createStreamLine;
exports.readFileLine = readFileLine;
exports.wrapStreamToPromise = wrapStreamToPromise;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const split2_1 = tslib_1.__importDefault(require("split2"));
const path_1 = require("path");
const bluebird_1 = tslib_1.__importDefault(require("bluebird"));
const stream_pipe_1 = require("stream-pipe");
/**
 * 建立逐行轉換串流
 * Create a line-by-line transform stream
 *
 * 建立一個轉換串流，將輸入資料按行分割。
 * 這是處理文字檔案的基礎函式，可與任何可讀串流搭配使用。
 *
 * Creates a transform stream that splits input by lines.
 * This is a fundamental function for processing text files, usable with any readable stream.
 *
 * @param {Function} [fn] - 選擇性的每行轉換函式 / Optional mapper function for each line
 * @param {IOptions} [options] - 串流選項 / Stream options
 * @returns {IStreamLine} 逐行串流 / Line stream
 *
 * @example
 * // 基本使用 / Basic usage
 * createReadStream('file.txt')
 *   .pipe(byLine())
 *   .on('data', line => console.log(line));
 *
 * @example
 * // 使用轉換函式 / With mapper function
 * createReadStream('file.txt')
 *   .pipe(byLine(line => line.trim()))
 *   .on('data', line => console.log(line));
 */
function byLine(fn, options = {}) {
    if (typeof fn == 'object') {
        [options, fn] = [fn, undefined];
    }
    fn = fn || options.mapper;
    // @ts-ignore
    let wts = (0, split2_1.default)(fn);
    wts.on('pipe', function (src) {
        // @ts-ignore
        const self = this;
        // 儲存來源串流的參考，用於後續追蹤與控制
        // Store reference to source stream for later tracking and control
        // @ts-ignore
        this.pipeFrom = src;
        let pipeStat = null;
        // 判斷檔案大小以支援進度追蹤功能
        // 依序嘗試不同方式取得檔案大小：bytesTotal 屬性、檔案描述符、檔案路徑
        // Determine file size for progress tracking
        // Try different methods to get file size: bytesTotal property, file descriptor, file path
        if (typeof src.bytesTotal == 'number') {
            self.bytesSize = src.bytesTotal;
        }
        else if (src.fd) {
            pipeStat = (0, fs_1.fstatSync)(src.fd);
            self.bytesSize = pipeStat.size;
        }
        else if (src.path) {
            let p = src.path;
            if (src.cwd && !(0, path_1.isAbsolute)(src.path)) {
                p = (0, path_1.resolve)(src.cwd, src.path);
            }
            pipeStat = (0, fs_1.statSync)(p);
            self.bytesSize = pipeStat.size;
        }
        else {
            // 無法取得檔案大小，設為 null
            // Unable to determine file size, set to null
            self.bytesSize = null;
        }
        // @ts-ignore
        this.pipeStat = pipeStat;
        // 轉發來源串流的事件，確保外部可以監聽這些事件
        // Forward events from source stream to ensure external listeners can receive them
        src
            .on('close', function (...argv) {
            self.emit('close', ...argv);
        })
            .on('ready', function (...argv) {
            self.emit('ready', ...argv);
        });
    });
    // 根據選項註冊事件處理器，支援 on* 格式的選項
    // Register event handlers from options, supporting on* format options
    Object.keys(options)
        .forEach(function (key) {
        if (key.indexOf('on') == 0 && options[key]) {
            wts.on(key.slice(2), options[key]);
        }
    });
    return wts;
}
function createStreamLine(file, fn, options) {
    return (0, stream_pipe_1.createReadStream)(file)
        .pipe(byLine(fn, options));
}
function readFileLine(file, fn, options) {
    return wrapStreamToPromise(createStreamLine(file, fn, options));
}
/**
 * 將串流包裝為 Promise
 * Wrap a stream to a promise
 *
 * 將串流包裝在 Promise 中，當串流關閉或完成時解析。
 * 這允許使用 async/await 語法等待串流處理完成。
 *
 * Wraps a stream in a promise that resolves when the stream closes or finishes.
 * This allows using async/await syntax to wait for stream processing completion.
 *
 * @template T - 串流類型 / Stream type
 * @param {T} stream - 要包裝的串流 / Stream to wrap
 * @returns {IPromiseStream<T>} Promise 包裝的串流 / Promise-wrapped stream
 *
 * @example
 * const promiseStream = wrapStreamToPromise(createReadStream('file.txt'));
 * promiseStream.stream.on('data', chunk => console.log(chunk));
 * await promiseStream;
 */
function wrapStreamToPromise(stream) {
    let resolve, reject;
    let promise = new bluebird_1.default(function () {
        resolve = arguments[0];
        reject = arguments[1];
    });
    stream
        .on('close', function (...argv) {
        // @ts-ignore
        resolve(this);
        //console.log('d.close', ...argv);
    })
        .on('finish', function (...argv) {
        // @ts-ignore
        resolve(this);
        //console.log('d.close', ...argv);
    })
        .on('error', function (...argv) {
        reject(...argv);
    });
    promise.stream = stream;
    // @ts-ignore
    promise = promise.bind(stream);
    promise.stream = stream;
    return promise;
}
/*
 * 使用範例 / Usage Example:

let p = readFileLine('../.gitignore', {

    mapper(data: string)
    {
        return data;
    },

});

p.stream.on('data', function (data)
{
    console.log(data);
});

p.then(function (d: IPipe<ReadStream, NodeJS.WritableStream>)
{
    console.log(this === p.stream, d === this);
});
*/
exports.default = exports;
//# sourceMappingURL=line.js.map