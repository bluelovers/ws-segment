"use strict";
/**
 * 載入器模組工廠
 * Loader Module Factory
 *
 * 提供動態載入各種字典載入器的工廠函式。
 * 支援的載入器類型：line、stopword、jieba、opencc、segment。
 *
 * Provides factory functions for dynamically loading various dictionary loaders.
 * Supported loader types: line, stopword, jieba, opencc, segment.
 *
 * @module @novel-segment/loaders/lib
 */
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