"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnset = isUnset;
exports.isSet = isSet;
function isUnset(val) {
    return typeof val === 'undefined' || val === null;
}
function isSet(val) {
    return typeof val !== 'undefined' && val !== null;
}
exports.default = isUnset;
//# sourceMappingURL=isUnset.js.map