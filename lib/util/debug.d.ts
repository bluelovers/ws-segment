/**
 * Created by user on 2018/4/19/019.
 */
import { IWord } from '@novel-segment/types';
export declare const SYMBOL_DEBUG_KEY = "_debug";
export type IWordDebugInfo<T extends IWordDebug = IWordDebug> = {
    ZhtSynonymOptimizer?: boolean;
    convertSynonym?: boolean;
    autoCreate?: boolean;
    _source?: T & IWordDebug;
    index?: number;
    ps_en?: string;
    [key: string]: any;
    [key: number]: any;
};
export type IWordDebug = IWord & {
    m?: Array<IWordDebug | string>;
    ps?: string;
    pp?: string;
    ow?: string;
    op?: number;
    ops?: string;
    opp?: string;
    os?: boolean;
    [SYMBOL_DEBUG_KEY]?: IWordDebugInfo<IWordDebug>;
};
export declare function clearTokemDebug(data: IWordDebugInfo, returnClone?: false): data is IWord;
export declare function clearTokemDebug(data: IWordDebugInfo, returnClone?: true): IWord;
export declare function debugToken<T extends IWordDebug, U extends IWordDebugInfo>(data: T, attr: U & IWordDebugInfo, returnToken: true, ...argv: any[]): T;
export declare function debugToken<T extends IWordDebug, U extends IWordDebugInfo>(data: T, attr?: U & IWordDebugInfo, returnToken?: boolean, ...argv: any[]): U & IWordDebugInfo;
export declare function debug_token<T extends IWordDebug>(ks: Array<T>, returnSource?: boolean): Array<T | IWordDebug>;
export declare function token_add_info<T extends IWordDebug>(v: T): T;
export declare function toHex(p: number): string;
