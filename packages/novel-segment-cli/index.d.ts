import type Segment2 from 'novel-segment/lib';
import Bluebird from 'bluebird';
import Cacache from './lib/cache';
import { enableDebug } from './lib/util';
import { IOptionsSegment } from 'novel-segment/lib/segment/types';
import { ITSResolvable } from 'ts-type';
/**
 * 分詞結果序列化函數
 * Segmentation result serialization function
 *
 * 將分詞後的資料結構轉換為文字。
 * Converts segmented data structure to text.
 *
 * @constant
 */
declare const stringify: typeof import("novel-segment/lib/segment/core").SegmentCore.stringify;
/**
 * 啟用除錯模式
 * Enable debug mode
 *
 * @see {@link enableDebug}
 */
export { enableDebug, stringify };
/**
 * CLI 分詞選項介面
 * CLI Segmentation Options Interface
 *
 * 定義命令列工具的所有可用選項。
 * Defines all available options for the command-line tool.
 */
export interface ISegmentCLIOptions {
    /**
     * 格式化分行符號
     * Format line break characters
     *
     * 可設定為特定換行符號（如 '\n'、'\r\n'）或啟用自動偵測。
     * Can be set to specific line break characters (like '\n', '\r\n') or enable auto-detection.
     */
    crlf?: string | boolean;
    /**
     * 是否使用全域快取
     * Whether to use global cache
     *
     * 全域快取會使用 NPM 快取目錄，跨專案共享。
     * Global cache uses NPM cache directory, shared across projects.
     */
    useGlobalCache?: boolean;
    /**
     * 是否停用快取
     * Whether to disable cache
     *
     * 停用快取會強制每次都重新載入字典，適合開發調試。
     * Disabling cache forces dictionary reload every time, suitable for development debugging.
     */
    disableCache?: boolean;
    /**
     * 是否停用警告訊息
     * Whether to disable warning messages
     *
     * 啟用後不會顯示檔案編碼等警告資訊。
     * When enabled, warning information like file encoding will not be displayed.
     */
    disableWarn?: boolean;
    /**
     * 快取有效時間（毫秒）
     * Cache TTL (milliseconds)
     *
     * 設定快取資料的有效期，預設為 1 小時。
     * Sets the validity period for cached data, default is 1 hour.
     */
    ttl?: number;
    /**
     * 是否轉換為繁體中文
     * Whether to convert to Traditional Chinese
     *
     * 將分詞結果從簡體中文轉換為繁體中文。
     * Converts segmentation result from Simplified Chinese to Traditional Chinese.
     */
    convertToZhTw?: boolean;
    /**
     * 分詞器選項
     * Segmenter options
     *
     * 傳遞給 novel-segment 的選項物件。
     * Options object passed to novel-segment.
     */
    optionsSegment?: IOptionsSegment;
    /**
     * 自訂快取資料庫鍵名
     * Custom cache database key
     *
     * 用於區分不同用途的快取資料。
     * Used to distinguish cache data for different purposes.
     */
    USER_DB_KEY?: string;
    /**
     * 自訂快取資訊鍵名
     * Custom cache info key
     */
    USER_DB_KEY_INFO?: string;
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
export declare function textSegmentCore(segment: ITSResolvable<Segment2>, text: string, options?: ISegmentCLIOptions): Bluebird<Segment2.IWord[]>;
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
export declare function textSegment(text: string, options?: ISegmentCLIOptions): Bluebird<Segment2.IWord[]>;
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
export declare function fileSegmentCore(segment: ITSResolvable<Segment2>, file: string, options?: ISegmentCLIOptions): Bluebird<Segment2.IWord[]>;
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
export declare function fileSegment(file: string, options?: ISegmentCLIOptions): Bluebird<Segment2.IWord[]>;
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
export declare function processText(text: string, options?: ISegmentCLIOptions): Bluebird<string>;
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
export declare function processTextCore(segment: ITSResolvable<Segment2>, text: string, options?: ISegmentCLIOptions): Bluebird<string>;
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
export declare function processFile(file: string, options?: ISegmentCLIOptions): Bluebird<string>;
/**
 * CLI 分詞錯誤
 * CLI Segmentation Error
 *
 * 用於表示 novel-segment-cli 操作中發生的錯誤。
 * Used to represent errors occurring during novel-segment-cli operations.
 */
export declare class SegmentCliError extends Error {
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
export declare function readFile(file: string, options?: ISegmentCLIOptions): Bluebird<Buffer>;
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
export declare function fixOptions<T extends ISegmentCLIOptions>(options?: T): T & ISegmentCLIOptions;
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
export declare function getCacache(options?: ISegmentCLIOptions): Bluebird<Cacache>;
/**
 * 重置分詞器
 * Reset segmenter
 *
 * 清除快取的分詞器實例，強制下次重新初始化。
 * Clears cached segmenter instance, forces re-initialization on next use.
 */
export declare function resetSegment(): void;
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
export declare function getSegment(options?: ISegmentCLIOptions): Bluebird<Segment2>;
/**
 * 快取資訊資料結構
 * Cache info data structure
 *
 * 儲存字典大小與版本資訊，用於判斷是否需要重新載入。
 * Stores dictionary size and version info, used to determine if reload is needed.
 */
export interface IDataCacheInfo {
    /** 主字典總數 / Main dictionary total count */
    size_db_dict?: number;
    /** 同義詞總數 / Synonym total count */
    size_segment?: number;
    /** 主字典數量差異 / Main dictionary count difference */
    size_db_dict_diff?: number;
    /** 同義詞數量差異 / Synonym count difference */
    size_segment_diff?: number;
    /** 各套件版本資訊 / Package version info */
    version?: {
        'novel-segment-cli'?: string;
        'novel-segment'?: string;
        'segment-dict'?: string;
    };
}
/**
 * 快取資料結構
 * Cache data structure
 *
 * 包含快取資訊與完整的字典資料。
 * Contains cache info and complete dictionary data.
 */
export interface IDataCache {
    /** 上次的快取資訊 / Previous cache info */
    last?: IDataCacheInfo;
    /** 目前的快取資訊 / Current cache info */
    current?: IDataCacheInfo;
    /** 字典資料 / Dictionary data */
    DICT?: any;
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
export declare function loadCacheInfo(options?: ISegmentCLIOptions): Bluebird<IDataCache>;
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
export declare function loadCacheDb(options?: ISegmentCLIOptions): Bluebird<IDataCache>;
/**
 * 移除快取
 * Remove cache
 *
 * 清除所有相關的快取資料，包括不同模式（一般/小說）的快取。
 * Clears all related cache data, including different modes (normal/novel) caches.
 *
 * @param options - 選項物件 / Options object
 */
export declare function removeCache(options?: ISegmentCLIOptions): Bluebird<void[]>;
/**
 * 重置快取
 * Reset cache
 *
 * 清除快取的 Cacache 實例，強制下次重新建立。
 * Clears cached Cacache instance, forces re-creation on next use.
 */
export declare function resetCache(): void;
