import Segment, { IWord } from '../Segment';
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
export declare function split(words: IWord[]): IWord[];
/**
 * 匹配单词，返回相关信息
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @param {object} preword 上一个单词
 * @return {array}  返回格式   {w: '单词', c: 开始位置}
 */
export declare function matchWord(text: string, cur: number, preword: IWord): Segment.IWord[];
/**
 * 选择最有可能匹配的单词
 *
 * @param {array} words 单词信息数组
 * @param {object} preword 上一个单词
 * @param {string} text 本节要分词的文本
 * @return {array}
 */
export declare function filterWord(words: IWord[], preword: IWord, text: string): Segment.IWord[];
/**
 * 将单词按照位置排列
 *
 * @param {array} words
 * @param {string} text
 * @return {object}
 */
export declare function getPosInfo(words: IWord[], text: string): {
    [index: number]: IWord[];
};
/**
 * 取所有分支
 *
 * @param {object} wordpos
 * @param {int} pos 当前位置
 * @param {string} text 本节要分词的文本
 * @return {array}
 */
export declare function getChunks(wordpos: {
    [index: number]: IWord[];
}, pos: number, text?: string): Segment.IWord[][];
/**
 * 评价排名
 *
 * @param {object} assess
 * @return {object}
 */
export declare function getTops(assess: Array<{
    x: number;
    a: number;
    b: number;
    c: number;
    d: number;
}>): number;
