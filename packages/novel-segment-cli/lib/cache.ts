
/**
 * 快取管理模組
 * Cache Management Module
 *
 * 此模組重新匯出 lazy-cacache 套件的功能，用於管理磁碟快取。
 * This module re-exports lazy-cacache package functionality for disk cache management.
 *
 * @see https://www.npmjs.com/package/lazy-cacache
 */
import _ from 'lazy-cacache';
// @ts-ignore
export * from 'lazy-cacache';

/**
 * 預設匯出 lazy-cacache 實例
 * Default export lazy-cacache instance
 */
export default _;
