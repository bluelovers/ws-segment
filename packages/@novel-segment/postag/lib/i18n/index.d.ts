/**
 * 國際化模組
 * Internationalization (i18n) Module
 *
 * 提供詞性標記的多語言名稱轉換功能。
 * 支援英文、簡體中文、繁體中文三種語言。
 *
 * Provides multi-language name conversion for POS tags.
 * Supports English, Simplified Chinese, and Traditional Chinese.
 *
 * @module @novel-segment/postag
 */
import POSTAG from '../postag/ids';
/**
 * 英文詞性名稱轉換器
 * English POS Name Translator
 *
 * 將詞性標記代碼轉換為英文名稱。
 * Converts POS tag codes to English names.
 */
export declare const enName: (p: POSTAG | import("../keys").IPOSTAG_KEYS | number) => string;
/**
 * 簡體中文詞性名稱轉換器
 * Simplified Chinese POS Name Translator
 *
 * 將詞性標記代碼轉換為簡體中文名稱。
 * Converts POS tag codes to Simplified Chinese names.
 */
export declare const chsName: (p: POSTAG | import("../keys").IPOSTAG_KEYS | number) => string;
/**
 * 繁體中文詞性名稱轉換器
 * Traditional Chinese POS Name Translator
 *
 * 將詞性標記代碼轉換為繁體中文名稱。
 * Converts POS tag codes to Traditional Chinese names.
 */
export declare const zhName: (p: POSTAG | import("../keys").IPOSTAG_KEYS | number) => string;
