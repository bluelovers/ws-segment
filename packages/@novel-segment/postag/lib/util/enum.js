"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumIsNaN = enumIsNaN;
exports.enumList = enumList;
function enumIsNaN(v) {
    return isNaN(Number(v));
}
function enumList(varEnum, byValue) {
    let keys = Object.keys(varEnum);
    if (byValue) {
        return keys.filter(key => isNaN(Number(varEnum[key])));
    }
    else {
        return keys.filter(key => !isNaN(Number(varEnum[key])));
    }
}
//# sourceMappingURL=enum.js.map