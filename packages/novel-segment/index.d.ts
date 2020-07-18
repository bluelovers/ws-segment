import { Segment } from './lib/Segment';
import { POSTAG } from '@novel-segment/postag/lib/postag/ids';
declare const _Segment: typeof Segment & {
    version: string;
    version_dict: string;
    versions: {
        'novel-segment': string;
        'segment-dict': string;
        'regexp-cjk': string;
        'cjk-conv': string;
    };
    /**
     * 分词接口
     */
    Segment: typeof Segment;
    /**
     * 词性接口
     */
    POSTAG: typeof POSTAG;
};
declare const __Segment: typeof Segment & {
    version: string;
    version_dict: string;
    versions: {
        'novel-segment': string;
        'segment-dict': string;
        'regexp-cjk': string;
        'cjk-conv': string;
    };
    /**
     * 分词接口
     */
    Segment: typeof Segment;
    /**
     * 词性接口
     */
    POSTAG: typeof POSTAG;
} & {
    default: typeof _Segment;
};
export = __Segment;
export * from './version';
