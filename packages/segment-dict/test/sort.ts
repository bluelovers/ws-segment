/**
 * Created by user on 2018/4/14/014.
 */

import Promise = require('bluebird');
import * as fs from "fs-extra";
import POSTAG from 'novel-segment/lib/POSTAG';
import zhRegExp from 'regexp-cjk';
import load, { parseLine, stringifyLine, serialize } from '@novel-segment/loader-line';
import { IDictRow, parseLine as parseLineSegment, serialize as serializeSegment } from '@novel-segment/loaders/segment';
import { charTableList, textList } from 'cjk-conv/lib/zh/table/list';
import libTable from 'cjk-conv/lib/zh/table';
import naturalCompare = require('string-natural-compare');

naturalCompare.caseInsensitive = naturalCompare.caseInsensitive || ((a, b, opt) => {
	if (typeof a === 'number' && typeof b === 'number')
	{
		return a - b
	}

	return naturalCompare(String(a), String(b), {...opt, caseInsensitive: true})
});

import UString from "uni-string";
import FastGlob from "@bluelovers/fast-glob";
import * as path from "path";
import { console } from "debug-color2";

import ProjectConfig from "../project.config";

let fa = [];
let fa2 = [];

let cwd = path.join(ProjectConfig.dict_root, 'segment');

export type ICUR_WORD_DATA = [string, number, number];

export interface ICUR_WORD
{
	data: [string, number, number],
	index: number,
	line: string,
	file: string,
	cjk_id: string,
}

let CACHE_TABLE = {} as {
	[k: string]: ICUR_WORD[];
};
let CACHE_FILE_TABLE = {} as {
	[k: string]: ICUR_WORD[];
};
let CACHE_TABLE_CJK = {} as {
	[k: string]: ICUR_WORD[];
};

const USE_CJK = false;

