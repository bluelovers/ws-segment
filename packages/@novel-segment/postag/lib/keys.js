"use strict";
/**
 * 詞性標記鍵值模組
 * POS Tag Keys Module
 *
 * 提供詞性標記列舉的鍵值陣列與類型定義。
 * 用於取得所有詞性標記的名稱列表。
 *
 * Provides key array and type definitions for POS tag enumeration.
 * Used to get the list of all POS tag names.
 *
 * @module @novel-segment/postag
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSTAG_KEYS = void 0;
const tslib_1 = require("tslib");
const ids_1 = tslib_1.__importDefault(require("./postag/ids"));
const ts_enum_util_1 = require("ts-enum-util");
/**
 * 詞性標記鍵值陣列
 * POS Tag Keys Array
 *
 * 包含所有詞性標記名稱的字串陣列。
 * 可用於迭代所有詞性類型。
 *
 * String array containing all POS tag names.
 * Can be used to iterate through all POS types.
 */
exports.POSTAG_KEYS = (0, ts_enum_util_1.$enum)(ids_1.default).getKeys();
exports.default = exports.POSTAG_KEYS;
//# sourceMappingURL=keys.js.map