import {
	Worker,
	isMainThread,
	parentPort,
	workerData,
	threadId,
	MessageChannel,
	MessagePort,
} from 'worker_threads';
import lineByLine = require('n-readlines');
import ProjectConfig from '../project.config';
import * as path from "upath2";
import { IDictRow, parseLine as parseLineSegment, serialize as serializeSegment } from '@novel-segment/loaders/segment/index';
import UString from 'uni-string';
import { getCjkName, zhDictCompare } from '@novel-segment/util';
import { transliterate as tr, slugify as slugifyTr } from 'transliteration';
import fs = require('fs-extra');
import Bluebird = require('bluebird');
import { cjk2zhs, cjk2zht } from 'cjk-conv';
import StrUtil = require('str-util');
import { sync as FastGlobSync } from 'fast-glob';
import { chkLineType, EnumLineType, ILoadDictFileRow2 } from 'segment-dict/script/util';
import { array_unique } from 'array-hyper-unique';
import { serialize } from '@novel-segment/loader-line';
import { console, chalkByConsole } from 'debug-color2';
import { greedyTableReplace } from 'cjk-conv/lib/zh/table/greedy';
import libTable from 'cjk-conv/lib/zh/table';
import { gitDiffStagedFile } from '@git-lazy/diff-staged';
import { matchGlob } from '@git-lazy/util/util/match';

let CWD = path.join(ProjectConfig.temp_root);

const enum EnumC1
{
	char = 'char',
	other = 'other',
	eng = 'eng',
}

const CWD_SAVETO = path.join(CWD, 'cache');

if (0 && (!fs.pathExistsSync(path.join(CWD, 'stringify.txt')) || !matchGlob(gitDiffStagedFile(CWD), [
	'cache.db.info.json'
]).length))
{
	process.exit();
}

if (isMainThread)
{
	log("This is the main thread", threadId);

	let workerOptions = {
		workerData: {
			time: new Date,
			//count: 0,
			//re: /   /ig,
		},
	};

	let w1 = new Worker(__filename, workerOptions);
	//let w2 = new Worker(__filename, workerOptions);

//	const subChannel = new MessageChannel();
//
//	w2.postMessage({
//		hereIsYourPort: subChannel.port1
//	}, [subChannel.port1]);
//	w1.postMessage({
//		hereIsYourPort: subChannel.port2
//	}, [subChannel.port2]);

	let timeDiff: Date;

	fs.removeSync(CWD_SAVETO);

	w1.on('message', (msg) =>
	{

		timeDiff = msg.timeDiff;

		//console.dir(msg);

		log(msg.index, msg.list.length);

		let cache = {
			char: [],
			other: [],
			eng: [],
		} as {
			[k in EnumC1 | string]: string[];
		};

		{
			let i = 'a'.codePointAt(0);
			let j = 'z'.codePointAt(0);

			while (i <= j)
			{
				cache[String.fromCodePoint(i)] = [];

				i++;
			}
		}

		cache = msg.list.reduce(function (cache, cur)
		{

			// @ts-ignore
			let { c1, line } = cur;

			cache[c1] = cache[c1] || [];

			cache[c1].push(Buffer.from(line).toString());

			return cache
		}, cache)
		;

		Object.entries(cache).forEach(async function ([c1, ls])
		{
			if (!/^[a-z0-9]$/i.test(c1))
			{
				c1 = '0/' + c1;
			}

			let file = path.join(CWD_SAVETO, c1 + '.txt');

			fs.ensureFileSync(file);

			if (!ls.length)
			{
				return;
			}

			return fs.appendFileSync(file, ls.join('\n') + '\n')
		});

		//fs.appendFile()

	});

	w1.on('error', e => console.error(console));
	w1.on('exit', (code) =>
	{

		let bool = true;

		try
		{
			let i = timeDiff.getTime() - workerOptions.workerData.time.getTime();

			log(i, timeDiff);
		}
		catch (e)
		{
			bool = false;
		}

		if (bool)
		{
			let ls = FastGlobSync([
				'**/*.txt'
			], {
				cwd: CWD_SAVETO,
				absolute: true,
			}).sort();

			let file2 = path.join(CWD, 'stringify.sorted.txt');

			fs.ensureFileSync(file2);
			fs.truncateSync(file2);

			let i2 = ls.reduce((a, file: string) => {

				log('[start]', path.relative(CWD_SAVETO, file));

				const liner = new lineByLine(file);
				let line: Buffer;

				let index = 0;

				let list: ILoadDictFileRow2[] = [];

				while (line = liner.next())
				{
					let s = line.toString();
					let data = parseLineSegment(s);
					let [w, p, f] = data;

					let cur: ILoadDictFileRow2 = {
						// @ts-ignore
						data,
						line: s,
						index: index++,
						c1: EnumC1.other as string,
						line_type: chkLineType(s),
						cjk_id: getCjkName(w),
					};

					list.push(cur);

					a++;
				}

				list = SortList( list);

				let out_list = list.map(v => v.line);

				out_list = array_unique(out_list);

				let out_data = serialize(out_list);

				fs.outputFileSync(file, out_data + "\n\n");

				fs.appendFileSync(file2, out_data + "\n");

				log('[done]', path.relative(CWD_SAVETO, file));

				return a;
			}, 0);

			log(i2)
		}

		if (code != 0)
		{
			console.error(new Error(`Worker stopped with exit code ${code}`))
		}
		else
		{
			log(`Worker stopped`)
		}
	});

}
else
{
//	parentPort.once('message', (value) => {
//		value.hereIsYourPort.postMessage('hello');
//		value.hereIsYourPort.on('message', msg => {
//			console.log(`thread ${threadId}: receive ${msg}`);
//		});
//	});

	//the worker's code

	console.dir(workerData, {
		colors: true,
	});

//	log(workerData.re.test(' '));

	let file = path.join(CWD, 'stringify.txt');

	const liner = new lineByLine(file);

	let line: Buffer;
	let lineNumber = 0;
	let count = 0;

	let c1_old: string;

	let list = [];

	while (line = liner.next())
	{
		//console.log('Line ' + lineNumber + ': ' + line.toString('ascii'));

		let index = lineNumber++;

		let data = parseLineSegment(line.toString());

		let cur = {
			data,
			line,
			index,
			c1: EnumC1.other as string,
		};

		let [w, p, f] = cur.data;

		let len = UString.size(w);

		let c1_now: string;

		if (len > 1)
		{
			c1_now = getCid(w);

			if (!c1_now)
			{
				console.log(c1_now, w);

				throw new Error(`${w}, ${c1_now}`);
			}
		}
		else if (len === 1)
		{
			c1_now = EnumC1.char;
		}
		else
		{
			c1_now = EnumC1.other;
		}

		cur.c1 = c1_now;

		if (count >= 10000)
		{
			parentPort.postMessage({

				index,
				list,

			});

			list = [];

			count = 0;
		}

		list.push(cur);

		c1_old = c1_now;

		count++;
	}

	log('end of line reached', lineNumber);

	workerData.count = lineNumber;

	parentPort.postMessage({
		timeDiff: new Date,
		index: lineNumber,
		list,
	});

}

