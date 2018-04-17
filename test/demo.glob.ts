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

			let text = await fs.readFile(path.join(cwd, file)) as any as string;

			text = crlf(text.toString());

			let ks = await segment.doSegment(text);

			let text_new = segment.stringify(ks);

			let ks2 = debug_token(ks);

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
