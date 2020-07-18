"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumList = exports.enumIsNaN = void 0;
function enumIsNaN(v) {
    return isNaN(Number(v));
}
exports.enumIsNaN = enumIsNaN;
function enumList(varEnum, byValue) {
    let keys = Object.keys(varEnum);
    if (byValue) {
        return keys.filter(key => isNaN(Number(varEnum[key])));
    }
    else {
        return keys.filter(key => !isNaN(Number(varEnum[key])));
    }
}
exports.enumList = enumList;
//# sourceMappingURL=enum.js.map