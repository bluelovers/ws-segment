/**
 * Created by user on 2018/4/15/015.
 */

import Segment, { POSTAG } from '../index';
import * as fs from "fs";

console.time();

const segment = new Segment({
	autoCjk: true,
});

let cache_file = './temp/cache.db';

/**
 * 使用緩存的字典檔範例
 */
if (1 && fs.existsSync(cache_file))
{
	let data = JSON.parse(fs.readFileSync(cache_file).toString());

	segment
	// 识别模块
	// 强制分割类单词识别
		.use('URLTokenizer')            // URL识别
		.use('WildcardTokenizer')       // 通配符，必须在标点符号识别之前
		.use('PunctuationTokenizer')    // 标点符号识别
		.use('ForeignTokenizer')        // 外文字符、数字识别，必须在标点符号识别之后
		// 中文单词识别
		.use('DictTokenizer')           // 词典识别
		.use('ChsNameTokenizer')        // 人名识别，建议在词典识别之后

		// 优化模块
		.use('EmailOptimizer')          // 邮箱地址识别
		.use('ChsNameOptimizer')        // 人名识别优化
		.use('DictOptimizer')           // 词典识别优化
		.use('DatetimeOptimizer')       // 日期时间识别优化
	;

	segment.DICT = data.DICT;

	segment.inited = true;

	cache_file = null;
}
else
{
	segment.autoInit();
}

if (cache_file)
{
	fs.writeFileSync(cache_file, JSON.stringify({
		DICT: segment.DICT,
	}));
}

let text = `李三买一张三角桌子`;

let ret = segment.doSegment(text);

ret.map(add_info);

fs.writeFileSync('./temp/c1.json', JSON.stringify({
	ret,
}, null, "\t"));

console.dir(ret, {
	colors: true,
});

console.timeEnd();

export function add_info(v)
{
	if (v.p)
	{
		v.ps = POSTAG.chsName(v.p);
		v.ps_en = POSTAG.enName(v.p);

		// @ts-ignore
		v.pp = '0x' + v.p.toString(16).padStart(4, '0');

		if (v.m)
		{
			v.m.map(add_info);
		}
	}

	return v;
}
