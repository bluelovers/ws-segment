import { IDICT_SYNONYM, IWord } from '../Segment';
import { IDictRow, stringifyLine } from '@novel-segment/loader-line';
import { cloneDeep } from '../util';
import AbstractTableDictCore, { IDICT, IDICT2, IOptions } from './core';

/**
 * 原版 node-segment 的格式
 */
export abstract class TableDictLine extends AbstractTableDictCore<boolean>
{
	public exists(data, ...argv)
	{
		let w = this._exists(data);

		let bool = this.TABLE[w];

		return typeof bool === 'boolean' ? bool : null
	}

	add(word: string | string[])
	{
		let self = this;

		if (Array.isArray(word))
		{
			word.forEach(v => self._add(v))
		}
		else
		{
			self._add(word);
		}

		return this;
	}

	_add(word: string)
	{
		word = word.trim();

		if (word)
		{
			this.TABLE[word] = true;
		}
	}

	remove(word: string)
	{
		let self = this;
		self._remove(word);

		return this;
	}

	_remove(word: string)
	{
		delete this.TABLE[word]
	}

	json()
	{
		return cloneDeep(this.TABLE)
	}

	stringify(LF = "\n")
	{
		let self = this;

		return Object.entries(self.TABLE)
			.reduce(function (a, [w, bool])
			{
				if (bool)
				{
					let line = stringifyLine(w);
					a.push(line);
				}

				return a
			}, [])
			.join(typeof LF === 'string' ? LF : "\n")
			;
	}
}

export default TableDictLine
