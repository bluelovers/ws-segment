"use strict";
/**
 * Created by user on 2018/3/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const line_1 = require("../../fs/line");
const stream_1 = require("../../fs/stream");
const sync_1 = require("../../fs/sync");
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
        n = parseInt(n);
    }
    if (!str) {
        throw new ReferenceError(`${input}`);
    }
    return [str, n, s];
}
exports.parseLine = parseLine;
function load(file) {
    return line_1.wrapStreamToPromise(loadStream(file))
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
