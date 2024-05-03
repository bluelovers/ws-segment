"use strict";
/**
 * Created by user on 2019/3/20.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCjkName = getCjkName;
const fullhalf_1 = require("@lazy-cjk/fullhalf");
const zh_slugify_1 = require("@lazy-cjk/zh-slugify");
function getCjkName(w, USE_CJK_MODE) {
    let cjk_id = (0, zh_slugify_1.slugify)(w, true);
    return (0, fullhalf_1.toHalfWidth)(cjk_id).toLocaleLowerCase();
}
exports.default = getCjkName;
//# sourceMappingURL=conv.js.map