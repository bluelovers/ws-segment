/**
 * Created by user on 2019/6/28.
 */


/**
 * Created by user on 2019/6/26.
 */

import Segment from 'novel-segment/lib';
import { outputJSON } from 'fs-extra';
//import { resolve } from 'bluebird';
import { join } from "path";
const __root = __dirname;

function buildCache()
{
	const CACHED_SEGMENT = createSegment();

	CACHED_SEGMENT.doSegment('');

	return outputJSON(join(__root, 'cache', 'cache.json'), CACHED_SEGMENT.DICT)
		.then(() => {
			console.log('[buildCache] done')
		})
}

function createSegment()
{
	return new Segment({
		autoCjk: true,
		optionsDoSegment: {
			convertSynonym: true,
		},
		all_mod: true,
	});
}

buildCache();
