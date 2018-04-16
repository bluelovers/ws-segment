/**
 * Created by user on 2018/2/21/021.
 */

import { IWord, Segment } from './Segment';

export class SModule implements ISModule
{
	type?: string;
	segment: Segment;
	/**
	 * @param {Segment} segment 分词接口
	 */
	constructor(segment: Segment)
	{
		this.segment = segment;
	}
}

export class SubSModule implements ISubSModule
{
	type: string;
	segment: Segment;

	priority?: number;

	constructor(type?: string, segment?: Segment, ...argv)
	{
		if (type)
		{
			this.type = type;
		}

		if (segment)
		{
			this.init(segment);
		}
	}

	static init(segment: Segment, ...argv)
	{
		let mod = new this();

		mod.init(segment, ...argv);

		return mod;
	}

	init(segment: Segment, ...argv): this
	{
		this.segment = segment;

		return this;
	}
}

export interface ISModule
{
	type?: string,
	segment: Segment,
}

export interface IModuleStatic<T = ISModule>
{
	new (segment: Segment): T,
}

export interface ISubSModule
{
	type: string,
	segment: Segment,

	priority?: number;

	init(segment: Segment, ...argv): ISubSModule,
}

import * as self from './module';
export default self;
