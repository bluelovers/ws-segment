/**
 * 美化差異比較模組
 * Pretty Diff Module
 *
 * 提供斷詞結果的視覺化差異比較功能。
 * 使用色彩標記新增（綠色）、刪除（紅色）和未變更（灰色）的部分，
 * 便於直觀地比較斷詞或轉換前後的差異。
 *
 * Provides visual diff comparison functionality for segmentation results.
 * Uses color coding to mark additions (green), removals (red), and unchanged (gray) parts,
 * making it easy to intuitively compare differences before and after segmentation or transformation.
 *
 * @module @novel-segment/pretty-diff
 */
import { ITSValueOrArrayMaybeReadonly } from 'ts-type/lib/type/base';
import { IWord } from '@novel-segment/types';
/**
 * 文字輸入類型
 * Text Input Type
 *
 * 支援單一詞詞物件、字串，或其陣列形式。
 * 可用於表示斷詞結果或原始文字。
 *
 * Supports single word object, string, or their array form.
 * Can be used to represent segmentation results or original text.
 */
export type ITextInput = ITSValueOrArrayMaybeReadonly<IWord | string>;
/**
 * 列印美化差異比較結果
 * Print Pretty Diff Result
 *
 * 比較新舊文字內容，以色彩標記差異並輸出至主控台。
 * 同時會進行簡繁轉換比較，顯示簡體轉繁體後的差異。
 *
 * Compares old and new text content, marks differences with colors and outputs to console.
 * Also performs Simplified-to-Traditional conversion comparison, showing differences after conversion.
 *
 * @param {ITextInput} text_old - 原始文字或斷詞結果 / Original text or segmentation result
 * @param {ITextInput} text_new - 新文字或斷詞結果 / New text or segmentation result
 * @returns {Object} 包含比較結果的物件 / Object containing comparison results
 * @returns {string} .text_old - 標準化後的原始文字 / Normalized original text
 * @returns {string} .text_new - 標準化後的新文字 / Normalized new text
 * @returns {boolean} .changed - 是否有變更 / Whether there are changes
 * @returns {string} .text_new2 - 簡轉繁後的新文字 / New text after Simplified-to-Traditional conversion
 */
export declare function printPrettyDiff(text_old: ITextInput, text_new: ITextInput): {
    text_old: string;
    text_new: string;
    changed: boolean;
    text_new2: string;
};
/**
 * 產生差異日誌字串
 * Generate Diff Log String
 *
 * 比較兩個字串的差異，產生帶有色彩標記的字串。
 * 使用 diff 套件進行字元級別的差異比對。
 *
 * Compares two strings and generates a string with color coding.
 * Uses the diff package for character-level diff comparison.
 *
 * @param {string} src_text - 來源文字 / Source text
 * @param {string} new_text - 新文字 / New text
 * @returns {string} 帶有 ANSI 色彩碼的差異字串 / Diff string with ANSI color codes
 */
export declare function diff_log(src_text: string, new_text: string): string;
export default printPrettyDiff;
