'use strict';

/**
 * 中文人名识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */

import CHS_NAMES, { FAMILY_NAME_1, FAMILY_NAME_2, SINGLE_NAME, DOUBLE_NAME_1, DOUBLE_NAME_2 } from './CHS_NAMES';
import Segment, { IWord } from '../Segment';
import { debug } from '../util';

/** 模块类型 */
export const type = 'tokenizer';

export let segment: Segment;

/**
 * 模块初始化
 *
 * @param {Segment} segment 分词接口
 */
export function init(_segment)
{
	segment = _segment;
}

/**
 * 对未识别的单词进行分词
 *
 * @param {array} words 单词数组
 * @return {array}
 */
export function split(words: IWord[]): IWord[]
{
	let POSTAG = segment.POSTAG;
	let ret: IWord[] = [];
	for (let i = 0, word; word = words[i]; i++)
	{
		if (word.p > 0)
		{
			ret.push(word);
			continue;
		}
		// 仅对未识别的词进行匹配
		let nameinfo = matchName(word.w);
		if (nameinfo.length < 1)
		{
			ret.push(word);
			continue;
		}
		// 分离出人名
		let lastc = 0;
		for (let ui = 0, url; url = nameinfo[ui]; ui++)
		{
			if (url.c > lastc)
			{
				ret.push({ w: word.w.substr(lastc, url.c - lastc) });
			}
			ret.push({ w: url.w, p: POSTAG.A_NR });
			lastc = url.c + url.w.length;
		}
		let lastn = nameinfo[nameinfo.length - 1];
		if (lastn.c + lastn.w.length < word.w.length)
		{
			ret.push({ w: word.w.substr(lastn.c + lastn.w.length) });
		}
	}
	return ret;
}

// ======================================================================
/**
 * 匹配包含的人名，并返回相关信息
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @return {array}  返回格式   {w: '人名', c: 开始位置}
 */
export function matchName(text: string, cur = 0): IWord[]
{
	if (isNaN(cur)) cur = 0;
	let ret: IWord[] = [];
	while (cur < text.length)
	{
		//debug('cur=' + cur + ', ' + text.charAt(cur));
		let name: string = null;
		// 复姓
		let f2 = text.substr(cur, 2);
		if (f2 in FAMILY_NAME_2)
		{
			let n1 = text.charAt(cur + 2);
			let n2 = text.charAt(cur + 3);
			if (n1 in DOUBLE_NAME_1 && n2 in DOUBLE_NAME_2)
			{
				name = f2 + n1 + n2;
			}
			else if (n1 in SINGLE_NAME)
			{
				name = f2 + n1 + (n1 == n2 ? n2 : '');
			}
		}
		// 单姓
		let f1 = text.charAt(cur);
		if (name === null && f1 in FAMILY_NAME_1)
		{
			let n1 = text.charAt(cur + 1);
			let n2 = text.charAt(cur + 2);
			if (n1 in DOUBLE_NAME_1 && n2 in DOUBLE_NAME_2)
			{
				name = f1 + n1 + n2;
			}
			else if (n1 in SINGLE_NAME)
			{
				name = f1 + n1 + (n1 == n2 ? n2 : '');
			}
		}
		// 检查是否匹配成功
		if (name === null)
		{
			cur++;
		}
		else
		{
			ret.push({ w: name, c: cur });
			cur += name.length;
		}
	}
	return ret;
}
// debug(matchName('刘德华和李娜娜、司马光、上官飞飞'));
// debug(matchName('李克'));

import * as self from './ChsNameTokenizer';
export default self;
