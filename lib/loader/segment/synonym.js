"use strict";
/**
 * Created by user on 2018/3/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _class_1 = require("../_class");
const libLoader = new _class_1.LoaderClass({
    parseLine(input) {
        let ret = input
            .replace(/^\s+|\s+$/, '')
            .split(',');
        if (ret.length < 2) {
            throw new ReferenceError(`${input}`);
        }
        return ret.map(function (s) {
            s = s.trim();
            if (s == '') {
                throw new ReferenceError(`${input}`);
            }
            return s;
        });
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
exports.default = libLoader.load;