function log(...argv)
{
	console.log(`[thread:${threadId}]`, ...argv);
}

function getCid(w: string)
{
	w = UString.slice(w, 0, 1).toLocaleLowerCase();

	if (/^[a-z0-9]$/i.test(w))
	{
		return EnumC1.eng;
	}

	let s = getCjkName(w);

	let r = slugifyTr(s);

	if (!r)
	{
		r = slugifyTr(greedyTableReplace(s));
	}

	if (!r)
	{
		let arr = libTable.auto(s, {
			safe: false,
			greedyTable: 2,
		});

		if (arr.length)
		{
			r = slugifyTr(arr[1] || arr[0]);
		}
	}

	if (!r)
	{
		let arr = libTable.auto(w, {
			safe: false,
			greedyTable: 2,
		});

		if (arr.length)
		{
			r = slugifyTr(arr[1] || arr[0]);
		}
	}

	if (!r)
	{
		r = slugifyTr(cjk2zhs(s));
	}

	if (!r)
	{
		r = slugifyTr(cjk2zht(s));
	}

	if (!r)
	{
		r = slugifyTr(cjk2zhs(w));
	}

	if (!r)
	{
		r = slugifyTr(cjk2zht(w));
	}

	if (!r)
	{
		r = slugifyTr(w);
	}

	if (!r)
	{
		r = w;
	}

	let r2 = UString.slice(r, 0, 1);

	if (!/^[a-z0-9]$/i.test(r2))
	{
		r2 = EnumC1.other;
	}

	return r2.toLocaleLowerCase()
}

function SortList<T = ILoadDictFileRow2>(ls: T[])
{
	// @ts-ignore
	return ls.sort(function (a: ILoadDictFileRow2, b: ILoadDictFileRow2)
	{
		if (
			a.line_type == EnumLineType.COMMENT_TAG
			|| b.line_type == EnumLineType.COMMENT_TAG
		)
		{
			return (a.index - b.index);
		}
		else if (
			a.line_type == EnumLineType.COMMENT
			|| b.line_type == EnumLineType.COMMENT
		)
		{
			return (a.index - b.index);
		}

		let ret = zhDictCompare(a.cjk_id, b.cjk_id)
			|| (a.index - b.index)
			|| 0
		;

		return ret;
	})
}
