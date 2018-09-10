/**
 * Created by user on 2018/4/15/015.
 */

import { crlf } from 'crlf-normalize';
import Segment, { POSTAG } from '../index';
import { useDefault, getDefaultModList } from '../lib';
import * as fs from "fs";
import { IWordDebug } from '../lib/util/debug';
import { createSegment } from './lib';
import { debug_token } from '../lib/util'
import { getDictMain } from './lib/index';
import { cn2tw_min } from 'cjk-conv/lib/zh/convert/min';
import prettyuse = require('prettyuse');
import { console } from 'debug-color2';

let file: string;
let DEBUG_EACH: boolean;

//DEBUG_EACH = true;

//file = 'D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel/wenku8/OVERLORD不死者之王/00110_短篇/00010_剧场版 特典小说 昴宿星团的一日.txt';

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
	.add(['l10n', POSTAG.A_NX, 0])
	.add(['i18n', POSTAG.A_NX, 0])
	//.add(['像', 0x141000, 20000])
	//.add(['建筑', 0x000000, 0])
	//.add(['發现', 0x1000, 10000])
;

console.time(`doSegment`);

let text = `

像是切出的黑曜石與不知名的金屬，用放出燐光的謎之物質做成高７～８美加，直徑３０～４０美加巨大的環狀列石群

`;

text = text.replace(/^\s+|\s+$/g, '');

if (file)
{
	text = fs.readFileSync(file).toString()
}

let ret: IWordDebug[];

if (DEBUG_EACH)
{
	ret = text
		.split(/([\n\p{Punctuation}])/u)
		.reduce(function (a, line)
		{
			console.dir(line);

			let r = segment.doSegment(line);

			a.push(...r);

			return a;
		}, [])
	;
}
else
{
	ret = segment.doSegment(text);
}

//console.log(ret);

debug_token(ret);

let output_text = segment.stringify(ret);

let changed = crlf(text.toString()) !== output_text;

if (changed)
{
	console.red(`changed: ${changed}`);
}

fs.writeFileSync('./temp/c1.json', JSON.stringify({

	changed,

	ret,
}, null, "\t"));

fs.writeFileSync('./temp/c1.txt', output_text);

console.gray("------------------");

console.log(output_text);

console.gray("------------------");

console.log(cn2tw_min(output_text));

console.gray("------------------");

console.timeEnd(`doSegment`);

console.debug(prettyuse());
