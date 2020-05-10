"use strict";
/**
 * Created by user on 2018/4/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = exports.stringifyLine = exports.parseLine = exports.loadStreamSync = exports.loadStream = exports.loadSync = exports.load = void 0;
const dict_loader_core_1 = require("@novel-segment/dict-loader-core");
const libLoader = new dict_loader_core_1.LoaderClass({
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
exports.stringifyLine = libLoader.stringifyLine;
exports.Loader = libLoader;
exports.default = libLoader.load;
//# sourceMappingURL=index.js.map