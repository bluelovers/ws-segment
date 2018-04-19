/**
 * Created by user on 2018/4/19/019.
 */

import { IDICT_SYNONYM, IWord } from '../Segment';
import { IDictRow } from 'segment-dict/lib/loader/segment';
import CjkConv from 'cjk-conv';
import { text_list } from '../util/cjk';
import AbstractTableDictCore, { IDICT, IDICT2, IOptions } from './core';
import { TableDictSynonymPanGu } from './synonym.pangu';

/**
 * 請注意 這與原版 node-segment 的格式不同
 *
 * 原版為一對一 => 錯字,正字
 * 這裡為一對多 並且順序與原版相反 => 正字,錯字,...以,分隔更多字
 */
export class TableDictSynonym extends TableDictSynonymPanGu
{

	add(data: [string, string] & string[], skipExists?: boolean)
	{
		if (!Array.isArray(data) || data.length < 2)
		{
			throw new TypeError(JSON.stringify(data));
		}

		let w = this._trim(data.shift());

		if (!w)
		{
			throw new TypeError(JSON.stringify(data));
		}

		let self = this;

		data.forEach(function (bw, index)
		{
			bw = self._trim(bw);

			if (!bw)
			{
				if (index == 0)
				{
					throw new TypeError();
				}

				return;
			}

			if (skipExists && self.exists(bw))
			{
				return;
			}

			self._add(bw, w);

			skipExists = true;
		});

		return this;
	}

}

export default TableDictSynonym
