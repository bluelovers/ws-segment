/**
 * Created by user on 2018/2/24/024.
 */

// @ts-ignore
import * as fs from 'fs';
import { crlf, LF } from 'crlf-normalize';
import SegmentDict from 'segment-dict';
import * as SegmentDictLoader from 'segment-dict/lib/loader/segment';
import * as SegmentSynonymLoader from 'segment-dict/lib/loader/segment/synonym';

export { SegmentDict }
export { SegmentDictLoader, SegmentSynonymLoader }

export interface IOptionsLoader
{
	toLowerCase?: boolean,
	encoding?: string,
}

export function loadTxtSync(filename, options: IOptionsLoader = {})
{
	let data = fs
		.readFileSync(filename, {
			encoding: options.encoding ? options.encoding : null,
		})
		.toString()
	;

	if (options.toLowerCase)
	{
		data = data.toLowerCase();
	}

	return crlf(data);
}

import * as self from './loader';

export default self;

