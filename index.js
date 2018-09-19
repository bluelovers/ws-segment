"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crlf_normalize_1 = require("crlf-normalize");
const novel_segment_1 = require("novel-segment");
exports.stringify = novel_segment_1.stringify;
const bluebird = require("bluebird");
const fs = require("fs-extra");
const lib_1 = require("novel-segment/lib");
const cache_1 = require("./lib/cache");
const util_1 = require("./lib/util");
exports.enableDebug = util_1.enableDebug;
const PACKAGE_JSON = require("./package.json");
const util_2 = require("novel-segment/lib/util");
const iconv = require("iconv-jschardet");
let CACHED_SEGMENT;
let CACHED_CACACHE;
const DB_KEY = 'cache.db';
const DB_KEY_INFO = 'cache.info';
const DB_TTL = 3600 * 1000;
function textSegment(text, options) {
    return getSegment()
        .then(function (segment) {
        return segment.doSegment(text);
    })
        .tap(function (data) {
        return util_2.debug_token(data);
    });
}
exports.textSegment = textSegment;
function fileSegment(file, options) {
    return bluebird.resolve(readFile(file))
        .then(function (buf) {
        return textSegment(buf.toString(), options);
    });
}
exports.fileSegment = fileSegment;
function processText(text, options) {
    return textSegment(text, options)
        .then(function (data) {
        return novel_segment_1.stringify(data);
    })
        .then(function (text) {
        if (options) {
            if (options.crlf) {
                if (typeof options.crlf === 'string') {
                    text = crlf_normalize_1.default(text, options.crlf);
                }
                else {
                    text = crlf_normalize_1.default(text);
                }
            }
        }
        return text;
    });
}
exports.processText = processText;
function processFile(file, options) {
    return bluebird.resolve(readFile(file))
        .then(function (buf) {
        return processText(buf.toString(), options);
    });
}
exports.processFile = processFile;
class SegmentCliError extends Error {
}
exports.SegmentCliError = SegmentCliError;
function readFile(file) {
    return new bluebird((resolve, reject) => {
        if (!fs.existsSync(file)) {
            let e = new SegmentCliError(`ENOENT: no such file or directory, open '${file}'`);
            reject(e);
        }
        else {
            fs.readFile(file).then(resolve);
        }
    })
        .tap(function (buf) {
        if (!buf.length) {
            util_1.console.warn(`此檔案無內容`, file);
        }
        else {
            let chk = iconv.detect(buf);
            if (chk.encoding != 'UTF-8' && chk.encoding != 'ascii') {
                util_1.console.warn('此檔案可能不是 UTF8 請檢查編碼或利用 MadEdit 等工具轉換', chk, file);
            }
        }
    });
}
exports.readFile = readFile;
function getCacache() {
    if (!CACHED_CACACHE) {
        CACHED_CACACHE = new cache_1.Cacache();
    }
    return bluebird.resolve(CACHED_CACACHE);
}
exports.getCacache = getCacache;
function getSegment(disableCache) {
    return bluebird
        .resolve()
        .then(async function () {
        await getCacache();
        if (!CACHED_SEGMENT) {
            CACHED_SEGMENT = new novel_segment_1.default({
                autoCjk: true,
                optionsDoSegment: {
                    convertSynonym: true,
                },
            });
            let options = {
                /**
                 * 開啟 all_mod 才會在自動載入時包含 ZhtSynonymOptimizer
                 */
                all_mod: true,
            };
            let _info = await loadCacheInfo();
            let version = {
                [PACKAGE_JSON.name]: PACKAGE_JSON.version,
                'novel-segment': novel_segment_1.default.version,
                'segment-dict': novel_segment_1.default.version_dict,
            };
            let cache_db = await loadCacheDb(disableCache);
            let _do_init;
            if (disableCache) {
                _do_init = true;
            }
            if (typeof _do_init == 'undefined'
                && _info
                && _info.current
                && _info.current[PACKAGE_JSON.name]) {
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
                    lib_1.useDefault(CACHED_SEGMENT, Object.assign({}, options, { nodict: true }));
                    CACHED_SEGMENT.DICT = cache_db.DICT;
                    CACHED_SEGMENT.inited = true;
                    _do_init = false;
                }
            }
            if (typeof _do_init == 'undefined' || _do_init) {
                util_1.debugConsole.debug(`重新載入分析字典`);
                CACHED_SEGMENT.autoInit(options);
                _do_init = true;
            }
            let db_dict = CACHED_SEGMENT.getDictDatabase('TABLE', true);
            db_dict.TABLE = CACHED_SEGMENT.DICT['TABLE'];
            db_dict.TABLE2 = CACHED_SEGMENT.DICT['TABLE2'];
            db_dict.options.autoCjk = true;
            CACHED_SEGMENT.loadSynonymDict('synonym', true);
            let size_db_dict = db_dict.size();
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
                await CACHED_CACACHE.writeJSON(DB_KEY, Object.assign({}, _info, { DICT: CACHED_SEGMENT.DICT }));
                util_1.debugConsole.debug(`緩存字典於 ${DB_KEY}`);
            }
        }
        return CACHED_SEGMENT;
    });
}
exports.getSegment = getSegment;
function loadCacheInfo() {
    return bluebird
        .resolve()
        .then(async function () {
        await getCacache();
        let has_cache_db = await CACHED_CACACHE.hasData(DB_KEY_INFO);
        let data;
        if (has_cache_db) {
            data = await CACHED_CACACHE
                .readJSON(DB_KEY_INFO)
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
function loadCacheDb(disableCache) {
    if (disableCache) {
        return bluebird
            .resolve(null);
    }
    return bluebird
        .resolve()
        .then(async function () {
        await getCacache();
        let has_cache_db = await CACHED_CACACHE.hasData(DB_KEY, {
            ttl: DB_TTL,
        });
        if (has_cache_db) {
            util_1.debugConsole.debug(`發現緩存 ${DB_KEY}`);
            return CACHED_CACACHE
                .readJSON(DB_KEY)
                .then(function (ret) {
                return ret.json;
            });
        }
        return null;
    });
}
exports.loadCacheDb = loadCacheDb;
