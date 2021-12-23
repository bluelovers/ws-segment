"use strict";
/**
 * Created by user on 2019/3/20.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCjkName = void 0;
const tslib_1 = require("tslib");
const str_util_1 = tslib_1.__importDefault(require("str-util"));
const list_1 = require("cjk-conv/lib/zh/table/list");
function getCjkName(w, USE_CJK_MODE) {
    let cjk_id = (0, list_1.slugify)(w, true);
    return str_util_1.default.toHalfWidth(cjk_id).toLocaleLowerCase();
}
exports.getCjkName = getCjkName;
exports.default = getCjkName;
//# sourceMappingURL=conv.js.map