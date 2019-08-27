/**
 * Created by user on 2018/4/15/015.
 */

import { crlf } from 'crlf-normalize';
import Segment, { POSTAG } from '../index';
import { useDefault, getDefaultModList } from '../lib';
import fs = require("fs-extra");
import { IWordDebug } from '../lib/util/debug';
import { createSegment } from './lib';
import { debug_token } from '../lib/util'
import { getDictMain } from './lib/index';
import { cn2tw_min, tw2cn_min } from 'cjk-conv/lib/zh/convert/min';
import prettyuse = require('prettyuse');
import { console, chalkByConsole } from 'debug-color2';
import jsdiff = require('diff');
import { IStylesColorNames } from 'debug-color2/lib/styles';

let file: string;
let DEBUG_EACH: boolean;

//DEBUG_EACH = true;

//file = 'C:/Home/link/dist_novel/h/在喪屍橫行的世界裡唯獨我不被襲擊/00020_第三章　市役所/00380_038　【晚宴】.txt';

console.log(Segment.versions);

const segment = createSegment(true, {
	nodeNovelMode: true,
});

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
	//.add(['l10n', POSTAG.A_NX, 0])
	//.add(['i18n', POSTAG.A_NX, 0])
//.add(['像', 0x141000, 20000])
//.add(['建筑', 0x000000, 0])
//.add(['發现', 0x1000, 10000])

	//.add(['身影', 0x100000, 10000])

//.add(['黑發', 0x100000, 1000])
//	.add(['超',0x08001000,1760])
//	.add(['公主抱',0x1000,0])
//	.add(['是以',0x8000000,0])
//	.add(['壓制',0x1000,1000])
//	.add(['在干的',0x18801000,500])
//	.add(['面包',0x100000, 800])
//	.add(['之间',0x2100000, 1000])
//	.add(['干吗',0x802000, 0])
//	.add(['聖域',0x108000, 2000])
//	.add(['全',0x48101000, 159])
//	.add(['全體表示',0x001000, 10000])
//	.add(['范',0x40100080, 5000])
//	.add(['七人',0x100000, 500])
//	.add(['意外',0x101000, 3000])
//	.add(['民兵團',0x0100000, 2000])
//	.add(['團團',0x8000000, 0])
//	.add(['重要',0x001000, 2000])
//	.add(['长剑',0x100000,2100])
//	.add(['仿製品',0x100000,11000])
//	.add(['擦干',0x1000,100])

;

segment
//	.addBlacklist('領民間')
;

console.time(`doSegment`);

let text = `

簡直象是完全不同的存在的手一樣。

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

	return chalkByConsole(function (chalk, _console)
	{
		let diff_arr: string[] = diff
			.reduce(function (a: string[], part)
			{
				let color: IStylesColorNames = part.added ? 'green' :
					part.removed ? 'red' : 'grey';

				let t = chalk[color](part.value);

				a.push(t);

				return a;
			}, [])
		;

		return diff_arr.join('');
	});
}

