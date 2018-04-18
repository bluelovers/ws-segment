import { TableDictSynonymPanGu } from './synonym.pangu';
/**
 * 請注意 這與原版 node-segment 的格式不同
 *
 * 原版為一對一 => 錯字,正字
 * 這裡為一對多 並且順序與原版相反 => 正字,錯字,...以,分隔更多字
 */
export declare class TableDictSynonym extends TableDictSynonymPanGu {
    add(data: [string, string] & string[], skipExists?: boolean): this;
}
export default TableDictSynonym;
