/**
 * Created by user on 2018/3/14/014.
 */
import Promise = require('bluebird');
import { LoaderClass } from '@novel-segment/dict-loader-core';
import { ArrayTwoOrMore } from '@novel-segment/types';
export type IDictRow = ArrayTwoOrMore<string>;
export type IDict = IDictRow[];
declare const libLoader: LoaderClass<IDict, IDictRow>;
export declare const load: typeof libLoader.load;
export declare const loadSync: typeof libLoader.loadSync;
export declare const loadStream: typeof libLoader.loadStream;
export declare const loadStreamSync: typeof libLoader.loadStreamSync;
export declare const parseLine: typeof libLoader.parseLine;
export declare const stringifyLine: typeof libLoader.stringifyLine;
export declare const serialize: typeof libLoader.serialize;
export declare const Loader: LoaderClass<IDict, IDictRow>;
declare const _default: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, IDictRow>) => Promise<IDict>;
export default _default;
