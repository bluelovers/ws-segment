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

import POSTAG_KEYS from '../keys';
import POSTAG from '../postag/ids';
import CHSNAME from '../postag/chs';
import ZHNAME from '../postag/cht';
import ENNAME from '../postag/en';
import getPOSTagTranslator from '../util/getPOSTagTranslator';

// 為所有詞性標記添加小寫鍵值別名 / Add lowercase key aliases for all POS tags
POSTAG_KEYS.forEach(function (key)
{
	// 取得鍵值的小寫形式 / Get lowercase form of the key
	let lc = key.toLowerCase();

	// 若小寫鍵值不存在，則建立別名 / Create alias if lowercase key doesn't exist
	// @ts-ignore
	POSTAG[lc] ??= POSTAG[key];
	// @ts-ignore
	CHSNAME[lc] ??= CHSNAME[key];
	// @ts-ignore
	ZHNAME[lc] ??= ZHNAME[key];
	// @ts-ignore
	ENNAME[lc] ??= ENNAME[key];
});

/**
 * 英文詞性名稱轉換器
 * English POS Name Translator
 *
 * 將詞性標記代碼轉換為英文名稱。
 * Converts POS tag codes to English names.
 */
export const enName = getPOSTagTranslator(POSTAG, ENNAME);

/**
 * 簡體中文詞性名稱轉換器
 * Simplified Chinese POS Name Translator
 *
 * 將詞性標記代碼轉換為簡體中文名稱。
 * Converts POS tag codes to Simplified Chinese names.
 */
export const chsName = getPOSTagTranslator(POSTAG, CHSNAME);

/**
 * 繁體中文詞性名稱轉換器
 * Traditional Chinese POS Name Translator
 *
 * 將詞性標記代碼轉換為繁體中文名稱。
 * Converts POS tag codes to Traditional Chinese names.
 */
export const zhName = getPOSTagTranslator(POSTAG, ZHNAME);
