/**
 * 列舉工具模組
 * Enum Utility Module
 *
 * 提供列舉類型的輔助函數。
 * 用於判斷和篩選列舉值。
 *
 * Provides helper functions for enum types.
 * Used for judging and filtering enum values.
 *
 * @module @novel-segment/postag
 */
import { IEnumLike } from '../types';
/**
 * 檢查列舉值是否為 NaN
 * Check if Enum Value is NaN
 *
 * 判斷傳入的值是否無法轉換為有效數字。
 * 用於區分列舉的鍵名與數值。
 *
 * Determines if the passed value cannot be converted to a valid number.
 * Used to distinguish between enum key names and numeric values.
 *
 * @param {any} v - 待檢查的值 / Value to check
 * @returns {boolean} 是否為 NaN / Whether it is NaN
 */
export declare function enumIsNaN(v: any): boolean;
/**
 * 取得列舉鍵值列表
 * Get Enum Key List
 *
 * 根據篩選條件取得列舉的鍵值列表。
 * 可選擇取得數值鍵或名稱鍵。
 *
 * Gets the key list of enum based on filter criteria.
 * Can choose to get value keys or name keys.
 *
 * @template T - 列舉類型 / Enum type
 * @param {T} varEnum - 列舉物件 / Enum object
 * @param {boolean} [byValue] - 是否依數值篩選 / Whether to filter by value
 *   - true: 返回名稱鍵（值為 NaN 的鍵）/ Returns name keys (keys with NaN values)
 *   - false/undefined: 返回數值鍵（值為數字的鍵）/ Returns value keys (keys with numeric values)
 * @returns {string[]} 篩選後的鍵值陣列 / Filtered key array
 */
export declare function enumList<T extends IEnumLike<any>>(varEnum: T, byValue?: boolean): string[];
