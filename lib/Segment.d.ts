import POSTAG from './POSTAG';
import Tokenizer from './Tokenizer';
import Optimizer from './Optimizer';
/**
 * 创建分词器接口
 */
export declare class Segment {
    /**
     * 词性
     * @type {POSTAG}
     */
    POSTAG: typeof POSTAG;
    /**
     * 词典表
     * @type {{}}
     */
    DICT: {};
    modules: {
        tokenizer: any[];
        optimizer: any[];
    };
    tokenizer: Tokenizer;
    optimizer: Optimizer;
    constructor();
    /**
     * 载入分词模块
     *
     * @param {String|Array|Object} module 模块名称(数组)或模块对象
     * @return {Segment}
     */
    use(module: any): this;
    _resolveDictFilename(name: any): any;
    /**
     * 载入字典文件
     *
     * @param {String} name 字典文件名
     * @param {String} type 类型
     * @param {Boolean} convert_to_lower 是否全部转换为小写
     * @return {Segment}
     */
    loadDict(name: any, type?: any, convert_to_lower?: any): this;
    /**
     * 取词典表
     *
     * @param {String} type 类型
     * @return {object}
     */
    getDict(type: any): any;
    /**
     * 载入同义词词典
     *
     * @param {String} name 字典文件名
     */
    loadSynonymDict(name: any): this;
    /**
     * 载入停止符词典
     *
     * @param {String} name 字典文件名
     */
    loadStopwordDict(name: any): this;
    /**
     * 使用默认的识别模块和字典文件
     *
     * @return {Segment}
     */
    useDefault(): this;
    /**
     * 开始分词
     *
     * @param {String} text 文本
     * @param {Object} options 选项
     *   - {Boolean} simple 是否仅返回单词内容
     *   - {Boolean} stripPunctuation 去除标点符号
     *   - {Boolean} convertSynonym 转换同义词
     *   - {Boolean} stripStopword 去除停止符
     * @return {Array}
     */
    doSegment(text: any, options: any): any[];
    /**
     * 将单词数组连接成字符串
     *
     * @param {Array} words 单词数组
     * @return {String}
     */
    toString(words: IWord[]): string;
    /**
     * 根据某个单词或词性来分割单词数组
     *
     * @param {Array} words 单词数组
     * @param {Number|String} s 用于分割的单词或词性
     * @return {Array}
     */
    split(words: any, s: any): any[];
    /**
     * 在单词数组中查找某一个单词或词性所在的位置
     *
     * @param {Array} words 单词数组
     * @param {Number|String} s 要查找的单词或词性
     * @param {Number} cur 开始位置
     * @return {Number} 找不到，返回-1
     */
    indexOf(words: any, s: any, cur: any): any;
}
export declare namespace Segment {
    interface IWord {
        w: string;
        p: number;
    }
}
export declare type IWord = Segment.IWord;
export default Segment;
