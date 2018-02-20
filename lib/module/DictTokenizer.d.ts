/**
 * 字典识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
declare var FAMILY_NAME_1: string[];
declare var FAMILY_NAME_2: string[];
declare var SINGLE_NAME: string[];
declare var DOUBLE_NAME_1: string[];
declare var DOUBLE_NAME_2: string[];
declare var debug: (message?: any, ...optionalParams: any[]) => void;
declare var _DATETIME: string[];
declare var DATETIME: {};
/**
 * 匹配单词，返回相关信息
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @param {object} preword 上一个单词
 * @return {array}  返回格式   {w: '单词', c: 开始位置}
 */
declare var matchWord: (text: any, cur: any, preword: any) => any[];
/**
 * 选择最有可能匹配的单词
 *
 * @param {array} words 单词信息数组
 * @param {object} preword 上一个单词
 * @param {string} text 本节要分词的文本
 * @return {array}
 */
declare var filterWord: (words: any, preword: any, text: any) => any[];
/**
 * 将单词按照位置排列
 *
 * @param {array} words
 * @param {string} text
 * @return {object}
 */
declare var getPosInfo: (words: any, text: any) => {};
/**
 * 取所有分支
 *
 * @param {object} wordpos
 * @param {int} pos 当前位置
 * @param {string} text 本节要分词的文本
 * @return {array}
 */
declare var getChunks: (wordpos: any, pos: any, text: any) => any[];
/**
 * 评价排名
 *
 * @param {object} assess
 * @return {object}
 */
declare var getTops: (assess: any) => number;
