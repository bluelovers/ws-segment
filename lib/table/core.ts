/**
 * Created by user on 2018/4/19/019.
 */

import { IWord } from '../Segment';
import { IDictRow } from 'segment-dict/lib/loader/segment';
import CjkConv from 'cjk-conv';
import { text_list } from '../util/cjk';
import { ITableDictRow } from './dict';

export type IOptions = {
	autoCjk?: boolean,
}

export interface IDICT<T = any>
{
	[key: string]: T,
}

export interface IDICT2<T = any>
{
	[key: number]: IDICT<T>,
}

export interface ITableDictExistsTable<T>
{
	TABLE?: IDICT<T>,
	TABLE2?: any | IDICT2<T>,
}

export abstract class AbstractTableDictCore<T>
{
	public static type: string;
	public type: string;

	public TABLE: IDICT<T> = {};
	public TABLE2: any | IDICT2<T> = {};

	public options: IOptions;

	constructor(type: string, options: IOptions = {}, existsTable?: ITableDictExistsTable<T>, ...argv)
	{
		this.type = type;

		this.options = Object.assign({}, this.options, options);

		if (existsTable)
		{
			if (existsTable.TABLE)
			{
				this.TABLE = existsTable.TABLE;
			}

			if (existsTable.TABLE2)
			{
				this.TABLE2 = existsTable.TABLE2;
			}
		}
	}

	protected _exists<U extends IWord | IDictRow | string>(data: U, ...argv)
	{
		let w, p, f;

		if (typeof data == 'string')
		{
			w = data;
		}
		else if (Array.isArray(data))
		{
			[w, p, f] = data;
		}
		else
		{
			({ w, p, f } = data as IWord);
		}

		return w
	}

	public exists<U extends IWord | IDictRow | string>(data: U, ...argv)
	{
		let w = this._exists(data);

		return this.TABLE[w] || null;
	}

	public abstract add(data, ...argv): this

	protected abstract _add(data, ...argv)

	public remove?(data, ...argv): this
	protected _remove?(data, ...argv)

	public json?(...argv): IDICT<T>
	public stringify?(...argv): string

	public size(): number
	{
		return Object.keys(this.TABLE).length;
	}
}

export default AbstractTableDictCore;
