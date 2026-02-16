/**
 * novel-segment-cli - 命令列分詞工具
 * Novel Segment CLI - Command-line segmentation tool
 *
 * 提供文字與檔案的分詞處理功能，支援快取管理、簡繁轉換。
 * Provides text and file segmentation processing with cache management and Traditional/Simplified Chinese conversion.
 */
import crlf from 'crlf-normalize';
import Segment from 'novel-segment';
import type Segment2 from 'novel-segment/lib';
import { useDefault } from 'novel-segment/lib';
import Bluebird from 'bluebird';
import { existsSync, loadFile } from 'fs-iconv';
import Cacache from './lib/cache';
import { console, debugConsole, enableDebug, freeGC } from './lib/util';
import PACKAGE_JSON from './package.json';
import { debug_token } from 'novel-segment/lib/util'
import iconv from 'iconv-jschardet';
import { cn2tw_min } from '@lazy-cjk/zh-convert/min';
import { IOptionsSegment } from 'novel-segment/lib/segment/types';
import { useDefaultBlacklistDict, useDefaultSynonymDict } from 'novel-segment/lib/defaults/dict';

import { merge } from 'lodash';
import { array_unique } from 'array-hyper-unique';
import { ITSResolvable } from 'ts-type';

/**
 * 快取的分詞實例
 * Cached Segment Instance
 *
 * 使用單例模式快取分詞器實例，避免重複初始化。
 * Uses singleton pattern to cache the segmenter instance to avoid repeated initialization.
 *
 * @private
 */
let CACHED_SEGMENT: import("novel-segment/lib/Segment").Segment;

/**
 * 快取的 Cacache 實例
 * Cached Cacache Instance
 *
 * 用於儲存字典資料的快取系統。
 * Used to store dictionary data cache.
 *
 * @private
 */
let CACHED_CACACHE: Cacache;

/**
 * 一般模式的快取資料庫鍵名
 * Cache database key for normal mode
 *
 * @constant {string}
 */
const DB_KEY = 'cache.db';

/**
 * 一般模式的快取資訊鍵名
 * Cache info key for normal mode
 *
 * @constant {string}
 */
const DB_KEY_INFO = 'cache.info';

/**
 * 小說模式（nodeNovelMode）的快取資料庫鍵名
 * Cache database key for novel mode (nodeNovelMode)
 *
 * @constant {string}
 */
const DB_KEY2 = 'cache.common.synonym.db';

/**
 * 小說模式的快取資訊鍵名
 * Cache info key for novel mode
 *
 * @constant {string}
 */
const DB_KEY2_INFO = 'cache.common.synonym.info';

/**
 * 快取預設 TTL（Time To Live）
 * Default cache TTL (Time To Live)
 *
 * 預設為 1 小時（3600 秒 = 3600 * 1000 毫秒）。
 * Default is 1 hour (3600 seconds = 3600 * 1000 milliseconds).
 *
 * @constant {number}
 */
const DB_TTL = 3600 * 1000;

/**
 * 分詞結果序列化函數
 * Segmentation result serialization function
 *
 * 將分詞後的資料結構轉換為文字。
 * Converts segmented data structure to text.
 *
 * @constant
 */
const stringify = Segment.stringify;

/**
 * 啟用除錯模式
 * Enable debug mode
 *
 * @see {@link enableDebug}
 */
export { enableDebug, stringify }

/**
 * CLI 分詞選項介面
 * CLI Segmentation Options Interface
 *
 * 定義命令列工具的所有可用選項。
 * Defines all available options for the command-line tool.
 */
export interface ISegmentCLIOptions
{
	/**
	 * 格式化分行符號
	 * Format line break characters
	 *
	 * 可設定為特定換行符號（如 '\n'、'\r\n'）或啟用自動偵測。
	 * Can be set to specific line break characters (like '\n', '\r\n') or enable auto-detection.
	 */
	crlf?: string | boolean,

	/**
	 * 是否使用全域快取
	 * Whether to use global cache
	 *
	 * 全域快取會使用 NPM 快取目錄，跨專案共享。
	 * Global cache uses NPM cache directory, shared across projects.
	 */
	useGlobalCache?: boolean,

	/**
	 * 是否停用快取
	 * Whether to disable cache
	 *
	 * 停用快取會強制每次都重新載入字典，適合開發調試。
	 * Disabling cache forces dictionary reload every time, suitable for development debugging.
	 */
	disableCache?: boolean,

