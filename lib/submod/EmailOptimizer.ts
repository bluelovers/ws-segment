'use strict';

import { SubSModule, SubSModuleOptimizer, ISubOptimizerCreate } from '../mod';
import { Segment, IWord, IDICT } from '../Segment';
import UString from 'uni-string';

/**
 * 邮箱地址中允许出现的字符
 * 参考：http://www.cs.tut.fi/~jkorpela/rfc/822addr.html
 */
export const _EMAILCHAR = '!"#$%&\'*+-/0123456789=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`abcdefghijklmnopqrstuvwxyz{|}~.'.split('');
export const EMAILCHAR: IDICT<number> = {};
for (let i in _EMAILCHAR) EMAILCHAR[_EMAILCHAR[i]] = 1;

/**
 * 邮箱地址识别优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
export class EmailOptimizer extends SubSModuleOptimizer
{

	/**
	 * 对可能是邮箱地址的单词进行优化
	 *
	 * @param {array} words 单词数组
	 * @return {array}
	 */
	doOptimize(words)
	{
		const POSTAG = this.segment.POSTAG;
		//debug(words);

		let i = 0;
		let ie = words.length - 1;
		let addr_start: boolean | number = false;
		let has_at = false;

		while (i < ie)
		{
			let word = words[i];
			let is_ascii = ((word.p == POSTAG.A_NX) ||
				(word.p == POSTAG.A_M && word.w.charCodeAt(0) < 128))
				? true : false;

			// 如果是外文字符或者数字，符合电子邮件地址开头的条件
			// @ts-ignore
			if (addr_start === false && is_ascii)
			{
				addr_start = i;
				i++;
				continue;
			}
			else
			{
				// 如果遇到@符号，符合第二个条件
				if (has_at === false && word.w == '@')
				{
					has_at = true;
					i++;
					continue;
				}
				// 如果已经遇到过@符号，且出现了其他字符，则截取邮箱地址
				if (has_at !== false && words[i - 1].w != '@' && is_ascii === false && !(word.w in EMAILCHAR))
				{
					let mailws = words.slice(addr_start, i);
					//debug(toEmailAddress(mailws));
					words.splice(addr_start, mailws.length, {
						w: this.toEmailAddress(mailws),
						p: POSTAG.URL
					});
					i = <number>addr_start + 1;
					ie -= mailws.length - 1;
					addr_start = false;
					has_at = false;
					continue;
				}
				// 如果已经开头
				if (addr_start !== false && (is_ascii || word.w in EMAILCHAR))
				{
					i++;
					continue;
				}
			}

			// 移到下一个词
			addr_start = false;
			has_at = false;
			i++;
		}

		// 检查剩余部分
		if (addr_start && has_at && words[ie])
		{
			let word = words[ie];
			let is_ascii = ((word.p == POSTAG.A_NX) ||
				(word.p == POSTAG.A_M && word.w in EMAILCHAR))
				? true : false;
			if (is_ascii)
			{
				let mailws = words.slice(addr_start, words.length);
				//debug(toEmailAddress(mailws));
				words.splice(addr_start, mailws.length, {
					w: this.toEmailAddress(mailws),
					p: POSTAG.URL
				});
			}
		}

		return words;
	}

	/**
	 * 根据一组单词生成邮箱地址
	 *
	 * @param {array} words 单词数组
	 * @return {string}
	 */
	toEmailAddress(words: IWord[])
	{
		let ret = words[0].w;
		for (let i = 1, word; word = words[i]; i++)
		{
			ret += word.w;
		}
		return ret;
	}

}

export const init = EmailOptimizer.init.bind(EmailOptimizer) as ISubOptimizerCreate<EmailOptimizer>;

export default EmailOptimizer;
