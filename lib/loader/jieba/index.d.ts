/// <reference types="bluebird" />
/**
 * Created by user on 2018/3/14/014.
 */
import { IStreamLineWithValue } from '../../fs/line';
import * as Promise from 'bluebird';
import { ICallback } from '../../fs/stream';
export declare type IDictRow = [string, number, string];
export declare type IDict = IDictRow[];
/**
 * 云计算
 * 蓝翔 nz
 * 区块链 10 nz
*/
export declare function parseLine(input: string): IDictRow;
export declare function load(file: string): Promise<IDict>;
export declare function loadStream(file: string, callback?: ICallback<IDict>): IStreamLineWithValue<[string, number, string][]>;
export default load;
