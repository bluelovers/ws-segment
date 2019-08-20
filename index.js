"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crlf_normalize_1 = require("crlf-normalize");
const novel_segment_1 = require("novel-segment");
exports.stringify = novel_segment_1.stringify;
const Bluebird = require("bluebird");
const fs = require("fs-iconv");
const lib_1 = require("novel-segment/lib");
const cache_1 = require("./lib/cache");
const util_1 = require("./lib/util");
exports.enableDebug = util_1.enableDebug;
const PACKAGE_JSON = require("./package.json");
const util_2 = require("novel-segment/lib/util");
const iconv = require("iconv-jschardet");
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
    return Bluebird.resolve(readFile(file))
        .then(function (buf) {
        return textSegment(buf.toString(), options);
    });
}
exports.fileSegment = fileSegment;
function processText(text, options) {
    if (!text.length || !text.replace(/\s+/g, '').length) {
        return Bluebird.resolve('');
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
    return Bluebird.resolve(readFile(file, options))
        .then(function (buf) {
        return processText(buf.toString(), options);
    });
}
exports.processFile = processFile;
class SegmentCliError extends Error {
}
exports.SegmentCliError = SegmentCliError;
function readFile(file, options) {
    return Bluebird.resolve().then(() => {
        if (!fs.existsSync(file)) {
            let e = new SegmentCliError(`ENOENT: no such file or directory, open '${file}'`);
            return Bluebird.reject(e);
        }
        return fs.loadFile(file, {
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
            let chk = iconv.detect(buf);
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
    return new Bluebird(function (resolve, reject) {
        if (!CACHED_CACACHE) {
            if (options && options.useGlobalCache) {
                CACHED_CACACHE = new cache_1.Cacache({
                    name: PACKAGE_JSON.name,
                    useGlobalCache: options.useGlobalCache,
                });
            }
            else {
                CACHED_CACACHE = new cache_1.Cacache(PACKAGE_JSON.name);
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
    return Bluebird
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
                [PACKAGE_JSON.name]: PACKAGE_JSON.version,
                ...novel_segment_1.default.versions,
                [PACKAGE_JSON.name]: PACKAGE_JSON.version,
            };
            let cache_db = await loadCacheDb(options);
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
    return Bluebird
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
        return Bluebird
            .resolve(null);
    }
    return Bluebird
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
    return Bluebird.all(array_hyper_unique_1.array_unique([
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG1EQUFrQztBQUNsQyxpREFBbUQ7QUE0QjdCLG9CQTVCSix5QkFBUyxDQTRCSTtBQTNCL0IscUNBQXNDO0FBQ3RDLCtCQUErQjtBQUMvQiwyQ0FBK0M7QUFDL0MsdUNBQXNDO0FBQ3RDLHFDQUF5RjtBQXVCaEYsc0JBdkJ3QyxrQkFBVyxDQXVCeEM7QUF0QnBCLCtDQUFnRDtBQUNoRCxpREFBb0Q7QUFDcEQseUNBQXlDO0FBQ3pDLHFEQUFtRTtBQUduRSwwREFBaUc7QUFFakcsbUNBQTBDO0FBQzFDLDJEQUFrRDtBQUVsRCxJQUFJLGNBQTJELENBQUM7QUFDaEUsSUFBSSxjQUF1QixDQUFDO0FBRTVCLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQztBQUMxQixNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUM7QUFFakMsTUFBTSxPQUFPLEdBQUcseUJBQXlCLENBQUM7QUFDMUMsTUFBTSxZQUFZLEdBQUcsMkJBQTJCLENBQUM7QUFFakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztBQTBCM0IsU0FBZ0IsV0FBVyxDQUFDLElBQVksRUFBRSxPQUE0QjtJQUVyRSxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUM7U0FDeEIsSUFBSSxDQUFDLFVBQVUsT0FBTztRQUV0QixPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBQyxDQUFDO1NBQ0QsR0FBRyxDQUFDLFVBQVUsSUFBSTtRQUVsQixPQUFPLGtCQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDekIsQ0FBQyxDQUFDLENBQ0Q7QUFDSCxDQUFDO0FBWkQsa0NBWUM7QUFFRCxTQUFnQixXQUFXLENBQUMsSUFBWSxFQUFFLE9BQTRCO0lBRXJFLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7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QUFDeEIsQ0FBQztBQUhELGdDQUdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNhY2FjaGUgPSByZXF1aXJlKCdjYWNhY2hlJyk7XG5pbXBvcnQgY3JsZiBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgU2VnbWVudCwgeyBzdHJpbmdpZnkgfSBmcm9tICdub3ZlbC1zZWdtZW50JztcbmltcG9ydCBCbHVlYmlyZCA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1pY29udic7XG5pbXBvcnQgeyB1c2VEZWZhdWx0IH0gZnJvbSAnbm92ZWwtc2VnbWVudC9saWInO1xuaW1wb3J0IHsgQ2FjYWNoZSB9IGZyb20gJy4vbGliL2NhY2hlJztcbmltcG9ydCB7IGNvbnNvbGUsIGRlYnVnQ29uc29sZSwgZ2V0Q2FjaGVEaXJQYXRoLCBlbmFibGVEZWJ1ZywgZnJlZUdDIH0gZnJvbSAnLi9saWIvdXRpbCc7XG5pbXBvcnQgUEFDS0FHRV9KU09OID0gcmVxdWlyZSgnLi9wYWNrYWdlLmpzb24nKTtcbmltcG9ydCB7IGRlYnVnX3Rva2VuIH0gZnJvbSAnbm92ZWwtc2VnbWVudC9saWIvdXRpbCdcbmltcG9ydCAqIGFzIGljb252IGZyb20gJ2ljb252LWpzY2hhcmRldCc7XG5pbXBvcnQgeyBjbjJ0d19taW4sIHR3MmNuX21pbiB9IGZyb20gJ2Nqay1jb252L2xpYi96aC9jb252ZXJ0L21pbic7XG5pbXBvcnQgeyBJVXNlRGVmYXVsdE9wdGlvbnMgfSBmcm9tICdub3ZlbC1zZWdtZW50L2xpYi9kZWZhdWx0cy9pbmRleCc7XG5pbXBvcnQgeyBJT3B0aW9uc1NlZ21lbnQgfSBmcm9tICdub3ZlbC1zZWdtZW50L2xpYi9zZWdtZW50L3R5cGVzJztcbmltcG9ydCB7IHVzZURlZmF1bHRCbGFja2xpc3REaWN0LCB1c2VEZWZhdWx0U3lub255bURpY3QgfSBmcm9tICdub3ZlbC1zZWdtZW50L2xpYi9kZWZhdWx0cy9kaWN0JztcblxuaW1wb3J0IHsgbWVyZ2UsIGNsb25lRGVlcCB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuXG5sZXQgQ0FDSEVEX1NFR01FTlQ6IGltcG9ydChcIm5vdmVsLXNlZ21lbnQvbGliL1NlZ21lbnRcIikuU2VnbWVudDtcbmxldCBDQUNIRURfQ0FDQUNIRTogQ2FjYWNoZTtcblxuY29uc3QgREJfS0VZID0gJ2NhY2hlLmRiJztcbmNvbnN0IERCX0tFWV9JTkZPID0gJ2NhY2hlLmluZm8nO1xuXG5jb25zdCBEQl9LRVkyID0gJ2NhY2hlLmNvbW1vbi5zeW5vbnltLmRiJztcbmNvbnN0IERCX0tFWTJfSU5GTyA9ICdjYWNoZS5jb21tb24uc3lub255bS5pbmZvJztcblxuY29uc3QgREJfVFRMID0gMzYwMCAqIDEwMDA7XG5cbmV4cG9ydCB7IGVuYWJsZURlYnVnLCBzdHJpbmdpZnkgfVxuXG5leHBvcnQgaW50ZXJmYWNlIElTZWdtZW50Q0xJT3B0aW9uc1xue1xuXHQvKipcblx0ICog5qC85byP5YyW5YiG6KGM56ym6JmfXG5cdCAqL1xuXHRjcmxmPzogc3RyaW5nIHwgYm9vbGVhbixcblxuXHR1c2VHbG9iYWxDYWNoZT86IGJvb2xlYW4sXG5cdGRpc2FibGVDYWNoZT86IGJvb2xlYW4sXG5cblx0ZGlzYWJsZVdhcm4/OiBib29sZWFuLFxuXG5cdHR0bD86IG51bWJlcixcblxuXHRjb252ZXJ0VG9aaFR3PzogYm9vbGVhbixcblxuXHRvcHRpb25zU2VnbWVudD86IElPcHRpb25zU2VnbWVudCxcblxuXHRVU0VSX0RCX0tFWT86IHN0cmluZyxcblx0VVNFUl9EQl9LRVlfSU5GTz86IHN0cmluZyxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRleHRTZWdtZW50KHRleHQ6IHN0cmluZywgb3B0aW9ucz86IElTZWdtZW50Q0xJT3B0aW9ucylcbntcblx0cmV0dXJuIGdldFNlZ21lbnQob3B0aW9ucylcblx0XHQudGhlbihmdW5jdGlvbiAoc2VnbWVudClcblx0XHR7XG5cdFx0XHRyZXR1cm4gc2VnbWVudC5kb1NlZ21lbnQodGV4dCk7XG5cdFx0fSlcblx0XHQudGFwKGZ1bmN0aW9uIChkYXRhKVxuXHRcdHtcblx0XHRcdHJldHVybiBkZWJ1Z190b2tlbihkYXRhKVxuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsZVNlZ21lbnQoZmlsZTogc3RyaW5nLCBvcHRpb25zPzogSVNlZ21lbnRDTElPcHRpb25zKVxue1xuXHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZShyZWFkRmlsZShmaWxlKSlcblx0XHQudGhlbihmdW5jdGlvbiAoYnVmKVxuXHRcdHtcblx0XHRcdHJldHVybiB0ZXh0U2VnbWVudChidWYudG9TdHJpbmcoKSwgb3B0aW9ucyk7XG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzVGV4dCh0ZXh0OiBzdHJpbmcsIG9wdGlvbnM/OiBJU2VnbWVudENMSU9wdGlvbnMpXG57XG5cdGlmICghdGV4dC5sZW5ndGggfHwgIXRleHQucmVwbGFjZSgvXFxzKy9nLCAnJykubGVuZ3RoKVxuXHR7XG5cdFx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoJycpO1xuXHR9XG5cblx0cmV0dXJuIHRleHRTZWdtZW50KHRleHQsIG9wdGlvbnMpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKGRhdGEpXG5cdFx0e1xuXHRcdFx0bGV0IHRleHQgPSBzdHJpbmdpZnkoZGF0YSk7XG5cdFx0XHRpZiAob3B0aW9ucylcblx0XHRcdHtcblx0XHRcdFx0aWYgKG9wdGlvbnMuY3JsZilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jcmxmID09PSAnc3RyaW5nJylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0ZXh0ID0gY3JsZih0ZXh0LCBvcHRpb25zLmNybGYpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGV4dCA9IGNybGYodGV4dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9wdGlvbnMuY29udmVydFRvWmhUdylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRleHQgPSBjbjJ0d19taW4odGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZnJlZUdDKCk7XG5cblx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0ZpbGUoZmlsZTogc3RyaW5nLCBvcHRpb25zPzogSVNlZ21lbnRDTElPcHRpb25zKVxue1xuXHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZShyZWFkRmlsZShmaWxlLCBvcHRpb25zKSlcblx0XHQudGhlbihmdW5jdGlvbiAoYnVmKVxuXHRcdHtcblx0XHRcdHJldHVybiBwcm9jZXNzVGV4dChidWYudG9TdHJpbmcoKSwgb3B0aW9ucyk7XG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBjbGFzcyBTZWdtZW50Q2xpRXJyb3IgZXh0ZW5kcyBFcnJvclxue1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkRmlsZShmaWxlOiBzdHJpbmcsIG9wdGlvbnM/OiBJU2VnbWVudENMSU9wdGlvbnMpOiBCbHVlYmlyZDxCdWZmZXI+XG57XG5cdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKCkudGhlbigoKSA9PlxuXHRcdHtcblx0XHRcdGlmICghZnMuZXhpc3RzU3luYyhmaWxlKSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGUgPSBuZXcgU2VnbWVudENsaUVycm9yKGBFTk9FTlQ6IG5vIHN1Y2ggZmlsZSBvciBkaXJlY3RvcnksIG9wZW4gJyR7ZmlsZX0nYCk7XG5cdFx0XHRcdHJldHVybiBCbHVlYmlyZC5yZWplY3QoZSlcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZzLmxvYWRGaWxlKGZpbGUsIHtcblx0XHRcdFx0XHRhdXRvRGVjb2RlOiB0cnVlLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbih2ID0+IEJ1ZmZlci5mcm9tKHYpKVxuXHRcdFx0XHQ7XG5cdFx0fSlcblx0XHQudGFwKGZ1bmN0aW9uIChidWYpXG5cdFx0e1xuXHRcdFx0aWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5kaXNhYmxlV2Fybilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWJ1Zi5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUud2Fybihg5q2k5qqU5qGI54Sh5YWn5a65YCwgZmlsZSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBjaGsgPSBpY29udi5kZXRlY3QoYnVmKTtcblxuXHRcdFx0XHRpZiAoY2hrLmVuY29kaW5nICE9ICdVVEYtOCcgJiYgY2hrLmVuY29kaW5nICE9ICdhc2NpaScpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oJ+atpOaqlOahiOWPr+iDveS4jeaYryBVVEY4IOiri+aqouafpee3qOeivOaIluWIqeeUqCBNYWRFZGl0IOetieW3peWFt+i9ieaPmycsIGNoaywgZmlsZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpeE9wdGlvbnM8VCBleHRlbmRzIElTZWdtZW50Q0xJT3B0aW9ucz4ob3B0aW9ucz86IFQpOiBUICYgSVNlZ21lbnRDTElPcHRpb25zXG57XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9IGFzIFQ7XG5cblx0aWYgKHR5cGVvZiBvcHRpb25zLnR0bCAhPT0gJ251bWJlcicgfHwgb3B0aW9ucy50dGwgPCAxKVxuXHR7XG5cdFx0ZGVsZXRlIG9wdGlvbnMudHRsO1xuXHR9XG5cblx0b3B0aW9ucy5vcHRpb25zU2VnbWVudCA9IG9wdGlvbnMub3B0aW9uc1NlZ21lbnQgfHwge307XG5cblx0aWYgKG9wdGlvbnMub3B0aW9uc1NlZ21lbnQubm9kZU5vdmVsTW9kZSlcblx0e1xuXHRcdG9wdGlvbnMuVVNFUl9EQl9LRVkgPSBvcHRpb25zLlVTRVJfREJfS0VZIHx8IERCX0tFWTI7XG5cdFx0b3B0aW9ucy5VU0VSX0RCX0tFWV9JTkZPID0gb3B0aW9ucy5VU0VSX0RCX0tFWV9JTkZPIHx8IERCX0tFWTJfSU5GTztcblx0fVxuXHRlbHNlXG5cdHtcblx0XHRvcHRpb25zLlVTRVJfREJfS0VZID0gb3B0aW9ucy5VU0VSX0RCX0tFWSB8fCBEQl9LRVk7XG5cdFx0b3B0aW9ucy5VU0VSX0RCX0tFWV9JTkZPID0gb3B0aW9ucy5VU0VSX0RCX0tFWV9JTkZPIHx8IERCX0tFWV9JTkZPO1xuXHR9XG5cblx0cmV0dXJuIG9wdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYWNhY2hlKG9wdGlvbnM/OiBJU2VnbWVudENMSU9wdGlvbnMpXG57XG5cdHJldHVybiBuZXcgQmx1ZWJpcmQ8Q2FjYWNoZT4oZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdClcblx0e1xuXHRcdGlmICghQ0FDSEVEX0NBQ0FDSEUpXG5cdFx0e1xuXHRcdFx0aWYgKG9wdGlvbnMgJiYgb3B0aW9ucy51c2VHbG9iYWxDYWNoZSlcblx0XHRcdHtcblx0XHRcdFx0Q0FDSEVEX0NBQ0FDSEUgPSBuZXcgQ2FjYWNoZSh7XG5cdFx0XHRcdFx0bmFtZTogUEFDS0FHRV9KU09OLm5hbWUsXG5cdFx0XHRcdFx0dXNlR2xvYmFsQ2FjaGU6IG9wdGlvbnMudXNlR2xvYmFsQ2FjaGUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRDQUNIRURfQ0FDQUNIRSA9IG5ldyBDYWNhY2hlKFBBQ0tBR0VfSlNPTi5uYW1lKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXNvbHZlKENBQ0hFRF9DQUNBQ0hFKVxuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0U2VnbWVudCgpXG57XG5cdENBQ0hFRF9TRUdNRU5UID0gdm9pZCAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VnbWVudChvcHRpb25zPzogSVNlZ21lbnRDTElPcHRpb25zKVxue1xuXHRvcHRpb25zID0gZml4T3B0aW9ucyhvcHRpb25zKTtcblx0bGV0IHsgZGlzYWJsZUNhY2hlIH0gPSBvcHRpb25zO1xuXG5cdHJldHVybiBCbHVlYmlyZFxuXHRcdC5yZXNvbHZlKClcblx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGF3YWl0IGdldENhY2FjaGUob3B0aW9ucyk7XG5cblx0XHRcdGNvbnN0IG9wdGlvbnNTZWdtZW50OiBJT3B0aW9uc1NlZ21lbnQgPSB7XG5cdFx0XHRcdGF1dG9Dams6IHRydWUsXG5cblx0XHRcdFx0b3B0aW9uc0RvU2VnbWVudDoge1xuXG5cdFx0XHRcdFx0Y29udmVydFN5bm9ueW06IHRydWUsXG5cblx0XHRcdFx0fSxcblxuXHRcdFx0XHRhbGxfbW9kOiB0cnVlLFxuXG5cdFx0XHRcdC4uLm9wdGlvbnMub3B0aW9uc1NlZ21lbnQsXG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAoIUNBQ0hFRF9TRUdNRU5UKVxuXHRcdFx0e1xuXHRcdFx0XHRDQUNIRURfU0VHTUVOVCA9IG5ldyBTZWdtZW50KG9wdGlvbnNTZWdtZW50KTtcblxuXHRcdFx0XHRsZXQgX2luZm8gPSBhd2FpdCBsb2FkQ2FjaGVJbmZvKG9wdGlvbnMpO1xuXG5cdFx0XHRcdGxldCB2ZXJzaW9uID0ge1xuXHRcdFx0XHRcdFtQQUNLQUdFX0pTT04ubmFtZV06IFBBQ0tBR0VfSlNPTi52ZXJzaW9uLFxuXHRcdFx0XHRcdC4uLlNlZ21lbnQudmVyc2lvbnMsXG5cdFx0XHRcdFx0W1BBQ0tBR0VfSlNPTi5uYW1lXTogUEFDS0FHRV9KU09OLnZlcnNpb24sXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bGV0IGNhY2hlX2RiID0gYXdhaXQgbG9hZENhY2hlRGIob3B0aW9ucyk7XG5cblx0XHRcdFx0bGV0IF9kb19pbml0OiBib29sZWFuO1xuXG5cdFx0XHRcdGlmIChkaXNhYmxlQ2FjaGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfZG9faW5pdCA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodHlwZW9mIF9kb19pbml0ID09ICd1bmRlZmluZWQnXG5cdFx0XHRcdFx0JiYgX2luZm9cblx0XHRcdFx0XHQmJiBfaW5mby5jdXJyZW50XG5cdFx0XHRcdFx0JiYgX2luZm8uY3VycmVudFtQQUNLQUdFX0pTT04ubmFtZV1cblx0XHRcdFx0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0T2JqZWN0LmtleXModmVyc2lvbilcblx0XHRcdFx0XHRcdC5zb21lKGtleSA9PlxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgYm9vbCA9IF9pbmZvW2tleV0gIT0gdmVyc2lvbltrZXldO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGVidWdDb25zb2xlLmRlYnVnKGDmnKzmrKHln7fooYznmoTniYjmnKzoiIfkuIrmrKHnt6nlrZjnmoTniYjmnKzkuI3lkIxgKTtcblx0XHRcdFx0XHRcdFx0XHRfZG9faW5pdCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYm9vbDtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHR5cGVvZiBfZG9faW5pdCA9PSAndW5kZWZpbmVkJyAmJiBjYWNoZV9kYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChjYWNoZV9kYi5ESUNUKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGRlYnVnQ29uc29sZS5kZWJ1Zyhg6LyJ5YWl57ep5a2Y5a2X5YW4YCk7XG5cblx0XHRcdFx0XHRcdHVzZURlZmF1bHQoQ0FDSEVEX1NFR01FTlQsIHtcblx0XHRcdFx0XHRcdFx0Li4ub3B0aW9uc1NlZ21lbnQsXG5cdFx0XHRcdFx0XHRcdG5vZGljdDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0YWxsX21vZDogdHJ1ZSxcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRDQUNIRURfU0VHTUVOVC5ESUNUID0gY2FjaGVfZGIuRElDVDtcblxuXHRcdFx0XHRcdFx0Q0FDSEVEX1NFR01FTlQuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0X2RvX2luaXQgPSBmYWxzZTtcblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmRpcihDQUNIRURfU0VHTUVOVC5tb2R1bGVzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodHlwZW9mIF9kb19pbml0ID09ICd1bmRlZmluZWQnIHx8IF9kb19pbml0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGVidWdDb25zb2xlLmRlYnVnKGDph43mlrDovInlhaXliIbmnpDlrZflhbhgKTtcblxuXHRcdFx0XHRcdENBQ0hFRF9TRUdNRU5ULmF1dG9Jbml0KG9wdGlvbnNTZWdtZW50KTtcblxuXHRcdFx0XHRcdF9kb19pbml0ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR1c2VEZWZhdWx0QmxhY2tsaXN0RGljdChDQUNIRURfU0VHTUVOVCwgb3B0aW9uc1NlZ21lbnQpO1xuXG5cdFx0XHRcdFx0dXNlRGVmYXVsdFN5bm9ueW1EaWN0KENBQ0hFRF9TRUdNRU5ULCBvcHRpb25zU2VnbWVudCk7XG5cblx0XHRcdFx0XHRDQUNIRURfU0VHTUVOVC5kb0JsYWNrbGlzdCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IGRiX2RpY3QgPSBDQUNIRURfU0VHTUVOVC5nZXREaWN0RGF0YWJhc2UoJ1RBQkxFJywgdHJ1ZSk7XG5cdFx0XHRcdGRiX2RpY3QuVEFCTEUgPSBDQUNIRURfU0VHTUVOVC5ESUNUWydUQUJMRSddO1xuXHRcdFx0XHRkYl9kaWN0LlRBQkxFMiA9IENBQ0hFRF9TRUdNRU5ULkRJQ1RbJ1RBQkxFMiddO1xuXG5cdFx0XHRcdGRiX2RpY3Qub3B0aW9ucy5hdXRvQ2prID0gdHJ1ZTtcblxuXHRcdFx0XHQvL0NBQ0hFRF9TRUdNRU5ULmxvYWRTeW5vbnltRGljdCgnc3lub255bScsIHRydWUpO1xuXG5cdFx0XHRcdGxldCBzaXplX2RiX2RpY3QgPSBkYl9kaWN0LnNpemUoKTtcblxuXHRcdFx0XHRDQUNIRURfU0VHTUVOVC5sb2FkU3lub255bURpY3QoJ3N5bm9ueW0nLCB0cnVlKTtcblxuXHRcdFx0XHRsZXQgc2l6ZV9zZWdtZW50ID0gT2JqZWN0LmtleXMoQ0FDSEVEX1NFR01FTlQuZ2V0RGljdCgnU1lOT05ZTScpKS5sZW5ndGg7XG5cblx0XHRcdFx0ZGVidWdDb25zb2xlLmRlYnVnKCfkuLvlrZflhbjnuL3mlbgnLCBzaXplX2RiX2RpY3QpO1xuXHRcdFx0XHRkZWJ1Z0NvbnNvbGUuZGVidWcoJ1N5bm9ueW0nLCBzaXplX3NlZ21lbnQpO1xuXG5cdFx0XHRcdF9pbmZvLmxhc3QgPSBPYmplY3QuYXNzaWduKHt9LCBfaW5mby5jdXJyZW50KTtcblxuXHRcdFx0XHRfaW5mby5jdXJyZW50ID0ge1xuXHRcdFx0XHRcdHNpemVfZGJfZGljdCxcblx0XHRcdFx0XHRzaXplX3NlZ21lbnQsXG5cdFx0XHRcdFx0c2l6ZV9kYl9kaWN0X2RpZmY6IHNpemVfZGJfZGljdCAtIChfaW5mby5sYXN0LnNpemVfZGJfZGljdCB8fCAwKSxcblx0XHRcdFx0XHRzaXplX3NlZ21lbnRfZGlmZjogc2l6ZV9zZWdtZW50IC0gKF9pbmZvLmxhc3Quc2l6ZV9zZWdtZW50IHx8IDApLFxuXG5cdFx0XHRcdFx0dmVyc2lvbixcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRkZWJ1Z0NvbnNvbGUuZGVidWcoX2luZm8pO1xuXG5cdFx0XHRcdGlmICghZGlzYWJsZUNhY2hlXG5cdFx0XHRcdFx0JiYgKF9kb19pbml0IHx8ICFjYWNoZV9kYiB8fCAhY2FjaGVfZGIuRElDVClcblx0XHRcdFx0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YXdhaXQgQ0FDSEVEX0NBQ0FDSEUud3JpdGVKU09OKG9wdGlvbnMuVVNFUl9EQl9LRVksIHtcblxuXHRcdFx0XHRcdFx0Li4uX2luZm8sXG5cblx0XHRcdFx0XHRcdERJQ1Q6IENBQ0hFRF9TRUdNRU5ULkRJQ1QsXG5cdFx0XHRcdFx0fSBhcyBJRGF0YUNhY2hlKTtcblxuXHRcdFx0XHRcdGRlYnVnQ29uc29sZS5kZWJ1Zyhg57ep5a2Y5a2X5YW45pa8ICR7b3B0aW9ucy5VU0VSX0RCX0tFWX1gLCBDQUNIRURfQ0FDQUNIRS5jYWNoZVBhdGgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZnJlZUdDKCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBDQUNIRURfU0VHTUVOVDtcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJRGF0YUNhY2hlSW5mb1xue1xuXHRzaXplX2RiX2RpY3Q/OiBudW1iZXIsXG5cdHNpemVfc2VnbWVudD86IG51bWJlcixcblx0c2l6ZV9kYl9kaWN0X2RpZmY/OiBudW1iZXIsXG5cdHNpemVfc2VnbWVudF9kaWZmPzogbnVtYmVyLFxuXG5cdHZlcnNpb24/OiB7XG5cdFx0J25vdmVsLXNlZ21lbnQtY2xpJz86IHN0cmluZyxcblx0XHQnbm92ZWwtc2VnbWVudCc/OiBzdHJpbmcsXG5cdFx0J3NlZ21lbnQtZGljdCc/OiBzdHJpbmcsXG5cdH0sXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSURhdGFDYWNoZVxue1xuXHRsYXN0PzogSURhdGFDYWNoZUluZm8sXG5cdGN1cnJlbnQ/OiBJRGF0YUNhY2hlSW5mbyxcblx0RElDVD86IGFueSxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRDYWNoZUluZm8ob3B0aW9ucz86IElTZWdtZW50Q0xJT3B0aW9ucylcbntcblx0cmV0dXJuIEJsdWViaXJkXG5cdFx0LnJlc29sdmUoKVxuXHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0YXdhaXQgZ2V0Q2FjYWNoZShvcHRpb25zKTtcblxuXHRcdFx0bGV0IGhhc19jYWNoZV9kYiA9IGF3YWl0IENBQ0hFRF9DQUNBQ0hFLmhhc0RhdGEob3B0aW9ucy5VU0VSX0RCX0tFWV9JTkZPKTtcblxuXHRcdFx0bGV0IGRhdGE6IElEYXRhQ2FjaGU7XG5cblx0XHRcdGlmIChoYXNfY2FjaGVfZGIpXG5cdFx0XHR7XG5cdFx0XHRcdGRhdGEgPSBhd2FpdCBDQUNIRURfQ0FDQUNIRVxuXHRcdFx0XHRcdC5yZWFkSlNPTjxJRGF0YUNhY2hlPihvcHRpb25zLlVTRVJfREJfS0VZX0lORk8pXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmV0Lmpzb247XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXHRcdFx0fVxuXG5cdFx0XHRkYXRhID0gZGF0YSB8fCB7fTtcblxuXHRcdFx0ZGF0YS5sYXN0ID0gZGF0YS5sYXN0IHx8IHt9O1xuXHRcdFx0ZGF0YS5jdXJyZW50ID0gZGF0YS5jdXJyZW50IHx8IHt9O1xuXHRcdFx0ZGF0YS5sYXN0LnZlcnNpb24gPSBkYXRhLmxhc3QudmVyc2lvbiB8fCB7fTtcblx0XHRcdGRhdGEuY3VycmVudC52ZXJzaW9uID0gZGF0YS5jdXJyZW50LnZlcnNpb24gfHwge307XG5cblx0XHRcdHJldHVybiBkYXRhO1xuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZENhY2hlRGIob3B0aW9ucz86IElTZWdtZW50Q0xJT3B0aW9ucyk6IEJsdWViaXJkPElEYXRhQ2FjaGU+XG57XG5cdG9wdGlvbnMgPSBmaXhPcHRpb25zKG9wdGlvbnMpO1xuXHRsZXQgeyBkaXNhYmxlQ2FjaGUgfSA9IG9wdGlvbnM7XG5cblx0aWYgKGRpc2FibGVDYWNoZSlcblx0e1xuXHRcdHJldHVybiBCbHVlYmlyZFxuXHRcdFx0LnJlc29sdmUobnVsbClcblx0XHRcdDtcblx0fVxuXG5cdHJldHVybiBCbHVlYmlyZFxuXHRcdC5yZXNvbHZlKClcblx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGF3YWl0IGdldENhY2FjaGUob3B0aW9ucyk7XG5cblx0XHRcdGxldCBoYXNfY2FjaGVfZGIgPSBhd2FpdCBDQUNIRURfQ0FDQUNIRS5oYXNEYXRhKG9wdGlvbnMuVVNFUl9EQl9LRVksIHtcblx0XHRcdFx0dHRsOiBvcHRpb25zLnR0bCA+IDAgPyBvcHRpb25zLnR0bCA6IERCX1RUTCxcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoaGFzX2NhY2hlX2RiKVxuXHRcdFx0e1xuXHRcdFx0XHRkZWJ1Z0NvbnNvbGUuZGVidWcoYOeZvOePvue3qeWtmCAke29wdGlvbnMuVVNFUl9EQl9LRVl9YCwgaGFzX2NhY2hlX2RiLnBhdGgpO1xuXG5cdFx0XHRcdHJldHVybiBDQUNIRURfQ0FDQUNIRVxuXHRcdFx0XHRcdC5yZWFkSlNPTjxJRGF0YUNhY2hlPihvcHRpb25zLlVTRVJfREJfS0VZKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIHJldC5qc29uO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUNhY2hlKG9wdGlvbnM/OiBJU2VnbWVudENMSU9wdGlvbnMpXG57XG5cdGxldCBvcHRzID0gZml4T3B0aW9ucyhvcHRpb25zKTtcblxuXHRyZXR1cm4gQmx1ZWJpcmQuYWxsKGFycmF5X3VuaXF1ZShbXG5cdFx0b3B0cyxcblx0XHRtZXJnZSh7fSwgb3B0cywgPElTZWdtZW50Q0xJT3B0aW9ucz57XG5cdFx0XHRvcHRpb25zU2VnbWVudDoge1xuXHRcdFx0XHRub2RlTm92ZWxNb2RlOiB0cnVlLFxuXHRcdFx0fVxuXHRcdH0pLFxuXHRcdG1lcmdlKHt9LCBvcHRzLCA8SVNlZ21lbnRDTElPcHRpb25zPntcblx0XHRcdG9wdGlvbnNTZWdtZW50OiB7XG5cdFx0XHRcdG5vZGVOb3ZlbE1vZGU6IGZhbHNlLFxuXHRcdFx0fVxuXHRcdH0pLFxuXHRdKSlcblx0XHQubWFwKGFzeW5jIChvKSA9PiB7XG5cdFx0XHRjb25zdCBjYWNoZSA9IGF3YWl0IGdldENhY2FjaGUobyk7XG5cblx0XHRcdGF3YWl0IGNhY2hlLmNsZWFyTWVtb2l6ZWQoKTtcblx0XHRcdGF3YWl0IGNhY2hlLnJlbW92ZUFsbCgpO1xuXHRcdH0pXG5cdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0Q2FjaGUoKVxue1xuXHRDQUNIRURfQ0FDQUNIRSA9IHZvaWQgMFxufVxuIl19