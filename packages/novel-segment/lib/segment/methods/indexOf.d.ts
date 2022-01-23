import { IWord } from '@novel-segment/types';
/**
 * 在单词数组中查找某一个单词或词性所在的位置
 *
 * @param {Array} words 单词数组
 * @param {Number|String} s 要查找的单词或词性
 * @param {Number} cur 开始位置
 * @return {Number} 找不到，返回-1
 */
export declare function indexOf(words: IWord[], s: string | number, cur?: number, ...argv: any[]): number;
