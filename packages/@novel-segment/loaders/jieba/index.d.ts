/**
 * Created by user on 2018/3/14/014.
 */
import { IStreamLineWithValue } from '@novel-segment/stream-loader-core/line';
import Bluebird from 'bluebird';
import createLoadStream, { ICallback } from '@novel-segment/stream-loader-core/stream';
export type IDictRow = [string, number, string];
export type IDict = IDictRow[];
/**
 * 云计算
 * 蓝翔 nz
 * 区块链 10 nz
*/
export declare function parseLine(input: string): IDictRow;
export declare function load(file: string): Bluebird<IDict>;
export declare function loadSync(file: string): IDict;
export declare function _createStream<IDict>(fnStream: typeof createLoadStream, file: string, callback?: ICallback<IDict>): IStreamLineWithValue<IDict>;
export declare function loadStream(file: string, callback?: ICallback<IDict>): IStreamLineWithValue<IDict>;
export declare function loadStreamSync(file: string, callback?: ICallback<IDict>): IStreamLineWithValue<IDict>;
export default load;
