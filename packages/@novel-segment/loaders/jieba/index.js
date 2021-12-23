"use strict";
/**
 * Created by user on 2018/3/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadStreamSync = exports.loadStream = exports._createStream = exports.loadSync = exports.load = exports.parseLine = void 0;
const tslib_1 = require("tslib");
const line_1 = require("@novel-segment/stream-loader-core/line");
const stream_1 = tslib_1.__importDefault(require("@novel-segment/stream-loader-core/stream"));
const sync_1 = tslib_1.__importDefault(require("@novel-segment/stream-loader-core/sync"));
/**
 * 云计算
 * 蓝翔 nz
 * 区块链 10 nz
*/
function parseLine(input) {
    let [str, n, s] = input
        .replace(/^\s+|\s+$/, '')
        .split(/\s+/g);
    if (n === '') {
        n = undefined;
    }
    if (s === '') {
        s = undefined;
    }
    if (typeof s == 'undefined' || s == '') {
        if (typeof n == 'string' && !/^\d+(?:\.\d+)?$/.test(n)) {
            [n, s] = [undefined, n];
        }
    }
    if (typeof n == 'string') {
        // @ts-ignore
        n = Number(n);
    }
    if (!str) {
        throw new ReferenceError(`${input}`);
    }
    return [str, n, s];
}
exports.parseLine = parseLine;
function load(file) {
    return (0, line_1.wrapStreamToPromise)(loadStream(file))
        .then(function (stream) {
        return stream.value;
    });
}
exports.load = load;
function loadSync(file) {
    return loadStreamSync(file).value;
}
exports.loadSync = loadSync;
function _createStream(fnStream, file, callback) {
    return fnStream(file, {
        callback,
        mapper(line) {
            if (line) {
                return parseLine(line);
            }
        },
    });
}
exports._createStream = _createStream;
function loadStream(file, callback) {
    return _createStream(stream_1.default, file, callback);
}
exports.loadStream = loadStream;
function loadStreamSync(file, callback) {
    return _createStream(sync_1.default, file, callback);
}
exports.loadStreamSync = loadStreamSync;
exports.default = load;
//# sourceMappingURL=index.js.map