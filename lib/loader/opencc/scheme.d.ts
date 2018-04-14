/// <reference types="bluebird" />
/**
 * Created by user on 2018/4/13/013.
 */
import * as Promise from 'bluebird';
import { IStreamLineWithValue } from '../../fs/line';
import { ICallback } from '../../fs/stream';
import { LoaderClass } from '../_class';
export declare type IDictRow = [string, string[], string] | [string, string[]];
export declare type IDict = IDictRow[];
export declare const load: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => IDictRow): IDictRow;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: IDictRow): string;
}) => Promise<IDictRow[]>;
export declare const loadSync: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => IDictRow): IDictRow;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: IDictRow): string;
}) => IDictRow[];
export declare const loadStream: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => IDictRow): IDictRow;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: IDictRow): string;
}, callback?: ICallback<IDictRow[]>) => IStreamLineWithValue<IDictRow[]>;
export declare const loadStreamSync: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => IDictRow): IDictRow;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: IDictRow): string;
}, callback?: ICallback<IDictRow[]>) => IStreamLineWithValue<IDictRow[]>;
export declare const parseLine: (input: string) => IDictRow;
export declare const stringifyLine: (data: IDictRow) => string;
export declare const serialize: (data: IDictRow[]) => string;
export declare const Loader: LoaderClass<IDictRow[], IDictRow>;
declare const _default: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => IDictRow): IDictRow;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: IDictRow): string;
}) => Promise<IDictRow[]>;
export default _default;
