/**
 * Created by user on 2018/4/15/015.
 */

import { crlf, CRLF } from 'crlf-normalize';
import * as fs from "fs";
import { isRegExp, zhRegExp } from 'regexp-cjk';
import CjkConv from 'cjk-conv';
import Segment, { POSTAG } from '../index';
import { IWord } from '../lib/Segment';

export type IReplaceFn = (input: string, ...m: string[]) => string;
export type IReplaceValue = string | IReplaceFn;

const segment = new Segment({
	/**
	 * autoCjk: true 時全部無差別繁簡配對
	 *
	 * 可以在此處禁用
	 *
	 * 僅保留之後的 db_dict.options.autoCjk = true;
	 * 這樣一來只有之後 新增的才會自動配對繁簡
	 */
	autoCjk: true,
});

console.time();

segment.autoInit();

console.timeEnd();

let db_dict = segment.getDictDatabase('TABLE');

db_dict.options.autoCjk = true;

console.time();

db_dict
	//.add(['在這裡', POSTAG.D_F, 0])
	//.add(['人名', POSTAG.A_NR, 0])
	//.add(['地名', POSTAG.A_NS, 0])
	//.add(['机构团体', POSTAG.A_NT, 0])
	//.add(['名词', POSTAG.D_N, 0])
	//.add(['錯字', POSTAG.BAD, 0])
;

console.log(Object.keys(db_dict.TABLE).length);

console.timeEnd();

console.time();

export let rs = [
	[/.[裏里]|[裏里]./, function (input, $1)
	{
		let self = this as IWord;

		// 方位词
		if (self.p & POSTAG.D_F)
		{
			return input.replace(/[裏里]/g, '裡');
		}
		else
		{
			console.log();
		}

		return input;
	}],
] as any as [RegExp, IReplaceValue][];

rs = rs.map(function (data)
{
	data[0] = new zhRegExp(data[0]);

	return data;
});

console.timeEnd();

let text = `
为了报复【劍】之勇者，我将为此舍弃克亞罗之名，化身为楚楚之花──克婭萝菈。
因为我不打算将刹那和伊芙作为袭击的诱饵，所以我将以自身作为饵食来袭击并捕捉【劍】之勇者。

既然用上了克婭萝菈这个假名，也就是說……我将会披上女装，心情实在是忐忑不安。

（葛藤も恐怖もある。）

【劍】之勇者対于我来說就是一块心理阴影。
我対这种人进行女装勾引，打从心底里有严重的抵抗。
因为……因为我好害怕啊，但是就算如此，我也不得不硬着头皮上。
如果不从此刻克服対那家伙的心理阴影的話，就永远只会停留在原地，无法前行。
`;

//console.time();
//
//lazyFix(text);
//console.log(1);
//
//console.timeEnd();

let file: string;
let change = false;

file = 'D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel/cm_out/元最強の剣士は、異世界魔法に憧れる/p0001_無章節/c0003_憂鬱的嘆息.txt';

text = fs.readFileSync(file).toString();

console.time();

let ks = _lazyFix(text, true);
console.log(2);

console.timeEnd();

let ks2 = [];

ks.map(function (v, index)
{
	// @ts-ignore
	v.index = index;

	if (v.p)
	{
		add_info(v);
	}
	else
	{
		ks2.push(v);
	}
});

fs.writeFileSync('./temp/s1.json', JSON.stringify({
	file,
	change,
	ks,
}, null, "\t"));

fs.writeFileSync('./temp/s2.json', JSON.stringify({
	file,
	change,
	ks2,
}, null, "\t"));

fs.writeFileSync('./temp/s_out.txt', segment.stringify(ks));

export function add_info(v)
{
	if (v.p)
	{
		v.ps = POSTAG.chsName(v.p);
		// @ts-ignore
		v.pp = '0x' + v.p.toString(16).padStart(4, '0');

		if (v.m)
		{
			v.m.map(add_info);
		}
	}

	return v;
}

export function _lazyFix(text: string, bool?: boolean)
{
	let ks = segment
		.doSegment(text, {
			//stripPunctuation: true,
		})
		.map(function (data)
		{
			rs.some(function (r)
			{
				// @ts-ignore
				let fn = typeof r[1] == 'function' ? r[1].bind(data) : r[1];

				let w = data.w.replace(r[0], fn);

				if (w !== data.w)
				{
					// @ts-ignore
					data.ow = data.w;
					data.w = w;

					change = true;

					return true;
				}
			});

			return data;
		})
	;

	bool && console.log(ks);

	return ks;
}

export function lazyFix(text: string, bool?: boolean)
{
	let ks = _lazyFix(text, bool);

	return segment.stringify(ks);
}
