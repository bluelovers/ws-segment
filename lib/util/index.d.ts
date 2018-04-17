/// <reference types="node" />
import { IWord } from '../Segment';
import * as util from 'util';
export * from './core';
export declare type IWordDebug = IWord & {
    m?: Array<IWordDebug | string>;
    ps?: string;
    ps_en?: string;
    ow?: string;
    op?: number;
    pp?: string;
    index?: number;
};
export declare function debug_inspect(argv: any[], options?: util.InspectOptions): string[];
export declare function debug(...argv: any[]): void;
export declare function debug_options(argv: any[], options?: util.InspectOptions): void;
export declare function debug_token<T extends IWordDebug>(ks: Array<T>, returnSource?: boolean): Array<T | IWordDebug>;
export declare function token_add_info<T extends IWordDebug>(v: T): T;
export declare function toHex(p: number): string;
export declare function hexAndAny(n: number, p?: number, ...argv: number[]): number;
export declare function hexAnd(n: number, p?: number, ...argv: number[]): number;
export declare function hexOr(n: number, p?: number, ...argv: number[]): number;
import * as self from './index';
export default self;
