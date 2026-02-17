/**
 * 斷言工具模組
 * Assertion Utility Module
 *
 * 提供用於測試斷詞結果的匹配 (Lazy Match) 功能。
 * 支援有序匹配、多重選項匹配及同義詞匹配等測試場景。
 *
 * Provides lazy match functionality for testing word segmentation results.
 * Supports ordered matching, multi-option matching, and synonym matching test scenarios.
 *
 * @module @novel-segment/assert
 */
/**
 * 匹配選項介面
 * Lazy Match Options Interface
 *
 * 定義匹配函數的可選參數。
 * Defines optional parameters for lazy match functions.
 */
export interface IOptionsLazyMatch {
    /**
     * 是否只取第一個匹配項
     * Whether to take only the first match
     *
     * 當設為 true 時，對於陣列類型的匹配目標，
     * 會在找到第一個符合條件的項目後停止搜尋。
     *
     * When set to true, for array-type match targets,
     * stops searching after finding the first matching item.
     */
    firstOne?: boolean;
    /**
     * 自訂檢視函式
     * Custom Inspect Function
     *
     * 用於格式化輸出結果，便於錯誤訊息的除錯。
     * 預設使用 Node.js 的 util.inspect。
     *
     * Used to format output results for debugging error messages.
     * Defaults to Node.js util.inspect.
     *
     * @example
     * inspectFn = chai.util.inspect
     * @example
     * import { inspect } from 'util';
     * inspectFn = inspect
     */
    inspectFn?(input: any, ...argv: any[]): any;
    /**
     * 不拋出錯誤，改為回傳失敗詞彙
     * Do not throw error, return failed words instead
     *
     * 當設為 true 時，函數不會拋出錯誤，
     * 而是回傳包含匹配結果和失敗詞彙的物件。
     *
     * When set to true, the function will not throw errors,
     * but return an object containing match result and failed words.
     */
    notThrowError?: boolean;
}
/**
 * 匹配核心結果介面
 * Lazy Match Core Result Interface
 *
 * 當 notThrowError 為 true 時回傳的結果結構。
 * Result structure returned when notThrowError is true.
 */
export interface ILazyMatchCoreResult {
    /**
     * 是否匹配成功
     * Whether match succeeded
     */
    matched: boolean;
    /**
     * 匹配失敗的詞彙清單
     * List of failed words
     */
    failedWords: string[];
}
export interface ILazyMatchArrayResult extends ILazyMatchCoreResult {
    entryIndex?: number;
    entryMatched?: Parameters<typeof lazyMatch>['1'];
}
/**
 * 反向匹配核心結果介面
 * Lazy Negative Match Core Result Interface
 *
 * 當 notThrowError 為 true 時回傳的結果結構（反向匹配用）。
 * Result structure returned when notThrowError is true (for negative match).
 */
export interface ILazyMatchNotCoreResult {
    /**
     * 是否通過測試（不包含指定組合）
     * Whether test passed (does not contain specified combination)
     */
    matched: boolean;
    /**
     * 找到不應存在的詞彙清單
     * List of words found that should not exist
     */
    failedWords: string[];
}
/**
 * 處理匹配選項
 * Handle Lazy Match Options
 *
 * 將傳入的選項參數進行標準化處理，填補預設值。
 * Normalizes the passed options and fills in default values.
 *
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Lazy match options
 * @returns {Required<IOptionsLazyMatch>} 標準化後的選項 / Normalized options
 */
export declare function _handleLazyMatchOptions(options?: IOptionsLazyMatch): {
    inspectFn: (input: any, ...argv: any[]) => any;
    /**
     * 是否只取第一個匹配項
     * Whether to take only the first match
     *
     * 當設為 true 時，對於陣列類型的匹配目標，
     * 會在找到第一個符合條件的項目後停止搜尋。
     *
     * When set to true, for array-type match targets,
     * stops searching after finding the first matching item.
     */
    firstOne?: boolean;
    /**
     * 不拋出錯誤，改為回傳失敗詞彙
     * Do not throw error, return failed words instead
     *
     * 當設為 true 時，函數不會拋出錯誤，
     * 而是回傳包含匹配結果和失敗詞彙的物件。
     *
     * When set to true, the function will not throw errors,
     * but return an object containing match result and failed words.
     */
    notThrowError?: boolean;
};
/**
 * 有序匹配核心函數
 * Lazy Ordered Match Core Function
 *
 * 驗證斷詞結果是否按順序包含指定的詞彙，並回傳匹配結果與失敗詞彙。
 * 此函數為 lazyMatch 的核心實作，支援 notThrowError 選項。
 *
 * Verifies if segmentation results contain specified words in order,
 * and returns match result with failed words.
 * This is the core implementation of lazyMatch, supporting notThrowError option.
 *
 * @param {string[]} a - 斷詞結果陣列 / Segmentation result array
 * @param {string[] | (string | string[])[]} b - 預期包含的詞彙 / Expected words
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {ILazyMatchCoreResult} 匹配結果與失敗詞彙 / Match result with failed words
 */
