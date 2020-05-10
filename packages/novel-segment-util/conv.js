"use strict";
/**
 * Created by user on 2019/3/20.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCjkName = void 0;
const StrUtil = require("str-util");
const list_1 = require("cjk-conv/lib/zh/table/list");
function getCjkName(w, USE_CJK_MODE) {
    let cjk_id = list_1.slugify(w, true);
    return StrUtil.toHalfWidth(cjk_id).toLocaleLowerCase();
}
exports.getCjkName = getCjkName;
exports.default = getCjkName;
//# sourceMappingURL=conv.js.map