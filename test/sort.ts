/**
 * Created by user on 2018/4/14/014.
 */

import * as Promise from 'bluebird';
import * as fs from "fs";
import load, { parseLine, stringifyLine, serialize } from '../lib/loader/line';
import { parseLine as parseLineSegment, serialize as serializeSegment } from '../lib/loader/segment';

import UString from "uni-string";

let fa = [];

let sa = Promise.map([
	'../dict/segment/dict.txt',
	'../dict/segment/dict2.txt',
	'../dict/segment/dict3.txt',
		'../dict/segment/dict4.txt',
	'../dict/segment/names.txt',
	//'../dict/segment/wildcard.txt',

		//'../dict/segment/jieba/jieba.txt',
		//'../dict/segment/jieba/jieba2.txt',
		//'../dict/segment/jieba/jieba3.txt',

], async function (file)
{
	let b = await load(file);

	b = b.filter(function (line)
	{
		let data = parseLineSegment(line);

		if (0 && UString.size(data[0]) == 1)
		{

			fa.push({
				data,
				line,
			});

			return false;
		}

		if (data[1] & 0x40)
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

	fs.writeFileSync(file, serialize(b));

	console.log(file);

	return b;
})
	.tap(function ()
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

		fs.writeFileSync('./temp/one.txt', serialize(fa));
	})
;
