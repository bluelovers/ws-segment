/**
 * Created by user on 2018/4/14/014.
 */

import * as Promise from 'bluebird';
import * as fs from "fs-extra";
import load, { parseLine, stringifyLine, serialize } from '../lib/loader/line';
import { IDictRow, parseLine as parseLineSegment, serialize as serializeSegment } from '../lib/loader/segment';

import UString from "uni-string";
import FastGlob from "fast-glob";
import * as path from "path";
import { console } from "debug-color2";

import ProjectConfig from "../project.config";

let fa = [];

let cwd = path.join(ProjectConfig.dict_root, 'segment');

export type ICUR_WORD_DATA = [string, number, number];

export interface ICUR_WORD
{
	data: [string, number, number],
	line: string,
	file: string,
}

let CACHE_TABLE = {} as {
	[k: string]: ICUR_WORD[];
};
let CACHE_FILE_TABLE = {} as {
	[k: string]: ICUR_WORD[];
};

Promise
	.resolve(FastGlob([

		'*.txt',
		'**/*.txt',

		'dict*.txt',
		'names.txt',
		'area/pangu.txt',

		'pangu/*.txt',

	], {
		cwd: cwd,
		absolute: true,

		ignore: [
			'char*',
			'**/skip',
			'**/jieba',
			'**/lazy',
			'**/synonym',
			'**/names',
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
	.map(async function (file: string)
	{
		let _basepath = path.relative(cwd, file);

		let b = await load(file);

		CACHE_FILE_TABLE[file] = [];

		b = b.filter(function (line)
		{
			let data = parseLineSegment(line) as ICUR_WORD_DATA;

			let bool: boolean;

			let [w, p, f] = data;

			let CUR_WORD = {
				data,
				line,
				file,
			};

			CACHE_FILE_TABLE[file].push(CUR_WORD);

			CACHE_TABLE[w] = CACHE_TABLE[w] || [];

			CACHE_TABLE[w].push(CUR_WORD);

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

		b = b.filter(function ({ data, line })
		{
			//let data = parseLineSegment(line);

			let bool: boolean;

			let [w, p, f] = data;

			if (0 && UString.size(data[0]) == 1)
			{

				fa.push({
					data,
					line,
				});

				return false;
			}

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
				}
			}

			if (1 && !bool && w.indexOf('，'))
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

			if (0 && w != '博物馆' && w.match(/博物馆/))
			{
				bool = true;
			}

			if (0 && data[1] & 0x08)
			{
				bool = true;
			}

			if (bool)
			{
				fa.push({
					data,
					line,
				});

				return false;
			}

			return true;
		});

		let c = b
			.map(v => v.line)
		;

		c.sort();

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

		fa = fa.map(function (d)
		{
			return d.line;
		});

		if (0)
		{
			fa.sort();
		}

		await fs.outputFile(path.join(ProjectConfig.temp_root, 'one.txt'), serialize(fa) + "\n\n");
	})
;
