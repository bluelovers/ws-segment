"use strict";
/**
 * 載入器基礎類別
 * Loader Base Class
 *
 * 此模組重新匯出 @novel-segment/dict-loader-core 的所有功能，
 * 提供字典載入器的基礎類別，作為各種載入器實作的基礎。
 * This module re-exports all functionality from @novel-segment/dict-loader-core,
 * providing the base class for dictionary loaders, serving as the foundation for various loader implementations.
 *
 * @module @novel-segment/loaders/_class
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("@novel-segment/dict-loader-core"), exports);
const dict_loader_core_1 = require("@novel-segment/dict-loader-core");
exports.default = dict_loader_core_1.LoaderClass;
//# sourceMappingURL=_class.js.map