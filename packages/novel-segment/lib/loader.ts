/**
 * Created by user on 2018/2/24/024.
 */

// @ts-ignore
import * as fs from 'fs';
import { crlf, LF } from 'crlf-normalize';
import SegmentDict from 'segment-dict';
import * as SegmentDictLoader from 'segment-dict/lib/loader/segment';
import * as SegmentSynonymLoader from '@novel-segment/loaders/segment/synonym';

export { SegmentDict }
export { SegmentDictLoader, SegmentSynonymLoader }

export default {
	SegmentDict,
	SegmentDictLoader,
	SegmentSynonymLoader,
};
