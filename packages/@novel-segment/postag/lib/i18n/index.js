"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhName = exports.chsName = exports.enName = void 0;
const tslib_1 = require("tslib");
const keys_1 = tslib_1.__importDefault(require("../keys"));
const ids_1 = tslib_1.__importDefault(require("../postag/ids"));
const chs_1 = tslib_1.__importDefault(require("../postag/chs"));
const cht_1 = tslib_1.__importDefault(require("../postag/cht"));
const en_1 = tslib_1.__importDefault(require("../postag/en"));
const getPOSTagTranslator_1 = tslib_1.__importDefault(require("../util/getPOSTagTranslator"));
// 為所有詞性標記添加小寫鍵值別名 / Add lowercase key aliases for all POS tags
keys_1.default.forEach(function (key) {
    var _a, _b, _c, _d;
    // 取得鍵值的小寫形式 / Get lowercase form of the key
    let lc = key.toLowerCase();
    // 若小寫鍵值不存在，則建立別名 / Create alias if lowercase key doesn't exist
    // @ts-ignore
    (_a = ids_1.default[lc]) !== null && _a !== void 0 ? _a : (ids_1.default[lc] = ids_1.default[key]);
    // @ts-ignore
    (_b = chs_1.default[lc]) !== null && _b !== void 0 ? _b : (chs_1.default[lc] = chs_1.default[key]);
    // @ts-ignore
    (_c = cht_1.default[lc]) !== null && _c !== void 0 ? _c : (cht_1.default[lc] = cht_1.default[key]);
    // @ts-ignore
    (_d = en_1.default[lc]) !== null && _d !== void 0 ? _d : (en_1.default[lc] = en_1.default[key]);
});
/**
 * 英文詞性名稱轉換器
 * English POS Name Translator
 *
 * 將詞性標記代碼轉換為英文名稱。
 * Converts POS tag codes to English names.
 */
exports.enName = (0, getPOSTagTranslator_1.default)(ids_1.default, en_1.default);
/**
 * 簡體中文詞性名稱轉換器
 * Simplified Chinese POS Name Translator
 *
 * 將詞性標記代碼轉換為簡體中文名稱。
 * Converts POS tag codes to Simplified Chinese names.
 */
exports.chsName = (0, getPOSTagTranslator_1.default)(ids_1.default, chs_1.default);
/**
 * 繁體中文詞性名稱轉換器
 * Traditional Chinese POS Name Translator
 *
 * 將詞性標記代碼轉換為繁體中文名稱。
 * Converts POS tag codes to Traditional Chinese names.
 */
exports.zhName = (0, getPOSTagTranslator_1.default)(ids_1.default, cht_1.default);
//# sourceMappingURL=index.js.map