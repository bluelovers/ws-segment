"use strict";
/**
 * Created by user on 2018/3/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _class_1 = require("../_class");
const libLoader = new _class_1.default({
    parseLine(input) {
        let [str, n, s] = input
            .replace(/^\s+|\s+$/, '')
            .split(/\|/g)
            .map(v => v.trim());
        return [str, Number(n), Number(s)];
    },
    filter(line) {
        if (line && line.indexOf('//') != 0) {
            return line;
        }
    },
    stringifyLine(data) {
        let a = [];
        // @ts-ignore
        a = data
            .slice();
        if (data.length > 1) {
            // @ts-ignore
            a[1] = '0x' + a[1].toString(16).padStart(4, '0');
        }
        return a.join('|');
    }
});
exports.load = libLoader.load;
exports.loadSync = libLoader.loadSync;
exports.loadStream = libLoader.loadStream;
exports.loadStreamSync = libLoader.loadStreamSync;
exports.parseLine = libLoader.parseLine;
exports.stringifyLine = libLoader.stringifyLine;
exports.serialize = libLoader.serialize;
exports.Loader = libLoader;
exports.default = exports.Loader.load;