	/**
	 * 是否停用警告訊息
	 * Whether to disable warning messages
	 *
	 * 啟用後不會顯示檔案編碼等警告資訊。
	 * When enabled, warning information like file encoding will not be displayed.
	 */
	disableWarn?: boolean,

	/**
	 * 快取有效時間（毫秒）
	 * Cache TTL (milliseconds)
	 *
	 * 設定快取資料的有效期，預設為 1 小時。
	 * Sets the validity period for cached data, default is 1 hour.
	 */
	ttl?: number,

	/**
	 * 是否轉換為繁體中文
	 * Whether to convert to Traditional Chinese
	 *
	 * 將分詞結果從簡體中文轉換為繁體中文。
	 * Converts segmentation result from Simplified Chinese to Traditional Chinese.
	 */
	convertToZhTw?: boolean,

	/**
	 * 分詞器選項
	 * Segmenter options
	 *
	 * 傳遞給 novel-segment 的選項物件。
	 * Options object passed to novel-segment.
	 */
	optionsSegment?: IOptionsSegment,

	/**
	 * 自訂快取資料庫鍵名
	 * Custom cache database key
	 *
	 * 用於區分不同用途的快取資料。
	 * Used to distinguish cache data for different purposes.
	 */
	USER_DB_KEY?: string,

	/**
	 * 自訂快取資訊鍵名
	 * Custom cache info key
	 */
	USER_DB_KEY_INFO?: string,
}

/**
 * 核心文字分詞函數
 * Core text segmentation function
 *
 * 執行實際的分詞處理，將文字分割為詞語陣列。
 * Performs actual segmentation processing, splitting text into word arrays.
 *
 * @param segment - 分詞器實例 / Segmenter instance
 * @param text - 待分詞的文字 / Text to segment
 * @param options - 選項物件 / Options object
 * @returns 分詞結果 / Segmentation result
 */
export function textSegmentCore(segment: ITSResolvable<Segment2>, text: string, options?: ISegmentCLIOptions)
{
	return Bluebird.resolve(segment)
		.then(function (segment)
		{
			return segment.doSegment(text);
		})
		.tap(function (data)
		{
			return debug_token(data)
		})
		;
}

/**
 * 文字分詞函數
 * Text segmentation function
 *
 * 取得分詞器並對文字進行分詞處理的便捷函數。
 * Convenience function to get segmenter and perform text segmentation.
 *
 * @param text - 待分詞的文字 / Text to segment
 * @param options - 選項物件 / Options object
 * @returns 分詞結果 / Segmentation result
 */
export function textSegment(text: string, options?: ISegmentCLIOptions)
{
	return textSegmentCore(getSegment(options), text, options)
}

/**
 * 核心檔案分詞函數
 * Core file segmentation function
 *
 * 讀取檔案並對其內容進行分詞處理。
 * Reads a file and performs segmentation on its content.
 *
 * @param segment - 分詞器實例 / Segmenter instance
 * @param file - 檔案路徑 / File path
 * @param options - 選項物件 / Options object
 * @returns 分詞結果 / Segmentation result
 */
export function fileSegmentCore(segment: ITSResolvable<Segment2>, file: string, options?: ISegmentCLIOptions)
{
	return Bluebird.resolve(readFile(file))
		.then(function (buf)
		{
			return textSegmentCore(segment, buf.toString(), options);
		})
		;
}

/**
 * 檔案分詞函數
 * File segmentation function
 *
 * 取得分詞器並對檔案內容進行分詞處理的便捷函數。
 * Convenience function to get segmenter and perform file content segmentation.
 *
 * @param file - 檔案路徑 / File path
 * @param options - 選項物件 / Options object
 * @returns 分詞結果 / Segmentation result
 */
export function fileSegment(file: string, options?: ISegmentCLIOptions)
{
	return getSegment(options)
		.then((segment) =>
		{
			return fileSegmentCore(segment, file, options);
		})
		;
}

/**
 * 處理文字並返回格式化結果
 * Process text and return formatted result
 *
 * 對文字進行分詞、格式化（換行符號、簡繁轉換）並返回最終結果。
 * Performs segmentation, formatting (line breaks, Traditional/Simplified conversion) on text and returns final result.
 *
 * @param text - 待處理的文字 / Text to process
 * @param options - 選項物件 / Options object
 * @returns 處理後的文字 / Processed text
 */
