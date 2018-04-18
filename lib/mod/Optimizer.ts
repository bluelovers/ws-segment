/**
 * 优化模块管理器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';

import { autobind } from 'core-decorators';
import { Segment, IWord } from '../Segment';
import { ISubSModule, SModule, SubSModule } from './mod';

export type ISubOptimizer = ISubSModule & {
	type: 'optimizer',
	doOptimize(words: IWord[], ...argv): IWord[],
}

export type ISubOptimizerCreate<T extends SubSModuleOptimizer, R extends SubSModuleOptimizer = SubSModuleOptimizer> = {
	(segment: Segment, ...argv): T & R,
};

@autobind
// @ts-ignore
export class SubSModuleOptimizer extends SubSModule implements ISubOptimizer
{
	public static readonly type = 'optimizer';
	public readonly type = 'optimizer';

	public doOptimize(words: IWord[], ...argv): IWord[]
	{
		throw new Error();
	}

	public init(segment: Segment, ...argv)
	{
		super.init(segment, ...argv);

		return this;
	}

	public static init<T extends SubSModuleOptimizer = SubSModuleOptimizer>(segment: Segment, ...argv): T
	{
		// @ts-ignore
		return super.init<T>(segment, ...argv);
	}
}

/**
 * 分词模块管理器
 */
export class Optimizer extends SModule
{
	type = 'optimizer';

	/**
	 * 对一段文本进行分词
	 *
	 * @param {array} words 单词数组
	 * @param {array} modules 分词模块数组
	 * @return {array}
	 */
	doOptimize(words: IWord[], mods: ISubOptimizer[], ...argv): IWord[]
	{
		// 按顺序分别调用各个mod来进行分词 ： 各个mod仅对没有识别类型的单词进行分词
		mods.forEach(function (mod)
		{
			words = mod.doOptimize(words, ...argv);
		});
		return words;
	}
}

export default Optimizer;
