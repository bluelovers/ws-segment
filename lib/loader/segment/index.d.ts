/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { ICallback } from '../../fs/stream';
import LoaderClass from '../_class';
export declare type IDictRow = [string, number, number];
export declare type IDict = IDictRow[];
export declare const load: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => [string, number, number]): [string, number, number];
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: [string, number, number]): string;
}) => Promise<[string, number, number][]>;
export declare const loadSync: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => [string, number, number]): [string, number, number];
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: [string, number, number]): string;
}) => any;
export declare const loadStream: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => [string, number, number]): [string, number, number];
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: [string, number, number]): string;
}, callback?: ICallback<[string, number, number][]>) => any;
export declare const loadStreamSync: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => [string, number, number]): [string, number, number];
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: [string, number, number]): string;
}, callback?: ICallback<[string, number, number][]>) => any;
export declare const parseLine: (input: string) => [string, number, number];
export declare const stringifyLine: (data: [string, number, number]) => string;
export declare const serialize: (data: [string, number, number][]) => string;
export declare const Loader: LoaderClass<[string, number, number][], [string, number, number]>;
declare const _default: (file: string, options?: {
    parseLine?(input: string, oldFn?: (input: string) => [string, number, number]): [string, number, number];
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: [string, number, number]): string;
}) => Promise<[string, number, number][]>;
export default _default;
