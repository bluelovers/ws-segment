"use strict";
/**
 * Created by user on 2019/3/20.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCjkName = void 0;
const str_util_1 = __importDefault(require("str-util"));
const list_1 = require("cjk-conv/lib/zh/table/list");
function getCjkName(w, USE_CJK_MODE) {
    let cjk_id = list_1.slugify(w, true);
    return str_util_1.default.toHalfWidth(cjk_id).toLocaleLowerCase();
}
exports.getCjkName = getCjkName;
exports.default = getCjkName;
//# sourceMappingURL=conv.js.map