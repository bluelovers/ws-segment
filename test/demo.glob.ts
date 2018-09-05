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
import { debug_token } from '../lib/util';
import { createSegment } from './lib';
import { getDictMain } from './lib/index';
import * as JsDiff from 'diff';
//import * as JSON from 'circular-json';
import prettyuse = require('prettyuse');
import { console } from 'debug-color2';

let NO_DEBUG = false;

let path_root = 'D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel';

let pathMain = 'user';
let pathMain_out;
let novelID: string;

pathMain_out = 'cm_out';
//pathMain_out = 'user';
//pathMain = 'cm';

pathMain = 'wenku8';

novelID = 'OVERLORD不死者之王';

NO_DEBUG = true;

let cwd = _path(pathMain, novelID);
let cwd_out = _path((pathMain_out || pathMain + '_out'), novelID);

const segment = createSegment();

let db_dict = getDictMain(segment);

/**
 * 最後一個參數的數字是代表權重 數字越高 越優先
 */
db_dict
	//.add(['在這裡', POSTAG.D_F, 0])
	//.add(['人名', POSTAG.A_NR, 0])
	//.add(['地名', POSTAG.A_NS, 0])
	//.add(['机构团体', POSTAG.A_NT, 0])
	//.add(['名词', POSTAG.D_N, 0])
	//.add(['錯字', POSTAG.BAD, 0])
;

Promise
	.resolve(FastGlob([

	'**/*.txt',

	//'00020_第２章　聖竜王の角/*.txt',

	//'!*６５*.txt',

], {
	cwd: cwd,
	//absolute: true,
}) as any as Promise<string[]>)
	.tap(function (ls)
	{
		if (ls.length == 0)
		{
			return Promise.reject(`沒有搜尋到任何檔案 請檢查搜尋條件`);
		}
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

			let text = await fs.readFile(path.join(cwd, file)) as any as string;

			text = crlf(text.toString());

			if (!text.replace(/\s+/g, ''))
			{
				console.warn('[skin]', label);

				return {
					file,
					changed: false,
					exists: true,
				};
			}

			let _now = Date.now();

			let ks = await segment.doSegment(text);

			let timeuse = Date.now() - _now;

			let text_new = segment.stringify(ks);

			let ks2 = debug_token(ks);

			//console.log('[done]', file);

			//console.timeEnd(label);

			let changed = text_new != text;

			if (NO_DEBUG)
			{
				if (changed)
				{
					console.warn('[changed]', label);

					await fs.outputFile(path.join(cwd_out, file), text_new);
				}
			}
			else
			{
				await fs.writeFile(path.join(cwd_out, file) + '.json', JSON.stringify({
					file,
					changed,
					timeuse,
					ks,
				}, null, "\t"));

				fs.writeFileSync(path.join(cwd_out, file) + '.2.json', JSON.stringify({
					file,
					changed,
					timeuse,
					ks2,
				}, null, "\t"));

				if (changed)
				{
					console.warn('[changed]', label);

					await fs.outputFile(path.join(cwd_out, file) + '.patch', JsDiff.createPatch(path.basename(file), text, text_new, {
						newlineIsToken: true
					}));
				}
			}

			console.log(prettyuse());
			freeGC();

			if (changed)
			{

			}
			else
			{
				console.log('[done]', label);
			}

			text_new = undefined;
			text = undefined;

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

export function freeGC()
{
	if (global && typeof global.gc === 'function')
	{
		try
		{
			global.gc();
		}
		catch (e)
		{
			console.error(e);
		}
	}
}
