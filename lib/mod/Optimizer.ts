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
		return this._doMethod('doOptimize', words, mods, ...argv);
	}
}

export default Optimizer;
