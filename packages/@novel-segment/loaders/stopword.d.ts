/**
 * 分隔詞字典載入器
 * Stopword (Separator) Dictionary Loader
 *
 * 此模組重新匯出 @novel-segment/loader-stopword 的所有功能，
 * 提供分隔詞字典的載入能力，用於切割字串、進行簡易斷詞。
 * This module re-exports all functionality from @novel-segment/loader-stopword,
 * providing stopword (separator) dictionary loading capabilities for string splitting and simple word segmentation.
 *
 * @module @novel-segment/loaders/stopword
 */
export * from '@novel-segment/loader-stopword';
import load from '@novel-segment/loader-stopword';
export default load;
