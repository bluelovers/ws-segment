'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * 類型定義模組
 * Type Definitions Module
 *
 * 定義斷詞系統中使用的核心類型與介面。
 * 包含詞詞物件 (IWord)、字典資料庫類型 (EnumDictDatabase) 等基礎定義。
 *
 * Defines core types and interfaces used in the segmentation system.
 * Includes basic definitions such as word object (IWord) and dictionary database types (EnumDictDatabase).
 *
 * @module @novel-segment/types
 */
/**
 * 包含兩個或更多元素的陣列類型
 * Array Type with Two or More Elements
 *
 * 確保陣列至少包含兩個元素，用於需要多個參數的場景。
 * Ensures the array contains at least two elements, used in scenarios requiring multiple parameters.
 *
 * @template T - 陣列元素類型 / Array element type
 */

let EnumDictDatabase = /*#__PURE__*/function (EnumDictDatabase) {
  EnumDictDatabase["SYNONYM"] = "SYNONYM";
  EnumDictDatabase["TABLE"] = "TABLE";
  EnumDictDatabase["STOPWORD"] = "STOPWORD";
  EnumDictDatabase["BLACKLIST"] = "BLACKLIST";
  EnumDictDatabase["BLACKLIST_FOR_OPTIMIZER"] = "BLACKLIST_FOR_OPTIMIZER";
  EnumDictDatabase["BLACKLIST_FOR_SYNONYM"] = "BLACKLIST_FOR_SYNONYM";
  return EnumDictDatabase;
}({});

exports.EnumDictDatabase = EnumDictDatabase;
//# sourceMappingURL=index.cjs.development.cjs.map
