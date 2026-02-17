/**
 * 載入器模組工廠
 * Loader Module Factory
 *
 * 提供動態載入各種字典載入器的工廠函式。
 * 支援的載入器類型：line、stopword、jieba、opencc、segment。
 *
 * Provides factory functions for dynamically loading various dictionary loaders.
 * Supported loader types: line, stopword, jieba, opencc, segment.
 *
 * @module @novel-segment/loaders/lib
 */
import { IRequireModule } from './types';
/**
 * 取得載入器的預設匯出
 * Get default export of a loader
 *
 * 根據 ID 取得對應載入器的預設匯出函式。
 * Returns the default export function of the corresponding loader based on ID.
 *
 * @param {'line'} id - 行式載入器 ID / Line loader ID
 * @returns {typeof import('../line').default} 行式載入器 / Line loader
 *
 * @param {'stopword'} id - 分隔詞載入器 ID / Stopword loader ID
 * @returns {typeof import('../stopword').default} 分隔詞載入器 / Stopword loader
 *
 * @param {'jieba'} id - 結巴載入器 ID / Jieba loader ID
 * @returns {typeof import('../jieba').default} 結巴載入器 / Jieba loader
 *
 * @param {'opencc'} id - OpenCC 載入器 ID / OpenCC loader ID
 * @returns {typeof import('../opencc').default} OpenCC 載入器 / OpenCC loader
 *
 * @param {'opencc'} id - OpenCC 載入器 ID / OpenCC loader ID
 * @param {'scheme'} subtype - 方案子類型 / Scheme subtype
 * @returns {typeof import('../opencc/scheme').default} OpenCC 方案載入器 / OpenCC scheme loader
 *
 * @param {'segment'} id - 斷詞載入器 ID / Segment loader ID
 * @returns {typeof import('../segment').default} 斷詞載入器 / Segment loader
 *
 * @param {'segment'} id - 斷詞載入器 ID / Segment loader ID
 * @param {'synonym'} subtype - 同義詞子類型 / Synonym subtype
 * @returns {typeof import('../segment/synonym').default} 同義詞載入器 / Synonym loader
 */
export declare function requireDefault(id: 'line'): typeof import('../line').default;
export declare function requireDefault(id: 'stopword'): typeof import('../stopword').default;
export declare function requireDefault(id: 'jieba'): typeof import('../jieba').default;
export declare function requireDefault(id: 'opencc'): typeof import('../opencc').default;
export declare function requireDefault(id: 'opencc', subtype: 'scheme'): typeof import('../opencc/scheme').default;
export declare function requireDefault(id: 'segment'): typeof import('../segment').default;
export declare function requireDefault(id: 'segment', subtype: 'synonym'): typeof import('../segment/synonym').default;
export declare function requireDefault<T = any>(id: any, subtype?: string): (file: string) => Promise<T>;
/**
 * 取得載入器模組
 * Get loader module
 *
 * 根據 ID 取得對應的載入器模組（包含所有匯出）。
 * Returns the corresponding loader module (including all exports) based on ID.
 *
 * @param {string} id - 載入器 ID / Loader ID
 * @param {string} [subtype] - 子類型 / Subtype
 * @returns {IRequireModule<T>} 載入器模組 / Loader module
 * @throws {Error} 當 ID 或子類型不存在時 / When ID or subtype doesn't exist
 */
export declare function requireModule(id: 'line'): typeof import('../line');
export declare function requireModule(id: 'stopword'): typeof import('../stopword');
export declare function requireModule(id: 'jieba'): typeof import('../jieba');
export declare function requireModule(id: 'opencc'): typeof import('../opencc');
export declare function requireModule(id: 'opencc', subtype: 'scheme'): typeof import('../opencc/scheme');
export declare function requireModule(id: 'segment'): typeof import('../segment');
export declare function requireModule(id: 'segment', subtype: 'synonym'): typeof import('../segment/synonym');
export declare function requireModule<T = any>(id: string, subtype?: string): IRequireModule<T>;
