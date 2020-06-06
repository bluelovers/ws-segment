/**
 * Created by user on 2018/4/15/015.
 */

import { crlf, CRLF } from 'crlf-normalize';
import * as fs from "fs";
import { isRegExp, zhRegExp } from 'regexp-cjk';
import Segment, { POSTAG } from '../index';
import { IWord } from '../lib/Segment';

/**
 * 需要使用緩存來加速讀取字典的話 參考 demo.cache.ts 內的範例
 */
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

let text: string;
/**
 * 如果設定了 file , text 會被覆寫為 file 內容
 */
let file: string;
let change = false;

text = `李三买一张三角桌子`;

file = './res/ウォルテニア戦記/第11話【西へ】其2.txt';
file = './res/ウォルテニア戦記/第11話【西へ】其2_out.txt';

//file = './res/ウォルテニア戦記/第11話【西へ】其2_opencc.txt';
//file = './res/ウォルテニア戦記/第11話【西へ】其2_cn2tw.txt';

let rs = [
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

console.time(`讀取模組與字典`);

/**
 * @see 需要使用緩存來加速讀取字典的話 參考 demo.cache.ts 內的範例
 */
segment.autoInit();

/**
 * 自動處理 `里|裏|后`
 */
segment.use('ZhtSynonymOptimizer');

console.timeEnd(`讀取模組與字典`);

let db_dict = segment.getDictDatabase('TABLE');

db_dict.options.autoCjk = true;

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

console.log('主字典總數', db_dict.size());

rs = rs.map(function (data)
{
	data[0] = new zhRegExp(data[0]);

	return data;
});

if (file)
{
	text = fs.readFileSync(file).toString();
	text = crlf(text);
}

console.time(`doSegment`);

let ks = _lazyFix(text);

console.timeEnd(`doSegment`);

console.time(`write debug data`);

let ks2 = debug_info(ks);
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

console.timeEnd(`write debug data`);

function debug_info(ks)
{
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

	return ks2;
}

function add_info(v)
{
	if (v.p)
	{
		v.ps = POSTAG.zhName(v.p);
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

function _lazyFix(text: string, bool?: boolean)
{
	let ks = segment
		.doSegment(text, {
			//stripPunctuation: true,
		})
		.map(function (data, index, arr)
		{
			if (0)
			{
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
			}

			return data;
		})
	;

	bool && console.log(ks);

	return ks;
}

function lazyFix(text: string, bool?: boolean)
{
	let ks = _lazyFix(text, bool);

	return segment.stringify(ks);
}

type IReplaceFn = (input: string, ...m: string[]) => string;
type IReplaceValue = string | IReplaceFn;
