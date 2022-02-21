/**
 * Created by user on 2018/4/19/019.
 */

import { IDictRow } from '@novel-segment/loaders/segment/index';
import { IWord } from '@novel-segment/types';
import { cloneDeep } from 'lodash';

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

	public TABLE: IDICT<T> = Object.create(null);
	public TABLE2: any | IDICT2<T> = Object.create(null);

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

		this._init();
	}

	_init()
	{
		Object.setPrototypeOf(this.TABLE, null);
		Object.setPrototypeOf(this.TABLE2, null);
	}

	protected _exists<U extends IWord | IDictRow | string>(data: U, ...argv)
	{
		let w: string;

		if (typeof data === 'string')
		{
			w = data;
		}
		else if (Array.isArray(data))
		{
			[w] = data;
		}
		else
		{
			({ w } = data as IWord);
		}

		return w
	}

	public exists<U extends IWord | IDictRow | string>(data: U, ...argv)
	{
		const w = this._exists(data);

		return this.TABLE[w] || null;
	}

	public abstract add(data, ...argv): this

	protected abstract _add(data, ...argv)

	public remove?(data, ...argv): this
	protected _remove?(data, ...argv)

	public json(...argv): IDICT<T>
	{
		return cloneDeep(this.TABLE)
	}
	public stringify?(...argv): string

	public size(): number
	{
		return Object.keys(this.TABLE).length;
	}
}

export default AbstractTableDictCore;
