import Segment, { IWord } from '../Segment';
/**
 * URL识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
/**
 * 模块类型
 * */
export declare const type = "tokenizer";
export declare let segment: Segment;
/**
 * 模块初始化
 *
 * @param {Segment} segment 分词接口
 */
export declare function init(_segment: Segment): void;
/**
 * 对未识别的单词进行分词
 *
 * @param {array} words 单词数组
 * @return {array}
 */
export declare function split(words: IWord[]): IWord[];
/**
 * 匹配包含的网址，返回相关信息
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @return {array}  返回格式   {w: '网址', c: 开始位置}
 */
export declare function matchURL(text: string, cur?: number): any[];
