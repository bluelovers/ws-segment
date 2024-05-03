"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = name;
exports.add = add;
exports.del = del;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const debug_color2_1 = tslib_1.__importDefault(require("debug-color2"));
const create_cache_name_1 = tslib_1.__importDefault(require("./create-cache-name"));
function name(name) {
    return (0, create_cache_name_1.default)('postpublish', `${name}`);
}
function add(module_name) {
    let file = name(module_name);
    debug_color2_1.default.debug(`[postpublish:script]`, `add`, module_name);
    (0, fs_extra_1.outputFileSync)(file, module_name);
}
function del(module_name) {
    let file = name(module_name);
    debug_color2_1.default.debug(`[postpublish:script]`, `del`, module_name);
    (0, fs_extra_1.unlinkSync)(file);
}
exports.default = add;
//# sourceMappingURL=add-to-postpublish-task.js.map