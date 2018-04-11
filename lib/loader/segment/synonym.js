"use strict";
/**
 * Created by user on 2018/3/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const line_1 = require("../../fs/line");
const stream_1 = require("../../fs/stream");
/**
 * 揭穿,戳穿
 */
function parseLine(input) {
    let ret = input
        .replace(/^\s+|\s+$/, '')
        .split(',');
    if (ret.length < 2) {
        throw new ReferenceError(`${input}`);
    }
    return ret;
}
exports.parseLine = parseLine;
function load(file) {
    return line_1.wrapStreamToPromise(loadStream(file))
        .then(function (stream) {
        return stream.value;
    });
}
exports.load = load;
function loadStream(file, callback) {
    let stream = stream_1.default(file, {
        callback,
        mapper(line) {
            if (line) {
                return parseLine(line);
            }
        },
    });
    return stream;
}
exports.loadStream = loadStream;
exports.default = load;
