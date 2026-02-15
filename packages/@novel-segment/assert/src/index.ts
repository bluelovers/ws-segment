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
 * 有序匹配
 * Lazy Ordered Match
 *
 * 分析後應該要符合以下結果，驗證斷詞結果是否按順序包含指定的詞彙。
 * 適用於測試斷詞器是否正確識別並排序關鍵詞。
 *
 * After analysis, should match the following result.
 * Verifies if segmentation results contain specified words in order.
 * Suitable for testing if the segmenter correctly identifies and orders keywords.
 *
 * @example
 * [
 * 		'胡锦涛出席APEC领导人会议后回京',
 * 		[
 * 			'会议',
 * 			'回京',
 * 		],
 * 	],
 *
 * @param {string[]} a - 斷詞結果陣列 / Segmentation result array
 * @param {string[] | (string | string[])[]} b - 預期包含的詞彙（支援陣列表示多選一）/ Expected words (array for multiple choices)
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {boolean} 是否匹配成功 / Whether match succeeded
 */
export function lazyMatch(a: string[], b: string[] | (string | string[])[], options: IOptionsLazyMatch = {})
{
	// 當前匹配索引位置 / Current match index position
	let i: number = null;

	const { inspectFn, firstOne } = _handleLazyMatchOptions(options);

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
	});

	// 若索引仍為 -1 表示無任何匹配 / If index is still -1, no match found
	if (i === -1)
	{
		bool = false;
	}

	// 匹配失敗時拋出錯誤 / Throw error when match fails
	!bool && fail(`expected ${inspectFn(a)} to have includes ordered members ${inspectFn(b)}`);

	return bool;
}

/**
 * 多選匹配
 * Lazy Multi-Choice Match
 *
 * 分析後應該要符合以下其中一個結果。
 * 適用於測試同一句子的多種可能斷詞結果。
 *
 * After analysis, should match one of the following results.
 * Suitable for testing multiple possible segmentation results of the same sentence.
 *
 * @example
 * [
 * 		'在這裡有兩具自動人偶隨侍在側的烏列爾',
 * 		[
 * 			[
 * 				'兩具',
 * 				'自動',
 * 				'人偶',
 * 				'隨侍',
 * 			],
 * 			[
 * 				'兩具',
 * 				'自動人偶',
 * 				'隨侍',
 * 			],
 * 		],
 * 	],
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

	// 逐一嘗試每組預期結果 / Try each expected result in order
	for (let b of b_arr)
	{
		try
		{
			bool = lazyMatch(a, b, options);

			// 找到匹配即停止 / Stop when match is found
			if (bool)
			{
				break;
			}
		}
		catch (e)
		{
			// 忽略錯誤，繼續嘗試下一組 / Ignore error, continue to next
		}
	}

	// 所有組合都不匹配時拋出錯誤 / Throw error when no combination matches
	!bool && fail(`expected ${options.inspectFn(a)} to have includes one of ordered members in ${options.inspectFn(b_arr)}`);
}

/**
 * 同義詞匹配
 * Lazy Synonym Match
 *
 * 分析轉換後應該要具有以下字詞。
 * 用於驗證同義詞轉換後的字串是否包含預期的詞彙。
 *
 * After analysis and transformation, should have the following words.
 * Used to verify if the string after synonym transformation contains expected words.
 *
 * @example
 * [
 * 		'大家干的好',
 * 		[
 * 			'幹',
 * 		],
 * 	],
 *
 * @param {string} a - 轉換後的字串 / Transformed string
 * @param {(string | string[])[]} b_arr - 預期包含的詞彙 / Expected words to contain
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 */
export function lazyMatchSynonym001(a: string, b_arr: (string | string[])[], options: IOptionsLazyMatch = {})
{
	// 匹配結果 / Match result
	let bool: boolean;
	// 當前搜尋位置 / Current search position
	let i: number = undefined;

	const { inspectFn, firstOne } = _handleLazyMatchOptions(options);

	// 檢查每個預期詞彙是否存在 / Check if each expected word exists
	bool = b_arr.every(function (bb)
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
					bb = v;

					return true;
				}
			})
		}
		else
		{
			// 單一字串直接搜尋 / Single string direct search
			j = a.indexOf(bb, ii);
		}

		// 檢查是否找到有效匹配 / Check if valid match is found
		if ((j > -1) && (j >= i))
		{
			// 更新位置，跳過已匹配的詞彙長度 / Update position, skip matched word length
			i = j + bb.length;

			return true;
		}
		else if (i > -1)
		{
			fail(`expected ${inspectFn(a)} to have have ${inspectFn(bb)} on index > ${i}, but got ${j}`);
		}
	});

	// 若位置仍為 -1 表示無任何匹配 / If position is still -1, no match found
	if (i === -1)
	{
		bool = false;
	}

	// 匹配失敗時拋出錯誤 / Throw error when match fails
	!bool && fail(`expected ${inspectFn(a)} to have index of ordered members in ${inspectFn(b_arr)}`);
}

