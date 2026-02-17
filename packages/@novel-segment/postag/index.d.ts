/**
 * 詞性標記模組
 * Part of Speech (POS) Tag Module
 *
 * 提供中文斷詞系統的詞性標記定義與轉換功能。
 * 包含詞性標記列舉 (POSTAG) 及其多語言名稱轉換器。
 *
 * Provides POS tag definitions and conversion functionality for Chinese segmentation system.
 * Includes POS tag enumeration (POSTAG) and its multi-language name translators.
 *
 * @module @novel-segment/postag
 *
 * @example
 * import POSTAG from '@novel-segment/postag';
 *
 * // 檢查詞性 / Check POS
 * if (word.p & POSTAG.D_N) {
 *   console.log('這是名詞 / This is a noun');
 * }
 *
 * @example
 * import { zhName } from '@novel-segment/postag/lib/i18n';
 *
 * // 取得繁體中文名稱 / Get Traditional Chinese name
 * console.log(zhName(POSTAG.D_N)); // 輸出: 名詞 名語素
 */
import { POSTAG } from './lib/postag/ids';
export { POSTAG };
export default POSTAG;
