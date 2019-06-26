/**
 * 分词器接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */

'use strict';

// @ts-ignore
// @ts-ignore
import path = require('path');
import POSTAG from '../POSTAG';
import TableDictBlacklist from '../table/blacklist';
import AbstractTableDictCore from '../table/core';
import { IOptions as IOptionsTableDict, TableDict } from '../table/dict';

import Loader from '../loader';
import { crlf } from 'crlf-normalize';
import { TableDictStopword } from '../table/stopword';
import TableDictSynonym from '../table/synonym';
import SegmentDict from 'segment-dict';
import { ISubOptimizer, ISubTokenizer, Optimizer, Tokenizer } from '../mod/index';
import { debugToken } from '../util/debug';
import { IWordDebug } from '../util/index';

import deepmerge from 'deepmerge-plus/core';
import { EnumDictDatabase } from '../const';
import { ENUM_SUBMODS, ENUM_SUBMODS_NAME, ENUM_SUBMODS_OTHER } from '../mod/index';
import { defaultOptionsDoSegment } from './defaults';
import { IDICT, IDICT2, IDICT_BLACKLIST, IDICT_STOPWORD, IDICT_SYNONYM, IOptionsDoSegment, IOptionsSegment, ISPLIT, ISPLIT_FILTER, IWord } from './types';
import { stringify } from './methods/stringify';
import { split } from './methods/split';
import { indexOf } from './methods/indexOf';
import { convertSynonym, IConvertSynonymWithShowcount } from './methods/convertSynonym';
import { listModules } from './methods/listModules';
import { _get_text } from './methods/_get_text';
import { getOptionsDoSegment } from './methods/getOptionsDoSegment';
import { useModules } from './methods/useModules';
import {
	_doSegmentSimple,
	_doSegmentStripPOSTAG,
	_doSegmentStripSpace,
	_doSegmentStripStopword,
} from './methods/doSegment';
import { ITSOverwrite } from 'ts-type';


/**
 * 创建分词器接口
 */
export class SegmentCore
{

	/**
	 * 分段
	 *
	 * 由於 segment 是利用對內容的前後文分析來進行分詞
	 * 所以如何切割段落對於結果就會產生不同影響
	 *
	 * `RegExp` or 具有 `.[Symbol.split](input: string, limit?: number) => string[]` 的物件
	 *
	 * @type {Segment.ISPLIT}
	 */
	SPLIT: ISPLIT = /([\r\n]+|^[　\s+]+|[　\s]+$|[　\s]{2,})/gm as ISPLIT;

	/**
	 * 分段之後 如果符合以下條件 則直接忽略分析
	 * `RegExp` or 具有 `.test(input: string) => boolean` 的物件
	 *
	 * @type {Segment.ISPLIT_FILTER}
	 */
	SPLIT_FILTER: ISPLIT_FILTER = /^([\r\n]+)$/g as ISPLIT_FILTER;

	/**
	 * 词性
	 * @type {POSTAG}
	 */
	POSTAG = POSTAG;
	/**
	 * 词典表
	 * @type {{}}
	 */
	DICT: {
		STOPWORD?: IDICT_STOPWORD,
		SYNONYM?: IDICT_SYNONYM,

		[key: string]: IDICT,
	} = {};
	modules = {
		/**
		 * 分词模块
		 */
		tokenizer: [],
		/**
		 * 优化模块
		 */
		optimizer: [],
	} as {
		tokenizer: ISubTokenizer[],
		optimizer: ISubOptimizer[],
	};

	tokenizer: Tokenizer;
	optimizer: Optimizer;

	db: {
		[key: string]: TableDict,
	} = {};

	options: IOptionsSegment = {};

	inited?: boolean;

	constructor(options: IOptionsSegment = {})
	{
		const self = this;

		this.options = Object.assign({}, this.options, options);

		this.tokenizer = new Tokenizer(this as any);
		this.optimizer = new Optimizer(this as any);

		if (this.options.db)
		{
			this.options.db.forEach(function (data)
			{
				self.db[data.type] = data;
			});
		}

		delete this.options.db;
	}

