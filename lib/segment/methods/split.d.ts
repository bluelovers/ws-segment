import { IWord } from '@novel-segment/types';
/**
 * 根据某个单词或词性来分割单词数组
 *
 * @param {Array} words 单词数组
 * @param {Number|String} s 用于分割的单词或词性
 * @return {Array}
 */
export declare function split(words: IWord[], s: string | number, ...argv: any[]): IWord[];
