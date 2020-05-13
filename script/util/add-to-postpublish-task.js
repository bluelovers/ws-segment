"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.del = exports.add = exports.name = void 0;
/**
 * Created by user on 2020/5/11.
 */
const __root_ws_1 = require("../../__root_ws");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const debug_color2_1 = require("debug-color2");
function name(name) {
    name = name
        .replace(/[^\-_\w\d]/g, '__');
    return path_1.join(__root_ws_1.default, 'temp', 'postpublish', `${name}`);
}
exports.name = name;
function add(module_name) {
    let file = name(module_name);
    debug_color2_1.default.debug(`[postpublish:script]`, `add`, module_name);
    fs_extra_1.outputFileSync(file, module_name);
}
exports.add = add;
function del(module_name) {
    let file = name(module_name);
    debug_color2_1.default.debug(`[postpublish:script]`, `del`, module_name);
    fs_extra_1.unlinkSync(file);
}
exports.del = del;
exports.default = add;
//# sourceMappingURL=add-to-postpublish-task.js.map