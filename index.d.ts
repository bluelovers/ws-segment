import { Segment } from './lib/Segment';
import { POSTAG } from './lib/POSTAG';
declare const __Segment: typeof Segment & {
    version: string;
    Segment: typeof Segment;
    POSTAG: typeof POSTAG;
} & {
    default: typeof Segment & {
        version: string;
        Segment: typeof Segment;
        POSTAG: typeof POSTAG;
    };
};
export = __Segment;
