"use strict";
/**
 * Created by user on 2018/4/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _class_1 = require("../_class");
const libLoader = new _class_1.LoaderClass({
    parseLine(input) {
        let data = input.split(/\t/);
        if (data.length < 2) {
            throw new Error();
        }
        return data;
    },
    filter(input) {
        return input.trim();
    },
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