	getDictDatabase<R extends TableDictSynonym>(type: EnumDictDatabase.SYNONYM,
		autocreate?: boolean,
		libTableDict?: { new(...argv): R },
	): R
	getDictDatabase<R extends TableDict>(type: EnumDictDatabase.TABLE, autocreate?: boolean, libTableDict?: { new(...argv): R }): R
	getDictDatabase<R extends TableDictStopword>(type: EnumDictDatabase.STOPWORD,
		autocreate?: boolean,
		libTableDict?: { new(...argv): R },
	): R
	getDictDatabase<R extends TableDictBlacklist>(type: EnumDictDatabase.BLACKLIST,
		autocreate?: boolean,
		libTableDict?: { new(...argv): R },
	): R
	getDictDatabase<R extends TableDictBlacklist>(type: EnumDictDatabase.BLACKLIST_FOR_OPTIMIZER,
		autocreate?: boolean,
		libTableDict?: { new(...argv): R },
	): R
	getDictDatabase<R extends AbstractTableDictCore<any>>(type: string | EnumDictDatabase,
		autocreate?: boolean,
		libTableDict?: { new(...argv): R },
	): R
	getDictDatabase(type: string, autocreate?: boolean, libTableDict?)
	{
		// @ts-ignore
		return this.db[type];
	}

	/**
	 * 载入分词模块
	 *
	 * @param {String|Array|Object} module 模块名称(数组)或模块对象
	 * @return {Segment}
	 */
	use(mod: ISubOptimizer, ...argv): this
	use(mod: ISubTokenizer, ...argv): this
	use(mod, ...argv): this
	use(mod, ...argv)
	{
		useModules(this, mod, ...argv);

		return this
	}

	/**
	 * 取词典表
	 *
	 * @param {String} type 类型
	 * @return {object}
	 */
	getDict(type: EnumDictDatabase.STOPWORD): IDICT_STOPWORD
	getDict(type: EnumDictDatabase.SYNONYM): IDICT_SYNONYM
	getDict(type: EnumDictDatabase.TABLE): IDICT<IWord>
	getDict(type: EnumDictDatabase.BLACKLIST): IDICT_BLACKLIST
	getDict(type: EnumDictDatabase.BLACKLIST_FOR_OPTIMIZER): IDICT_BLACKLIST
	getDict(type: 'TABLE2'): IDICT2<IWord>
	getDict(type: EnumDictDatabase): IDICT
	getDict(type): IDICT
	getDict(type)
	{
		return this.DICT[type];
	}

	getOptionsDoSegment<T extends IOptionsDoSegment>(options?: T): T
	{
		return getOptionsDoSegment<T>(options, this.options.optionsDoSegment)
	}

	protected _get_text(text: string | Buffer): string
	{
		return _get_text(text)
	}

	addBlacklist(word: string, remove?: boolean)
	{
		let me = this;

		const BLACKLIST = me.getDictDatabase(EnumDictDatabase.BLACKLIST);
		const TABLE = me.getDictDatabase(EnumDictDatabase.TABLE);

		let bool = !remove;

		if (bool)
		{
			BLACKLIST.add(word);
			TABLE.remove(word);
		}
		else
		{
			BLACKLIST.remove(word)
		}

		return this
	}

	/**
	 * remove key in TABLE by BLACKLIST
	 */
	doBlacklist()
	{
		let me = this;

		const BLACKLIST = me.getDict(EnumDictDatabase.BLACKLIST);
		const TABLE = me.getDictDatabase(EnumDictDatabase.TABLE);

		Object.entries(BLACKLIST)
			.forEach(function ([key, bool])
			{
				bool && TABLE.remove(key)
			})
		;

		return this
	}

	listModules(options: IOptionsDoSegment = {})
	{
		options = this.getOptionsDoSegment(options);

		return listModules(this.modules, options);
	}

