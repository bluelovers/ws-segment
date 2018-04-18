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
	public static type: ISModuleType;
	public type: ISModuleType;
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

	public static init<T extends SubSModule = SubSModule>(segment: Segment, ...argv): T
	{
		// @ts-ignore
		return this._init(this, segment, ...argv);
	}

	protected static _init<T extends SubSModule>(libThis: IModuleStatic<T>, segment: Segment, ...argv): T
	{
		if (!libThis.type)
		{
			throw new Error()
		}

		let mod = new libThis(libThis.type, segment, ...argv);

		if (!mod.inited)
		{
			mod.init(segment, ...argv);
			mod.inited = true;
		}

		// @ts-ignore
		return mod;
	}

	public init(segment: Segment, ...argv)
	{
		this.segment = segment;
		this.inited = true;

		return this;
	}
}

export interface ISubSModuleMethod<T extends IWord, U extends IWord = T>
{
	(words: T[], ...argv): U[],
}

export interface ISubSModuleCreate<T extends SubSModule, R extends SubSModule = SubSModule>
{
	(segment: Segment, ...argv): T & R,
}

export interface ISModule
{
	type?: ISModuleType,
	segment: Segment,
}

export interface IModuleStatic<T extends ISModule | SubSModule>
{
	type: ISModuleType;

	new(type?: ISModuleType, segment?: Segment, ...argv): T,
	init(segment: Segment, ...argv): T,
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
