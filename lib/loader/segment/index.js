"use strict";
/**
 * Created by user on 2018/3/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const line_1 = require("../../fs/line");
const stream_1 = require("../../fs/stream");
/**
 * 爱|0x1000|323
 */
function parseLine(input) {
    let [str, n, s] = input
        .replace(/^\s+|\s+$/, '')
        .split(/\|/g);
    return [str, parseInt(n), parseInt(s)];
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
