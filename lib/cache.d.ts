/// <reference types="node" />
import bluebird = require('bluebird');
import TypedArray = NodeJS.TypedArray;
export interface ICacacheOptionsCore {
    integrity?: any;
    algorithms?: ICacacheAlgorithm;
    memoize?: any;
    uid?: any;
    git?: any;
}
export interface ICacacheOptionsPlus extends ICacacheOptionsCore {
    ttl?: number;
}
export interface ICacacheOptions extends ICacacheOptionsCore {
    cachePath?: string;
}
export declare type ICacacheAlgorithm = 'sha512' | string;
export interface ICacacheIntegrity<T = ICacacheHash> {
    sha512?: T[];
    [k: string]: T[];
}
export interface ICacacheHash<O = any> {
    source: string;
    algorithm: ICacacheAlgorithm;
    digest: string;
    options: O[];
}
export interface ICacacheListEntry<M = any> {
    key: string;
    integrity: string;
    path: string;
    size: number;
    time: number;
    metadata: M;
}
export interface ICacacheList<M = any> {
    [k: string]: ICacacheListEntry<M>;
}
export interface ICacacheData<D = Buffer, M = any> {
    metadata: M;
    integrity: string;
    data: D | Buffer | DataView | TypedArray;
    size: string;
}
export interface ICacacheJSON<D = Buffer, M = any> {
    metadata: M;
    integrity: string;
    data: Buffer | DataView | TypedArray;
    size: string;
    json: D;
}
export interface ICacacheDataHasContent<O = any> {
    sri: ICacacheHash<O>;
    size: number;
}
export declare class Cacache {
    cachePath: string;
    static getHashes(): string[];
    constructor(options?: ICacacheOptions);
    list<M>(): bluebird<ICacacheList<M>>;
    readData<D = Buffer, M = any>(key: string, options?: ICacacheOptionsCore): bluebird<ICacacheData<D, M>>;
    readJSON<D = any, M = any>(key: string, options?: ICacacheOptionsCore): bluebird<ICacacheJSON<D, M>>;
    readDataInfo<M>(key: string, options?: ICacacheOptionsCore): bluebird<ICacacheListEntry<M>>;
    hasContent<O>(integrity: string): bluebird<ICacacheDataHasContent<O>>;
    hasData<M>(key: string, options?: ICacacheOptionsPlus): bluebird<ICacacheListEntry<M>>;
    writeData<O>(key: string, data: string | DataView | TypedArray, options?: ICacacheOptionsCore): bluebird<ICacacheIntegrity<ICacacheHash<O>>>;
    writeJSON<O>(key: string, data: any, options?: ICacacheOptionsCore): bluebird<ICacacheIntegrity<ICacacheHash<O>>>;
    removeAll(): bluebird<void>;
    remove(key: string): bluebird<void>;
    removeContent(data_integrity: string): bluebird<void>;
    clearMemoized(): bluebird<void>;
    createTempDirPath(options?: ICacacheOptionsCore): bluebird<string>;
    withTempDirPath(options?: ICacacheOptionsCore): bluebird<string>;
}
export default Cacache;
