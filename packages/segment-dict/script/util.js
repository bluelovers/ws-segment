"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.all_extra_dict = exports.all_default_load_dict = exports.baseSortList = exports.globDict = exports.DEFAULT_IGNORE = exports.getCjkName = exports.zhDictCompare = void 0;
const tslib_1 = require("tslib");
const fast_glob_1 = tslib_1.__importDefault(require("@bluelovers/fast-glob"));
const string_natural_compare_1 = tslib_1.__importDefault(require("@bluelovers/string-natural-compare"));
const util_1 = require("@novel-segment/util");
Object.defineProperty(exports, "getCjkName", { enumerable: true, get: function () { return util_1.getCjkName; } });
Object.defineProperty(exports, "zhDictCompare", { enumerable: true, get: function () { return util_1.zhDictCompare; } });
const bluebird_1 = tslib_1.__importDefault(require("bluebird"));
exports.DEFAULT_IGNORE = [
    //'char*',
    '**/skip',
    '**/jieba',
    '**/lazy',
    '**/synonym',
    '**/names',
];
function globDict(cwd, pattern, ignore = exports.DEFAULT_IGNORE) {
    return bluebird_1.default
        .resolve((0, fast_glob_1.default)(pattern, {
        cwd,
        absolute: true,
        ignore,
        markDirectories: true,
    }));
}
exports.globDict = globDict;
function baseSortList(ls, bool) {
    return ls.sort(function (a, b) {
        // @ts-ignore
        return string_natural_compare_1.default.caseInsensitive(a.cjk_id, b.cjk_id)
            // @ts-ignore
            || string_natural_compare_1.default.caseInsensitive(a.data[1], b.data[1])
            // @ts-ignore
            || string_natural_compare_1.default.caseInsensitive(a.data[0], b.data[0])
            // @ts-ignore
            || string_natural_compare_1.default.caseInsensitive(a.data[2], b.data[2]);
    });
}
exports.baseSortList = baseSortList;
function all_default_load_dict() {
    return [
        'dict_synonym/*.txt',
        'names/*.txt',
        'lazy/*.txt',
        'dict*.txt',
        'phrases/*.txt',
        'pangu/*.txt',
        'char.txt',
    ];
}
exports.all_default_load_dict = all_default_load_dict;
function all_extra_dict() {
    return [
        'infrequent/**/*.txt',
    ];
}
exports.all_extra_dict = all_extra_dict;
/*
export function getCjkName(w: string, USE_CJK_MODE: number)
{
    let cjk_id = w;

    if (1)
    {
        cjk_id = slugify(w, true);
    }
    else if (USE_CJK_MODE > 1)
    {
        let cjk_list = textList(w);
        cjk_list.sort();
        cjk_id = cjk_list[0];
    }
    else if (USE_CJK_MODE)
    {
        let cjk_list = libTable.auto(w);
        cjk_list.sort();
        cjk_id = cjk_list[0];
    }

    return StrUtil.toHalfWidth(cjk_id);
}
*/
//console.log(['第', '一', 'Ｔ', '网开一面', '三街六市'].sort(zhDictCompare));
//# sourceMappingURL=util.js.map