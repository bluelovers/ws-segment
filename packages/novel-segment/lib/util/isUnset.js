"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSet = exports.isUnset = void 0;
function isUnset(val) {
    return typeof val === 'undefined' || val === null;
}
exports.isUnset = isUnset;
function isSet(val) {
    return typeof val !== 'undefined' && val !== null;
}
exports.isSet = isSet;
exports.default = isUnset;
//# sourceMappingURL=isUnset.js.map