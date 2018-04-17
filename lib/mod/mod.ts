/**
 * Created by user on 2018/2/21/021.
 */

import { IWord, Segment } from '../Segment';

export type ISModuleType = 'optimizer' | 'tokenizer' | string;

export class SModule implements ISModule
{
	type?: ISModuleType;
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
	static type: ISModuleType;
	type: ISModuleType;
	segment: Segment;

	priority?: number;

	inited?: boolean;

	constructor(type?: ISModuleType, segment?: Segment, ...argv)
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
	type?: ISModuleType,
	segment: Segment,
}

export interface IModuleStatic<T = ISModule>
{
	new (segment: Segment): T,
}

export interface ISubSModule
{
	type: ISModuleType,
	segment: Segment,

	priority?: number;

	init(segment: Segment, ...argv): ISubSModule,
}

import * as self from './mod';
export default self;
