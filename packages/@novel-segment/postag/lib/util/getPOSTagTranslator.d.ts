/**
 * 詞性標記轉換器工廠
 * POS Tag Translator Factory
 *
 * 提供建立詞性標記名稱轉換器的工廠函數。
 * 可根據不同的語言字典建立對應的轉換器。
 *
 * Provides factory function for creating POS tag name translators.
 * Can create corresponding translators based on different language dictionaries.
 *
 * @module @novel-segment/postag
 */
import POSTAG from '../postag/ids';
import { IPOSTAG_KEYS } from '../keys';
import { ITSPartialRecord } from 'ts-type/lib/type/record';
/**
 * 建立詞性標記轉換器
 * Create POS Tag Translator
 *
 * 建立一個轉換函數，將詞性標記代碼轉換為對應的語言名稱。
 * 支援單一詞性或多重詞性組合（使用位元運算）。
 *
 * Creates a conversion function that converts POS tag codes to corresponding language names.
 * Supports single POS or multiple POS combinations (using bitwise operations).
 *
 * @param {typeof POSTAG} POSTagDict - 詞性標記列舉字典 / POS tag enumeration dictionary
 * @param {ITSPartialRecord<IPOSTAG_KEYS, string>} I18NDict - 國際化名稱字典 / i18n name dictionary
 * @returns {Function} 詞性標記轉換函數 / POS tag translator function
 *
 * @example
 * // 建立英文轉換器
 * const toEnglish = getPOSTagTranslator(POSTAG, ENNAME);
 * toEnglish(POSTAG.D_N); // 返回 "Noun"
 * toEnglish(POSTAG.D_N | POSTAG.D_V); // 返回 "Noun,Verb"
 */
export declare function getPOSTagTranslator(POSTagDict: typeof POSTAG, I18NDict: ITSPartialRecord<IPOSTAG_KEYS, string>): (p: POSTAG | IPOSTAG_KEYS | number) => string;
export default getPOSTagTranslator;
