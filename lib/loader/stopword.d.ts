/// <reference types="bluebird" />
/**
 * Created by user on 2018/4/14/014.
 */
import * as Promise from 'bluebird';
import { IStreamLineWithValue } from '../fs/line';
import { ICallback } from '../fs/stream';
import { LoaderClass } from './_class';
export declare type IDictRow = string;
export declare type IDict = IDictRow[];
export declare const load: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => string): string;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: string): string;
}) => Promise<string[]>;
export declare const loadSync: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => string): string;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: string): string;
}) => string[];
export declare const loadStream: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => string): string;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: string): string;
}, callback?: ICallback<string[]>) => IStreamLineWithValue<string[]>;
export declare const loadStreamSync: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => string): string;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: string): string;
}, callback?: ICallback<string[]>) => IStreamLineWithValue<string[]>;
export declare const parseLine: (input: string) => string;
export declare const stringifyLine: (data: string) => string;
export declare const Loader: LoaderClass<string[], string>;
declare const _default: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => string): string;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: string): string;
}) => Promise<string[]>;
export default _default;