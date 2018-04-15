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

let ret = segment.doSegment(`對索菲亞・諾伊蒙多來說，兒子──索馬・諾伊蒙多的存在是，可以被稱為天才的象征。

因自身立場身份，索菲亞有機會遇到各式各樣的人。
其中有壞人也有好人，有凡人也有天才。

從公爵家的千金開始，經過魔導學院，幾多戰場的奔波……不久，或是被稱為世界最強的魔導士等。
但是在那過程中與所遇到的每個人相比，自己的兒子更充滿著才能。
`);

console.dir(ret, {
	colors: true,
});

console.timeEnd();
