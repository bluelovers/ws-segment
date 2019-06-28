import Segment from 'novel-segment/lib/segment/core';
import { useModules } from 'novel-segment/lib/segment/methods/useModules2';
import getDefaultModList from 'novel-segment/lib/mod';

let CACHED_SEGMENT: Segment;

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

export function getSegment()
{
	const DICT = require('./cache.json');

	CACHED_SEGMENT = createSegment();

	useModules(CACHED_SEGMENT as any, getDefaultModList(CACHED_SEGMENT.options.all_mod));

	CACHED_SEGMENT.DICT = DICT;
	CACHED_SEGMENT.inited = true;

	return CACHED_SEGMENT
}

console.dir(getSegment().doSegment('韓國明文禁止遊戲代練 即日起代練遊戲獲利者將處以兩年以下有期徒刑'));
