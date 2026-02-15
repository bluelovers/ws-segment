/**
 * 類型定義模組
 * Type Definitions Module
 *
 * 定義斷詞系統中使用的核心類型與介面。
 * 包含詞詞物件 (IWord)、字典資料庫類型 (EnumDictDatabase) 等基礎定義。
 *
 * Defines core types and interfaces used in the segmentation system.
 * Includes basic definitions such as word object (IWord) and dictionary database types (EnumDictDatabase).
 *
 * @module @novel-segment/types
 */

/**
 * 包含兩個或更多元素的陣列類型
 * Array Type with Two or More Elements
 *
 * 確保陣列至少包含兩個元素，用於需要多個參數的場景。
 * Ensures the array contains at least two elements, used in scenarios requiring multiple parameters.
 *
 * @template T - 陣列元素類型 / Array element type
 */
export type ArrayTwoOrMore<T> = T[] & {
	0: T,
	1: T,
}

/**
 * 字典資料庫類型列舉
 * Dictionary Database Type Enumeration
 *
 * 定義斷詞系統中使用的各種字典類型。
 * 每種類型對應不同的字典用途和處理邏輯。
 *
 * Defines various dictionary types used in the segmentation system.
 * Each type corresponds to different dictionary purposes and processing logic.
 */
export const enum EnumDictDatabase
{
	/**
	 * 同義詞字典
	 * Synonym Dictionary
	 *
	 * 儲存詞彙的同義詞對應關係，用於詞彙轉換。
	 * Stores synonym mappings for words, used for word transformation.
	 */
	SYNONYM = 'SYNONYM',

	/**
	 * 主字典表
	 * Main Dictionary Table
	 *
	 * 儲存詞彙及其詞性、權重等資訊，為斷詞的核心字典。
	 * Stores words and their part-of-speech, weight, and other information, serving as the core dictionary for segmentation.
	 */
	TABLE = 'TABLE',

	/**
	 * 停用詞字典
	 * Stopword Dictionary
	 *
	 * 儲存應被過濾的停用詞列表。
	 * Stores the list of stopwords that should be filtered out.
	 */
	STOPWORD = 'STOPWORD',

	/**
	 * 字典黑名單
	 * Dictionary Blacklist
	 *
	 * 在主字典內刪除此字典內有的條目。
	 * 用於排除不需要的詞彙。
	 *
	 * Removes entries in this dictionary from the main dictionary.
	 * Used to exclude unwanted words.
	 */
	BLACKLIST = 'BLACKLIST',

	/**
	 * 優化器黑名單
	 * Optimizer Blacklist
	 *
	 * 會防止部分優化器去組合此字典內的詞。
	 * 例如：人名自動組合之類的優化處理會跳過這些詞。
	 *
	 * Prevents some optimizers from combining words in this dictionary.
	 * For example: optimization processes like automatic name combination will skip these words.
	 */
	BLACKLIST_FOR_OPTIMIZER = 'BLACKLIST_FOR_OPTIMIZER',

	/**
	 * 轉換黑名單
	 * Synonym Transformation Blacklist
	 *
	 * 動態轉換字詞時會忽略此字典內的詞。
	 * 確保特定詞彙不會被同義詞轉換影響。
	 *
	 * Ignores words in this dictionary during dynamic word transformation.
	 * Ensures specific words are not affected by synonym conversion.
	 */
	BLACKLIST_FOR_SYNONYM = 'BLACKLIST_FOR_SYNONYM',

}

/**
 * 詞詞物件介面
 * Word Object Interface
 *
 * 定義斷詞結果中單一詞彙的資料結構。
 * 包含詞彙內容、詞性、權重、位置等資訊。
 *
 * Defines the data structure for a single word in segmentation results.
 * Includes word content, part-of-speech, weight, position, and other information.
 */
export interface IWord
{
	/**
	 * 詞彙內容
	 * Word Content
	 *
	 * 該詞的文字內容。
	 * The text content of the word.
	 */
	w: string,

	/**
	 * 詞性
	 * Part of Speech (POS)
	 *
	 * 詞性標記，使用數字編碼表示。
	 * 參見 POSTAG 列舉了解具體的詞性類型。
	 *
	 * Part-of-speech tag, represented using numeric encoding.
	 * See POSTAG enumeration for specific POS types.
	 */
	p?: number,

	/**
	 * 詞性名稱
	 * Part of Speech Name
	 *
	 * 詞性的可讀名稱字串。
	 * Human-readable name string for the part-of-speech.
	 */
	ps?: string,

	/**
	 * 詞性別名
	 * Part of Speech Alias
	 *
	 * 詞性的替代名稱或別名。
	 * Alternative name or alias for the part-of-speech.
	 */
	pp?: string,

	/**
	 * 權重
	 * Weight / Frequency
	 *
	 * 詞彙的權重或頻率值。
	 * 用於排序或評估詞彙重要性。
	 *
	 * Weight or frequency value of the word.
	 * Used for sorting or evaluating word importance.
	 */
	f?: number,

	/**
	 * 開始位置
	 * Start Position
	 *
	 * 詞彙在原始文字中的起始字元索引。
	 * The starting character index of the word in the original text.
	 */
	c?: number,

	/**
	 * 合併項目
	 * Merged Items
	 *
	 * 記錄此詞彙是由哪些子詞彙合併而成。
	 * 用於追蹤複合詞的組成來源。
	 *
	 * Records which sub-words this word was merged from.
	 * Used for tracking the composition source of compound words.
	 */
	m?: Array<IWord | string>,

	//convertSynonym?: boolean,
	//autoCreate?: boolean,

	/**
	 * 原生字典項目標記
	 * Native Dictionary Entry Flag
	 *
	 * 代表此項目原生存在於字典內。
	 * 用於區分字典詞與動態生成的詞。
	 *
	 * Indicates this item natively exists in the dictionary.
	 * Used to distinguish dictionary words from dynamically generated words.
	 */
	s?: boolean,

	/**
	 * 原始原生字典項目標記
	 * Original Native Dictionary Entry Flag
	 *
	 * 用於標記原始的字典項目狀態。
	 * 用於追蹤詞彙在處理過程中的來源狀態。
	 *
	 * Used to mark the original dictionary entry status.
	 * Used for tracking the source status of words during processing.
	 */
	os?: boolean,
}