export function processText(text: string, options?: ISegmentCLIOptions)
{
	return processTextCore(getSegment(options), text, options)
}

/**
 * 核心處理文字函數
 * Core process text function
 *
 * 執行文字處理的核心邏輯，包括分詞、換行符號處理、簡繁轉換。
 * Executes core text processing logic including segmentation, line break handling, Traditional/Simplified conversion.
 *
 * @param segment - 分詞器實例 / Segmenter instance
 * @param text - 待處理的文字 / Text to process
 * @param options - 選項物件 / Options object
 * @returns 處理後的文字 / Processed text
 */
export function processTextCore(segment: ITSResolvable<Segment2>, text: string, options?: ISegmentCLIOptions)
{
	// 檢查文字是否為空或只包含空白字元 / Check if text is empty or contains only whitespace
	if (!text.length || !text.replace(/\s+/g, '').length)
	{
		return Bluebird.resolve('');
	}

	return textSegmentCore(segment, text, options)
		.then(function (data)
		{
			let text = stringify(data);
			if (options)
			{
				// 處理換行符號格式 / Handle line break character formatting
				if (options.crlf)
				{
					if (typeof options.crlf === 'string')
					{
						text = crlf(text, options.crlf);
					}
					else
					{
						text = crlf(text);
					}
				}

				// 轉換為繁體中文 / Convert to Traditional Chinese
				if (options.convertToZhTw)
				{
					text = cn2tw_min(text);
				}
			}

			// 釋放記憶體 / Free memory
			freeGC();

			return text;
		})
		;
}

/**
 * 處理檔案並返回格式化結果
 * Process file and return formatted result
 *
 * 讀取檔案內容，進行分詞處理並返回格式化後的結果。
 * Reads file content, performs segmentation processing and returns formatted result.
 *
 * @param file - 檔案路徑 / File path
 * @param options - 選項物件 / Options object
 * @returns 處理後的文字 / Processed text
 */
export function processFile(file: string, options?: ISegmentCLIOptions)
{
	return Bluebird.resolve(readFile(file, options))
		.then(function (buf)
		{
			return processText(buf.toString(), options);
		})
		;
}

/**
 * CLI 分詞錯誤
 * CLI Segmentation Error
 *
 * 用於表示 novel-segment-cli 操作中發生的錯誤。
 * Used to represent errors occurring during novel-segment-cli operations.
 */
export class SegmentCliError extends Error
{

}

/**
 * 讀取檔案
 * Read file
 *
 * 讀取指定檔案並自動偵測編碼，回傳 Buffer 物件。
 * Reads specified file and auto-detects encoding, returns Buffer object.
 *
 * @param file - 檔案路徑 / File path
 * @param options - 選項物件 / Options object
 * @returns 檔案內容的 Buffer / Buffer of file content
 */
export function readFile(file: string, options?: ISegmentCLIOptions): Bluebird<Buffer>
{
	return Bluebird.resolve().then(() =>
		{
			// 檢查檔案是否存在 / Check if file exists
			if (!existsSync(file))
			{
				let e = new SegmentCliError(`ENOENT: no such file or directory, open '${file}'`);
				return Bluebird.reject(e)
			}

			// 載入檔案並自動解碼 / Load file and auto-decode
			return loadFile(file, {
				autoDecode: true,
			})
				.then(v => Buffer.from(v))
				;
		})
		.tap(function (buf)
		{
			// 若已停用警告則跳過 / Skip if warnings are disabled
			if (options && options.disableWarn)
			{
				return;
			}

			// 檢查檔案是否為空 / Check if file is empty
			if (!buf.length)
			{
				console.warn(`此檔案無內容`, file);
			}
			else
			{
				// 偵測檔案編碼 / Detect file encoding
				let chk = iconv.detect(buf);

				// 警告非 UTF-8 編碼的檔案 / Warn about non-UTF-8 encoded files
				if (chk.encoding != 'UTF-8' && chk.encoding != 'ascii')
				{
					console.warn('此檔案可能不是 UTF8 請檢查編碼或利用 MadEdit 等工具轉換', chk, file);
				}
			}
		})
		;
}

/**
 * 修正與補全選項
 * Fix and complete options
 *
 * 處理選項物件，設定預設值並根據 mode 選擇正確的快取鍵名。
 * Processes options object, sets default values and selects correct cache key based on mode.
 *
 * @param options - 原始選項物件 / Original options object
 * @returns 修正後的選項物件 / Fixed options object
 */