/**
 * 同義詞反向匹配
 * Lazy Synonym Negative Match
 *
 * 分析轉換後不應該具有以下字詞。
 * 用於驗證同義詞轉換後的字串不應包含特定的詞彙。
 *
 * After analysis and transformation, should NOT have the following words.
 * Used to verify that the string after synonym transformation does not contain specific words.
 *
 * @example
 * [
 * 		'那是里靈魂的世界。',
 * 		[
 * 			'裡',
 * 		],
 * 	],
 *
 * @param {string} a - 轉換後的字串 / Transformed string
 * @param {(string | string[])[]} b_arr - 不應包含的詞彙 / Words that should not be contained
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 */
export function lazyMatchSynonym001Not(a: string, b_arr: (string | string[])[], options: IOptionsLazyMatch = {})
{
	// 匹配結果 / Match result
	let bool: boolean;
	// 當前搜尋位置 / Current search position
	let i: number = undefined;

	const { inspectFn, firstOne } = _handleLazyMatchOptions(options);

	// 檢查每個詞彙是否不存在 / Check if each word does not exist
	bool = b_arr.every(function (bb)
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
					bb = v;

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
			fail(`expected ${inspectFn(a)} to not have ${inspectFn(bb)} on index > ${i}, but got ${j}`);

			return true;
		}
		else
		{
			// 繼續搜尋下一個位置 / Continue searching next position
			i++;
		}
	});
}

/**
 * 反向匹配
 * Lazy Negative Match
 *
 * 分析後不應該存在符合以下結果。
 * 用於驗證斷詞結果不應按順序包含指定的詞彙組合。
 *
 * After analysis, should NOT have the following result.
 * Used to verify that segmentation results should not contain specified word combinations in order.
 *
 * @example
 * [
 * 		'這份毫不守舊的率直',
 * 		[
 * 			'份毫',
 * 		],
 * 	],
 *
 * @param {string[]} a - 斷詞結果陣列 / Segmentation result array
 * @param {string[] | (string | string[])[]} b - 不應包含的詞彙組合 / Word combinations that should not be contained
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {boolean} 是否通過測試（不包含指定組合）/ Whether test passed (does not contain specified combination)
 */
export function lazyMatchNot(a: string[], b: string[] | (string | string[])[], options: IOptionsLazyMatch = {})
{
	// 當前匹配索引位置 / Current match index position
	let i: number = null;

	const { inspectFn, firstOne } = _handleLazyMatchOptions(options);

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
			if (options.firstOne)
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

	// 匹配成功時拋出錯誤（因為不應該匹配）/ Throw error when match succeeds (because it shouldn't match)
	!bool && fail(`expected ${inspectFn(a)} should not have includes ordered members ${inspectFn(b)}`);

	return bool;
}
