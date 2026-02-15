
import {
	chkLineType,
	EnumLineType,
	handleDictLines,
	ILoadDictFileRow2,
	USE_CJK_MODE,
} from '@novel-segment/util-compare';
import { array_unique } from 'array-hyper-unique';
import { ArrayTwoOrMore } from '@novel-segment/types';
import { load } from '@novel-segment/loader-line';
import { getCjkName } from '@novel-segment/util/conv';
import { EnumSortCompareOrder, zhDictCompare } from '@novel-segment/util/sort';

/**
 * 字典同義詞行資料類型
 * Dictionary Synonym Row Data Type
 *
 * 繼承自 ILoadDictFileRow2，專門用於處理同義詞字典資料。
 * 資料陣列至少包含兩個字串元素（主詞與同義詞）。
 *
 * Extends ILoadDictFileRow2, specifically for handling synonym dictionary data.
 * Data array contains at least two string elements (main word and synonym).
 */
export type IHandleDictSynonym = ILoadDictFileRow2<ArrayTwoOrMore<string>>

/**
 * 排序同義詞行
 * Sort Synonym Lines
 *
 * 將原始同義詞字典行陣列解析、過濾並排序為結構化的同義詞資料。
 * 每行格式為：主詞,同義詞1,同義詞2,...
 *
 * Parses, filters, and sorts raw synonym dictionary line array into structured synonym data.
 * Each line format: main_word,synonym1,synonym2,...
 *
 * @param {string[]} lines - 原始同義詞字典行字串陣列 / Raw synonym dictionary line string array
 * @param {string} [file] - 來源檔案路徑（選填）/ Source file path (optional)
 * @returns {IHandleDictSynonym[]} 排序後的同義詞資料陣列 / Sorted synonym data array
 */
