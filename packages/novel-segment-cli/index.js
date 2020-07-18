"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetCache = exports.removeCache = exports.loadCacheDb = exports.loadCacheInfo = exports.getSegment = exports.resetSegment = exports.getCacache = exports.fixOptions = exports.readFile = exports.SegmentCliError = exports.processFile = exports.processText = exports.fileSegment = exports.textSegment = exports.stringify = exports.enableDebug = void 0;
const crlf_normalize_1 = __importDefault(require("crlf-normalize"));
const novel_segment_1 = __importStar(require("novel-segment"));
Object.defineProperty(exports, "stringify", { enumerable: true, get: function () { return novel_segment_1.stringify; } });
const bluebird_1 = __importDefault(require("bluebird"));
const fs_iconv_1 = __importDefault(require("fs-iconv"));
const lib_1 = require("novel-segment/lib");
// @ts-ignore
const cache_1 = require("./lib/cache");
const util_1 = require("./lib/util");
Object.defineProperty(exports, "enableDebug", { enumerable: true, get: function () { return util_1.enableDebug; } });
const package_json_1 = __importDefault(require("./package.json"));
const util_2 = require("novel-segment/lib/util");
const iconv_jschardet_1 = __importDefault(require("iconv-jschardet"));
const min_1 = require("cjk-conv/lib/zh/convert/min");
const dict_1 = require("novel-segment/lib/defaults/dict");
const lodash_1 = require("lodash");
const array_hyper_unique_1 = require("array-hyper-unique");
let CACHED_SEGMENT;
let CACHED_CACACHE;
const DB_KEY = 'cache.db';
const DB_KEY_INFO = 'cache.info';
const DB_KEY2 = 'cache.common.synonym.db';
const DB_KEY2_INFO = 'cache.common.synonym.info';
const DB_TTL = 3600 * 1000;
function textSegment(text, options) {
    return getSegment(options)
        .then(function (segment) {
        return segment.doSegment(text);
    })
        .tap(function (data) {
        return util_2.debug_token(data);
    });
}
exports.textSegment = textSegment;
function fileSegment(file, options) {
    return bluebird_1.default.resolve(readFile(file))
        .then(function (buf) {
        return textSegment(buf.toString(), options);
    });
}
exports.fileSegment = fileSegment;
function processText(text, options) {
    if (!text.length || !text.replace(/\s+/g, '').length) {
        return bluebird_1.default.resolve('');
    }
    return textSegment(text, options)
        .then(function (data) {
        let text = novel_segment_1.stringify(data);
        if (options) {
            if (options.crlf) {
                if (typeof options.crlf === 'string') {
                    text = crlf_normalize_1.default(text, options.crlf);
                }
                else {
                    text = crlf_normalize_1.default(text);
                }
            }
            if (options.convertToZhTw) {
                text = min_1.cn2tw_min(text);
            }
        }
        util_1.freeGC();
        return text;
    });
}
exports.processText = processText;
function processFile(file, options) {
    return bluebird_1.default.resolve(readFile(file, options))
        .then(function (buf) {
        return processText(buf.toString(), options);
    });
}
exports.processFile = processFile;
class SegmentCliError extends Error {
}
exports.SegmentCliError = SegmentCliError;
function readFile(file, options) {
    return bluebird_1.default.resolve().then(() => {
        if (!fs_iconv_1.default.existsSync(file)) {
            let e = new SegmentCliError(`ENOENT: no such file or directory, open '${file}'`);
            return bluebird_1.default.reject(e);
        }
        return fs_iconv_1.default.loadFile(file, {
            autoDecode: true,
        })
            .then(v => Buffer.from(v));
    })
        .tap(function (buf) {
        if (options && options.disableWarn) {
            return;
        }
        if (!buf.length) {
            util_1.console.warn(`此檔案無內容`, file);
        }
        else {
            let chk = iconv_jschardet_1.default.detect(buf);
            if (chk.encoding != 'UTF-8' && chk.encoding != 'ascii') {
                util_1.console.warn('此檔案可能不是 UTF8 請檢查編碼或利用 MadEdit 等工具轉換', chk, file);
            }
        }
    });
}
exports.readFile = readFile;
function fixOptions(options) {
    options = options || {};
    if (typeof options.ttl !== 'number' || options.ttl < 1) {
        delete options.ttl;
    }
    options.optionsSegment = options.optionsSegment || {};
    if (options.optionsSegment.nodeNovelMode) {
        options.USER_DB_KEY = options.USER_DB_KEY || DB_KEY2;
        options.USER_DB_KEY_INFO = options.USER_DB_KEY_INFO || DB_KEY2_INFO;
    }
    else {
        options.USER_DB_KEY = options.USER_DB_KEY || DB_KEY;
        options.USER_DB_KEY_INFO = options.USER_DB_KEY_INFO || DB_KEY_INFO;
    }
    return options;
}
exports.fixOptions = fixOptions;
function getCacache(options) {
    return new bluebird_1.default(function (resolve, reject) {
        if (!CACHED_CACACHE) {
            if (options && options.useGlobalCache) {
                CACHED_CACACHE = new cache_1.Cacache({
                    name: package_json_1.default.name,
                    useGlobalCache: options.useGlobalCache,
                });
            }
            else {
                CACHED_CACACHE = new cache_1.Cacache(package_json_1.default.name);
            }
        }
        resolve(CACHED_CACACHE);
    });
}
exports.getCacache = getCacache;
function resetSegment() {
    CACHED_SEGMENT = void 0;
}
exports.resetSegment = resetSegment;
function getSegment(options) {
    options = fixOptions(options);
    let { disableCache } = options;
    return bluebird_1.default
        .resolve()
        .then(async function () {
        await getCacache(options);
        const optionsSegment = {
            autoCjk: true,
            optionsDoSegment: {
                convertSynonym: true,
            },
            all_mod: true,
            ...options.optionsSegment,
        };
        if (!CACHED_SEGMENT) {
            CACHED_SEGMENT = new novel_segment_1.default(optionsSegment);
            let _info = await loadCacheInfo(options);
            let version = {
                [package_json_1.default.name]: package_json_1.default.version,
                ...novel_segment_1.default.versions,
                [package_json_1.default.name]: package_json_1.default.version,
            };
            let cache_db = await loadCacheDb(options);
            let _do_init;
            if (disableCache) {
                _do_init = true;
            }
            if (typeof _do_init == 'undefined'
                && _info
                && _info.current
                && _info.current[package_json_1.default.name]) {
                Object.keys(version)
                    .some(key => {
                    let bool = _info[key] != version[key];
                    if (bool) {
                        util_1.debugConsole.debug(`本次執行的版本與上次緩存的版本不同`);
                        _do_init = true;
                    }
                    return bool;
                });
            }
            if (typeof _do_init == 'undefined' && cache_db) {
                if (cache_db.DICT) {
                    util_1.debugConsole.debug(`載入緩存字典`);
                    lib_1.useDefault(CACHED_SEGMENT, {
                        ...optionsSegment,
                        nodict: true,
                        all_mod: true,
                    });
                    CACHED_SEGMENT.DICT = cache_db.DICT;
                    CACHED_SEGMENT.inited = true;
                    _do_init = false;
                    //console.dir(CACHED_SEGMENT.modules);
                }
            }
            if (typeof _do_init == 'undefined' || _do_init) {
                util_1.debugConsole.debug(`重新載入分析字典`);
                CACHED_SEGMENT.autoInit(optionsSegment);
                _do_init = true;
            }
            else {
                dict_1.useDefaultBlacklistDict(CACHED_SEGMENT, optionsSegment);
                dict_1.useDefaultSynonymDict(CACHED_SEGMENT, optionsSegment);
                CACHED_SEGMENT.doBlacklist();
            }
            let db_dict = CACHED_SEGMENT.getDictDatabase('TABLE', true);
            db_dict.TABLE = CACHED_SEGMENT.DICT['TABLE'];
            db_dict.TABLE2 = CACHED_SEGMENT.DICT['TABLE2'];
            db_dict.options.autoCjk = true;
            //CACHED_SEGMENT.loadSynonymDict('synonym', true);
            let size_db_dict = db_dict.size();
            CACHED_SEGMENT.loadSynonymDict('synonym', true);
            let size_segment = Object.keys(CACHED_SEGMENT.getDict('SYNONYM')).length;
            util_1.debugConsole.debug('主字典總數', size_db_dict);
            util_1.debugConsole.debug('Synonym', size_segment);
            _info.last = Object.assign({}, _info.current);
            _info.current = {
                size_db_dict,
                size_segment,
                size_db_dict_diff: size_db_dict - (_info.last.size_db_dict || 0),
                size_segment_diff: size_segment - (_info.last.size_segment || 0),
                version,
            };
            util_1.debugConsole.debug(_info);
            if (!disableCache
                && (_do_init || !cache_db || !cache_db.DICT)) {
                await CACHED_CACACHE.writeJSON(options.USER_DB_KEY, {
                    ..._info,
                    DICT: CACHED_SEGMENT.DICT,
                });
                util_1.debugConsole.debug(`緩存字典於 ${options.USER_DB_KEY}`, CACHED_CACACHE.cachePath);
            }
            util_1.freeGC();
        }
        return CACHED_SEGMENT;
    });
}
exports.getSegment = getSegment;
function loadCacheInfo(options) {
    return bluebird_1.default
        .resolve()
        .then(async function () {
        await getCacache(options);
        let has_cache_db = await CACHED_CACACHE.hasData(options.USER_DB_KEY_INFO);
        let data;
        if (has_cache_db) {
            data = await CACHED_CACACHE
                .readJSON(options.USER_DB_KEY_INFO)
                .then(function (ret) {
                return ret.json;
            });
        }
        data = data || {};
        data.last = data.last || {};
        data.current = data.current || {};
        data.last.version = data.last.version || {};
        data.current.version = data.current.version || {};
        return data;
    });
}
exports.loadCacheInfo = loadCacheInfo;
function loadCacheDb(options) {
    options = fixOptions(options);
    let { disableCache } = options;
    if (disableCache) {
        return bluebird_1.default
            .resolve(null);
    }
    return bluebird_1.default
        .resolve()
        .then(async function () {
        await getCacache(options);
        let has_cache_db = await CACHED_CACACHE.hasData(options.USER_DB_KEY, {
            ttl: options.ttl > 0 ? options.ttl : DB_TTL,
        });
        if (has_cache_db) {
            util_1.debugConsole.debug(`發現緩存 ${options.USER_DB_KEY}`, has_cache_db.path);
            return CACHED_CACACHE
                .readJSON(options.USER_DB_KEY)
                .then(function (ret) {
                return ret.json;
            });
        }
        return null;
    });
}
exports.loadCacheDb = loadCacheDb;
function removeCache(options) {
    let opts = fixOptions(options);
    return bluebird_1.default.all(array_hyper_unique_1.array_unique([
        opts,
        lodash_1.merge({}, opts, {
            optionsSegment: {
                nodeNovelMode: true,
            }
        }),
        lodash_1.merge({}, opts, {
            optionsSegment: {
                nodeNovelMode: false,
            }
        }),
    ]))
        .map(async (o) => {
        const cache = await getCacache(o);
        await cache.clearMemoized();
        await cache.removeAll();
    });
}
exports.removeCache = removeCache;
function resetCache() {
    CACHED_CACACHE = void 0;
}
exports.resetCache = resetCache;
//# sourceMappingURL=index.js.map