/**
 * Created by user on 2018/4/16/016.
 */

import { IWord, Segment } from '../Segment';

import { $enum, EnumWrapper, } from "ts-enum-util";
import { Optimizer, SubSModuleOptimizer, ISubOptimizer } from './Optimizer';
import { Tokenizer, SubSModuleTokenizer, ISubTokenizer } from './Tokenizer';
import { SubSModule, ISubSModule } from './mod';

export { Optimizer, SubSModuleOptimizer, ISubOptimizer }
export { Tokenizer, SubSModuleTokenizer, ISubTokenizer }
export { SubSModule, ISubSModule }

/**
 * 识别模块
 * 强制分割类单词识别
 */
export enum ENUM_SUBMODS
{
	/**
	 * URL识别
	 */
	URLTokenizer = 'URLTokenizer',
	/**
	 * 通配符，必须在标点符号识别之前
	 */
	WildcardTokenizer = 'WildcardTokenizer',
	/**
	 * 标点符号识别
	 */
	PunctuationTokenizer = 'PunctuationTokenizer',
	/**
	 * 外文字符、数字识别，必须在标点符号识别之后
	 */
	ForeignTokenizer = 'ForeignTokenizer',
	// 中文单词识别
	/**
	 * 词典识别
	 */
	DictTokenizer = 'DictTokenizer',
	/**
	 * 人名识别，建议在词典识别之后
	 */
	ChsNameTokenizer = 'ChsNameTokenizer',

	// 优化模块
	/**
	 * 邮箱地址识别
	 */
	EmailOptimizer = 'EmailOptimizer',
	/**
	 * 人名识别优化
	 */
	ChsNameOptimizer = 'ChsNameOptimizer',
	/**
	 * 词典识别优化
	 */
	DictOptimizer = 'DictOptimizer',
	/**
	 * 日期时间识别优化
	 */
	DatetimeOptimizer = 'DatetimeOptimizer',

	/**
	 * 自動處理 `里|裏|后`
	 */
	ZhtSynonymOptimizer = 'ZhtSynonymOptimizer',
}

export const ENUM_SUBMODS_NOT_DEF = [
	ENUM_SUBMODS.ZhtSynonymOptimizer,
];

export const SUBMODS_LIST = $enum(ENUM_SUBMODS);

/**
 * 取得列表並且保持 ENUM 順序
 * @param {boolean} all
 * @returns {ENUM_SUBMODS[]}
 */
export function getDefault(all?: boolean): ENUM_SUBMODS[]
{
	let list = SUBMODS_LIST.getKeys();

	return Object.keys(ENUM_SUBMODS)
		.reduce(function (a, m)
		{
			if (!a.includes(m) && list.includes(m as any))
			{
				if (all || !ENUM_SUBMODS_NOT_DEF.includes(m as any))
				{
					a.push(m);
				}
			}

			return a;
		}, []);
}

//console.log(getDefault(true));

export default getDefault;
