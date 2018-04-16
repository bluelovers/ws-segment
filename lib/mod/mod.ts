/**
 * Created by user on 2018/2/21/021.
 */

import { IWord, Segment } from '../Segment';

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
	static type: string;
	type: string;
	segment: Segment;

	priority?: number;

	inited?: boolean;

	constructor(type?: string, segment?: Segment, ...argv)
	{
		if (type)
		{
			this.type = type;
		}

		if (!this.type)
		{
			throw new Error()
		}

		if (segment)
		{
			this.init(segment, ...argv);
			this.inited = true;
		}
	}

	static init(segment: Segment, ...argv)
	{
		if (!this.type)
		{
			throw new Error()
		}

		let mod = new this(this.type, segment, ...argv);

		if (!mod.inited)
		{
			mod.init(segment, ...argv);
			mod.inited = true;
		}

		return mod;
	}

	init(segment: Segment, ...argv): this
	{
		this.segment = segment;
		this.inited = true;

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

import * as self from './mod';
export default self;
