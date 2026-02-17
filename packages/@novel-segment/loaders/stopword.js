"use strict";
/**
 * 分隔詞字典載入器
 * Stopword (Separator) Dictionary Loader
 *
 * 此模組重新匯出 @novel-segment/loader-stopword 的所有功能，
 * 提供分隔詞字典的載入能力，用於切割字串、進行簡易斷詞。
 * This module re-exports all functionality from @novel-segment/loader-stopword,
 * providing stopword (separator) dictionary loading capabilities for string splitting and simple word segmentation.
 *
 * @module @novel-segment/loaders/stopword
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("@novel-segment/loader-stopword"), exports);
const loader_stopword_1 = tslib_1.__importDefault(require("@novel-segment/loader-stopword"));
exports.default = loader_stopword_1.default;
//# sourceMappingURL=stopword.js.map