export function fixOptions<T extends ISegmentCLIOptions>(options?: T): T & ISegmentCLIOptions
{
	options = options || {} as T;

	// 驗證並修正 TTL 值 / Validate and fix TTL value
	if (typeof options.ttl !== 'number' || options.ttl < 1)
	{
		delete options.ttl;
	}

	// 確保分詞選項物件存在 / Ensure segment options object exists
	options.optionsSegment = options.optionsSegment || {};

	// 根據 mode 選擇對應的快取鍵名 / Select corresponding cache key based on mode
	if (options.optionsSegment.nodeNovelMode)
	{
		options.USER_DB_KEY = options.USER_DB_KEY || DB_KEY2;
		options.USER_DB_KEY_INFO = options.USER_DB_KEY_INFO || DB_KEY2_INFO;
	}
	else
	{
		options.USER_DB_KEY = options.USER_DB_KEY || DB_KEY;
		options.USER_DB_KEY_INFO = options.USER_DB_KEY_INFO || DB_KEY_INFO;
	}

	return options;
}

/**
 * 取得 Cacache 實例
 * Get Cacache instance
 *
 * 回傳快取管理實例，若不存在則建立新的單例。
 * Returns cache management instance, creates new singleton if not exists.
 *
 * @param options - 選項物件 / Options object
 * @returns Cacache 實例 / Cacache instance
 */
export function getCacache(options?: ISegmentCLIOptions)
{
	return new Bluebird<Cacache>(function (resolve, reject)
	{
		if (!CACHED_CACACHE)
		{
			// 使用全域快取或本地位址快取 / Use global cache or local temp cache
			if (options && options.useGlobalCache)
			{
				CACHED_CACACHE = new Cacache({
					name: PACKAGE_JSON.name,
					useGlobalCache: options.useGlobalCache,
					autoCreateDir: true,
				});
			}
			else
			{
				CACHED_CACACHE = new Cacache({
					name: PACKAGE_JSON.name,
					autoCreateDir: true,
				});
			}
		}

		resolve(CACHED_CACACHE)
	});
}

/**
 * 重置分詞器
 * Reset segmenter
 *
 * 清除快取的分詞器實例，強制下次重新初始化。
 * Clears cached segmenter instance, forces re-initialization on next use.
 */
export function resetSegment()
{
	CACHED_SEGMENT = void 0;
}

/**
 * 取得分詞器實例
 * Get segmenter instance
 *
 * 回傳已初始化並快取的分詞器實例。包含完整的字典載入與快取邏輯。
 * Returns initialized and cached segmenter instance. Includes complete dictionary loading and caching logic.
 *
 * 處理流程：
 * 1. 載入或建立 Cacache 實例
 * 2. 檢查是否有可用的快取字典
 * 3. 比對版本號，若版本不同則重新初始化
 * 4. 載入黑名單與同義詞字典
 * 5. 建立最終的字典資料表
 * 6. 儲存更新後的快取（若需要）
 *
 * Processing flow:
 * 1. Load or create Cacache instance
 * 2. Check if cached dictionary is available
 * 3. Compare version numbers, re-initialize if version differs
 * 4. Load blacklist and synonym dictionaries
 * 5. Build final dictionary table
 * 6. Save updated cache (if needed)
 *
 * @param options - 選項物件 / Options object
 * @returns 分詞器實例 / Segmenter instance
 */
