"use strict";
/**
 * Created by user on 2018/4/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _class_1 = require("./_class");
const libLoader = new _class_1.LoaderClass({
    parseLine(input) {
        return input;
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
exports.Loader = libLoader;
exports.default = libLoader.load;