	/**
	 * 开始分词
	 *
	 * @param {String} text 文本
	 * @param {Object} options 选项
	 *   - {Boolean} simple 是否仅返回单词内容
	 *   - {Boolean} stripPunctuation 去除标点符号
	 *   - {Boolean} convertSynonym 转换同义词
	 *   - {Boolean} stripStopword 去除停止符
	 * @return {Array}
	 */
	doSegment(text: string | Buffer, options: ITSOverwrite<IOptionsDoSegment, {
		simple: true,
	}>): string[]
	doSegment(text: string | Buffer, options?: IOptionsDoSegment): IWord[]
	doSegment(text, options: IOptionsDoSegment = {})
	{
		const me = this;

		options = me.getOptionsDoSegment(options);

		//console.dir(options);

		let text_list = me._get_text(text)
			// @ts-ignore
			.split(this.SPLIT)
		;
		text = undefined;

		const mods = me.listModules(options).enable;

		// 将文本按照换行符分割成多段，并逐一分词
		let ret = text_list.reduce(function (ret, section)
		{
			//console.dir(section);

			if (me.SPLIT_FILTER.test(section))
			{
				ret = ret.concat({ w: section });

				section = [];
			}

			//section = section.trim();
			if (section.length > 0)
			{
				// 分词
				let sret = me.tokenizer.split(section, mods.tokenizer);

				// 优化
				sret = me.optimizer.doOptimize(sret, mods.optimizer);

				// 连接分词结果
				if (sret.length > 0)
				{
					ret = ret.concat(sret);
				}
			}

			return ret;
		}, []);

		// 去除标点符号
		if (options.stripPunctuation)
		{
			ret = _doSegmentStripPOSTAG(ret, POSTAG.D_W)
		}

		if (options.convertSynonym)
		{
			ret = this.convertSynonym(ret);
		}

		// 去除停止符
		if (options.stripStopword)
		{
			ret = _doSegmentStripStopword(ret, me.getDict('STOPWORD'))
		}

		if (options.stripSpace)
		{
			ret = _doSegmentStripSpace(ret)
		}

		// 仅返回单词内容
		if (options.simple)
		{
			ret = _doSegmentSimple(ret)
		}

		return ret;
	}

	/**
	 * 转换同义词
	 */
	convertSynonym(ret: IWordDebug[], showcount: true): {
		count: number,
		list: IWordDebug[],
	}
	/**
	 * 转换同义词
	 */
	convertSynonym(ret: IWordDebug[], showcount?: boolean): IWordDebug[]
	convertSynonym(ret: IWordDebug[], showcount?: boolean)
	{
		return convertSynonym(ret, {
			showcount,
			DICT_SYNONYM: this.getDict('SYNONYM'),
			DICT_TABLE: this.getDict('TABLE'),
			POSTAG: this.POSTAG,
		}) as IWordDebug[] | IConvertSynonymWithShowcount;
	}

	/**
	 * 将单词数组连接成字符串
	 *
	 * @param {Array} words 单词数组
	 * @return {String}
	 */
	stringify(words: Array<IWord | string>, ...argv): string
	{
		return stringify(words, ...argv);
	}

	/**
	 * 将单词数组连接成字符串
	 *
	 * @param {Array} words 单词数组
	 * @return {String}
	 */
	static stringify(words: Array<IWord | string>, ...argv): string
	{
		return stringify(words, ...argv)
	}

	/**
	 * 根据某个单词或词性来分割单词数组
	 *
	 * @param {Array} words 单词数组
	 * @param {Number|String} s 用于分割的单词或词性
	 * @return {Array}
	 */
	split(words: IWord[], s: string | number, ...argv): IWord[]
	{
		return split(words, s, ...argv)
	}

	/**
	 * 在单词数组中查找某一个单词或词性所在的位置
	 *
	 * @param {Array} words 单词数组
	 * @param {Number|String} s 要查找的单词或词性
	 * @param {Number} cur 开始位置
	 * @return {Number} 找不到，返回-1
	 */
	indexOf(words: IWord[], s: string | number, cur?: number, ...argv)
	{
		return indexOf(words, cur, ...argv)
	}

}

export { IDICT, IDICT2, IDICT_BLACKLIST, IDICT_STOPWORD, IDICT_SYNONYM, IOptionsDoSegment, IOptionsSegment, ISPLIT, ISPLIT_FILTER, IWord }

export default SegmentCore;
