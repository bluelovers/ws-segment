/// <reference types="bluebird" />
/**
 * Created by user on 2018/3/14/014.
 */
import { IStreamLineWithValue } from '../../fs/line';
import * as Promise from 'bluebird';
import { ICallback } from '../../fs/stream';
import LoaderClass from '../_class';
export declare type IDictRow<T = string> = {
    0: string;
    1: number;
    2: number;
    [index: number]: T | string | number;
} & Array<string | number>;
export declare type IDict = IDictRow[];
export declare const load: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => IDictRow<string>): IDictRow<string>;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: IDictRow<string>): string;
}) => Promise<IDictRow<string>[]>;
export declare const loadSync: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => IDictRow<string>): IDictRow<string>;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: IDictRow<string>): string;
}) => IDictRow<string>[];
export declare const loadStream: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => IDictRow<string>): IDictRow<string>;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: IDictRow<string>): string;
}, callback?: ICallback<IDictRow<string>[]>) => IStreamLineWithValue<IDictRow<string>[]>;
export declare const loadStreamSync: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => IDictRow<string>): IDictRow<string>;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: IDictRow<string>): string;
}, callback?: ICallback<IDictRow<string>[]>) => IStreamLineWithValue<IDictRow<string>[]>;
export declare const parseLine: (input: string) => IDictRow<string>;
export declare const stringifyLine: (data: IDictRow<string>) => string;
export declare const serialize: (data: IDictRow<string>[]) => string;
export declare const Loader: LoaderClass<IDictRow<string>[], IDictRow<string>>;
declare const _default: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => IDictRow<string>): IDictRow<string>;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: IDictRow<string>): string;
}) => Promise<IDictRow<string>[]>;
export default _default;