export function sortLines(lines: string[], file?: string)
{
	const list = handleDictLines<IHandleDictSynonym>(lines, function (list, cur)
	{
		// 記錄來源檔案路徑 / Record source file path
		cur.file = file;

		// 取得第一個元素作為主詞 / Get the first element as the main word
		let [w] = cur.data;

		// 檢查並設定行類型 / Check and set line type
		cur.line_type = chkLineType(cur.line);

		// 如果是註解行，移除開頭的 // 符號以取得實際內容 / If comment line, remove leading // to get actual content
		if (cur.line_type === EnumLineType.COMMENT)
		{
			w = w.replace(/^\/\//, '');

			//console.log(w);
		}
		// 如果是基礎行，處理同義詞列表 / If base line, process synonym list
		else if (cur.line_type === EnumLineType.BASE)
		{
			// 取得同義詞列表（排除第一個主詞）/ Get synonym list (excluding the first main word)
			let ls = cur.data.slice(1);

			// 移除重複項及與主詞相同的項目 / Remove duplicates and items identical to main word
			ls = array_unique(ls).filter(v => v != w);
			//ls.sort();

			// 依 CJK 字元順序對同義詞進行排序 / Sort synonyms by CJK character order
			ls.sort(function (a, b)
			{
				let ca = getCjkName(a, USE_CJK_MODE);
				let cb = getCjkName(b, USE_CJK_MODE);

				return zhDictCompare(ca, cb)
					|| zhDictCompare(a, b)
			});

			// 重新組合行內容：主詞 + 排序後的同義詞列表 / Reconstruct line content: main word + sorted synonym list
			cur.line = [w].concat(ls).join(',');

			// 如果沒有同義詞，排除該行 / If no synonyms, exclude the line
			if (!ls.length)
			{
				return false;
			}
		}

		// 計算主詞的 CJK 標準化識別 ID / Calculate CJK normalized identification ID for main word
		const cjk_id = getCjkName(w, USE_CJK_MODE);

		cur.cjk_id = cjk_id;

		return true;
	}, {
		// 解析函式：以逗號分隔行內容 / Parse function: split line content by comma
		parseFn(line)
		{
			return line.split(',') as ArrayTwoOrMore<string>;
		},
	});

	// 對處理後的列表進行排序 / Sort the processed list
	return SortList(list)
}

/**
 * 載入並排序同義詞字典檔案
 * Load and Sort Synonym Dictionary File
 *
 * 非同步載入同義詞字典檔案，並將其內容排序為結構化的同義詞資料。
 * Asynchronously loads a synonym dictionary file and sorts its content into structured synonym data.
 *
 * @param {string} file - 同義詞字典檔案路徑 / Synonym dictionary file path
 * @returns {Promise<IHandleDictSynonym[]>} 排序後的同義詞資料陣列 Promise / Promise of sorted synonym data array
 */
export function loadFile(file: string)
{
	return load(file).then(lines => sortLines(lines, file))
}

/**
 * 排序同義詞列表
 * Sort Synonym List
 *
 * 根據 CJK 字元順序及原始索引位置對同義詞資料進行排序。
 * 排序規則：
 * 1. 標籤註解行（COMMENT_TAG）優先處理，@ 開頭的標籤排在前面
 * 2. 一般註解行（COMMENT）依原始索引順序排列
 * 3. 基礎行（BASE）依 CJK 字元順序排序，相同時依原始索引排序
 *
 * Sorts synonym data based on CJK character order and original index position.
 * Sorting rules:
 * 1. Tagged comment lines (COMMENT_TAG) are processed first, @-prefixed tags come first
 * 2. Regular comment lines (COMMENT) are ordered by original index
 * 3. Base lines (BASE) are sorted by CJK character order, with original index as tiebreaker
 *
 * @template T - 行資料類型，繼承自 ILoadDictFileRow2 / Row data type, extends ILoadDictFileRow2
 * @param {T[]} ls - 待排序的列表 / List to be sorted
 * @returns {T[]} 排序後的列表 / Sorted list
 */
export function SortList<T extends ILoadDictFileRow2<any> = ILoadDictFileRow2>(ls: T[])
{
	return ls.sort(function (a: ILoadDictFileRow2, b: ILoadDictFileRow2)
	{
		// 處理標籤註解行的排序邏輯 / Handle sorting logic for tagged comment lines
		if (
			a.line_type === EnumLineType.COMMENT_TAG
			|| b.line_type === EnumLineType.COMMENT_TAG
		)
		{
			// 如果 b 不是標籤註解行，a 排在前面 / If b is not a tagged comment, a comes first
			if (b.line_type !== EnumLineType.COMMENT_TAG)
			{
				return EnumSortCompareOrder.UP
			}
			// 如果 a 不是標籤註解行，b 排在前面 / If a is not a tagged comment, b comes first
			else if (a.line_type !== EnumLineType.COMMENT_TAG)
			{
				return EnumSortCompareOrder.DOWN
			}

			// 檢查是否為 @ 開頭的標籤 / Check if tags start with @
			const aa = /^\/\/\s+@/.test(a.line);
			const ba = /^\/\/\s+@/.test(b.line);

			// @ 開頭的標籤排在前面 / @-prefixed tags come first
			if (aa && !ba)
				{
					return EnumSortCompareOrder.UP
				}
				else if (!aa && ba)
				{
					return EnumSortCompareOrder.DOWN
				}

			// 相同類型的標籤依原始索引排序 / Same type tags sorted by original index
			return (a.index - b.index);
		}
		// 如果兩行都是一般註解行，依原始索引排序 / If both are regular comments, sort by original index
		else if (
			a.line_type === EnumLineType.COMMENT
			&& b.line_type === EnumLineType.COMMENT
		)
		{
			return (a.index - b.index);
		}

		// 基礎行依 CJK 字元順序排序，相同時依原始索引排序 / Base lines sorted by CJK order, with index as tiebreaker
		let ret = zhDictCompare(a.cjk_id, b.cjk_id)
			|| zhDictCompare(a.data[0], b.data[0])
			|| (a.index - b.index)
			|| EnumSortCompareOrder.KEEP
		;

		return ret;
	})
}

export default sortLines
