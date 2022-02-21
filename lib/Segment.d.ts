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
import { ISubOptimizer, ISubTokenizer } from './mod';
import { ITSTypeAndStringLiteral } from 'ts-type/lib/helper/string';
import { IDICT, IDICT2, IDICT_BLACKLIST, IDICT_STOPWORD, IDICT_SYNONYM, IOptionsDoSegment, IOptionsSegment, ISPLIT, ISPLIT_FILTER } from './segment/types';
import { EnumDictDatabase, IWord } from '@novel-segment/types';
import { SegmentCore } from './segment/core';
import { ITSOverwrite } from 'ts-type';
import { IUseDefaultOptions } from './defaults/index';
/**
 * 创建分词器接口
 */
export declare class Segment extends SegmentCore {
    static defaultOptionsDoSegment: IOptionsDoSegment;
    getDictDatabase<R extends TableDictSynonym>(type: ITSTypeAndStringLiteral<EnumDictDatabase.SYNONYM>, autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends TableDict>(type: ITSTypeAndStringLiteral<EnumDictDatabase.TABLE>, autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends TableDictStopword>(type: ITSTypeAndStringLiteral<EnumDictDatabase.STOPWORD>, autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends TableDictBlacklist>(type: ITSTypeAndStringLiteral<EnumDictDatabase.BLACKLIST>, autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends TableDictBlacklist>(type: ITSTypeAndStringLiteral<EnumDictDatabase.BLACKLIST_FOR_OPTIMIZER>, autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends TableDictBlacklist>(type: ITSTypeAndStringLiteral<EnumDictDatabase.BLACKLIST_FOR_SYNONYM>, autocreate?: boolean, libTableDict?: {
        new (...argv: any[]): R;
    }): R;
    getDictDatabase<R extends AbstractTableDictCore<any>>(type: string | ITSTypeAndStringLiteral<EnumDictDatabase>, autocreate?: boolean, libTableDict?: {
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
    loadDict(name: string, type?: string | ITSTypeAndStringLiteral<EnumDictDatabase>, convert_to_lower?: boolean, skipExists?: boolean): this;
    /**
     * 载入同义词词典
     *
     * @param {String} name 字典文件名
     */
    loadSynonymDict(name: string, skipExists?: boolean): this;
    protected _loadBlacklistDict(name: string, type: EnumDictDatabase): this;
    /**
     * 字典黑名單 在主字典內刪除此字典內有的條目
     */
    loadBlacklistDict(name: string): this;
    /**
     * 優化器黑名單 會防止部分優化器去組合此字典內的詞
     * 例如 人名 自動組合之類
     */
    loadBlacklistOptimizerDict(name: string): this;
    /**
     * 轉換黑名單 動態轉換字詞時會忽略此字典內的詞
     */
    loadBlacklistSynonymDict(name: string): this;
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
    useDefault(options?: IUseDefaultOptions, ...argv: any[]): any;
    /**
     * 此函數只需執行一次，並且一般狀況下不需要手動呼叫
     */
    autoInit(options?: IUseDefaultOptions): this;
    addBlacklist(word: string, remove?: boolean): this;
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
    doSegment(text: string | Buffer, options: ITSOverwrite<IOptionsDoSegment, {
        simple: true;
    }>): string[];
    doSegment(text: string | Buffer, options?: IOptionsDoSegment): IWord[];
}
export declare namespace Segment {
    export { IDICT, IDICT2, IDICT_BLACKLIST, IDICT_STOPWORD, IDICT_SYNONYM, IOptionsDoSegment, IOptionsSegment, ISPLIT, ISPLIT_FILTER, IWord, };
}
export { IDICT, IDICT2, IDICT_BLACKLIST, IDICT_STOPWORD, IDICT_SYNONYM, IOptionsDoSegment, IOptionsSegment, ISPLIT, ISPLIT_FILTER, IWord, };
export default Segment;
