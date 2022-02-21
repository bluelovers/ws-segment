/**
 * 分词器接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */
/// <reference types="node" />
import { TableDictBlacklist } from '@novel-segment/table-blacklist';
import { AbstractTableDictCore } from '@novel-segment/table-core-abstract';
import { TableDict } from '@novel-segment/table-dict';
import { TableDictStopword } from '@novel-segment/table-stopword';
import { TableDictSynonym } from '@novel-segment/table-synonym';
import { ISubOptimizer, ISubTokenizer, Optimizer, Tokenizer } from '../mod/index';
import { IWordDebug } from '../util/index';
import { IDICT, IDICT2, IDICT_BLACKLIST, IDICT_STOPWORD, IDICT_SYNONYM, IOptionsDoSegment, IOptionsSegment, ISPLIT, ISPLIT_FILTER } from './types';
import { ITSTypeAndStringLiteral } from 'ts-type/lib/helper/string';
import { ITSOverwrite, ITSPartialRecord } from 'ts-type/lib/type/record';
import { POSTAG } from '@novel-segment/postag/lib/postag/ids';
import { EnumDictDatabase, IWord } from '@novel-segment/types';
/**
 * 创建分词器接口
 */
export declare class SegmentCore {
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
    } & ITSPartialRecord<ITSTypeAndStringLiteral<EnumDictDatabase.SYNONYM>, IDICT_SYNONYM> & ITSPartialRecord<ITSTypeAndStringLiteral<EnumDictDatabase.STOPWORD>, IDICT_STOPWORD>;
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
    getDictDatabase<R extends TableDictSynonym>(type: EnumDictDatabase.SYNONYM, autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends TableDict>(type: EnumDictDatabase.TABLE, autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends TableDictStopword>(type: EnumDictDatabase.STOPWORD, autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends TableDictBlacklist>(type: EnumDictDatabase.BLACKLIST, autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends TableDictBlacklist>(type: EnumDictDatabase.BLACKLIST_FOR_OPTIMIZER, autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends AbstractTableDictCore<any>>(type: string | EnumDictDatabase, autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    /**
     * 载入分词模块
     *
     * @param {String|Array|Object} module 模块名称(数组)或模块对象
     * @return {Segment}
     */
    use(mod: ISubOptimizer, ...argv: any[]): this;
    use(mod: ISubTokenizer, ...argv: any[]): this;
    use(mod: any, ...argv: any[]): this;
    /**
     * 取词典表
     *
     * @param {String} type 类型
     * @return {object}
     */
    getDict(type: ITSTypeAndStringLiteral<EnumDictDatabase.STOPWORD>): IDICT_STOPWORD;
    getDict(type: ITSTypeAndStringLiteral<EnumDictDatabase.SYNONYM>): IDICT_SYNONYM;
    getDict(type: ITSTypeAndStringLiteral<EnumDictDatabase.TABLE>): IDICT<IWord>;
    getDict(type: ITSTypeAndStringLiteral<EnumDictDatabase.BLACKLIST>): IDICT_BLACKLIST;
    getDict(type: ITSTypeAndStringLiteral<EnumDictDatabase.BLACKLIST_FOR_OPTIMIZER>): IDICT_BLACKLIST;
    getDict(type: 'TABLE2'): IDICT2<IWord>;
    getDict(type: ITSTypeAndStringLiteral<EnumDictDatabase>): IDICT;
    getDict(type: unknown): IDICT;
    getOptionsDoSegment<T extends IOptionsDoSegment>(options?: T): T;
    protected _get_text(text: string | Buffer): string;
    addBlacklist(word: string, remove?: boolean): this;
    /**
     * remove key in TABLE by BLACKLIST
     */
    doBlacklist(): this;
    listModules(options?: IOptionsDoSegment): {
        enable: {
            tokenizer: ISubTokenizer[];
            optimizer: ISubOptimizer[];
        };
        disable: {
            tokenizer: ISubTokenizer[];
            optimizer: ISubOptimizer[];
        };
    };
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
    doSegment(text: string | Buffer, options: ITSOverwrite<IOptionsDoSegment, {
        simple: true;
    }>): string[];
    doSegment(text: string | Buffer, options?: IOptionsDoSegment): IWord[];
    /**
     * 转换同义词
     */
    convertSynonym(ret: IWordDebug[], showcount: true): {
        count: number;
        list: IWordDebug[];
    };
    /**
     * 转换同义词
     */
    convertSynonym(ret: IWordDebug[], showcount?: boolean): IWordDebug[];
    /**
     * 将单词数组连接成字符串
     *
     * @param {Array} words 单词数组
     * @return {String}
     */
    stringify(words: Array<IWord | string>, ...argv: any[]): string;
    /**
     * 将单词数组连接成字符串
     *
     * @param {Array} words 单词数组
     * @return {String}
     */
    static stringify(words: Array<IWord | string>, ...argv: any[]): string;
    /**
     * 根据某个单词或词性来分割单词数组
     *
     * @param {Array} words 单词数组
     * @param {Number|String} s 用于分割的单词或词性
     * @return {Array}
     */
    split(words: IWord[], s: string | number, ...argv: any[]): IWord[];
    /**
     * 在单词数组中查找某一个单词或词性所在的位置
     *
     * @param {Array} words 单词数组
     * @param {Number|String} s 要查找的单词或词性
     * @param {Number} cur 开始位置
     * @return {Number} 找不到，返回-1
     */
    indexOf(words: IWord[], s: string | number, cur?: number, ...argv: any[]): number;
}
export { IDICT, IDICT2, IDICT_BLACKLIST, IDICT_STOPWORD, IDICT_SYNONYM, IOptionsDoSegment, IOptionsSegment, ISPLIT, ISPLIT_FILTER, IWord };
export default SegmentCore;
