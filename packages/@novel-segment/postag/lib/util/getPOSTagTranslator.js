"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPOSTagTranslator = getPOSTagTranslator;
const tslib_1 = require("tslib");
const ids_1 = tslib_1.__importDefault(require("../postag/ids"));
const keys_1 = tslib_1.__importDefault(require("../keys"));
const enum_1 = require("./enum");
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
function getPOSTagTranslator(POSTagDict, I18NDict) {
    /**
     * 詞性標記轉換函數
     * POS Tag Translator Function
     *
     * @param {POSTAG | IPOSTAG_KEYS | number} p - 詞性標記代碼或名稱 / POS tag code or name
     * @returns {string} 對應的語言名稱 / Corresponding language name
     */
    return (p) => {
        // 如果是字串鍵名（非數字），直接查表 / If string key name (non-numeric), lookup directly
        if ((0, enum_1.enumIsNaN)(p)) {
            return I18NDict[p] || I18NDict.UNK;
        }
        // 將字串數字轉換為數值 / Convert string number to numeric value
        if (typeof p === 'string') {
            p = Number(p);
        }
        // 使用位元運算檢查所有可能的詞性組合 / Use bitwise operations to check all possible POS combinations
        let ret = keys_1.default.reduce(function (ret, i) {
            // 檢查該詞性位元是否被設定 / Check if the POS bit is set
            if ((p & ids_1.default[i])) 
            //if ((<number>p & <number>POSTAG[i]) > 0)
            {
                // 將對應的名稱加入結果陣列 / Add corresponding name to result array
                ret.push(I18NDict[i] || i);
            }
            return ret;
        }, []);
        // 若無匹配的詞性，返回未知標記 / If no matching POS, return unknown tag
        if (ret.length < 1) {
            return I18NDict.UNK;
        }
        else {
            // 將所有匹配的詞性名稱以逗號連接 / Join all matched POS names with comma
            return ret.toString();
        }
    };
}
exports.default = getPOSTagTranslator;
//# sourceMappingURL=getPOSTagTranslator.js.map