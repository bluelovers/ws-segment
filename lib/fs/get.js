"use strict";
/**
 * Created by user on 2018/4/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
// @ts-ignore
function searchFirst(file, options = {}) {
    if (typeof file !== 'string' || file === '') {
        throw new TypeError();
    }
    let fp;
    if (Array.isArray(options)) {
        let paths;
        [paths, options] = [options, {}];
        options.paths = paths;
    }
    options = Object.assign({}, options);
    // typescript know options is IOptions
    if (options.onlyDir || options.extensions && !options.extensions.length) {
        delete options.extensions;
    }
    let bool = options.paths.some(function (dir) {
        fp = path.join(dir, file);
        let bool;
        // typescript don't know what type about options
        if (options.extensions) {
            for (let ext of options.extensions) {
                let file = fp + ext;
                bool = existsSync(file, options);
                if (bool) {
                    fp = file;
                    break;
                }
            }
        }
        else {
            bool = existsSync(fp, options);
        }
        return bool;
    });
    if (bool) {
        return path.resolve(fp);
    }
    return null;
}
exports.searchFirst = searchFirst;
function existsSync(path, options = {}) {
    let bool = fs.existsSync(path);
    if (bool && (options.onlyDir || options.onlyFile)) {
        let stat = fs.statSync(path);
        if (options.onlyDir && !stat.isDirectory()) {
            bool = false;
        }
        else if (options.onlyFile && !stat.isFile()) {
            bool = false;
        }
    }
    return bool;
}
exports.existsSync = existsSync;
/*
let k = searchFirst('index', {
    paths: [
        '.',
        '..',
        '../..',
    ],
    extensions: [
        '.ts',
    ],
});

console.log(k);
*/
exports.default = searchFirst;
