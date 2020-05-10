"use strict";
/**
 * Created by user on 2020/5/11.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUndefined = exports.isDefined = void 0;
function isDefined(value) {
    return value !== undefined && value !== null;
}
exports.isDefined = isDefined;
function isUndefined(value) {
    return value === null || value === void 0;
}
exports.isUndefined = isUndefined;
//# sourceMappingURL=types.js.map