/**
 * Created by user on 2018/4/13/013.
 */
import * as Promise from 'bluebird';
import { IStreamLineWithValue } from '../fs/line';
import { ICallback } from '../fs/stream';
import { LoaderClass } from './_class';
export declare type IDictRow = string;
export declare type IDict = IDictRow[];
export declare const load: (file: string, options?: import("./_class").IOptions<string[], string>) => Promise<string[]>;
export declare const loadSync: (file: string, options?: import("./_class").IOptions<string[], string>) => string[];
export declare const loadStream: (file: string, options?: import("./_class").IOptions<string[], string>, callback?: ICallback<string[]>) => IStreamLineWithValue<string[]>;
export declare const loadStreamSync: (file: string, options?: import("./_class").IOptions<string[], string>, callback?: ICallback<string[]>) => IStreamLineWithValue<string[]>;
export declare const parseLine: (input: string) => string;
export declare const stringifyLine: (data: string) => string;
export declare const serialize: (data: string[]) => string;
export declare const Loader: LoaderClass<string[], string>;
declare const _default: (file: string, options?: import("./_class").IOptions<string[], string>) => Promise<string[]>;
export default _default;
