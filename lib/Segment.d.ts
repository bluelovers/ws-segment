/**
 * 分词器接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */
/// <reference types="node" />
import POSTAG from './POSTAG';
import TableDictBlacklist from './table/blacklist';
import AbstractTableDictCore from './table/core';
import { TableDict, IOptions as IOptionsTableDict } from './table/dict';
import { TableDictStopword } from './table/stopword';
import TableDictSynonym from './table/synonym';
import { Optimizer, ISubOptimizer, Tokenizer, ISubTokenizer } from './mod';
import { IWordDebug } from './util/index';
/**
 * 创建分词器接口
 */
export declare class Segment {
    static defaultOptionsDoSegment: IOptionsDoSegment;
    /**
     * 分段
     *
     * 由於 segment 是利用對內容的前後文分析來進行分詞
     * 所以如何切割段落對於結果就會產生不同影響
     *
     * `RegExp` or 具有 `.[Symbol.split](input: string, limit?: number) => string[]` 的物件
     *
     * @type {Segment.ISPLIT}
     */
    SPLIT: ISPLIT;
    /**
     * 分段之後 如果符合以下條件 則直接忽略分析
     * `RegExp` or 具有 `.test(input: string) => boolean` 的物件
     *
     * @type {Segment.ISPLIT_FILTER}
     */
    SPLIT_FILTER: ISPLIT_FILTER;
    /**
     * 词性
     * @type {POSTAG}
     */
    POSTAG: typeof POSTAG;
    /**
     * 词典表
     * @type {{}}
     */
    DICT: {
        STOPWORD?: IDICT_STOPWORD;
        SYNONYM?: IDICT_SYNONYM;
        [key: string]: IDICT;
    };
    modules: {
        tokenizer: ISubTokenizer[];
        optimizer: ISubOptimizer[];
    };
    tokenizer: Tokenizer;
    optimizer: Optimizer;
    db: {
        [key: string]: TableDict;
    };
    options: IOptionsSegment;
    inited?: boolean;
    constructor(options?: IOptionsSegment);
    getDictDatabase<R extends TableDictSynonym>(type: 'SYNONYM', autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends TableDict>(type: 'TABLE', autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends TableDictStopword>(type: 'STOPWORD', autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends TableDictBlacklist>(type: 'BLACKLIST', autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends AbstractTableDictCore<any>>(type: string, autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    /**
     * 载入分词模块
     *
     * @param {String|Array|Object} module 模块名称(数组)或模块对象
     * @return {Segment}
     */
    use(mod: ISubOptimizer, ...argv: any[]): any;
    use(mod: ISubTokenizer, ...argv: any[]): any;
    use(mod: Array<ISubTokenizer | ISubOptimizer | string>, ...argv: any[]): any;
    use(mod: string, ...argv: any[]): any;
    use(mod: any, ...argv: any[]): any;
    _resolveDictFilename(name: string, pathPlus?: string[], extPlus?: string[]): string | string[];
    /**
     * 载入字典文件
     *
     * @param {String} name 字典文件名
     * @param {String} type 类型
     * @param {Boolean} convert_to_lower 是否全部转换为小写
     * @return {Segment}
     */
    loadDict(name: string, type?: string, convert_to_lower?: boolean, skipExists?: boolean): this;
    /**
     * 取词典表
     *
     * @param {String} type 类型
     * @return {object}
     */
    getDict(type: 'STOPWORD'): IDICT_STOPWORD;
    getDict(type: 'SYNONYM'): IDICT_SYNONYM;
    getDict(type: 'TABLE'): IDICT<IWord>;
    getDict(type: 'TABLE2'): IDICT2<IWord>;
    getDict(type: any): IDICT;
    /**
     * 载入同义词词典
     *
     * @param {String} name 字典文件名
     */
    loadSynonymDict(name: string, skipExists?: boolean): this;
    loadBlacklistDict(name: string): this;
    /**
     * 载入停止符词典
     *
     * @param {String} name 字典文件名
     */
    loadStopwordDict(name: string): this;
    /**
     * 使用默认的识别模块和字典文件
     * 在使用預設值的情況下，不需要主動呼叫此函數
     *
     * @return {Segment}
     */
    useDefault(...argv: any[]): this;
    /**
     * 此函數只需執行一次，並且一般狀況下不需要手動呼叫
     */
    autoInit(options?: {
        all_mod?: boolean;
    }): this;
    getOptionsDoSegment<T extends IOptionsDoSegment>(options?: T): T;
    protected _get_text(text: string | Buffer): string;
    /**
     * remove key in TABLE by BLACKLIST
     */
    doBlacklist(): this;
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
    doSegment(text: string | Buffer, options: IOptionsDoSegment & {
        simple: true;
    }): string[];
    doSegment(text: string | Buffer, options?: IOptionsDoSegment): IWord[];
    /**
     * 转换同义词
     */
    convertSynonym(ret: IWordDebug[], showcount: true): {
        count: number;
        list: IWordDebug[];
    };
    convertSynonym(ret: IWordDebug[], showcount?: boolean): IWordDebug[];
    /**
     * 将单词数组连接成字符串
     *
     * @param {Array} words 单词数组
     * @return {String}
     */
    stringify(words: Array<IWord | string>, ...argv: any[]): string;
    static stringify(words: Array<IWord | string>, ...argv: any[]): string;
    /**
     * 根据某个单词或词性来分割单词数组
     *
     * @param {Array} words 单词数组
     * @param {Number|String} s 用于分割的单词或词性
     * @return {Array}
     */
    split(words: IWord[], s: string | number): IWord[];
    /**
     * 在单词数组中查找某一个单词或词性所在的位置
     *
     * @param {Array} words 单词数组
     * @param {Number|String} s 要查找的单词或词性
     * @param {Number} cur 开始位置
     * @return {Number} 找不到，返回-1
     */
    indexOf(words: IWord[], s: string | number, cur?: number): number;
}
export declare namespace Segment {
    type ISPLIT = RegExp | string | {
        [Symbol.split](input: string, limit?: number): string[];
    };
    type ISPLIT_FILTER = RegExp | {
        test(input: string): boolean;
    };
    interface IDICT<T = any> {
        [key: string]: T;
    }
    interface IDICT2<T = any> {
        [key: number]: IDICT<T>;
    }
    type IOptionsSegment = IOptionsTableDict & {
        db?: TableDict[];
        optionsDoSegment?: IOptionsDoSegment;
        all_mod?: boolean;
        maxChunkCount?: number;
    };
    type IDICT_SYNONYM = IDICT<string>;
    type IDICT_STOPWORD = IDICT<boolean>;
    interface IWord {
        w: string;
        /**
         * 詞性
         */
        p?: number;
        /**
         * 詞性名稱
         */
        ps?: string;
        pp?: string;
        /**
         * 權重
         */
        f?: number;
        /**
         * 开始位置
         */
        c?: number;
        /**
         * 合併項目
         */
        m?: Array<IWord | string>;
        /**
         * 代表原生存在於字典內的項目
         */
        s?: boolean;
        os?: boolean;
    }
    interface IOptionsDoSegment {
        /**
         * 不返回词性
         */
        simple?: boolean;
        /**
         * 去除标点符号
         */
        stripPunctuation?: boolean;
        /**
         * 转换同义词
         */
        convertSynonym?: boolean;
        /**
         * 去除停止符
         */
        stripStopword?: boolean;
        stripSpace?: boolean;
    }
}
export import IOptionsSegment = Segment.IOptionsSegment;
export import IWord = Segment.IWord;
export import IOptionsDoSegment = Segment.IOptionsDoSegment;
export import IDICT_SYNONYM = Segment.IDICT_SYNONYM;
export import IDICT_STOPWORD = Segment.IDICT_STOPWORD;
export import IDICT = Segment.IDICT;
export import IDICT2 = Segment.IDICT2;
export import ISPLIT = Segment.ISPLIT;
export import ISPLIT_FILTER = Segment.ISPLIT_FILTER;
export default Segment;
