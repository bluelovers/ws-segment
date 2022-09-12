export type ArrayTwoOrMore<T> = T[] & {
    0: T;
    1: T;
};
export declare const enum EnumDictDatabase {
    SYNONYM = "SYNONYM",
    TABLE = "TABLE",
    STOPWORD = "STOPWORD",
    /**
     * 字典黑名單 在主字典內刪除此字典內有的條目
     */
    BLACKLIST = "BLACKLIST",
    /**
     * 優化器黑名單 會防止部分優化器去組合此字典內的詞
     * 例如 人名 自動組合之類
     */
    BLACKLIST_FOR_OPTIMIZER = "BLACKLIST_FOR_OPTIMIZER",
    /**
     * 轉換黑名單 動態轉換字詞時會忽略此字典內的詞
     */
    BLACKLIST_FOR_SYNONYM = "BLACKLIST_FOR_SYNONYM"
}
export interface IWord {
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
