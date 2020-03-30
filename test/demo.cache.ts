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


;

segment
//	.addBlacklist('領民間')
;

console.time(`doSegment`);

let text = `

在二十年前左右還發生几起坍塌

最基本的類型是將八條腿的蟑螂稍微修長后上半身彎曲起身的類型。

「什麼情況!?」
「降落伞打开了,但是由于受到冲击哪里出现了裂缝。」

相当大的冲搫来了。急忙解开安全带,准备从救生艇里出来。
要带的东西有背包、脉冲步枪、镭射枪、装了处理器模块的袋子、制服、清洁室用的工作服、毛毯两卷。行李真不错。

但是,在心中卻注意到了。確實搜索隊會有。但是,別說這個行星,就連這個星系都能發現的概率非常低。
司令部知道航行日程。搜索將以跳出宇宙為中心進行吧。但是中途跳躍出界了,應該很難找到這個星區。
與預想相反,緊急用固體食品非常潮濕,非常好吃。囗渴

變焦的臉看起來很丑。一臉穨廢,吊起來的眼睛,尖銳的耳朵等,非常醜陋的長相。

能夠突入大氣層的約占全體的八成。軌道太差,有二成被捲入了倉庫區域的爆炸中。

应用于超宽带穿墙雷达的极窄脉冲发生器设计

鉑，化學元素，俗稱白金，化學符號為Pt，原子序為78。鉑密度高、延展性高、反應性低的灰白色貴金屬，屬於過渡金屬。 鉑同屬於鉑系元素和10族元素。它共有六種自然產生的同位素。鉑是地球地殼中罕見的元素，豐度排在第71名

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

