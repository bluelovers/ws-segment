/**
 * Created by user on 2018/3/14/014.
 */
import { IStreamLineWithValue } from '@novel-segment/stream-loader-core/line';
import Promise = require('bluebird');
import { ICallback } from '@novel-segment/stream-loader-core/stream';
import LoaderClass from '../_class';
export declare type IDictRow<T = string> = {
    0: string;
    1: number;
    2: number;
    [index: number]: T | string | number;
} & Array<string | number>;
export declare type IDict = IDictRow[];
export declare const load: (file: string, options?: import("../_class").IOptions<IDict, IDictRow<string>>) => Promise<IDict>;
export declare const loadSync: (file: string, options?: import("../_class").IOptions<IDict, IDictRow<string>>) => IDict;
export declare const loadStream: (file: string, options?: import("../_class").IOptions<IDict, IDictRow<string>>, callback?: ICallback<IDict>) => IStreamLineWithValue<IDict>;
export declare const loadStreamSync: (file: string, options?: import("../_class").IOptions<IDict, IDictRow<string>>, callback?: ICallback<IDict>) => IStreamLineWithValue<IDict>;
export declare const parseLine: (input: string) => IDictRow<string>;
export declare const stringifyLine: (data: IDictRow<string>) => string;
export declare const serialize: (data: IDictRow<string>[]) => string;
export declare const Loader: LoaderClass<IDict, IDictRow<string>>;
declare const _default: (file: string, options?: import("../_class").IOptions<IDict, IDictRow<string>>) => Promise<IDict>;
export default _default;
