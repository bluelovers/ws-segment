"use strict";
/**
 * 行式字典載入器
 * Line Dictionary Loader
 *
 * 此模組重新匯出 @novel-segment/loader-line 的所有功能，
 * 提供行式字典的載入能力，適用於每行一個詞條的字典格式。
 * This module re-exports all functionality from @novel-segment/loader-line,
 * providing line-based dictionary loading capabilities for dictionary formats with one word per line.
 *
 * @module @novel-segment/loaders/line
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("@novel-segment/loader-line"), exports);
const loader_line_1 = tslib_1.__importDefault(require("@novel-segment/loader-line"));
exports.default = loader_line_1.default;
//# sourceMappingURL=line.js.map