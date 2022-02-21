/**
 * Created by user on 2018/4/17/017.
 */
/// <reference types="node" />
import { debug_token, IWordDebug, IWordDebugInfo, toHex, token_add_info } from './debug';
import { InspectOptions } from 'util';
export { IWordDebug, IWordDebugInfo, debug_token, toHex, token_add_info };
export declare function debug_inspect(argv: any[], options?: InspectOptions): string[];
export declare function debug(...argv: any[]): void;
export declare function debug_options(argv: any[], options?: InspectOptions): void;
export declare function hexAndAny(n: number, p?: number, ...argv: number[]): number;
export declare function hexAnd(n: number, p?: number, ...argv: number[]): number;
export declare function hexOr(n: number, p?: number, ...argv: number[]): number;
