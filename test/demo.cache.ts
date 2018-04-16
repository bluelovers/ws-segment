/**
 * Created by user on 2018/4/15/015.
 */

import Segment, { POSTAG } from '../index';
import { useDefault, getDefaultModList } from '../lib';
import * as fs from "fs";

const segment = new Segment({
	autoCjk: true,
});

let cache_file = './temp/cache.db';

let options = {
	/**
	 * 開啟 all_mod 才會在自動載入時包含 ZhtSynonymOptimizer
	 */
	//all_mod: true,
};

console.time(`讀取模組與字典`);

/**
 * 使用緩存的字典檔範例
 */
if (1 && fs.existsSync(cache_file))
{
	console.log(`發現 ./temp/cache.db 開始載入字典`);

	let data = JSON.parse(fs.readFileSync(cache_file).toString());

	useDefault(segment, {
		...options,
		nodict: true,
	});

	segment.DICT = data.DICT;

	segment.inited = true;

	cache_file = null;
}
else
{
	segment.autoInit(options);

	let db_dict = segment.getDictDatabase('TABLE');
	console.log('主字典總數', db_dict.size());
}

console.timeEnd(`讀取模組與字典`);

if (cache_file)
{
	console.log(`緩存字典 ./temp/cache.db`);

	fs.writeFileSync(cache_file, JSON.stringify({
		DICT: segment.DICT,
	}));
}

console.time(`doSegment`);

let text = `李三买一张三角桌子`;

let ret = segment.doSegment(text);

ret.map(add_info);

fs.writeFileSync('./temp/c1.json', JSON.stringify({
	ret,
}, null, "\t"));

console.dir(ret, {
	colors: true,
});

console.timeEnd(`doSegment`);

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
