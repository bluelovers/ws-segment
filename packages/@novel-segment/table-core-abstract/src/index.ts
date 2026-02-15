/**
 * 字典表格核心抽象模組
 * Dictionary Table Core Abstract Module
 *
 * Created by user on 2018/4/19/019.
 */

import { IDictRow } from '@novel-segment/loaders/segment/index';
import { IWord } from '@novel-segment/types';
import { cloneDeep } from 'lodash';

/**
 * 表格選項介面
 * Table Options Interface
 *
 * 定義字典表格的配置選項。
 * Defines configuration options for dictionary tables.
 */
export type IOptions = {
	/**
	 * 自動轉換中日韓字元
	 * Auto-convert CJK characters
	 *
	 * 啟用後會自動處理簡繁轉換、日文漢字等變體。
	 * When enabled, automatically handles simplified/traditional Chinese
	 * conversion and Japanese kanji variants.
	 */
	autoCjk?: boolean,
}

/**
 * 字典介面
 * Dictionary Interface
 *
 * 以字串為鍵的字典結構，儲存任意類型的值。
 * A dictionary structure with string keys, storing values of any type.
 */
export interface IDICT<T = any>
{
	[key: string]: T,
}

/**
 * 二維字典介面
 * Two-dimensional Dictionary Interface
 *
 * 以數字為鍵的第一層字典，值為另一個字典結構。
 * 用於按長度分組儲存詞條，提升查詢效率。
 *
 * A first-level dictionary with numeric keys, where values are another dictionary structure.
 * Used to group entries by length for improved query efficiency.
 */
export interface IDICT2<T = any>
{
	[key: number]: IDICT<T>,
}

/**
 * 表格存在介面
 * Table Exists Interface
 *
 * 定義可傳入建構函式的現有表格結構。
 * Defines existing table structures that can be passed to the constructor.
 */
export interface ITableDictExistsTable<T>
{
	/**
	 * 主字典表格
	 * Main dictionary table
	 */
	TABLE?: IDICT<T>,
	/**
	 * 二維字典表格（按長度索引）
	 * Two-dimensional dictionary table (indexed by length)
	 */
	TABLE2?: any | IDICT2<T>,
}

/**
 * 字典表格核心抽象類別
 * Abstract Dictionary Table Core Class
 *
 * 所有字典表格的基礎抽象類別，提供共用的儲存結構與操作方法。
 * 子類別需實作 add() 與 _add() 方法，可選實作 remove() 與 stringify()。
 *
 * Base abstract class for all dictionary tables, providing shared storage
 * structures and operations. Subclasses must implement add() and _add() methods,
 * and optionally implement remove() and stringify().
 *
 * @template T - 表格儲存的值類型 / The type of values stored in the table
 */
export abstract class AbstractTableDictCore<T>
{
	/**
	 * 表格類型識別碼（靜態）
	 * Table type identifier (static)
	 */
	public static type: string;

	/**
	 * 表格類型識別碼
	 * Table type identifier
	 */
	public type: string;

	/**
	 * 主字典表格
	 * Main Dictionary Table
	 *
	 * 以詞語為鍵，儲存對應的值。
	 * 使用 Object.create(null) 建立無原型鏈的物件，避免屬性衝突。
	 *
	 * Uses words as keys to store corresponding values.
	 * Created with Object.create(null) to avoid prototype chain property conflicts.
	 */
	public TABLE: IDICT<T> = Object.create(null);

	/**
	 * 二維字典表格
	 * Two-dimensional Dictionary Table
	 *
	 * 以詞語長度為第一層鍵，詞語為第二層鍵。
	 * 用於優化按長度查詢的效能。
	 *
	 * Uses word length as the first-level key and word as the second-level key.
	 * Used to optimize query performance by length.
	 */
	public TABLE2: any | IDICT2<T> = Object.create(null);

	/**
	 * 表格選項
	 * Table Options
	 */
	public options: IOptions;

	/**
	 * 建構函式
	 * Constructor
	 *
	 * 初始化字典表格實例，可傳入現有表格資料以複用。
	 *
	 * Initializes a dictionary table instance, optionally accepting existing
	 * table data for reuse.
	 *
	 * @param {string} type - 表格類型識別碼 / Table type identifier
	 * @param {IOptions} options - 表格選項 / Table options
	 * @param {ITableDictExistsTable<T>} existsTable - 現有表格資料 / Existing table data
	 * @param {...any} argv - 其他參數 / Additional arguments
	 */
	constructor(type: string, options: IOptions = {}, existsTable?: ITableDictExistsTable<T>, ...argv)
	{
		this.type = type;

		this.options = Object.assign({}, this.options, options);

		// 載入現有表格資料 / Load existing table data
		if (existsTable)
		{
			if (existsTable.TABLE)
			{
				this.TABLE = existsTable.TABLE;
			}

			if (existsTable.TABLE2)
			{
				this.TABLE2 = existsTable.TABLE2;
			}
		}

		this._init();
	}

	/**
	 * 內部初始化方法
	 * Internal Initialization Method
	 *
	 * 設定 TABLE 與 TABLE2 的原型為 null，確保乾淨的字典結構。
	 * Sets the prototype of TABLE and TABLE2 to null, ensuring a clean dictionary structure.
	 */
	_init()
	{
		Object.setPrototypeOf(this.TABLE, null);
		Object.setPrototypeOf(this.TABLE2, null);
	}

