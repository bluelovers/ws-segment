"use strict";
/**
 * 載入器模組類型定義
 * Loader Module Type Definitions
 *
 * 定義載入器模組所需的類型與工具函式。
 * Defines types and utility functions required for loader modules.
 *
 * @module @novel-segment/loaders/lib/types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDefined = isDefined;
exports.isUndefined = isUndefined;
/**
 * 檢查值是否已定義（非 null 且非 undefined）
 * Check if value is defined (not null and not undefined)
 *
 * @template T - 值的類型 / Value type
 * @param {T} value - 要檢查的值 / Value to check
 * @returns {boolean} 若值已定義則返回 true / Returns true if value is defined
 */
function isDefined(value) {
    return value !== undefined && value !== null;
}
/**
 * 檢查值是否未定義（為 null 或 undefined）
 * Check if value is undefined (null or undefined)
 *
 * @template T - 值的類型 / Value type
 * @param {T} value - 要檢查的值 / Value to check
 * @returns {boolean} 若值未定義則返回 true / Returns true if value is undefined
 */
function isUndefined(value) {
    return value === null || value === void 0;
}
//# sourceMappingURL=types.js.map