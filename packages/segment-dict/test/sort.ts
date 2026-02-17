/**
 * Created by user on 2018/4/14/014.
 *
 * 斷詞字典排序腳本
 * Segment Dictionary Sorting Script
 *
 * 用於處理、過濾和排序斷詞字典檔案。
 * 支援 CJK 字元處理與重複詞條偵測。
 *
 * Used for processing, filtering, and sorting segment dictionary files.
 * Supports CJK character processing and duplicate detection.
 */

import Promise = require('bluebird');
import { outputFile, appendFile, writeFile } from "fs-extra";
import { POSTAG } from '@novel-segment/postag/lib/postag/ids';
import { zhRegExp } from 'regexp-cjk';
import { load, parseLine, stringifyLine, serialize } from '@novel-segment/loader-line';
import { IDictRow, parseLine as parseLineSegment, serialize as serializeSegment } from '@novel-segment/loaders/segment';
import { textList } from '@lazy-cjk/zh-table-list/list';
import { auto } from '@lazy-cjk/zh-table-list';
import { caseInsensitive } from '@bluelovers/string-natural-compare';

import { UString } from "uni-string";
import FastGlob from "@bluelovers/fast-glob";
import { join, relative } from "path";
import { console } from "debug-color2";

import ProjectConfig from "../project.config";

// 已過濾項目陣列 - 儲存需要移除的詞條
// Filtered items array - stores words that need to be removed
let fa = [];

// 次要過濾項目陣列 - 儲存單字詞或註解開頭的行
// Secondary filtered items array - stores single character words or comment-prefixed lines
let fa2 = [];

// 當前工作目錄 - 指向斷詞字典根目錄
// Current working directory - points to the segment dictionary root
let cwd = join(ProjectConfig.dict_root, 'segment');

/**
 * 當前詞條資料類型
 * Current word data type
 *
 * 元組格式：[詞條, 詞性標籤, 詞頻]
 * Tuple format: [word, part-of-speech tag, frequency]
 */
export type ICUR_WORD_DATA = [string, number, number];

/**
 * 當前詞條介面
 * Current word interface
 *
 * 代表單一字典條目及其元資料。
 * Represents a single dictionary entry with metadata.
 *
 * @property {ICUR_WORD_DATA} data - 解析後的詞條資料元組 [詞條, 詞性, 詞頻]
 * @property {number} index - 在原始檔案中的行索引
 * @property {string} line - 原始行內容
 * @property {string} file - 來源檔案路徑
 * @property {string} cjk_id - 用於排序的 CJK 字元識別碼
 */
export interface ICUR_WORD
{
	data: [string, number, number],
	index: number,
	line: string,
	file: string,
	cjk_id: string,
}

// 詞條查詢快取表 - 將詞條對應至其所有出現位置
// Word lookup cache table - maps word to all its occurrences
let CACHE_TABLE = {} as {
	[k: string]: ICUR_WORD[];
};

// 檔案快取表 - 將檔案路徑對應至該檔案中的所有詞條
// File-based cache table - maps file path to all words in that file
let CACHE_FILE_TABLE = {} as {
	[k: string]: ICUR_WORD[];
};

// CJK 字元快取表 - 將 CJK 識別碼對應至相關詞條
// CJK character cache table - maps CJK identifier to words
let CACHE_TABLE_CJK = {} as {
	[k: string]: ICUR_WORD[];
};

// 是否啟用 CJK 字元處理模式的旗標
// Flag to enable CJK character processing mode
const USE_CJK = false;

