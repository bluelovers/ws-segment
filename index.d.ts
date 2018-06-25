import { Segment } from './lib/Segment';
import { POSTAG } from './lib/POSTAG';
declare const __Segment: typeof Segment & {
    version: string;
    /**
     * 分词接口
     */
    Segment: typeof Segment;
    /**
     * 词性接口
     */
    POSTAG: typeof POSTAG;
} & {
    default: typeof Segment & {
        version: string;
        /**
         * 分词接口
         */
        Segment: typeof Segment;
        /**
         * 词性接口
         */
        POSTAG: typeof POSTAG;
    };
};
export = __Segment;
