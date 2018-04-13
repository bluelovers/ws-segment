/// <reference types="bluebird" />
/**
 * Created by user on 2018/3/14/014.
 */
import { IStreamLineWithValue } from '../../fs/line';
import * as Promise from 'bluebird';
import createLoadStream, { ICallback } from '../../fs/stream';
export declare type IDictRow = string[];
export declare type IDict = IDictRow[];
/**
 * 揭穿,戳穿
 */
export declare function parseLine(input: string): IDictRow;
export declare function load(file: string): Promise<IDict>;
export declare function loadSync(file: string): string[][];
export declare function _createStream<IDict>(fnStream: typeof createLoadStream, file: string, callback?: ICallback<IDict>): IStreamLineWithValue<IDict>;
export declare function loadStream(file: string, callback?: ICallback<IDict>): IStreamLineWithValue<string[][]>;
export declare function loadStreamSync(file: string, callback?: ICallback<IDict>): IStreamLineWithValue<string[][]>;
export default load;