// 主要處理管線
// Main processing pipeline
Promise
	.resolve(FastGlob([

		// 目錄中的所有文字檔案
		// All text files in the directory
		'*.txt',
		'**/*.txt',

		// 特定字典檔案
		// Specific dictionary files
		'dict*.txt',
		'names.txt',
		'area/pangu.txt',

		// Pangu 目錄檔案
		// Pangu directory files
		'pangu/*.txt',

		// Lazy 目錄檔案
		// Lazy directory files
		'lazy/*.txt',



	], {
		cwd: cwd,
		absolute: true,

		// 搜尋時要忽略的模式
		// Patterns to ignore during search
		ignore: [
			'char*',
			'**/skip',
			'**/jieba',
			//'**/lazy',
			'**/dict_synonym',
			'**/synonym',
			'**/names',
			'**/infrequent',
		],

		markDirectories: true,

	}))
	.tap(function (ls: string[])
	{
		// 記錄所有匹配的檔案供除錯使用
		// Log all matched files for debugging
		let a = ls.reduce(function (a, v)
		{
			let p = relative(cwd, v);

			a.push(p);

			return a;
		}, []);

		console.log(a);

		//process.exit();
	})
	.mapSeries(async function (file: string)
	{
		// 計算相對路徑供顯示使用
		// Calculate relative path for display
		let _basepath = relative(cwd, file);

		// 載入字典檔案內容
		// Load dictionary file content
		let b = await load(file);

		b = b || [];

		// 初始化檔案快取項目
		// Initialize file cache entry
		CACHE_FILE_TABLE[file] = [];

		// 處理每一行並建立快取表
		// Process each line and build cache tables
		b = b.filter(function (line, index)
		{
			// 將行解析為詞條資料元組
			// Parse line into word data tuple
			let data = parseLineSegment(line) as ICUR_WORD_DATA;

			let bool: boolean;

			let [w, p, f] = data;

			let cjk_id = w;

			// 根據處理模式決定 CJK 識別碼
			// Determine CJK identifier based on processing mode
			if (USE_CJK)
			{
				// 使用完整 CJK 字元列表
				// Use full CJK character list
				let cjk_list = textList(w);
				cjk_id = cjk_list[0];
			}
			else
			{
				// 使用自動偵測的 CJK 變體
				// Use auto-detected CJK variant
				let cjk_list = auto(w);
				cjk_id = cjk_list[0];
			}

			// 建立詞條物件
			// Create word entry object
			let CUR_WORD = {
				data,
				index,
				line,
				file,
				cjk_id,
			};

			// 加入檔案快取
			// Add to file cache
			CACHE_FILE_TABLE[file].push(CUR_WORD);

			// 加入詞條查詢快取
			// Add to word lookup cache
			CACHE_TABLE[w] = CACHE_TABLE[w] || [];

			CACHE_TABLE[w].push(CUR_WORD);

			// 若啟用則加入 CJK 快取
			// Add to CJK cache if enabled
			if (USE_CJK)
			{
				CACHE_TABLE_CJK[cjk_id] = CACHE_TABLE_CJK[cjk_id] || [];

				CACHE_TABLE_CJK[cjk_id].push(CUR_WORD);
			}

			return true;
		});

		return file;
	})
	.map(async function (file: string, ls_index, ls_len)
	{
		// 計算相對路徑供顯示使用
		// Calculate relative path for display
		let _basepath = relative(cwd, file);

		// 使用快取資料而非重新載入檔案
		// Use cached data instead of reloading file
		//let b = await load(file);
		let b = CACHE_FILE_TABLE[file];

		let b_len = b.length;

		// 過濾並處理詞條
		// Filter and process words
		b = b.filter(function (current_data)
		{
			let { data, line, index, cjk_id } = current_data;

			//let data = parseLineSegment(line);

			let bool: boolean;

			let [w, p, f] = data;

			// 過濾單字詞（已停用）
			// Filter out single character words (disabled)
			if (0 && UString.size(data[0]) == 1)
			{
				fa2.push(current_data);

				return false;
			}

			if (!bool)
			{
				let s: string;

				s = '//';

				// 過濾包含標記字串的詞條（已停用）
				// Filter words containing the marker string (disabled)
				if (0 && s && w != s && w.indexOf(s) != -1)
				{
					bool = true;
				}

				// 過濾以標記字串結尾的詞條（已停用）
				// Filter words ending with the marker string (disabled)
				if (0 && s && w != s && w.match(new RegExp(`${s}$`)))
				{
					bool = true;
				}

				// 過濾以註解標記開頭的詞條
				// Filter words starting with comment marker
				if (1 && s && w != s && w.indexOf(s) == 0)
				{
					bool = true;

					fa2.push(current_data);

					return false;
				}
			}

			// 清理以逗號分隔的多片語條目（已停用）
			// Clean up multi-phrase entries separated by commas (disabled)
			if (0 && !bool && w.indexOf('，'))
			{
				// 清理多餘片語
				// Clean up redundant phrases

				let aa = w.split('，');

				if (aa.length > 1)
				{
					let bb: boolean;

					// 檢查所有部分是否都存在於快取中
					// Check if all parts exist in cache
					for (let k of aa)
					{
						if (k in CACHE_TABLE)
						{
							bb = true;
						}
						else
						{
							bb = false;
							break;
						}
					}

					if (bb)
					{
						bool = true;
					}
					else
					{
						console.red(line);
					}
				}
			}

			// 偵測跨檔案的重複詞條（已停用）
			// Detect duplicate words across files (disabled)
			if (0 && !bool && w in CACHE_TABLE)
			{
				let ta = CACHE_TABLE[w];

				if (ta.length > 1)
				{
					let ta0 = ta[0];

					// 不同檔案中的重複項
					// Duplicate in different file
					if (ta0.file != file)
					{
						//console.red(w, index, line, _basepath);
						bool = true;
					}
					// 相同檔案中的重複項
					// Duplicate in same file
					else if (ta0.index != index)
					{
						//console.red(w, index, line, _basepath);
						bool = true;
					}
				}
			}

			// 處理 CJK 重複項並填補缺少的詞性標籤（已停用）
			// Handle CJK duplicates and fill missing POS tags (disabled)
			if (0 && !bool && USE_CJK)
			{
				let ta = CACHE_TABLE_CJK[cjk_id];

				if (ta && ta.length > 1)
				{
					// 從第一個匹配項填補缺少的詞性標籤
					// Fill missing POS tag from first matching entry
					if (!p)
					{
						ta.some(function (a)
						{
							if (a.data[1])
							{
								// 將詞性標籤格式化為十六進位字串
								// Format POS tag as hex string
								let ps = '0x' + a.data[1]
									.toString(16)
									.padStart(4, '0')
									.toUpperCase()
								;

								f = a.data[2];

								// 以填補的詞性重建行
								// Reconstruct line with filled POS
								current_data.line = [
									w,
									ps,
									f,
									...data.slice(3)
								].join('|');

								return true;
							}
						})
					}

					console.red(w);
					bool = true;
				}
			}

			// 過濾單字詞（已停用）
			// Filter single character words (disabled)
			if (0 && !bool && UString.size(w) === 1)
			{
				bool = true;
			}

			// 過濾特定詞性標籤（已停用）
			// Filter specific POS tags (disabled)
			if (0 && !bool && p & POSTAG.D_O)
			{
				bool = true;
			}

			// 過濾包含特定字元的詞條（如「致」與「緻」）
			// Filter words containing specific characters (like 致 and 緻)
			if (1 && !bool
				&& zhRegExp.create(/比|批/u).test(w)
			)
			{
				bool = true;
			}

			// 過濾博物館相關詞條（已停用）
			// Filter museum-related words (disabled)
			if (0 && !bool && w != '博物馆' && w.match(/博物馆/))
			{
				bool = true;
			}

			// 過濾人名標籤（已停用）
			// Filter person name tags (disabled)
			if (0 && !bool && p == POSTAG.A_NR)
			{
				bool = true;
			}

			// 過濾特定位元旗標（已停用）
			// Filter specific bit flag (disabled)
			if (0 && !bool && data[1] & 0x08)
			{
				bool = true;
			}

			// 若標記為移除則加入過濾陣列
			// Add to filtered array if marked for removal
			if (bool)
			{
				fa.push(current_data);

				return false;
			}

			return true;
		});

		//sortList(b);

		// 從詞條物件提取行內容
		// Extract lines from word objects
		let c = b
			.map(v => v.line)
		;

		//c.sort(naturalCompare.caseInsensitive);

		// 根據是否有過濾發生來決定日誌方法
		// Determine log method based on whether filtering occurred
		let method = 'debug';

		if (b.length != b_len)
		{
			method = 'ok';
		}

		// 序列化並寫入更新後的檔案
		// Serialize and write updated file
		let out = serialize(c) + "\n\n";

		await writeFile(file, out);

		console[method](_basepath, `${ls_index} / ${ls_len}`);

		return b;
	})
	.tap(async function (ls)
	{
		console.log('tap');

		// 排序過濾結果
		// Sort filtered results
		if (0)
		{
			// 先依詞性再依詞條排序
			// Sort by POS then by word
			fa.sort(function (a, b)
			{
				return (a.data[1] - b.data[1]) || (a.data[0] - b.data[0]);
			});
		}
		else
		{
			// 使用自訂排序函式
			// Use custom sort function
			sortList(fa, true);
		}

		// 將詞條物件轉換為行內容
		// Convert word objects to lines
		fa = fa.map(function (d)
		{
			return d.line;
		});

		// 排序並轉換次要過濾項目
		// Sort and convert secondary filtered items
		fa2 = sortList(fa2, true).map(function (d)
		{
			return d.line;
		});

		if (0)
		{
			fa.sort();
		}

		// 將過濾後的詞條寫入輸出檔案
		// Write filtered words to output files
		await outputFile(join(ProjectConfig.temp_root, 'one.txt'), serialize(fa) + "\n\n");

		await appendFile(join(ProjectConfig.temp_root, 'skip.txt'), "\n\n" + serialize(fa2) + "\n\n");
	})
;

/**
 * 依 CJK 識別碼和詞條資料排序詞條列表
 * Sort word list by CJK identifier and word data
 *
 * 使用多層級比較進行排序：
 * 1. CJK 識別碼（升冪）
 * 2. 詞性標籤（降冪）
 * 3. 詞條字串（升冪）
 * 4. 詞頻（升冪）
 *
 * Sorts the word list using a multi-level comparison:
 * 1. CJK identifier (ascending)
 * 2. Part-of-speech tag (descending)
 * 3. Word string (ascending)
 * 4. Frequency (ascending)
 *
 * @param {ICUR_WORD[]} ls - 要排序的詞條物件陣列
 * @param {boolean} [bool] - 選填旗標（目前未使用）
 * @returns {ICUR_WORD[]} 排序後的陣列（與輸入相同參照）
 */
function sortList(ls: ICUR_WORD[], bool?: boolean)
{
	return ls.sort(function (a, b)
	{
		return caseInsensitive(a.cjk_id, b.cjk_id)
			|| caseInsensitive(b.data[1], a.data[1])
			|| caseInsensitive(a.data[0], b.data[0])
			|| caseInsensitive(a.data[2], b.data[2])
		;
	});
}