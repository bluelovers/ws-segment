"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const debug_color2_1 = require("debug-color2");
const fs_extra_1 = require("fs-extra");
const upath2_1 = tslib_1.__importDefault(require("upath2"));
const loader_line_1 = require("@novel-segment/loader-line");
const project_config_1 = tslib_1.__importDefault(require("../project.config"));
const util_1 = require("./util");
const util_compare_1 = require("@novel-segment/util-compare");
const sort_dict_table_1 = require("@novel-segment/sort-dict-table");
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
    let list = await (0, sort_dict_table_1.loadFile)(file, {
        cbIgnore(cur) {
            CACHE_LIST.skip.push(cur);
        },
    });
    let out_list = (0, util_compare_1.stringifyHandleDictLinesList)(list);
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
        let list = (0, sort_dict_table_1.SortList)(CACHE_LIST.skip);
        let out_list = list.map(v => v.line);
        let out_file = upath2_1.default.join(project_config_1.default.temp_root, 'skip2.txt');
        await (0, fs_extra_1.appendFile)(out_file, "\n\n" + (0, loader_line_1.serialize)(out_list) + "\n\n");
    }
});
//# sourceMappingURL=sort.dict_synonym.js.map