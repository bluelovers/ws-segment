/**
 * Created by user on 2018/4/19/019.
 */
import { IDICT, IOptions } from './core';
import { TableDictSynonymPanGu } from './synonym.pangu';
import { ArrayTwoOrMore } from '@novel-segment/types';
export interface IOptionsTableDictSynonym extends IOptions {
    skipExists?: boolean;
    forceOverwrite?: boolean;
}
/**
 * 請注意 這與原版 node-segment 的格式不同
 *
 * 原版為一對一 => 錯字,正字
 * 這裡為一對多 並且順序與原版相反 => 正字,錯字,...以,分隔更多字
 */
export declare class TableDictSynonym extends TableDictSynonymPanGu {
    options: IOptionsTableDictSynonym;
    constructor(type?: string, options?: IOptionsTableDictSynonym, ...argv: any[]);
    /**
     * 緩存主KEY
     */
    TABLE2: IDICT<string[]>;
    add(data: ArrayTwoOrMore<string>, skipExists?: boolean, forceOverwrite?: boolean): this;
}
export default TableDictSynonym;