export function getSegment(options?: ISegmentCLIOptions)
{
	options = fixOptions(options);
	let { disableCache } = options;

	return Bluebird
		.resolve()
		.then(async function ()
		{
			await getCacache(options);

			const optionsSegment: IOptionsSegment = {
				autoCjk: true,

				optionsDoSegment: {

					convertSynonym: true,

				},

				all_mod: true,

				...options.optionsSegment,
			};

			if (!CACHED_SEGMENT)
			{
				// 建立新的分詞器實例 / Create new segmenter instance
				CACHED_SEGMENT = new Segment(optionsSegment);

				// 載入快取資訊 / Load cache info
				let _info = await loadCacheInfo(options);

				// 建立版本資訊物件 / Build version info object
				let version = {
					[PACKAGE_JSON.name]: PACKAGE_JSON.version,
					...Segment.versions,
					[PACKAGE_JSON.name]: PACKAGE_JSON.version,
				};

				// 載入快取資料庫 / Load cached database
				let cache_db = await loadCacheDb(options);

				let _do_init: boolean;

				// 若停用快取則直接初始化 / If cache disabled, initialize directly
				if (disableCache)
				{
					_do_init = true;
				}

				// 檢查版本是否變更 / Check if version changed
				if (typeof _do_init == 'undefined'
					&& _info
					&& _info.current
					&& _info.current[PACKAGE_JSON.name]
				)
				{
					Object.keys(version)
						.some(key =>
						{
							let bool = _info[key] != version[key];

							if (bool)
							{
								debugConsole.debug(`本次執行的版本與上次緩存的版本不同`);
								_do_init = true;
							}

							return bool;
						})
					;
				}

				// 若有快取字典則載入 / Load cached dictionary if available
				if (typeof _do_init == 'undefined' && cache_db)
				{
					if (cache_db.DICT)
					{
						debugConsole.debug(`載入緩存字典`);

						useDefault(CACHED_SEGMENT, {
							...optionsSegment,
							nodict: true,
							all_mod: true,
						});

						CACHED_SEGMENT.DICT = cache_db.DICT;

						CACHED_SEGMENT.inited = true;

						_do_init = false;
					}
				}

				// 若無快取或需要初始化，則重新載入字典 / If no cache or needs initialization, reload dictionary
				if (typeof _do_init == 'undefined' || _do_init)
				{
					debugConsole.debug(`重新載入分析字典`);

					CACHED_SEGMENT.autoInit(optionsSegment);

					_do_init = true;
				}
				else
				{
					// 載入黑名單與同義詞 / Load blacklist and synonym
					useDefaultBlacklistDict(CACHED_SEGMENT, optionsSegment);

					useDefaultSynonymDict(CACHED_SEGMENT, optionsSegment);

					CACHED_SEGMENT.doBlacklist();
				}

				// 建立字典資料表 / Build dictionary table
				let db_dict = CACHED_SEGMENT.getDictDatabase('TABLE', true);
				db_dict.TABLE = CACHED_SEGMENT.DICT['TABLE'];
				db_dict.TABLE2 = CACHED_SEGMENT.DICT['TABLE2'];

				db_dict.options.autoCjk = true;

				let size_db_dict = db_dict.size();

				// 載入同義詞字典 / Load synonym dictionary
				CACHED_SEGMENT.loadSynonymDict('synonym', true);

				let size_segment = Object.keys(CACHED_SEGMENT.getDict('SYNONYM')).length;

				debugConsole.debug('主字典總數', size_db_dict);
				debugConsole.debug('Synonym', size_segment);

				// 更新快取資訊 / Update cache info
				_info.last = Object.assign({}, _info.current);

				_info.current = {
					size_db_dict,
					size_segment,
					size_db_dict_diff: size_db_dict - (_info.last.size_db_dict || 0),
					size_segment_diff: size_segment - (_info.last.size_segment || 0),

					version,
				};

				debugConsole.debug(_info);

				// 儲存字典快取 / Save dictionary cache
				if (!disableCache
					&& (_do_init || !cache_db || !cache_db.DICT)
				)
				{
					await CACHED_CACACHE.writeJSON(options.USER_DB_KEY, {

						..._info,

						DICT: CACHED_SEGMENT.DICT,
					} as IDataCache);

					debugConsole.debug(`緩存字典於 ${options.USER_DB_KEY}`, CACHED_CACACHE.cachePath);
				}

				// 釋放記憶體 / Free memory
				freeGC();
			}

			return CACHED_SEGMENT;
		})
		;
}

/**
 * 快取資訊資料結構
 * Cache info data structure
 *
 * 儲存字典大小與版本資訊，用於判斷是否需要重新載入。
 * Stores dictionary size and version info, used to determine if reload is needed.
 */
export interface IDataCacheInfo
{
	/** 主字典總數 / Main dictionary total count */
	size_db_dict?: number,
	/** 同義詞總數 / Synonym total count */
	size_segment?: number,
	/** 主字典數量差異 / Main dictionary count difference */
	size_db_dict_diff?: number,
	/** 同義詞數量差異 / Synonym count difference */
	size_segment_diff?: number,

	/** 各套件版本資訊 / Package version info */
	version?: {
		'novel-segment-cli'?: string,
		'novel-segment'?: string,
		'segment-dict'?: string,
	},
}

