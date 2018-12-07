/// <reference types="node" />
import { stringify } from 'novel-segment';
import bluebird = require('bluebird');
import { Cacache } from './lib/cache';
import { enableDebug } from './lib/util';
export { enableDebug, stringify };
export interface ISegmentCLIOptions {
    /**
     * 格式化分行符號
     */
    crlf?: string | boolean;
    useGlobalCache?: boolean;
    disableCache?: boolean;
    disableWarn?: boolean;
    ttl?: number;
}
export declare function textSegment(text: string, options?: ISegmentCLIOptions): bluebird<import("novel-segment/lib").Segment.IWord[]>;
export declare function fileSegment(file: string, options?: ISegmentCLIOptions): bluebird<import("novel-segment/lib").Segment.IWord[]>;
export declare function processText(text: string, options?: ISegmentCLIOptions): bluebird<string>;
export declare function processFile(file: string, options?: ISegmentCLIOptions): bluebird<string>;
export declare class SegmentCliError extends Error {
}
export declare function readFile(file: string, options?: ISegmentCLIOptions): bluebird<Buffer>;
export declare function fixOptions(options?: ISegmentCLIOptions): ISegmentCLIOptions;
export declare function getCacache(options?: ISegmentCLIOptions): bluebird<Cacache>;
export declare function resetSegment(): void;
export declare function getSegment(options?: ISegmentCLIOptions): bluebird<import("novel-segment/lib").Segment>;
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
export declare function loadCacheInfo(options?: ISegmentCLIOptions): bluebird<IDataCache>;
export declare function loadCacheDb(options?: ISegmentCLIOptions): bluebird<IDataCache>;
export declare function removeCache(options?: ISegmentCLIOptions): bluebird<Cacache>;
export declare function resetCache(): void;
