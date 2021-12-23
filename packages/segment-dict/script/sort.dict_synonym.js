"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const debug_color2_1 = require("debug-color2");
const fs_extra_1 = require("fs-extra");
const upath2_1 = tslib_1.__importDefault(require("upath2"));
const loader_line_1 = require("@novel-segment/loader-line");
const project_config_1 = tslib_1.__importDefault(require("../project.config"));
const util_1 = require("./util");
const array_hyper_unique_1 = require("array-hyper-unique");
let CWD = upath2_1.default.join(project_config_1.default.dict_root, 'segment');
let USE_CJK_MODE = 2;
let CACHE_LIST = {
    skip: [],
};
(0, util_1.globDict)(CWD, [
    ...(0, util_1.all_default_load_dict)(),
    ...(0, util_1.all_extra_dict)(),
], [])
    .tap(function (ls) {
    let a = ls.reduce(function (a, v) {
        let p = upath2_1.default.relative(CWD, v);
        a.push(p);
        //			console.dir(p);
        return a;
    }, []);
    debug_color2_1.console.dir(a);
    //		process.exit();
})
    .mapSeries(async function (file) {
    let _basepath = upath2_1.default.relative(CWD, file);
    debug_color2_1.console.debug(`[START]`, _basepath);
    debug_color2_1.console.time(_basepath);
    let list = await (0, util_1.loadDictFile)(file, function (list, cur) {
        cur.file = file;
        let [w, p, f] = cur.data;
        let cjk_id = (0, util_1.getCjkName)(w, USE_CJK_MODE);
        cur.cjk_id = cjk_id;
        cur.line_type = (0, util_1.chkLineType)(cur.line);
        if (cur.line_type == util_1.EnumLineType.COMMENT) {
            CACHE_LIST.skip.push(cur);
            return false;
        }
        if (f > 15000) {
            //cur.line = [w, toHex(p), 0].join('|');
        }
        return true;
    });
    list = SortList(list);
    let out_list = list.map(v => v.line);
    out_list = (0, array_hyper_unique_1.array_unique)(out_list);
    //console.log(list);
    let out_file = file;
    if (0) {
        out_file = upath2_1.default.join(project_config_1.default.temp_root, upath2_1.default.basename(_basepath));
    }
    let out_data = (0, loader_line_1.serialize)(out_list) + "\n\n";
    await (0, fs_extra_1.outputFile)(out_file, out_data);
    debug_color2_1.console.timeEnd(_basepath);
})
    .tap(async function () {
    if (CACHE_LIST.skip.length) {
        let list = SortList(CACHE_LIST.skip);
        let out_list = list.map(v => v.line);
        let out_file = upath2_1.default.join(project_config_1.default.temp_root, 'skip2.txt');
        await (0, fs_extra_1.appendFile)(out_file, "\n\n" + (0, loader_line_1.serialize)(out_list) + "\n\n");
    }
});
function SortList(ls) {
    // @ts-ignore
    return ls.sort(function (a, b) {
        if (a.line_type == util_1.EnumLineType.COMMENT_TAG
            || b.line_type == util_1.EnumLineType.COMMENT_TAG) {
            return (a.index - b.index);
        }
        else if (a.line_type == util_1.EnumLineType.COMMENT
            || b.line_type == util_1.EnumLineType.COMMENT) {
            return (a.index - b.index);
        }
        let ret = (0, util_1.zhDictCompare)(a.cjk_id, b.cjk_id)
            || (a.index - b.index)
            || 0;
        return ret;
    });
}
//# sourceMappingURL=sort.dict_synonym.js.map