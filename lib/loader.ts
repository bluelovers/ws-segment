/**
 * Created by user on 2018/2/24/024.
 */

// @ts-ignore
import * as fs from 'fs';
import { crlf, LF } from 'crlf-normalize';
import SegmentDict from 'segment-dict';
import SegmentDictLoader = require('segment-dict/lib/loader/segment');
import SegmentSynonymLoader = require('segment-dict/lib/loader/segment/synonym');

export { SegmentDict }
export { SegmentDictLoader, SegmentSynonymLoader }

import * as self from './loader';

export default self;

