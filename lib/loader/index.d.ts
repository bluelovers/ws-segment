/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import * as JIEBA from './jieba';
import * as SEGMENT from './segment';
export declare function requireDefault<T = any>(id: any, subtype: string): (file: string) => Promise<T>;
export declare function requireDefault(id: 'jieba'): typeof JIEBA.default;
export declare function requireDefault(id: 'segment'): typeof SEGMENT.default;
export declare function requireDefault<T = any>(id: any, subtype?: string): (file: string) => Promise<T>;
export declare function requireModule<T = any>(id: any, subtype: string): IRequireModule<T>;
export declare function requireModule(id: 'jieba'): typeof JIEBA;
export declare function requireModule(id: 'segment'): typeof SEGMENT;
export declare function requireModule<T = any>(id: any, subtype?: string): IRequireModule<T>;
export declare type IRequireModule<T = any> = {
    load(file: string): Promise<T>;
    default(file: string): Promise<T>;
};
export default requireDefault;
