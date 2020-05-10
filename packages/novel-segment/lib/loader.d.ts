/**
 * Created by user on 2018/2/24/024.
 */
import SegmentDict from 'segment-dict';
import * as SegmentDictLoader from 'segment-dict/lib/loader/segment';
import * as SegmentSynonymLoader from '@novel-segment/loaders/segment/synonym';
export { SegmentDict };
export { SegmentDictLoader, SegmentSynonymLoader };
declare const _default: {
    SegmentDict: typeof import("segment-dict");
    SegmentDictLoader: typeof SegmentDictLoader;
    SegmentSynonymLoader: typeof SegmentSynonymLoader;
};
export default _default;
