import { Segment as libSegment } from './lib/Segment';
import POSTAG from './lib/POSTAG';
declare const Segment: typeof libSegment & {
    version: string;
    Segment: typeof libSegment;
    POSTAG: typeof POSTAG;
} & {
    default: typeof libSegment & {
        version: string;
        Segment: typeof libSegment;
        POSTAG: typeof POSTAG;
    };
};
export = Segment;