Promise
	.resolve(FastGlob([

		'*.txt',
		'**/*.txt',

		'dict*.txt',
		'names.txt',
		'area/pangu.txt',

		'pangu/*.txt',

		'lazy/badword.txt',
		'lazy/dict_synonym.txt',
		'lazy/index.txt',



	], {
		cwd: cwd,
		absolute: true,

		ignore: [
			'char*',
			'**/skip',
			'**/jieba',
			//'**/lazy',
			'**/dict_synonym',
			'**/synonym',
			'**/names',
			'**/infrequent',
		],

		markDirectories: true,

	}))
	.tap(function (ls: string[])
	{
		let a = ls.reduce(function (a, v)
		{
			let p = path.relative(cwd, v);

			a.push(p);

			return a;
		}, []);

		console.log(a);

		//process.exit();
	})
	.mapSeries(async function (file: string)
	{
		let _basepath = path.relative(cwd, file);

		let b = await load(file);

		b = b || [];

		CACHE_FILE_TABLE[file] = [];

		b = b.filter(function (line, index)
		{
			let data = parseLineSegment(line) as ICUR_WORD_DATA;

			let bool: boolean;

			let [w, p, f] = data;

			let cjk_id = w;

			if (USE_CJK)
			{
				let cjk_list = textList(w);
				cjk_id = cjk_list[0];
			}
			else
			{
				let cjk_list = libTable.auto(w);
				cjk_id = cjk_list[0];
			}

			let CUR_WORD = {
				data,
				index,
				line,
				file,
				cjk_id,
			};

			CACHE_FILE_TABLE[file].push(CUR_WORD);

			CACHE_TABLE[w] = CACHE_TABLE[w] || [];

			CACHE_TABLE[w].push(CUR_WORD);

			if (USE_CJK)
			{
				CACHE_TABLE_CJK[cjk_id] = CACHE_TABLE_CJK[cjk_id] || [];

				CACHE_TABLE_CJK[cjk_id].push(CUR_WORD);
			}

			return true;
		});

		return file;
	})
	.map(async function (file: string, ls_index, ls_len)
	{
		let _basepath = path.relative(cwd, file);

		//let b = await load(file);
		let b = CACHE_FILE_TABLE[file];

		let b_len = b.length;

		b = b.filter(function (current_data)
		{
			let { data, line, index, cjk_id } = current_data;

			//let data = parseLineSegment(line);

			let bool: boolean;

			let [w, p, f] = data;

			if (0 && UString.size(data[0]) == 1)
			{
				fa2.push(current_data);

				return false;
			}

			if (!bool)
			{
				let s: string;

				s = '//';

				if (0 && s && w != s && w.indexOf(s) != -1)
				{
					bool = true;
				}

				if (0 && s && w != s && w.match(new RegExp(`${s}$`)))
				{
					bool = true;
				}

				if (1 && s && w != s && w.indexOf(s) == 0)
				{
					bool = true;

					fa2.push(current_data);

					return false;
				}
			}

			if (0 && !bool && w.indexOf('，'))
			{
				// 清理多餘片語

				let aa = w.split('，');

				if (aa.length > 1)
				{
					let bb: boolean;

					for (let k of aa)
					{
						if (k in CACHE_TABLE)
						{
							bb = true;
						}
						else
						{
							bb = false;
							break;
						}
					}

					if (bb)
					{
						bool = true;
					}
					else
					{
						console.red(line);
					}
				}
			}

			if (0 && !bool && w in CACHE_TABLE)
			{
				let ta = CACHE_TABLE[w];

				if (ta.length > 1)
				{
					let ta0 = ta[0];

					if (ta0.file != file)
					{
						//console.red(w, index, line, _basepath);
						bool = true;
					}
					else if (ta0.index != index)
					{
						//console.red(w, index, line, _basepath);
						bool = true;
					}
				}
			}

			if (0 && !bool && USE_CJK)
			{
				let ta = CACHE_TABLE_CJK[cjk_id];

				if (ta && ta.length > 1)
				{
					if (!p)
					{
						ta.some(function (a)
						{
							if (a.data[1])
							{
								let ps = '0x' + a.data[1]
									.toString(16)
									.padStart(4, '0')
									.toUpperCase()
								;

								f = a.data[2];

								current_data.line = [
									w,
									ps,
									f,
									...data.slice(3)
								].join('|');

								return true;
							}
						})
					}

					console.red(w);
					bool = true;
				}
			}

			if (0 && !bool && UString.size(w) === 1)
			{
				bool = true;
			}

			if (1 && !bool
				&& zhRegExp.create(/訓|训|馴|驯/u).test(w)
			)
			{
				bool = true;
			}

			if (0 && !bool && w != '博物馆' && w.match(/博物馆/))
			{
				bool = true;
			}

			if (0 && !bool && p == POSTAG.A_NR)
			{
				bool = true;
			}

			if (0 && !bool && data[1] & 0x08)
			{
				bool = true;
			}

			if (bool)
			{
				fa.push(current_data);

				return false;
			}

			return true;
		});

		//sortList(b);

		let c = b
			.map(v => v.line)
		;

		//c.sort(naturalCompare.caseInsensitive);

		let method = 'debug';

		if (b.length != b_len)
		{
			method = 'ok';
		}

		let out = serialize(c) + "\n\n";

		await fs.writeFile(file, out);

		console[method](_basepath, `${ls_index} / ${ls_len}`);

		return b;
	})
	.tap(async function (ls)
	{
		console.log('tap');

		if (0)
		{
			fa.sort(function (a, b)
			{
				return (a.data[1] - b.data[1]) || (a.data[0] - b.data[0]);
			});
		}
		else
		{
			sortList(fa, true);
		}

		fa = fa.map(function (d)
		{
			return d.line;
		});

		fa2 = sortList(fa2, true).map(function (d)
		{
			return d.line;
		});

		if (0)
		{
			fa.sort();
		}

		await fs.outputFile(path.join(ProjectConfig.temp_root, 'one.txt'), serialize(fa) + "\n\n");

		await fs.appendFile(path.join(ProjectConfig.temp_root, 'skip.txt'), "\n\n" + serialize(fa2) + "\n\n");
	})
;

function sortList(ls: ICUR_WORD[], bool?: boolean)
{
	return ls.sort(function (a, b)
	{
		return naturalCompare.caseInsensitive(a.cjk_id, b.cjk_id)
			|| naturalCompare.caseInsensitive(b.data[1], a.data[1])
			|| naturalCompare.caseInsensitive(a.data[0], b.data[0])
			|| naturalCompare.caseInsensitive(a.data[2], b.data[2])
			;
	});
}
