/**
 * Created by user on 2018/4/17/017.
 */

import { crlf } from 'crlf-normalize';
import * as FastGlob from 'fast-glob';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as Promise from 'bluebird';
import { Segment } from '../../lib/Segment';
import { useDefault, getDefaultModList } from '../../lib';
import { debug_token } from '../../lib/util';
import ProjectConfig from '../../project.config';
import TableDict from '../../lib/table/dict';

export function createSegment(useCache: boolean = true)
{
	const segment = new Segment({
		autoCjk: true,

		optionsDoSegment: {

			convertSynonym: true,

		},
	});

	let cache_file = path.join(ProjectConfig.temp_root, 'cache.db');

	let options = {
		/**
		 * 開啟 all_mod 才會在自動載入時包含 ZhtSynonymOptimizer
		 */
		all_mod: true,
	};

	console.time(`讀取模組與字典`);

	/**
	 * 使用緩存的字典檔範例
	 */
	if (useCache && fs.existsSync(cache_file))
	{
		console.log(`發現 cache.db`);

		let st = fs.statSync(cache_file);

		let md = (Date.now() - st.mtimeMs) / 1000;

		console.log(`距離上次緩存已過 ${md}s`);

		if (md < 300)
		{
			//console.log(st, md);

			console.log(`開始載入緩存字典`);

			let data = JSON.parse(fs.readFileSync(cache_file).toString());

			useDefault(segment, {
				...options,
				nodict: true,
			});

			segment.DICT = data.DICT;

			segment.inited = true;

			cache_file = null;
		}
	}

	if (!segment.inited)
	{
		console.log(`重新載入分析字典`);
		segment.autoInit(options);

		// 簡轉繁專用
		segment.loadSynonymDict('zht.synonym.txt');
	}

	let db_dict = segment.getDictDatabase('TABLE', true);
	db_dict.TABLE = segment.DICT['TABLE'];
	db_dict.TABLE2 = segment.DICT['TABLE2'];

	db_dict.options.autoCjk = true;

	console.log('主字典總數', db_dict.size());

	console.timeEnd(`讀取模組與字典`);

	if (useCache && cache_file)
	{
		console.log(`緩存字典於 cache.db`);

		fs.outputFileSync(cache_file, JSON.stringify({
			DICT: segment.DICT,
		}));
	}

	return segment;
}

export function getDictMain(segment: Segment)
{
	return segment.getDictDatabase('TABLE');
}

import * as self from './index';
export default self;
