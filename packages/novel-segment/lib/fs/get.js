"use strict";
/**
 * Created by user on 2018/4/13/013.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = exports.existsSync = exports.searchFirstSync = exports._searchGlobSync = exports.searchGlobSync = void 0;
const FastGlob = __importStar(require("@bluelovers/fast-glob"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// @ts-ignore
function searchGlobSync(file, options) {
    options = getOptions(options);
    let ls = [];
    options.extensions = options.extensions || [''];
    options.paths.some(function (cwd) {
        let bool = options.extensions
            .some(function (ext) {
            let ret = _searchGlobSync(file + ext, options, cwd);
            if (ret.length) {
                ls = ret;
                return true;
            }
        });
        if (bool || ls.length) {
            return true;
        }
    });
    return ls;
}
exports.searchGlobSync = searchGlobSync;
function _searchGlobSync(file, options, cwd) {
    let glob_options = {
        markDirectories: true,
        unique: true,
        onlyDirectories: options.onlyDir,
        onlyFiles: !options.onlyDir,
        ignore: [
            '.*',
            '*.bak',
            '*.old',
        ],
        deep: 0,
        absolute: true,
    };
    if (cwd) {
        glob_options.cwd = cwd;
    }
    return FastGlob.sync(file, glob_options);
}
exports._searchGlobSync = _searchGlobSync;
// @ts-ignore
function searchFirstSync(file, options = {}) {
    if (typeof file !== 'string' || file === '') {
        throw new TypeError();
    }
    let fp;
    options = getOptions(options);
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
exports.searchFirstSync = searchFirstSync;
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
    // @ts-ignore
    delete options.cwd;
    return bool;
}
exports.existsSync = existsSync;
// @ts-ignore
function getOptions(options = {}) {
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
    return options;
}
exports.getOptions = getOptions;
/*
let k = searchFirstSync('index', {
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
/*
console.log(searchGlobSync('fs/*', {
    paths: [
        '..',
    ],

    extensions: [
        '.js',
    ]
}));
*/
exports.default = searchFirstSync;
//# sourceMappingURL=get.js.map