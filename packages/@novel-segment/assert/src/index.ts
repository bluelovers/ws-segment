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

import { inspect } from 'util';
import { fail } from 'assert';

/**
 * 匹配選項介面
 * Lazy Match Options Interface
 *
 * 定義匹配函數的可選參數。
 * Defines optional parameters for lazy match functions.
 */
export interface IOptionsLazyMatch
{
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
	firstOne?: boolean,

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
	inspectFn?(input: any, ...argv: any[]): any,

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
	notThrowError?: boolean,
}

/**
 * 匹配核心結果介面
 * Lazy Match Core Result Interface
 *
 * 當 notThrowError 為 true 時回傳的結果結構。
 * Result structure returned when notThrowError is true.
 */
export interface ILazyMatchCoreResult
{
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

export interface ILazyMatchArrayResult extends ILazyMatchCoreResult
{
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
export interface ILazyMatchNotCoreResult
{
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
export function _handleLazyMatchOptions(options: IOptionsLazyMatch = {})
{
	options ??= {};
	return {
		...options ,
		inspectFn: options.inspectFn ?? inspect,
	}
}

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
export function _lazyMatchCore(a: string[], b: string[] | (string | string[])[], options: IOptionsLazyMatch = {}): ILazyMatchCoreResult
{
	// 當前匹配索引位置 / Current match index position
	let i: number = null;

	const { firstOne } = _handleLazyMatchOptions(options);

	// 失敗詞彙清單 / List of failed words
	const failedWords: string[] = [];

	// 檢查每個預期詞彙是否按順序存在 / Check if each expected word exists in order
	let bool = b.every(function (value, index, array)
	{
		// 找到的索引位置 / Found index position
		let j: number = -1;
		// 搜尋起始位置 / Search start position
		let ii = i;

		// 初始化索引 / Initialize index
		if (i == null)
		{
			i = -1;
		}

		// 處理陣列類型的匹配目標（多選一）/ Handle array-type match target (multiple choices)
		if (Array.isArray(value))
		{
			if (firstOne)
			{
				// 只取第一個匹配項 / Take only the first match
				value.some(function (bb)
				{
					let jj = a.indexOf(bb, ii);

					if ((jj > -1) && (jj > i))
					{
						j = jj;

						return true
					}
				});
			}
			else
			{
				// 取最接近的匹配項 / Take the closest match
				j = value.reduce(function (aa, bb)
				{
					let jj = a.indexOf(bb, ii);

					if ((jj > -1) && (jj > i))
					{
						if (aa == -1)
						{
							return jj;
						}

						return Math.min(jj, aa)
					}

					return aa;
				}, -1)
			}
		}
		else
		{
			// 單一字串直接搜尋 / Single string direct search
			j = a.indexOf(value, ii);
		}

		// 檢查是否找到有效匹配 / Check if valid match is found
		if ((j > -1) && (j > i))
		{
			i = j;

			return true;
		}
		else
		{
			// 記錄失敗的詞彙 / Record failed word
			failedWords.push(Array.isArray(value) ? value.join('/') : value);
			return false;
		}
	});

	// 若索引仍為 -1 表示無任何匹配 / If index is still -1, no match found
	if (i === -1)
	{
		bool = false;
	}

	return {
		matched: bool,
		failedWords,
	};
}

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
export function lazyMatch(a: string[], b: string[] | (string | string[])[], options: IOptionsLazyMatch = {})
{
	const { inspectFn, notThrowError } = _handleLazyMatchOptions(options);

	const result = _lazyMatchCore(a, b, options);

	// 如果 notThrowError 為 true，直接回傳結果物件
	// If notThrowError is true, return result object directly
	if (notThrowError)
	{
		return result;
	}

	// 匹配失敗時拋出錯誤 / Throw error when match fails
	!result.matched && fail(`expected ${inspectFn(a)} to have includes ordered members ${inspectFn(b)}`);

	return result.matched;
}

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
export function lazyMatch002(a: string[], b_arr: Parameters<typeof lazyMatch>['1'][], options: IOptionsLazyMatch = {})
{
	// 匹配結果 / Match result
	let bool: boolean;

	options = _handleLazyMatchOptions(options);
	let result: ILazyMatchCoreResult;
	let entryIndex = -1;

	// 逐一嘗試每組預期結果 / Try each expected result in order
	for (let b of b_arr)
	{
		result = _lazyMatchCore(a, b, options);

		// 處理新的回傳類型 / Handle new return type
		bool = result.matched;
		entryIndex++;

		// 找到匹配即停止 / Stop when match is found
		if (bool)
		{
			break;
		}
	}

	// 如果 notThrowError 為 true，直接回傳結果物件
	// If notThrowError is true, return result object directly
	if (options.notThrowError)
	{
		let entryMatched: Parameters<typeof lazyMatch>['1'];
		if (bool)
		{
			entryMatched = entryIndex >= 0 && b_arr[entryIndex]
		}
		else
		{
			entryIndex = -1;
		}

		return {
			...result,
			entryIndex,
			entryMatched,
		} as ILazyMatchArrayResult;
	}

	// 所有組合都不匹配時拋出錯誤 / Throw error when no combination matches
	!bool && fail(`expected ${options.inspectFn(a)} to have includes one of ordered members in ${options.inspectFn(b_arr)}`);

	return bool;
}

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
export function _lazyMatchSynonym001Core(a: string, b_arr: (string | string[])[], options: IOptionsLazyMatch = {}): ILazyMatchCoreResult
{
	// 當前搜尋位置 / Current search position
	let i: number = undefined;

	// 失敗詞彙清單 / List of failed words
	const failedWords: string[] = [];

	// 檢查每個預期詞彙是否存在 / Check if each expected word exists
	let bool = b_arr.every(function (bb)
	{
		// 搜尋起始位置 / Search start position
		let ii = i;

		// 初始化位置 / Initialize position
		if (i == null)
		{
			i = -1;
		}

		// 找到的索引位置 / Found index position
		let j: number = -1;

		// 記錄當前匹配的詞彙 / Record current matched word
		let matchedWord: string = null;

		// 處理陣列類型的匹配目標 / Handle array-type match target
		if (Array.isArray(bb))
		{
			bb.some(v =>
			{
				let jj = a.indexOf(v, ii);

				if (jj > -1)
				{
					j = jj;
					matchedWord = v;

					return true;
				}
			})
		}
		else
		{
			// 單一字串直接搜尋 / Single string direct search
			j = a.indexOf(bb, ii);
			matchedWord = bb;
		}

		// 檢查是否找到有效匹配 / Check if valid match is found
		if ((j > -1) && (j >= i))
		{
			// 更新位置，跳過已匹配的詞彙長度 / Update position, skip matched word length
			i = j + (matchedWord?.length || 0);

			return true;
		}
		else
		{
			// 記錄失敗的詞彙 / Record failed word
			failedWords.push(Array.isArray(bb) ? bb.join('/') : bb);
			return false;
		}
	});

	// 若位置仍為 -1 表示無任何匹配 / If position is still -1, no match found
	if (i === -1)
	{
		bool = false;
	}

	return {
		matched: bool,
		failedWords,
	};
}

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
export function lazyMatchSynonym001(a: string, b_arr: (string | string[])[], options: IOptionsLazyMatch = {})
{
	const { inspectFn, notThrowError } = _handleLazyMatchOptions(options);

	const result = _lazyMatchSynonym001Core(a, b_arr, options);

	// 如果 notThrowError 為 true，直接回傳結果物件
	// If notThrowError is true, return result object directly
	if (notThrowError)
	{
		return result;
	}

	// 匹配失敗時拋出錯誤 / Throw error when match fails
	!result.matched && fail(`expected ${inspectFn(a)} to have index of ordered members in ${inspectFn(b_arr)}`);

	return result.matched;
}

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
export function _lazyMatchSynonym001NotCore(a: string, b_arr: (string | string[])[], options: IOptionsLazyMatch = {}): ILazyMatchNotCoreResult
{
	// 當前搜尋位置 / Current search position
	let i: number = undefined;

	// 找到不應存在的詞彙清單 / List of words found that should not exist
	const failedWords: string[] = [];

	// 檢查每個詞彙是否不存在 / Check if each word does not exist
	let bool = b_arr.every(function (bb)
	{
		// 搜尋起始位置 / Search start position
		let ii = i;

		// 初始化位置 / Initialize position
		if (i == null)
		{
			i = -1;
		}

		// 找到的索引位置 / Found index position
		let j: number = -1;

		// 處理陣列類型的匹配目標 / Handle array-type match target
		if (Array.isArray(bb))
		{
			bb.some(v =>
			{
				let jj = a.indexOf(v, ii);

				if (jj > -1)
				{
					j = jj;

					return true;
				}
			})
		}
		else
		{
			// 單一字串直接搜尋 / Single string direct search
			j = a.indexOf(bb, ii);
		}

		// 如果找到匹配，表示測試失敗 / If match found, test fails
		if ((j > -1) && (j > i))
		{
			// 記錄找到不應存在的詞彙 / Record word found that should not exist
			failedWords.push(Array.isArray(bb) ? bb.join('/') : bb);

			return false;
		}
		else
		{
			// 繼續搜尋下一個位置 / Continue searching next position
			i++;
			return true;
		}
	});

	return {
		matched: bool,
		failedWords,
	};
}

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
export function lazyMatchSynonym001Not(a: string, b_arr: (string | string[])[], options: IOptionsLazyMatch = {})
{
	const { inspectFn, notThrowError } = _handleLazyMatchOptions(options);

	const result = _lazyMatchSynonym001NotCore(a, b_arr, options);

	// 如果 notThrowError 為 true，直接回傳結果物件
	// If notThrowError is true, return result object directly
	if (notThrowError)
	{
		return result;
	}

	// 匹配成功時拋出錯誤（因為不應該匹配）/ Throw error when match succeeds (because it shouldn't match)
	!result.matched && fail(`expected ${inspectFn(a)} to not have index of ordered members in ${inspectFn(b_arr)}`);

	return result.matched;
}

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
export function _lazyMatchNotCore(a: string[], b: string[] | (string | string[])[], options: IOptionsLazyMatch = {}): ILazyMatchNotCoreResult
{
	// 當前匹配索引位置 / Current match index position
	let i: number = null;

	const { firstOne } = _handleLazyMatchOptions(options);

	// 找到不應存在的詞彙清單 / List of words found that should not exist
	const failedWords: string[] = [];

	// 檢查每個詞彙是否不存在 / Check if each word does not exist
	let bool = b.every(function (value, index, array)
	{
		// 找到的索引位置 / Found index position
		let j: number = -1;
		// 搜尋起始位置 / Search start position
		let ii = i;

		// 初始化索引 / Initialize index
		if (i == null)
		{
			i = -1;
		}

		// 處理陣列類型的匹配目標 / Handle array-type match target
		if (Array.isArray(value))
		{
			if (firstOne)
			{
				// 只取第一個匹配項 / Take only the first match
				value.some(function (bb)
				{
					let jj = a.indexOf(bb, ii);

					if ((jj > -1) && (jj > i))
					{
						j = jj;

						return true
					}
				});
			}
			else
			{
				// 取最接近的匹配項 / Take the closest match
				j = value.reduce(function (aa, bb)
				{
					let jj = a.indexOf(bb, ii);

					if ((jj > -1) && (jj > i))
					{
						if (aa == -1)
						{
							return jj;
						}

						return Math.min(jj, aa)
					}

					return aa;
				}, -1)
			}
		}
		else
		{
			// 單一字串直接搜尋 / Single string direct search
			j = a.indexOf(value, ii);
		}

		// 如果找到匹配，表示測試失敗 / If match found, test fails
		if (j > -1)
		{
			i = j;

			// 記錄找到不應存在的詞彙 / Record word found that should not exist
			failedWords.push(Array.isArray(value) ? value.join('/') : value);

			return false;
		}
		else
		{
			return true;
		}
	});

	// 若索引仍為 -1 表示無任何匹配（測試通過）/ If index is still -1, no match found (test passed)
	if (i === -1)
	{
		bool = true;
	}

	return {
		matched: bool,
		failedWords,
	};
}

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
export function lazyMatchNot(a: string[], b: string[] | (string | string[])[], options: IOptionsLazyMatch = {})
{
	const { inspectFn, notThrowError } = _handleLazyMatchOptions(options);

	const result = _lazyMatchNotCore(a, b, options);

	// 如果 notThrowError 為 true，直接回傳結果物件
	// If notThrowError is true, return result object directly
	if (notThrowError)
	{
		return result;
	}

	// 匹配成功時拋出錯誤（因為不應該匹配）/ Throw error when match succeeds (because it shouldn't match)
	!result.matched && fail(`expected ${inspectFn(a)} should not have includes ordered members ${inspectFn(b)}`);

	return result.matched;
}
