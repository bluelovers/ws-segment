/**
 * Created by user on 2018/3/14/014.
 */
import { IStreamLineWithValue } from '@novel-segment/stream-loader-core/line';
import Promise = require('bluebird');
import { ICallback } from '@novel-segment/stream-loader-core/stream';
import { LoaderClass } from '@novel-segment/dict-loader-core';
import { ArrayTwoOrMore } from '@novel-segment/types';
export type IDictRow = ArrayTwoOrMore<string>;
export type IDict = IDictRow[];
export declare const load: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, IDictRow>) => Promise<IDict>;
export declare const loadSync: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, IDictRow>) => IDict;
export declare const loadStream: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, IDictRow>, callback?: ICallback<IDict>) => IStreamLineWithValue<IDict>;
export declare const loadStreamSync: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, IDictRow>, callback?: ICallback<IDict>) => IStreamLineWithValue<IDict>;
export declare const parseLine: (input: string) => IDictRow;
export declare const stringifyLine: (data: IDictRow) => string;
export declare const serialize: (data: IDictRow[]) => string;
export declare const Loader: LoaderClass<IDict, IDictRow>;
declare const _default: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, IDictRow>) => Promise<IDict>;
export default _default;
