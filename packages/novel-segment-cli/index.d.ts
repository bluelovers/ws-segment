/// <reference types="node" />
import { stringify } from 'novel-segment';
import Bluebird = require('bluebird');
import { Cacache } from './lib/cache';
import { enableDebug } from './lib/util';
import { IOptionsSegment } from 'novel-segment/lib/segment/types';
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
    convertToZhTw?: boolean;
    optionsSegment?: IOptionsSegment;
    USER_DB_KEY?: string;
    USER_DB_KEY_INFO?: string;
}
export declare function textSegment(text: string, options?: ISegmentCLIOptions): Bluebird<import("novel-segment/lib/Segment").IWord[]>;
export declare function fileSegment(file: string, options?: ISegmentCLIOptions): Bluebird<import("novel-segment/lib/Segment").IWord[]>;
export declare function processText(text: string, options?: ISegmentCLIOptions): Bluebird<string>;
export declare function processFile(file: string, options?: ISegmentCLIOptions): Bluebird<string>;
export declare class SegmentCliError extends Error {
}
export declare function readFile(file: string, options?: ISegmentCLIOptions): Bluebird<Buffer>;
export declare function fixOptions<T extends ISegmentCLIOptions>(options?: T): T & ISegmentCLIOptions;
export declare function getCacache(options?: ISegmentCLIOptions): Bluebird<Cacache>;
export declare function resetSegment(): void;
export declare function getSegment(options?: ISegmentCLIOptions): Bluebird<import("novel-segment/lib").Segment>;
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
export declare function loadCacheInfo(options?: ISegmentCLIOptions): Bluebird<IDataCache>;
export declare function loadCacheDb(options?: ISegmentCLIOptions): Bluebird<IDataCache>;
export declare function removeCache(options?: ISegmentCLIOptions): Bluebird<void[]>;
export declare function resetCache(): void;
