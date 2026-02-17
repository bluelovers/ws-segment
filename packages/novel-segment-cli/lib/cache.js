"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * 快取管理模組
 * Cache Management Module
 *
 * 此模組重新匯出 lazy-cacache 套件的功能，用於管理磁碟快取。
 * This module re-exports lazy-cacache package functionality for disk cache management.
 *
 * @see https://www.npmjs.com/package/lazy-cacache
 */
const lazy_cacache_1 = tslib_1.__importDefault(require("lazy-cacache"));
// @ts-ignore
tslib_1.__exportStar(require("lazy-cacache"), exports);
/**
 * 預設匯出 lazy-cacache 實例
 * Default export lazy-cacache instance
 */
exports.default = lazy_cacache_1.default;
//# sourceMappingURL=cache.js.map