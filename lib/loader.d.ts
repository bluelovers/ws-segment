import SegmentDict from 'segment-dict';
import * as SegmentDictLoader from 'segment-dict/lib/loader/segment';
import * as SegmentSynonymLoader from 'segment-dict/lib/loader/segment/synonym';
export { SegmentDict };
export { SegmentDictLoader, SegmentSynonymLoader };
export interface IOptionsLoader {
    toLowerCase?: boolean;
    encoding?: string;
}
export declare function loadTxtSync(filename: any, options?: IOptionsLoader): string;
import * as self from './loader';
export default self;
