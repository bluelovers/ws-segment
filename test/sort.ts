/**
 * Created by user on 2018/4/14/014.
 */

import * as Promise from 'bluebird';
import * as fs from "fs-extra";
import load, { parseLine, stringifyLine, serialize } from '../lib/loader/line';
import { parseLine as parseLineSegment, serialize as serializeSegment } from '../lib/loader/segment';

import UString from "uni-string";
import FastGlob from "fast-glob";
import * as path from "path";
import ProjectConfig from "../project.config";

let fa = [];

let cwd = path.join(ProjectConfig.dict_root, 'segment');

Promise
	.resolve(FastGlob([

		'dict*.txt',
		'names.txt',
		'area/pangu.txt',

	], {
		cwd: cwd,
		absolute: true,
	}))
	.tap(function (ls: string[])
	{
		let a = ls.reduce(function (a, v)
		{
			let p = path.relative(cwd, v);

			a.push(p);

			return a;
		}, []);

		//console.log(a);
	})
	.map(async function (file: string)
	{
		let b = await load(file);

		b = b.filter(function (line)
		{
			let data = parseLineSegment(line);

			let bool: boolean;

			if (0 && UString.size(data[0]) == 1)
			{

				fa.push({
					data,
					line,
				});

				return false;
			}

			if (data[0].match(/.大学/))
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

		b.sort();

		await fs.writeFile(file, serialize(b));

		console.log(file);

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

		if (1)
		{
			fa.sort();
		}

		await fs.writeFileSync(path.join(ProjectConfig.temp_root, 'one.txt'), serialize(fa));
	})
;
