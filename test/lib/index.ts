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
import * as util from 'util';

util.inspect.defaultOptions.colors = true;

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

		if (md < 3600)
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
		//segment.loadSynonymDict('zht.synonym.txt');
	}
	else
	{
		segment
			.loadSynonymDict('synonym')
			.loadSynonymDict('zht.synonym')
		;
	}

	let db_dict = segment.getDictDatabase('TABLE', true);
	db_dict.TABLE = segment.DICT['TABLE'];
	db_dict.TABLE2 = segment.DICT['TABLE2'];

	db_dict.options.autoCjk = true;

	let size_db_dict = db_dict.size();

	console.log('主字典總數', size_db_dict);

	segment.loadSynonymDict('synonym', true);

	let size_segment = Object.keys(segment.getDict('SYNONYM')).length;

		console.log('Synonym', size_segment);

	console.timeEnd(`讀取模組與字典`);

	if (useCache && cache_file)
	{
		let _info;

		try
		{
			_info = fs.readJSONSync(cache_file + '.info.json')
		}
		catch (e)
		{

		}

		_info = _info || {};
		_info.last = _info.last || {};
		_info.current = _info.current || {};

		_info.last = Object.assign({}, _info.current);

		_info.current = {
			size_db_dict,
			size_segment,
			size_db_dict_diff: size_db_dict - (_info.last.size_db_dict || 0),
			size_segment_diff: size_segment - (_info.last.size_segment || 0),
		};

		console.log(`緩存字典於 cache.db`);

		console.dir(_info);

		fs.outputFileSync(cache_file, JSON.stringify({
			DICT: segment.DICT,
		}));

		fs.outputJSONSync(cache_file + '.info.json', _info);

		fs.writeFile(path.join(ProjectConfig.temp_root, 'stringify.txt'), db_dict.stringify())

	}

	return segment;
}

export function getDictMain(segment: Segment)
{
	return segment.getDictDatabase('TABLE');
}

import * as self from './index';
export default self;
