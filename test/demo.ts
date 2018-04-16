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

segment.autoInit(); // 需要加速的話 參考 demo.cache 內的範例

/**
 * 自動處理 `里|裏|后`
 */
segment.use('zhtSynonymOptimizer');

console.timeEnd();

let db_dict = segment.getDictDatabase('TABLE');

db_dict.options.autoCjk = true;

console.time();

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

console.log(db_dict.size());

console.timeEnd();

console.time();

export let rs = [
	/*
	[/.[裏里后]|[后裏里]./, function ($0, offset, input, ...argv)
	{
		let self = this as IWord;

		// 方位词
		if (self.p & POSTAG.D_F)
		{
			console.log($0, self.w, argv);

			return $0
				.replace(/[裏里]/, '裡')
				.replace(/后/, '後')
				;
		}

		return input;
	}],
	*/
] as any as [RegExp, IReplaceValue][];

rs = rs.map(function (data)
{
	data[0] = new zhRegExp(data[0]);

	return data;
});

console.timeEnd();

let text = `李三买一张三角桌子`;

//console.time();
//
//lazyFix(text);
//console.log(1);
//
//console.timeEnd();

let file: string;
let change = false;

if (1)
{
	file = 'D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel/user_out/ウォルテニア戦記/0004 ザルーダ王国激闘編/第11話【西へ】其2.txt';

	text = fs.readFileSync(file).toString();

	text = crlf(text);
}

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

let text_new = segment.stringify(ks);

change = text != text_new;

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

fs.writeFileSync('./temp/s_out.txt', text_new);

export function add_info(v)
{
	if (v.p)
	{
		v.ps = POSTAG.chsName(v.p);
		v.ps_en = POSTAG.enName(v.p);

		// @ts-ignore
		v.pp = '0x' + v.p.toString(16).padStart(4, '0').toUpperCase();

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
		.map(function (data, index, arr)
		{
			return data;

			rs.some(function (r)
			{
				// @ts-ignore
				let fn = typeof r[1] == 'function' ? function (...argv)
				{
					return (r[1] as (...argv) => string)
						.apply(data, argv.concat(data, index, arr))
						;
				} : r[1];

				let w = data.w.replace(r[0], fn as any);

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
