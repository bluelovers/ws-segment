/// <reference types="node" />
import { stringify } from 'novel-segment';
import bluebird = require('bluebird');
import { Cacache } from './lib/cache';
import { enableDebug } from './lib/util';
export { enableDebug, stringify };
export interface ISegmentOptions {
    /**
     * 格式化分行符號
     */
    crlf: string | boolean;
}
export declare function textSegment(text: string, options?: ISegmentOptions): bluebird<import("novel-segment/lib/Segment").Segment.IWord[]>;
export declare function fileSegment(file: string, options?: ISegmentOptions): bluebird<import("novel-segment/lib/Segment").Segment.IWord[]>;
export declare function processText(text: string, options?: ISegmentOptions): bluebird<string>;
export declare function processFile(file: string, options?: ISegmentOptions): bluebird<string>;
export declare class SegmentCliError extends Error {
}
export declare function readFile(file: string): Promise<Buffer>;
export declare function getCacache(): bluebird<Cacache>;
export declare function getSegment(disableCache?: boolean): bluebird<import("novel-segment/lib/Segment").Segment>;
export interface IDataCacheInfo {
    size_db_dict?: number;
    size_segment?: number;
    size_db_dict_diff?: number;
    size_segment_diff?: number;
    version?: {
        'novel-segment-cli'?: string;
        'novel-segment'?: string;
        'segment-dict'?: string;
    };
}
export interface IDataCache {
    last?: IDataCacheInfo;
    current?: IDataCacheInfo;
    DICT?: any;
}
export declare function loadCacheInfo(): bluebird<IDataCache>;
export declare function loadCacheDb(disableCache?: boolean): bluebird<IDataCache>;