export declare function _lazyMatchCore(a: string[], b: string[] | (string | string[])[], options?: IOptionsLazyMatch): ILazyMatchCoreResult;
/**
 * 有序匹配
 * Lazy Ordered Match
 *
 * 分析後應該要符合以下結果，驗證斷詞結果是否按順序包含指定的詞彙。
 * 適用於測試斷詞器是否正確識別並排序關鍵詞。
 *
 * 此函數採用貪心匹配策略，從左到右依次查找每個預期詞彙，
 * 並確保每個詞彙出現在陣列中的位置是遞增的。
 *
 * After analysis, should match the following result.
 * Verifies if segmentation results contain specified words in order.
 * Suitable for testing if the segmenter correctly identifies and orders keywords.
 *
 * This function uses a greedy matching strategy, iterating through each expected word
 * from left to right and ensuring each word appears at an increasing position in the array.
 *
 * @example
 * // 基本用法 / Basic usage
 * const result = ['胡锦涛', '出席', 'APEC', '领导人', '会议', '后', '回京'];
 * lazyMatch(result, ['会议', '回京']); // true
 *
 * @example
 * // 多選一用法 / Multiple choices
 * const result = ['在', '這裡', '有', '兩具', '自動', '人偶', '隨侍', '在', '側', '的', '烏列爾'];
 * lazyMatch(result, [['會議', '议'], '回京']); // 支援混合陣列
 *
 * @example
 * // 使用 notThrowError 選項 / Using notThrowError option
 * const result = lazyMatch(['a', 'b'], ['c'], { notThrowError: true });
 * // result: { matched: false, failedWords: ['c'] }
 *
 * @see lazyMatch002 - 用於多組結果的匹配
 * @see lazyMatchNot - 用於反向匹配（不應包含）
 * @see _lazyMatchCore - 核心函數，回傳失敗詞彙
 * @throws {AssertionError} 當匹配失敗時拋出 / Throws when match fails
 *
 * @param {string[]} a - 斷詞結果陣列 / Segmentation result array
 * @param {string[] | (string | string[])[]} b - 預期包含的詞彙（支援陣列表示多選一）/ Expected words (array for multiple choices)
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {boolean | ILazyMatchCoreResult} 是否匹配成功，或完整結果物件 / Whether match succeeded, or full result object
 */
export declare function lazyMatch(a: string[], b: string[] | (string | string[])[], options?: IOptionsLazyMatch): boolean | ILazyMatchCoreResult;
/**
 * 多選匹配
 * Lazy Multi-Choice Match
 *
 * 分析後應該要符合以下其中一個結果。
 * 適用於測試同一句子的多種可能斷詞結果。
 *
 * 此函數會逐一嘗試每組預期結果，直到找到匹配為止。
 * 如果所有組合都不匹配，則拋出錯誤。
 *
 * After analysis, should match one of the following results.
 * Suitable for testing multiple possible segmentation results of the same sentence.
 *
 * This function tries each expected result set in order until a match is found.
 * If no combination matches, an error is thrown.
 *
 * @example
 * // 基本用法 / Basic usage
 * const result = ['在', '這裡', '有', '兩具', '自動', '人偶', '隨侍', '在', '側', '的', '烏列爾'];
 * lazyMatch002(result, [
 *   ['兩具', '自動', '人偶', '隨侍'],
 *   ['兩具', '自動人偶', '隨侍']
 * ]); // true - 兩種組合都接受
 *
 * @see lazyMatch - 用於單一結果的匹配
 * @see lazyMatchNot - 用於反向匹配
 * @throws {AssertionError} 當所有組合都不匹配時拋出 / Throws when no combination matches
 *
 * @param {string[]} a - 斷詞結果陣列 / Segmentation result array
 * @param {Parameters<typeof lazyMatch>['1'][]} b_arr - 多組預期結果陣列 / Multiple expected result arrays
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 */
export declare function lazyMatch002(a: string[], b_arr: Parameters<typeof lazyMatch>['1'][], options?: IOptionsLazyMatch): boolean | ILazyMatchArrayResult;
/**
 * 同義詞匹配核心函數
 * Lazy Synonym Match Core Function
 *
 * 驗證同義詞轉換後的字串是否包含預期的詞彙，並回傳匹配結果與失敗詞彙。
 * 此函數為 lazyMatchSynonym001 的核心實作，支援 notThrowError 選項。
 *
 * Verifies if the string after synonym transformation contains expected words,
 * and returns match result with failed words.
 * This is the core implementation of lazyMatchSynonym001, supporting notThrowError option.
 *
 * @param {string} a - 轉換後的字串 / Transformed string
 * @param {(string | string[])[]} b_arr - 預期包含的詞彙 / Expected words to contain
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {ILazyMatchCoreResult} 匹配結果與失敗詞彙 / Match result with failed words
 */
