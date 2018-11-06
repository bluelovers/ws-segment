/**
 * Created by user on 2018/4/17/017.
 */
/// <reference types="node" />
import * as util from 'util';
export * from './core';
import { IWordDebug, IWordDebugInfo, debug_token, toHex, token_add_info } from './debug';
export { IWordDebug, IWordDebugInfo, debug_token, toHex, token_add_info };
export declare function debug_inspect(argv: any[], options?: util.InspectOptions): string[];
export declare function debug(...argv: any[]): void;
export declare function debug_options(argv: any[], options?: util.InspectOptions): void;
export declare function hexAndAny(n: number, p?: number, ...argv: number[]): number;
export declare function hexAnd(n: number, p?: number, ...argv: number[]): number;
export declare function hexOr(n: number, p?: number, ...argv: number[]): number;
export declare function cloneDeep<T extends object | Array<any>>(data: T): T;
import * as self from './index';
export default self;