	/**
	 * 內部存在檢查輔助方法
	 * Internal Exists Check Helper Method
	 *
	 * 從各種輸入格式中提取詞語字串。
	 * 支援字串、陣列或 IWord 物件格式。
	 *
	 * Extracts word string from various input formats.
	 * Supports string, array, or IWord object formats.
	 *
	 * @protected
	 * @template U - 輸入資料類型 / Input data type
	 * @param {U} data - 輸入資料 / Input data
	 * @param {...any} argv - 其他參數 / Additional arguments
	 * @returns {string} 提取的詞語 / Extracted word
	 */
	protected _exists<U extends IWord | IDictRow | string>(data: U, ...argv)
	{
		let w: string;

		if (typeof data === 'string')
		{
			w = data;
		}
		else if (Array.isArray(data))
		{
			[w] = data;
		}
		else
		{
			({ w } = data as IWord);
		}

		return w
	}

	/**
	 * 檢查詞語是否存在於表格中
	 * Check if Word Exists in Table
	 *
	 * 查詢主字典表格中是否存在指定的詞語。
	 * 若存在則返回對應的值，否則返回 null。
	 *
	 * Queries the main dictionary table for the specified word.
	 * Returns the corresponding value if exists, otherwise returns null.
	 *
	 * @template U - 輸入資料類型 / Input data type
	 * @param {U} data - 輸入資料（字串、陣列或 IWord） / Input data (string, array, or IWord)
	 * @param {...any} argv - 其他參數 / Additional arguments
	 * @returns {T | null} 存在時返回對應值，否則返回 null / Corresponding value if exists, null otherwise
	 */
	public exists<U extends IWord | IDictRow | string>(data: U, ...argv)
	{
		const w = this._exists(data);

		return this.TABLE[w] || null;
	}

	/**
	 * 新增詞語到表格
	 * Add Word to Table
	 *
	 * 抽象方法，子類別必須實作。
	 * 將詞語及其相關資料加入字典表格。
	 *
	 * Abstract method that subclasses must implement.
	 * Adds a word and its associated data to the dictionary table.
	 *
	 * @abstract
	 * @param {any} data - 要新增的資料 / Data to add
	 * @param {...any} argv - 其他參數 / Additional arguments
	 * @returns {this} 返回實例以支援鏈式呼叫 / Returns instance for method chaining
	 */
	public abstract add(data, ...argv): this

	/**
	 * 內部新增方法
	 * Internal Add Method
	 *
	 * 抽象方法，子類別必須實作。
	 * 實際執行將資料加入表格的邏輯。
	 *
	 * Abstract method that subclasses must implement.
	 * Actually performs the logic of adding data to the table.
	 *
	 * @abstract
	 * @protected
	 * @param {any} data - 要新增的資料 / Data to add
	 * @param {...any} argv - 其他參數 / Additional arguments
	 */
	protected abstract _add(data, ...argv)

	/**
	 * 從表格移除詞語
	 * Remove Word from Table
	 *
	 * 可選方法，子類別可依需求實作。
	 * 從字典表格中移除指定的詞語。
	 *
	 * Optional method that subclasses can implement as needed.
	 * Removes the specified word from the dictionary table.
	 *
	 * @param {any} data - 要移除的資料 / Data to remove
	 * @param {...any} argv - 其他參數 / Additional arguments
	 * @returns {this} 返回實例以支援鏈式呼叫 / Returns instance for method chaining
	 */
	public remove?(data, ...argv): this

	/**
	 * 內部移除方法
	 * Internal Remove Method
	 *
	 * 可選方法，子類別可依需求實作。
	 * 實際執行從表格移除資料的邏輯。
	 *
	 * Optional method that subclasses can implement as needed.
	 * Actually performs the logic of removing data from the table.
	 *
	 * @protected
	 * @param {any} data - 要移除的資料 / Data to remove
	 * @param {...any} argv - 其他參數 / Additional arguments
	 */
	protected _remove?(data, ...argv)

	/**
	 * 匯出表格為 JSON 物件
	 * Export Table as JSON Object
	 *
	 * 返回主字典表格的深拷貝，避免外部修改影響內部資料。
	 * Returns a deep copy of the main dictionary table to prevent
	 * external modifications from affecting internal data.
	 *
	 * @param {...any} argv - 其他參數 / Additional arguments
	 * @returns {IDICT<T>} 表格的深拷貝 / Deep copy of the table
	 */
	public json(...argv): IDICT<T>
	{
		return cloneDeep(this.TABLE)
	}

	/**
	 * 將表格序列化為字串
	 * Serialize Table to String
	 *
	 * 可選方法，子類別可依需求實作。
	 * 將字典表格轉換為可儲存或傳輸的字串格式。
	 *
	 * Optional method that subclasses can implement as needed.
	 * Converts the dictionary table to a string format for storage or transmission.
	 *
	 * @param {...any} argv - 其他參數 / Additional arguments
	 * @returns {string} 序列化後的字串 / Serialized string
	 */
	public stringify?(...argv): string

	/**
	 * 取得表格中的詞語數量
	 * Get Word Count in Table
	 *
	 * 返回主字典表格中儲存的詞語總數。
	 * Returns the total number of words stored in the main dictionary table.
	 *
	 * @returns {number} 詞語數量 / Word count
	 */
	public size(): number
	{
		return Object.keys(this.TABLE).length;
	}
}

export default AbstractTableDictCore;
