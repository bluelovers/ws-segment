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

let path_root = 'D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel';

let pathMain = 'user';
let pathMain_out;
let novelID: string;

pathMain_out = 'cm_out';

novelID = '暗黒騎士物語　～勇者を倒すために魔王に召喚されました～';

let cwd = _path(pathMain, novelID);
let cwd_out = _path((pathMain_out || pathMain + '_out'), novelID);

const segment = createSegment();

FastGlob([

	//'**/*.txt',

	'00020_第２章　聖竜王の角/*.txt',

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

			console.log('[start]', label);

			let text = await fs.readFile(path.join(cwd, file));

			text = crlf(text.toString());

			let ks = await segment.doSegment(text);

			let text_new = segment.stringify(ks);

			let ks2 = debug_info(ks);

			await fs.outputFile(path.join(cwd_out, file), text_new);

			//console.log('[done]', file);

			//console.timeEnd(label);

			let changed = text_new != text;

			await fs.writeFile(path.join(cwd_out, file) + '.json', JSON.stringify({
				file,
				ks,
				changed,
			}, null, "\t"));

			fs.writeFileSync(path.join(cwd_out, file) + '.2.json', JSON.stringify({
				file,
				changed,
				ks2,
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
		console.log(`發現 ./temp/cache.db`);

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
		else if (v.m)
		{
			v.m.map(add_info);
		}
		else
		{
			ks2.push(v);
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
