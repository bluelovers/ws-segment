/**
 * 同義詞表格模組
 * Synonym Table Module
 *
 * Created by user on 2018/4/19/019.
 */

import { IDICT, IOptions } from '@novel-segment/table-core-abstract';
import { TableDictSynonymPanGu } from '@novel-segment/table-synonym-pangu';
import { ArrayTwoOrMore } from '@novel-segment/types';

/**
 * 同義詞表格選項介面
 * Synonym Table Options Interface
 *
 * 擴充基礎選項，新增同義詞處理相關的配置。
 * Extends base options with synonym processing related configurations.
 */
export interface IOptionsTableDictSynonym extends IOptions
{
	/**
	 * 若詞語已存在則跳過
	 * Skip if word already exists
	 */
	skipExists?: boolean
	/**
	 * 強制覆寫已存在的對應
	 * Force overwrite existing mappings
	 */
	forceOverwrite?: boolean
}

/**
 * 同義詞表格類別
 * Synonym Table Class
 *
 * 請注意：這與原版 node-segment 的格式不同。
 * Note: This format differs from the original node-segment.
 *
 * 原版格式：一對一 => 錯字,正字
 * Original format: One-to-one => wrong_word,correct_word
 *
 * 此類別格式：一對多，順序與原版相反 => 正字,錯字,...以逗號分隔更多字
 * This class format: One-to-many, order reversed from original => correct_word,wrong_word,...more words separated by comma
 *
 * 支援將一個正確詞語對應到多個同義詞/變體詞，適用於：
 * - 簡繁轉換對應
 * - 錯字校正
 * - 同義詞替換
 *
 * Supports mapping one correct word to multiple synonyms/variant words, suitable for:
 * - Simplified/traditional Chinese conversion
 * - Typo correction
 * - Synonym replacement
 *
 * @example
 * ```typescript
 * const synonymTable = new TableDictSynonym();
 * // 正字為「臺灣」，對應到「台灣」、「台湾」等變體
 * // Correct word is "臺灣", mapping to variants like "台灣", "台湾"
 * synonymTable.add(['臺灣', '台灣', '台湾']);
 * ```
 */
export class TableDictSynonym extends TableDictSynonymPanGu
{
	/**
	 * 表格選項
	 * Table Options
	 */
	public declare options: IOptionsTableDictSynonym;

	/**
	 * 緩存主鍵對應表
	 * Cached Main Key Mapping Table
	 *
	 * 儲存正字對應到所有變體詞的陣列。
	 * 格式：{ 正字: [變體1, 變體2, ...] }
	 *
	 * Stores arrays of variant words mapped from correct words.
	 * Format: { correct_word: [variant1, variant2, ...] }
	 */
	public declare TABLE2: IDICT<string[]>;

	/**
	 * 建構函式
	 * Constructor
	 *
	 * 初始化同義詞表格實例。
	 * Initializes a synonym table instance.
	 *
	 * @param {string} [type] - 表格類型識別碼，預設為 TableDictSynonym.type / Table type identifier, defaults to TableDictSynonym.type
	 * @param {IOptionsTableDictSynonym} [options] - 表格選項 / Table options
	 * @param {...any} argv - 其他參數 / Additional arguments
	 */
	constructor(type: string = TableDictSynonym.type, options?: IOptionsTableDictSynonym, ...argv)
	{
		super(type, options, ...argv)
	}

	/**
	 * 新增同義詞對應
	 * Add Synonym Mapping
	 *
	 * 新增一對多的同義詞對應關係。
	 * 陣列第一個元素為正字（主鍵），後續元素為變體詞。
	 *
	 * Adds a one-to-many synonym mapping relationship.
	 * The first element of the array is the correct word (main key),
	 * subsequent elements are variant words.
	 *
	 * @param {ArrayTwoOrMore<string>} data - 同義詞對應陣列，至少需兩個元素 / Synonym mapping array, requires at least two elements
	 * @param {boolean} [skipExists] - 若變體詞已存在則跳過 / Skip if variant word already exists
	 * @param {boolean} [forceOverwrite] - 強制覆寫已存在的對應 / Force overwrite existing mappings
	 * @returns {this} 返回實例以支援鏈式呼叫 / Returns instance for method chaining
	 * @throws {TypeError} 當輸入格式不正確時拋出錯誤 / Throws error when input format is incorrect
	 */
	override add(data: ArrayTwoOrMore<string>, skipExists?: boolean, forceOverwrite?: boolean)
	{
		// 驗證輸入格式 / Validate input format
		if (!Array.isArray(data) || data.length < 2)
		{
			throw new TypeError(JSON.stringify(data));
		}

		// 取出正字（第一個元素）/ Extract correct word (first element)
		const w = this._trim(data.shift());

		if (!w.length)
		{
			throw new TypeError(JSON.stringify(data));
		}

		const self = this;

		// 初始化正字的變體詞陣列 / Initialize variant word array for correct word
		self.TABLE2[w] ??= [];

		// 使用選項預設值 / Use option defaults
		forceOverwrite ??= this.options.forceOverwrite;
		skipExists ??= this.options.skipExists ?? true;

		// 處理每個變體詞 / Process each variant word
		data.forEach(function (bw, index)
		{
			bw = self._trim(bw);

			// 跳過空字串 / Skip empty strings
			if (!bw.length)
			{
				if (index === 0)
				{
					throw new TypeError();
				}

				return;
			}

			// 檢查是否跳過已存在的詞語 / Check if should skip existing word
			if ((!forceOverwrite) && (skipExists && self.exists(bw) || bw in self.TABLE2))
			{
				return;
			}

			// 加入變體詞到對應表 / Add variant word to mapping table
			self.TABLE2[w].push(bw);
			// 建立變體詞到正字的對應 / Create mapping from variant word to correct word
			self._add(bw, w);

			//skipExists = true;
		});

		return this;
	}

}

export default TableDictSynonym
