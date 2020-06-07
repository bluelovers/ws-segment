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
//	.add(['中长发',0x100000,2000])
//	.add(['內臟',0x100000,500])
//	.add(['進发',0x1000,1000])
//	.add(['发直',0x1000,4000])
	//.add(['否',0x101000,1000])
//	.add(['目的',0x108000,2000])
//	.add(['刻划',0x1000,4500])
//	.add(['故事',0x100000,1000])
//	.add(['被發現',0x1000,0])
//	.add(['様式',0x100000,9330])

;

segment
//	.addBlacklist('領民間')
;

console.time(`doSegment`);

let text = `

废柴以魔王之姿闯荡异世界 有时作弊一下的悠哉旅程[推一下!] \t[举报/报错] 
文库分类：Fami通文库 \t小说作者：蓝敦 \t文章状态：连载中 \t最后更新：2020-06-07 \t全文长度：803533字
\t作品热度：B级 ，当前热度上升指数为：A级

最近章节：
第七卷 插图

内容简介：
在对战竞技游戏终止营运的当天，吉城单挑打赢大魔王，并获得外挂般的能力值。当他再次醒来，却发现自己不仅身处从未见过的地方，还变成身著中二装备，一副魔王模样，名叫凯冯──这个他自己所创造的游戏角色！而且在满腔疑惑的他面前，出现了吉城的分身角色──妖精种族的露耶……!?在跟她一起生活后，他得知自己是流传于这个世界中，神话等级的英雄！以魔王之姿自在又横行的悠哉旅程展开序幕！


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

if (output_text === output_text2)
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

