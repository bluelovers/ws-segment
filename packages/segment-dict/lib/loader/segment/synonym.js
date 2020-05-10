"use strict";
/**
 * Created by user on 2018/3/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = exports.serialize = exports.stringifyLine = exports.parseLine = exports.loadStreamSync = exports.loadStream = exports.loadSync = exports.load = void 0;
const dict_loader_core_1 = require("@novel-segment/dict-loader-core");
const libLoader = new dict_loader_core_1.LoaderClass({
    parseLine(input) {
        let ret = input
            .replace(/^\s+|\s+$/, '')
            .split(',');
        if (ret.length < 2) {
            throw new ReferenceError(`${input}`);
        }
        return ret.map(function (s) {
            s = s
                .replace(/^\s+|\s+$/, '')
                .trim();
            if (s == '') {
                throw new ReferenceError(`${input}`);
            }
            return s;
        });
    },
    filter(line) {
        line = line
            .replace(/\uFEFF/g, '')
            .trim()
            .replace(/^\s+|\s+$/, '');
        if (line && line.indexOf('\/\/') != 0) {
            return line;
        }
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
//# sourceMappingURL=synonym.js.map