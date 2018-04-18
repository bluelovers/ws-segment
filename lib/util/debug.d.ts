import { IWord } from '../Segment';
export declare const SYMBOL_DEBUG_KEY = "_debug";
export declare type IWordDebugInfo<T extends IWordDebug = IWordDebug> = {
    ZhtSynonymOptimizer?: boolean;
    convertSynonym?: boolean;
    autoCreate?: boolean;
    _source?: T & IWordDebug;
    index?: number;
    ps_en?: string;
    [key: string]: any;
    [key: number]: any;
};
export declare type IWordDebug = IWord & {
    m?: Array<IWordDebug | string>;
    ps?: string;
    ow?: string;
    op?: number;
    pp?: string;
    [SYMBOL_DEBUG_KEY]?: IWordDebugInfo<IWordDebug>;
};
export declare function debugToken<T extends IWordDebug, U extends IWordDebugInfo>(data: T, attr: U & IWordDebugInfo, returnSource: true): T;
export declare function debugToken<T extends IWordDebug, U extends IWordDebugInfo>(data: T, attr?: U & IWordDebugInfo, returnSource?: boolean): U & IWordDebugInfo;
export declare function debug_token<T extends IWordDebug>(ks: Array<T>, returnSource?: boolean): Array<T | IWordDebug>;
export declare function token_add_info<T extends IWordDebug>(v: T): T;
export declare function toHex(p: number): string;
import * as self from './debug';
export default self;