/**
 * 快取資料結構
 * Cache data structure
 *
 * 包含快取資訊與完整的字典資料。
 * Contains cache info and complete dictionary data.
 */
export interface IDataCache
{
	/** 上次的快取資訊 / Previous cache info */
	last?: IDataCacheInfo,
	/** 目前的快取資訊 / Current cache info */
	current?: IDataCacheInfo,
	/** 字典資料 / Dictionary data */
	DICT?: any,
}

/**
 * 載入快取資訊
 * Load cache info
 *
 * 讀取快取的中繼資訊（版本、大小等），用於判斷快取有效性。
 * Reads cached metadata (version, size, etc.), used to determine cache validity.
 *
 * @param options - 選項物件 / Options object
 * @returns 快取資訊物件 / Cache info object
 */
export function loadCacheInfo(options?: ISegmentCLIOptions)
{
	return Bluebird
		.resolve()
		.then(async function ()
		{
			await getCacache(options);

			// 檢查快取資訊是否存在 / Check if cache info exists
			let has_cache_db = await CACHED_CACACHE.hasData(options.USER_DB_KEY_INFO);

			let data: IDataCache;

			if (has_cache_db)
			{
				// 讀取快取資訊 / Read cache info
				data = await CACHED_CACACHE
					.readJSON<IDataCache>(options.USER_DB_KEY_INFO)
					.then(function (ret)
					{
						return ret.json;
					})
				;
			}

			// 初始化預設值 / Initialize default values
			data = data || {};

			data.last = data.last || {};
			data.current = data.current || {};
			data.last.version = data.last.version || {};
			data.current.version = data.current.version || {};

			// 清除原型鏈以避免效能問題 / Clear prototype chain to avoid performance issues
			if (data.DICT)
			{
				Object.setPrototypeOf(data.DICT, null);
			}

			return data;
		})
		;
}

/**
 * 載入快取資料庫
 * Load cache database
 *
 * 讀取儲存的字典資料庫，包含完整的字典內容。
 * Reads stored dictionary database, containing complete dictionary content.
 *
 * @param options - 選項物件 / Options object
 * @returns 快取資料庫或 null / Cache database or null
 */
export function loadCacheDb(options?: ISegmentCLIOptions): Bluebird<IDataCache>
{
	options = fixOptions(options);
	let { disableCache } = options;

	// 若停用快取則回傳 null / Return null if cache is disabled
	if (disableCache)
	{
		return Bluebird
			.resolve(null)
			;
	}

	return Bluebird
		.resolve()
		.then(async function ()
		{
			await getCacache(options);

			// 檢查快取是否存在且尚未過期 / Check if cache exists and not expired
			let has_cache_db = await CACHED_CACACHE.hasData(options.USER_DB_KEY, {
				ttl: options.ttl > 0 ? options.ttl : DB_TTL,
			});

			if (has_cache_db)
			{
				debugConsole.debug(`發現緩存 ${options.USER_DB_KEY}`, has_cache_db.path);

				return CACHED_CACACHE
					.readJSON<IDataCache>(options.USER_DB_KEY)
					.then(function (ret)
					{
						// 清除原型鏈 / Clear prototype chain
						if (ret.json?.DICT)
						{
							Object.setPrototypeOf(ret.json.DICT, null);
						}

						return ret.json;
					})
					;
			}

			return null;
		})
		;
}

/**
 * 移除快取
 * Remove cache
 *
 * 清除所有相關的快取資料，包括不同模式（一般/小說）的快取。
 * Clears all related cache data, including different modes (normal/novel) caches.
 *
 * @param options - 選項物件 / Options object
 */
export function removeCache(options?: ISegmentCLIOptions)
{
	let opts = fixOptions(options);

	return Bluebird.all(array_unique([
			opts,
			merge({}, opts, <ISegmentCLIOptions>{
				optionsSegment: {
					nodeNovelMode: true,
				},
			}),
			merge({}, opts, <ISegmentCLIOptions>{
				optionsSegment: {
					nodeNovelMode: false,
				},
			}),
		]))
		.map(async (o) =>
		{
			const cache = await getCacache(o);

			await cache.clearMemoized();
			await cache.removeAll();
		})
		;
}

/**
 * 重置快取
 * Reset cache
 *
 * 清除快取的 Cacache 實例，強制下次重新建立。
 * Clears cached Cacache instance, forces re-creation on next use.
 */
export function resetCache()
{
	CACHED_CACACHE = void 0
}
