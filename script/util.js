"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const table_1 = require("cjk-conv/lib/zh/table");
const list_1 = require("cjk-conv/lib/zh/table/list");
const fast_glob_1 = require("fast-glob");
const BluebirdPromise = require("bluebird");
const line_1 = require("../lib/loader/line");
const index_1 = require("../lib/loader/segment/index");
const naturalCompare = require("string-natural-compare");
exports.DEFAULT_IGNORE = [
    'char*',
    '**/skip',
    '**/jieba',
    '**/lazy',
    '**/synonym',
    '**/names',
];
function globDict(cwd, pattern, ignore = exports.DEFAULT_IGNORE) {
    return BluebirdPromise
        .resolve(fast_glob_1.default(pattern, {
        cwd,
        absolute: true,
        ignore,
        markDirectories: true,
    }));
}
exports.globDict = globDict;
function loadDictFile(file, fn) {
    return line_1.default(file)
        .then(function (b) {
        return b.reduce(function (a, line, index, arr) {
            let bool;
            let data = index_1.parseLine(line);
            let cur = {
                data,
                line,
                index,
            };
            if (fn) {
                // @ts-ignore
                bool = fn(a, cur);
            }
            else {
                bool = true;
            }
            if (bool) {
                a.push(cur);
            }
            return a;
        }, []);
    });
}
exports.loadDictFile = loadDictFile;
var EnumLineType;
(function (EnumLineType) {
    EnumLineType[EnumLineType["BASE"] = 0] = "BASE";
    EnumLineType[EnumLineType["COMMENT"] = 1] = "COMMENT";
    EnumLineType[EnumLineType["COMMENT_TAG"] = 2] = "COMMENT_TAG";
})(EnumLineType = exports.EnumLineType || (exports.EnumLineType = {}));
function chkLineType(line) {
    let ret = EnumLineType.BASE;
    if (line.indexOf('//') == 0) {
        ret = EnumLineType.COMMENT;
        if (/ @todo/i.test(line)) {
            ret = EnumLineType.COMMENT_TAG;
        }
    }
    return ret;
}
exports.chkLineType = chkLineType;
function baseSortList(ls, bool) {
    return ls.sort(function (a, b) {
        // @ts-ignore
        return naturalCompare.caseInsensitive(a.cjk_id, b.cjk_id)
            // @ts-ignore
            || naturalCompare.caseInsensitive(b.data[1], a.data[1])
            // @ts-ignore
            || naturalCompare.caseInsensitive(a.data[0], b.data[0])
            // @ts-ignore
            || naturalCompare.caseInsensitive(a.data[2], b.data[2]);
    });
}
exports.baseSortList = baseSortList;
function getCjkName(w, USE_CJK_MODE) {
    let cjk_id = w;
    if (USE_CJK_MODE > 1) {
        let cjk_list = list_1.textList(w);
        cjk_list.sort();
        cjk_id = cjk_list[0];
    }
    else if (USE_CJK_MODE) {
        let cjk_list = table_1.default.auto(w);
        cjk_list.sort();
        cjk_id = cjk_list[0];
    }
    return cjk_id;
}
exports.getCjkName = getCjkName;
