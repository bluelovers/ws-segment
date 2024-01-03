"use strict";
/**
 * Created by user on 2019/3/20.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCjkName = void 0;
const str_util_1 = require("str-util");
const zh_slugify_1 = require("@lazy-cjk/zh-slugify");
function getCjkName(w, USE_CJK_MODE) {
    let cjk_id = (0, zh_slugify_1.slugify)(w, true);
    return (0, str_util_1.toHalfWidth)(cjk_id).toLocaleLowerCase();
}
exports.getCjkName = getCjkName;
exports.default = getCjkName;
//# sourceMappingURL=conv.js.map