export declare function _lazyMatchSynonym001Core(a: string, b_arr: (string | string[])[], options?: IOptionsLazyMatch): ILazyMatchCoreResult;
/**
 * 同義詞匹配
 * Lazy Synonym Match
 *
 * 分析轉換後應該要具有以下字詞。
 * 用於驗證同義詞轉換後的字串是否包含預期的詞彙。
 *
 * 與 lazyMatch 不同，此函數操作於字串而非陣列，
 * 並且在匹配時會跳過已匹配的詞彙長度（基於字元位置而非陣列索引）。
 *
 * After analysis and transformation, should have the following words.
 * Used to verify if the string after synonym transformation contains expected words.
 *
 * Unlike lazyMatch, this function operates on a string rather than an array,
 * and when matching, it skips the length of matched words (based on character position, not array index).
 *
 * @example
 * // 基本用法 / Basic usage
 * const transformed = '大家干的好'; // 原始: '大家幹的好'
 * lazyMatchSynonym001(transformed, ['幹']); // true
 *
 * @example
 * // 多選一用法 / Multiple choices
 * lazyMatchSynonym001('大家干的好', [['幹', '干']]); // true - 兩者皆可
 *
 * @example
 * // 使用 notThrowError 選項 / Using notThrowError option
 * const result = lazyMatchSynonym001('abc', ['d'], { notThrowError: true });
 * // result: { matched: false, failedWords: ['d'] }
 *
 * @see lazyMatchSynonym001Not - 用於反向匹配（不應包含）
 * @see _lazyMatchSynonym001Core - 核心函數，回傳失敗詞彙
 * @throws {AssertionError} 當匹配失敗時拋出 / Throws when match fails
 *
 * @param {string} a - 轉換後的字串 / Transformed string
 * @param {(string | string[])[]} b_arr - 預期包含的詞彙 / Expected words to contain
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {boolean | ILazyMatchCoreResult} 是否匹配成功，或完整結果物件 / Whether match succeeded, or full result object
 */
export declare function lazyMatchSynonym001(a: string, b_arr: (string | string[])[], options?: IOptionsLazyMatch): boolean | ILazyMatchCoreResult;
/**
 * 同義詞反向匹配核心函數
 * Lazy Synonym Negative Match Core Function
 *
 * 驗證同義詞轉換後的字串不應包含特定的詞彙，並回傳匹配結果與失敗詞彙。
 * 此函數為 lazyMatchSynonym001Not 的核心實作，支援 notThrowError 選項。
 *
 * Verifies that the string after synonym transformation does not contain specific words,
 * and returns match result with failed words (words found that should not exist).
 * This is the core implementation of lazyMatchSynonym001Not, supporting notThrowError option.
 *
 * @param {string} a - 轉換後的字串 / Transformed string
 * @param {(string | string[])[]} b_arr - 不應包含的詞彙 / Words that should not be contained
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {ILazyMatchNotCoreResult} 匹配結果與失敗詞彙 / Match result with failed words
 */
