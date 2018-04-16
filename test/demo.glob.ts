/**
 * Created by user on 2018/4/16/016.
 */

import { crlf } from 'crlf-normalize';
import * as FastGlob from 'fast-glob';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as Promise from 'bluebird';
import Segment, { POSTAG } from '../index';
import { useDefault, getDefaultModList } from '../lib';
import { add_info } from './demo';

let path_root = 'D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel';

let pathMain = 'cm';
let novelID: string;

novelID = 'モンスターがあふれる世界になったので、好きに生きたいと思います';

let cwd = _path(pathMain, novelID);
let cwd_out = _path(pathMain + '_out', novelID);

const segment = createSegment();

FastGlob([

	'**/*.txt',
	//'!*６５*.txt',

], {
	cwd: cwd,
	//absolute: true,
})
	.then(async function (ls)
	{
		let label = `all file ${ls.length}`;
		console.time(label);

		console.log(`all file ${ls.length}`);

		let rs = await Promise.mapSeries(ls, async function (file)
		{
			let label = file;

			//console.time(label);

			console.log(label);

			let text = await fs.readFile(path.join(cwd, file));

			text = crlf(text.toString());

			let ks = await segment.doSegment(text);

			let text_new = segment.stringify(ks);

			debug_info(ks);

			await fs.outputFile(path.join(cwd_out, file), text_new);

			//console.log('[done]', file);

			//console.timeEnd(label);

			let changed = text_new != text;

			await fs.writeFile(path.join(cwd_out, file) + '.json', JSON.stringify({
				file,
				ks,
				changed,
			}, null, "\t"));

			if (changed)
			{
				console.warn('[changed]', label);
			}
			else
			{
				console.log('[done]', label);
			}

			return {
				file,
				changed,
			};
		});

		console.timeEnd(label);
	})
;

function _path(pathMain, novelID)
{
	return path.resolve(path_root, pathMain, novelID);
}

function createSegment()
{
	const segment = new Segment({
		autoCjk: true,
	});

	let cache_file = './temp/cache.db';

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
	if (1 && fs.existsSync(cache_file))
	{
		console.log(`發現 ./temp/cache.db 開始載入字典`);

		let data = JSON.parse(fs.readFileSync(cache_file).toString());

		useDefault(segment, {
			...options,
			nodict: true,
		});

		segment.DICT = data.DICT;

		segment.inited = true;

		cache_file = null;
	}
	else
	{
		segment.autoInit(options);

		let db_dict = segment.getDictDatabase('TABLE');
		console.log('主字典總數', db_dict.size());
	}

	console.timeEnd(`讀取模組與字典`);

	if (cache_file)
	{
		console.log(`緩存字典 ./temp/cache.db`);

		fs.writeFileSync(cache_file, JSON.stringify({
			DICT: segment.DICT,
		}));
	}

	return segment;
}

function debug_info(ks)
{
	let ks2 = [];

	ks.map(function (v, index)
	{
		// @ts-ignore
		v.index = index;

		if (v.p)
		{
			add_info(v);
		}
	});

	return ks2;
}

function add_info(v)
{
	if (v.p)
	{
		v.ps = POSTAG.chsName(v.p);
		v.ps_en = POSTAG.enName(v.p);

		// @ts-ignore
		v.pp = '0x' + v.p.toString(16).padStart(4, '0').toUpperCase();

		if (v.m)
		{
			v.m.map(add_info);
		}
	}

	return v;
}
