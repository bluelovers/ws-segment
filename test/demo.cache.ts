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
import jsdiff = require('diff');

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

當然，無論在哪個国家魔法陣都會被嚴格管理。比如說從Ａ地點轉移到Ｂ地點的情況下，在轉移之前先在Ｂ地點記錄本人的魔力印記是必須執行的步驟。
所以，雖說是要從Ａ地點支付高額的使用費轉移到Ｂ地點，但如果是沒有登記的人或許可被取消的人則不能進行轉移。根據情況的不同，甚至有可能會被卷進時空的夾隙，從而無法回到現世，是以相當程度的風險博取高回報的手段。而這次喬伊事先在亞拉進行記錄，目的在於利用地下城內無人管理的轉移魔法陣回去的樣子。
雖說乍一看是個盡是好事的計劃……

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

if (changed)
{
	console.success(diff_log(text, output_text));
}
else
{
	console.log(output_text);
}

console.gray("------------------");

let output_text2 = cn2tw_min(output_text);

if (output_text == output_text2)
{
	//console.gray(output_text2);
}
else
{
	console.log(diff_log(output_text, output_text2));

	//console.log(output_text2);

	console.gray("------------------");
}

console.timeEnd(`doSegment`);

console.debug(prettyuse());

function diff_log(src_text: string, new_text: string): string
{
	let diff = jsdiff.diffChars(src_text, new_text);

	let diff_arr = diff
		.reduce(function (a, part)
		{
			let color = part.added ? 'green' :
				part.removed ? 'red' : 'grey';

			let t = console[color].chalk(part.value);

			a.push(t);

			return a;
		}, [])
	;

	return diff_arr.join('');
}
