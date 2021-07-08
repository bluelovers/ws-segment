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
const worker_threads_1 = require("worker_threads");
const lineByLine = require("n-readlines");
const project_config_1 = __importDefault(require("../project.config"));
const path = __importStar(require("upath2"));
const index_1 = require("@novel-segment/loaders/segment/index");
const uni_string_1 = __importDefault(require("uni-string"));
const util_1 = require("@novel-segment/util");
const transliteration_1 = require("transliteration");
const fs = require("fs-extra");
const cjk_conv_1 = require("cjk-conv");
const fast_glob_1 = require("@bluelovers/fast-glob");
const util_2 = require("segment-dict/script/util");
const array_hyper_unique_1 = require("array-hyper-unique");
const loader_line_1 = require("@novel-segment/loader-line");
const debug_color2_1 = require("debug-color2");
const greedy_1 = require("cjk-conv/lib/zh/table/greedy");
const table_1 = __importDefault(require("cjk-conv/lib/zh/table"));
const diff_staged_1 = require("@git-lazy/diff-staged");
const match_1 = require("@git-lazy/util/util/match");
let CWD = path.join(project_config_1.default.temp_root);
var EnumC1;
(function (EnumC1) {
    EnumC1["char"] = "char";
    EnumC1["other"] = "other";
    EnumC1["eng"] = "eng";
})(EnumC1 || (EnumC1 = {}));
const CWD_SAVETO = path.join(CWD, 'cache');
if (0 && (!fs.pathExistsSync(path.join(CWD, 'stringify.txt')) || !(0, match_1.matchGlob)((0, diff_staged_1.gitDiffStagedFile)(CWD), [
    'cache.db.info.json'
]).length)) {
    process.exit();
}
if (worker_threads_1.isMainThread) {
    log("This is the main thread", worker_threads_1.threadId);
    let workerOptions = {
        workerData: {
            time: new Date,
            //count: 0,
            //re: /   /ig,
        },
    };
    let w1 = new worker_threads_1.Worker(__filename, workerOptions);
    //let w2 = new Worker(__filename, workerOptions);
    //	const subChannel = new MessageChannel();
    //
    //	w2.postMessage({
    //		hereIsYourPort: subChannel.port1
    //	}, [subChannel.port1]);
    //	w1.postMessage({
    //		hereIsYourPort: subChannel.port2
    //	}, [subChannel.port2]);
    let timeDiff;
    fs.removeSync(CWD_SAVETO);
    w1.on('message', (msg) => {
        timeDiff = msg.timeDiff;
        //console.dir(msg);
        log(msg.index, msg.list.length);
        let cache = {
            char: [],
            other: [],
            eng: [],
        };
        {
            let i = 'a'.codePointAt(0);
            let j = 'z'.codePointAt(0);
            while (i <= j) {
                cache[String.fromCodePoint(i)] = [];
                i++;
            }
        }
        cache = msg.list.reduce(function (cache, cur) {
            // @ts-ignore
            let { c1, line } = cur;
            cache[c1] = cache[c1] || [];
            cache[c1].push(Buffer.from(line).toString());
            return cache;
        }, cache);
        Object.entries(cache).forEach(async function ([c1, ls]) {
            if (!/^[a-z0-9]$/i.test(c1)) {
                c1 = '0/' + c1;
            }
            let file = path.join(CWD_SAVETO, c1 + '.txt');
            fs.ensureFileSync(file);
            if (!ls.length) {
                return;
            }
            return fs.appendFileSync(file, ls.join('\n') + '\n');
        });
        //fs.appendFile()
    });
    w1.on('error', e => debug_color2_1.console.error(debug_color2_1.console));
    w1.on('exit', (code) => {
        let bool = true;
        try {
            let i = timeDiff.getTime() - workerOptions.workerData.time.getTime();
            log(i, timeDiff);
        }
        catch (e) {
            bool = false;
        }
        if (bool) {
            let ls = (0, fast_glob_1.sync)([
                '**/*.txt'
            ], {
                cwd: CWD_SAVETO,
                absolute: true,
            }).sort();
            let file2 = path.join(CWD, 'stringify.sorted.txt');
            fs.ensureFileSync(file2);
            fs.truncateSync(file2);
            let i2 = ls.reduce((a, file) => {
                log('[start]', path.relative(CWD_SAVETO, file));
                const liner = new lineByLine(file);
                let line;
                let index = 0;
                let list = [];
                while (line = liner.next()) {
                    let s = line.toString();
                    let data = (0, index_1.parseLine)(s);
                    let [w, p, f] = data;
                    let cur = {
                        // @ts-ignore
                        data,
                        line: s,
                        index: index++,
                        c1: "other" /* other */,
                        line_type: (0, util_2.chkLineType)(s),
                        cjk_id: (0, util_1.getCjkName)(w),
                    };
                    list.push(cur);
                    a++;
                }
                list = SortList(list);
                let out_list = list.map(v => v.line);
                out_list = (0, array_hyper_unique_1.array_unique)(out_list);
                let out_data = (0, loader_line_1.serialize)(out_list);
                fs.outputFileSync(file, out_data + "\n\n");
                fs.appendFileSync(file2, out_data + "\n");
                log('[done]', path.relative(CWD_SAVETO, file));
                return a;
            }, 0);
            log(i2);
        }
        if (code != 0) {
            debug_color2_1.console.error(new Error(`Worker stopped with exit code ${code}`));
        }
        else {
            log(`Worker stopped`);
        }
    });
}
else {
    //	parentPort.once('message', (value) => {
    //		value.hereIsYourPort.postMessage('hello');
    //		value.hereIsYourPort.on('message', msg => {
    //			console.log(`thread ${threadId}: receive ${msg}`);
    //		});
    //	});
    //the worker's code
    debug_color2_1.console.dir(worker_threads_1.workerData, {
        colors: true,
    });
    //	log(workerData.re.test(' '));
    let file = path.join(CWD, 'stringify.txt');
    const liner = new lineByLine(file);
    let line;
    let lineNumber = 0;
    let count = 0;
    let c1_old;
    let list = [];
    while (line = liner.next()) {
        //console.log('Line ' + lineNumber + ': ' + line.toString('ascii'));
        let index = lineNumber++;
        let data = (0, index_1.parseLine)(line.toString());
        let cur = {
            data,
            line,
            index,
            c1: "other" /* other */,
        };
        let [w, p, f] = cur.data;
        let len = uni_string_1.default.size(w);
        let c1_now;
        if (len > 1) {
            c1_now = getCid(w);
            if (!c1_now) {
                debug_color2_1.console.log(c1_now, w);
                throw new Error(`${w}, ${c1_now}`);
            }
        }
        else if (len === 1) {
            c1_now = "char" /* char */;
        }
        else {
            c1_now = "other" /* other */;
        }
        cur.c1 = c1_now;
        if (count >= 10000) {
            worker_threads_1.parentPort.postMessage({
                index,
                list,
            });
            list = [];
            count = 0;
        }
        list.push(cur);
        c1_old = c1_now;
        count++;
    }
    log('end of line reached', lineNumber);
    worker_threads_1.workerData.count = lineNumber;
    worker_threads_1.parentPort.postMessage({
        timeDiff: new Date,
        index: lineNumber,
        list,
    });
}
function log(...argv) {
    debug_color2_1.console.log(`[thread:${worker_threads_1.threadId}]`, ...argv);
}
function getCid(w) {
    w = uni_string_1.default.slice(w, 0, 1).toLocaleLowerCase();
    if (/^[a-z0-9]$/i.test(w)) {
        return "eng" /* eng */;
    }
    let s = (0, util_1.getCjkName)(w);
    let r = (0, transliteration_1.slugify)(s);
    if (!r) {
        r = (0, transliteration_1.slugify)((0, greedy_1.greedyTableReplace)(s));
    }
    if (!r) {
        let arr = table_1.default.auto(s, {
            safe: false,
            greedyTable: 2,
        });
        if (arr.length) {
            r = (0, transliteration_1.slugify)(arr[1] || arr[0]);
        }
    }
    if (!r) {
        let arr = table_1.default.auto(w, {
            safe: false,
            greedyTable: 2,
        });
        if (arr.length) {
            r = (0, transliteration_1.slugify)(arr[1] || arr[0]);
        }
    }
    if (!r) {
        r = (0, transliteration_1.slugify)((0, cjk_conv_1.cjk2zhs)(s));
    }
    if (!r) {
        r = (0, transliteration_1.slugify)((0, cjk_conv_1.cjk2zht)(s));
    }
    if (!r) {
        r = (0, transliteration_1.slugify)((0, cjk_conv_1.cjk2zhs)(w));
    }
    if (!r) {
        r = (0, transliteration_1.slugify)((0, cjk_conv_1.cjk2zht)(w));
    }
    if (!r) {
        r = (0, transliteration_1.slugify)(w);
    }
    if (!r) {
        r = w;
    }
    let r2 = uni_string_1.default.slice(r, 0, 1);
    if (!/^[a-z0-9]$/i.test(r2)) {
        r2 = "other" /* other */;
    }
    return r2.toLocaleLowerCase();
}
function SortList(ls) {
    // @ts-ignore
    return ls.sort(function (a, b) {
        if (a.line_type == util_2.EnumLineType.COMMENT_TAG
            || b.line_type == util_2.EnumLineType.COMMENT_TAG) {
            return (a.index - b.index);
        }
        else if (a.line_type == util_2.EnumLineType.COMMENT
            || b.line_type == util_2.EnumLineType.COMMENT) {
            return (a.index - b.index);
        }
        let ret = (0, util_1.zhDictCompare)(a.cjk_id, b.cjk_id)
            || (a.index - b.index)
            || 0;
        return ret;
    });
}
//# sourceMappingURL=sort-stringify-cache.js.map