export declare function _lazyMatchSynonym001NotCore(a: string, b_arr: (string | string[])[], options?: IOptionsLazyMatch): ILazyMatchNotCoreResult;
/**
 * 同義詞反向匹配
 * Lazy Synonym Negative Match
 *
 * 分析轉換後不應該具有以下字詞。
 * 用於驗證同義詞轉換後的字串不應包含特定的詞彙。
 *
 * 此函數是 lazyMatchSynonym001 的反向版本，
 * 用於確保轉換後的字串不包含特定的同義詞。
 *
 * After analysis and transformation, should NOT have the following words.
 * Used to verify that the string after synonym transformation does not contain specific words.
 *
 * This function is the reverse version of lazyMatchSynonym001,
 * used to ensure the transformed string does not contain specific synonyms.
 *
 * @example
 * // 基本用法 / Basic usage
 * const transformed = '那是里靈魂的世界。';
 * lazyMatchSynonym001Not(transformed, ['裡']); // true - 不應包含 '裡'
 *
 * @example
 * // 多選一用法 / Multiple choices
 * lazyMatchSynonym001Not('那是里靈魂的世界。', [['裡', '里']]); // true - 兩者都不應包含
 *
 * @example
 * // 使用 notThrowError 選項 / Using notThrowError option
 * const result = lazyMatchSynonym001Not('abc', ['a'], { notThrowError: true });
 * // result: { matched: false, failedWords: ['a'] }
 *
 * @see lazyMatchSynonym001 - 用於正向匹配（應該包含）
 * @see _lazyMatchSynonym001NotCore - 核心函數，回傳失敗詞彙
 * @throws {AssertionError} 當找到不應有的詞彙時拋出 / Throws when finding unexpected words
 *
 * @param {string} a - 轉換後的字串 / Transformed string
 * @param {(string | string[])[]} b_arr - 不應包含的詞彙 / Words that should not be contained
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {boolean | ILazyMatchNotCoreResult} 是否通過測試，或完整結果物件 / Whether test passed, or full result object
 */
export declare function lazyMatchSynonym001Not(a: string, b_arr: (string | string[])[], options?: IOptionsLazyMatch): boolean | ILazyMatchNotCoreResult;
/**
 * 反向匹配核心函數
 * Lazy Negative Match Core Function
 *
 * 驗證斷詞結果不應按順序包含指定的詞彙組合，並回傳匹配結果與失敗詞彙。
 * 此函數為 lazyMatchNot 的核心實作，支援 notThrowError 選項。
 *
 * Verifies that segmentation results should not contain specified word combinations in order,
 * and returns match result with failed words (words found that should not exist).
 * This is the core implementation of lazyMatchNot, supporting notThrowError option.
 *
 * @param {string[]} a - 斷詞結果陣列 / Segmentation result array
 * @param {string[] | (string | string[])[]} b - 不應包含的詞彙組合 / Word combinations that should not be contained
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {ILazyMatchNotCoreResult} 匹配結果與失敗詞彙 / Match result with failed words
 */
export declare function _lazyMatchNotCore(a: string[], b: string[] | (string | string[])[], options?: IOptionsLazyMatch): ILazyMatchNotCoreResult;
/**
 * 反向匹配
 * Lazy Negative Match
 *
 * 分析後不應該存在符合以下結果。
 * 用於驗證斷詞結果不應按順序包含指定的詞彙組合。
 *
 * 此函數是 lazyMatch 的反向版本，用於確保斷詞結果
 * 不按順序包含指定的詞彙組合。
 *
 * After analysis, should NOT have the following result.
 * Used to verify that segmentation results should not contain specified word combinations in order.
 *
 * This function is the reverse version of lazyMatch, used to ensure that
 * segmentation results do not contain specified word combinations in order.
 *
 * @example用法 / Basic usage
 * const result = ['這', '份', '毫不', '守舊', '的', '率直'];
 * lazyMatchNot(result, ['份', '毫']); // true - 不應按順序出現
 *
 * @example
 * // 多選一用法 / Multiple choices
 * lazyMatchNot(['這', '份', '毫不', '守舊', '的', '率直'], [['份毫', '份', '毫']]); // true
 *
 * @example
 * // 使用 notThrowError 選項 / Using notThrowError option
 * const result = lazyMatchNot(['a', 'b', 'c'], ['a', 'b'], { notThrowError: true });
 * // result: { matched: false, failedWords: ['a', 'b'] }
 *
 * @see lazyMatch - 用於正向匹配（應該包含）
 * @see lazyMatch002 - 用於多組結果的匹配
 * @see _lazyMatchNotCore - 核心函數，回傳失敗詞彙
 * @throws {AssertionError} 當找到不應有的組合時拋出 / Throws when finding unexpected combinations
 *
 * @param {string[]} a - 斷詞結果陣列 / Segmentation result array
 * @param {string[] | (string | string[])[]} b - 不應包含的詞彙組合 / Word combinations that should not be contained
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {boolean | ILazyMatchNotCoreResult} 是否通過測試，或完整結果物件 / Whether test passed, or full result object
 */
export declare function lazyMatchNot(a: string[], b: string[] | (string | string[])[], options?: IOptionsLazyMatch): boolean | ILazyMatchNotCoreResult;
