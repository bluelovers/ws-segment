"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug_color2_1 = require("debug-color2");
const fs = require("fs-extra");
const path = require("upath2");
const line_1 = require("../lib/loader/line");
const project_config_1 = require("../project.config");
const util_1 = require("./util");
const array_hyper_unique_1 = require("array-hyper-unique");
let CWD = path.join(project_config_1.default.dict_root, 'segment');
let USE_CJK_MODE = 2;
let CACHE_LIST = {
    skip: [],
};
util_1.globDict(CWD, [
    ...util_1.all_default_load_dict(),
    ...util_1.all_extra_dict(),
], [])
    .tap(function (ls) {
    let a = ls.reduce(function (a, v) {
        let p = path.relative(CWD, v);
        a.push(p);
        //			console.dir(p);
        return a;
    }, []);
    debug_color2_1.console.dir(a);
    //		process.exit();
})
    .mapSeries(async function (file) {
    let _basepath = path.relative(CWD, file);
    debug_color2_1.console.debug(`[START]`, _basepath);
    debug_color2_1.console.time(_basepath);
    let list = await util_1.loadDictFile(file, function (list, cur) {
        cur.file = file;
        let [w, p, f] = cur.data;
        let cjk_id = util_1.getCjkName(w, USE_CJK_MODE);
        cur.cjk_id = cjk_id;
        cur.line_type = util_1.chkLineType(cur.line);
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
    out_list = array_hyper_unique_1.array_unique(out_list);
    //console.log(list);
    let out_file = file;
    if (0) {
        out_file = path.join(project_config_1.default.temp_root, path.basename(_basepath));
    }
    let out_data = line_1.serialize(out_list) + "\n\n";
    await fs.outputFile(out_file, out_data);
    debug_color2_1.console.timeEnd(_basepath);
})
    .tap(async function () {
    if (CACHE_LIST.skip.length) {
        let list = SortList(CACHE_LIST.skip);
        let out_list = list.map(v => v.line);
        let out_file = path.join(project_config_1.default.temp_root, 'skip2.txt');
        await fs.appendFile(out_file, "\n\n" + line_1.serialize(out_list) + "\n\n");
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
        let ret = util_1.zhDictCompare(a.cjk_id, b.cjk_id)
            || (a.index - b.index)
            || 0;
        return ret;
    });
}
//# sourceMappingURL=sort.dict_synonym.js.map