"use strict";
/**
 * Created by user on 2020/7/1.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notNum = void 0;
function notNum(val) {
    return typeof val !== 'number' || Number.isNaN(val);
}
exports.notNum = notNum;
//# sourceMappingURL=isNum.js.map