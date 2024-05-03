"use strict";
/**
 * Created by user on 2020/5/11.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDefined = isDefined;
exports.isUndefined = isUndefined;
function isDefined(value) {
    return value !== undefined && value !== null;
}
function isUndefined(value) {
    return value === null || value === void 0;
}
//# sourceMappingURL=types.js.map