import { IWord } from '@novel-segment/types';
import { ITSArrayListMaybeReadonly } from 'ts-type/lib/type/base';
export declare type IStringifyWordInput = ITSArrayListMaybeReadonly<IWord | string>;
/**
 * 将单词数组连接成字符串
 *
 * @param {Array} words 单词数组
 * @return {String}
 */
export declare function stringify(words: IStringifyWordInput, ...argv: any[]): string;
export default stringify;
