"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireDefault = requireDefault;
exports.requireModule = requireModule;
const types_1 = require("./types");
function requireDefault(id, subtype) {
    return requireModule(id, subtype).default;
}
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
//# sourceMappingURL=index.js.map