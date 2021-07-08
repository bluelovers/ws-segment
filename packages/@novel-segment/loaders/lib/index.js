"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireModule = exports.requireDefault = void 0;
const types_1 = require("./types");
function requireDefault(id, subtype) {
    return requireModule(id, subtype).default;
}
exports.requireDefault = requireDefault;
function requireModule(id, subtype) {
    if (id === 'line' && (0, types_1.isUndefined)(subtype))
        return require('../line');
    if (id === 'stopword' && (0, types_1.isUndefined)(subtype))
        return require('../stopword');
    if (id === 'jieba' && (0, types_1.isUndefined)(subtype))
        return require('../jieba');
    if (id === 'opencc' && (0, types_1.isUndefined)(subtype))
        return require('../opencc');
    if (id === 'opencc' && subtype === 'scheme')
        return require('../opencc/scheme');
    if (id === 'segment' && (0, types_1.isUndefined)(subtype))
        return require('../segment');
    if (id === 'segment' && subtype === 'synonym')
        return require('../segment/synonym');
    throw new Error(`module not defined. id: ${id}, subtype: ${subtype}`);
}
exports.requireModule = requireModule;
//# sourceMappingURL=index.js.map