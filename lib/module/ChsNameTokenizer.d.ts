import Segment from '../Segment';
/** 模块类型 */
export declare const type = "tokenizer";
export declare let segment: Segment;
/**
 * 模块初始化
 *
 * @param {Segment} segment 分词接口
 */
export declare function init(_segment: any): void;
/**
 * 对未识别的单词进行分词
 *
 * @param {array} words 单词数组
 * @return {array}
 */
export declare function split(words: any): any[];
