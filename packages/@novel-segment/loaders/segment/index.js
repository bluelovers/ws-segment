"use strict";
/**
 * Created by user on 2018/3/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = exports.serialize = exports.stringifyLine = exports.parseLine = exports.loadStreamSync = exports.loadStream = exports.loadSync = exports.load = void 0;
const dict_loader_core_1 = require("@novel-segment/dict-loader-core");
const libLoader = new dict_loader_core_1.LoaderClass({
    parseLine(input) {
        let [str, n, s, ...plus] = input
            .replace(/^\s+|\s+$/, '')
            .split(/\|/g)
            .map(v => v.trim());
        let d1 = Number(n);
        let d2 = Number(s);
        if (Number.isNaN(d1)) {
            // @ts-ignore
            d1 = 0;
        }
        if (Number.isNaN(d2)) {
            // @ts-ignore
            d2 = 0;
        }
        // @ts-ignore
        return [str, d1, d2, ...plus];
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
    stringifyLine(data) {
        let a = [];
        // @ts-ignore
        a = data
            .slice();
        if (a.length > 1) {
            // @ts-ignore
            if (!a[1] || Number.isNaN(a[1])) {
                // @ts-ignore
                a[1] = 0;
            }
            // @ts-ignore
            a[1] = '0x' + a[1]
                // @ts-ignore
                .toString(16)
                .padStart(4, '0')
                .toUpperCase();
        }
        if (a.length > 2) {
            // @ts-ignore
            if (!a[2] || Number.isNaN(a[2])) {
                // @ts-ignore
                a[2] = 0;
            }
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
exports.default = libLoader.load;
//# sourceMappingURL=index.js.map