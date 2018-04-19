/**
 * 分词器接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */

'use strict';

// @ts-ignore
import * as fs from 'fs';
// @ts-ignore
import * as path from 'path';
import { searchFirst } from './fs/get';
import { useDefault } from './index';
import POSTAG from './POSTAG';
import AbstractTableDictCore from './table/core';
import { TableDict, IOptions as IOptionsTableDict, ITableDictRow } from './table/dict';

import Loader from './loader';
import { crlf, LF } from 'crlf-normalize';
import TableDictSynonym from './table/synonym';
import { debug, IWordDebugInfo } from './util';
import SegmentDict from 'segment-dict';
import getDefaultModList, { Optimizer, ISubOptimizer, Tokenizer, ISubTokenizer } from './mod';
import { debugToken } from './util/debug';
import { IWordDebug } from './util/index';

import * as deepmerge from 'deepmerge-plus';

/**
 * 创建分词器接口
 */
export class Segment
{

	static defaultOptionsDoSegment: IOptionsDoSegment = {};

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
		optimizer: []
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

		this.tokenizer = new Tokenizer(this);
		this.optimizer = new Optimizer(this);

		if (this.options.db)
		{
			this.options.db.forEach(function (data)
			{
				self.db[data.type] = data;
			});
		}

		delete this.options.db;
	}

	getDictDatabase<R extends TableDictSynonym>(type: 'SYNONYM',
		autocreate?: boolean,
		libTableDict?: { new(...argv): R }
	): R
	getDictDatabase<R extends TableDict>(type: 'TABLE', autocreate?: boolean, libTableDict?: { new(...argv): R }): R
	getDictDatabase<R extends AbstractTableDictCore<any>>(type: string,
		autocreate?: boolean,
		libTableDict?: { new(...argv): R }
	): R
	getDictDatabase(type: string, autocreate?: boolean, libTableDict?)
	{
		if (autocreate && !this.db[type])
		{
			if (type == 'SYNONYM')
			{
				libTableDict = libTableDict || TableDictSynonym;
			}
			else
			{
				libTableDict = libTableDict || TableDict;
			}

			this.db[type] = new libTableDict(type, this.options);
		}

		// @ts-ignore
		return this.db[type];
	}

	/**
	 * 载入分词模块
	 *
	 * @param {String|Array|Object} module 模块名称(数组)或模块对象
	 * @return {Segment}
	 */
	use(mod: ISubOptimizer, ...argv)
	use(mod: ISubTokenizer, ...argv)
	use(mod: Array<ISubTokenizer | ISubOptimizer | string>, ...argv)
	use(mod: string, ...argv)
	use(mod, ...argv)
	use(mod, ...argv)
	{
		let me = this;

		if (Array.isArray(mod))
		{
			mod.forEach(function (m)
			{
				me.use(m);
			});
		}
		else
		{
			if (typeof mod == 'string')
			{
				//console.log('module', mod);

				// @ts-ignore
				//let filename = path.resolve(__dirname, 'module', module + '.js');
				let filename = path.resolve(__dirname, 'submod', mod);

				// @ts-ignore
				mod = require(filename);
			}
			// 初始化并注册模块
			let c = mod.init(this, ...argv);

			if (typeof c !== 'undefined')
			{
				mod = c;
			}

			this.modules[mod.type].push(mod);
		}

		this.inited = true;

		return this;
	}

	_resolveDictFilename(name: string, pathPlus: string[] = [], extPlus: string[] = []): string
	{
		let filename = searchFirst(name, {
			paths: [
				'',
				// @ts-ignore
				path.resolve(__dirname, '../dicts'),
				...pathPlus,
				path.resolve(SegmentDict.DICT_ROOT, 'segment'),
			],
			extensions: [
				'',
				...extPlus,
				'.utf8',
				'.txt',
			],

			onlyFile: true,
		});

		if (!filename)
		{
			//console.log(name, pathPlus, extPlus);

			throw Error(`Cannot find dict file "${name}".`);
		}

		return filename;
	}

	/**
	 * 载入字典文件
	 *
	 * @param {String} name 字典文件名
	 * @param {String} type 类型
	 * @param {Boolean} convert_to_lower 是否全部转换为小写
	 * @return {Segment}
	 */
	loadDict(name: string, type?: string, convert_to_lower?: boolean, skipExists?: boolean)
	{
		let filename = this._resolveDictFilename(name);
		if (!type) type = 'TABLE';     // 默认为TABLE

		const db = this.getDictDatabase(type, true);

		const TABLE = this.DICT[type] = db.TABLE;
		const TABLE2 = this.DICT[type + '2'] = db.TABLE2;

		/*
		// 初始化词典
		if (!this.DICT[type]) this.DICT[type] = {};
		if (!this.DICT[type + '2']) this.DICT[type + '2'] = {};
		let TABLE = this.DICT[type];        // 词典表  '词' => {属性}
		let TABLE2 = this.DICT[type + '2']; // 词典表  '长度' => '词' => 属性
		*/
		// 导入数据
		const POSTAG = this.POSTAG;

		let data = Loader.SegmentDictLoader.loadSync(filename);

		data.forEach(function (data)
		{
			if (convert_to_lower)
			{
				data[0] = data[0].toLowerCase();
			}

			db.add(data, skipExists);

			/*
			let [w, p, f] = data;

			if (w.length == 0)
			{
				throw new Error()
			}

			TABLE[w] = { p, f, };
			if (!TABLE2[w.length]) TABLE2[w.length] = {};
			TABLE2[w.length][w] = TABLE[w];
			*/
		});

		this.inited = true;

		return this;
	}

	/**
	 * 取词典表
	 *
	 * @param {String} type 类型
	 * @return {object}
	 */
	getDict(type: 'STOPWORD'): IDICT_STOPWORD
	getDict(type: 'SYNONYM'): IDICT_SYNONYM
	getDict(type: 'TABLE'): IDICT<IWord>
	getDict(type: 'TABLE2'): IDICT2<IWord>
	getDict(type): IDICT
	getDict(type)
	{
		return this.DICT[type];
	}

	/**
	 * 载入同义词词典
	 *
	 * @param {String} name 字典文件名
	 */
	loadSynonymDict(name: string, skipExists?: boolean)
	{
		let filename = this._resolveDictFilename(name, [
			path.resolve(SegmentDict.DICT_ROOT, 'synonym'),
		]);

		let type = 'SYNONYM';

		const db = this.getDictDatabase(type, true);

		const TABLE = this.DICT[type] = db.TABLE;

		/*
		// 初始化词典
		if (!this.DICT[type]) this.DICT[type] = {};
		// 词典表  '同义词' => '标准词'
		let TABLE = this.DICT[type] as IDICT_SYNONYM;
		// 导入数据
		*/

		let data = Loader.SegmentSynonymLoader.loadSync(filename);

		data.forEach(function (blocks: string[])
		{
			db.add(blocks, skipExists);

			/*
			let [n1, n2] = blocks;

			TABLE[n1] = n2;
			if (TABLE[n2] === n1)
			{
				delete TABLE[n2];
			}
			*/
		});

		//console.log(TABLE);

		this.inited = true;

		return this;
	}

	/**
	 * 载入停止符词典
	 *
	 * @param {String} name 字典文件名
	 */
	loadStopwordDict(name: string)
	{
		let filename = this._resolveDictFilename(name, [
			path.resolve(SegmentDict.DICT_ROOT, 'stopword'),
		]);
		let type = 'STOPWORD';

		// 初始化词典
		if (!this.DICT[type]) this.DICT[type] = {};

		let TABLE = this.DICT[type] as IDICT_STOPWORD;
		// 导入数据

		let data = Loader.SegmentDict
			.requireLoaderModule('line')
			.loadSync(filename, {
				filter(line: string)
				{
					return line.trim();
				}
			})
		;

		data.forEach(function (line)
		{
			line = line.trim();
			if (line)
			{
				TABLE[line] = true;
			}
		});

		this.inited = true;

		return this;
	}

	/**
	 * 使用默认的识别模块和字典文件
	 *
	 * @return {Segment}
	 */
	useDefault(...argv)
	{
		useDefault(this, ...argv);

		this.inited = true;

		return this;

		/*
		this
			// 识别模块
			// 强制分割类单词识别
			.use('URLTokenizer')            // URL识别
			.use('WildcardTokenizer')       // 通配符，必须在标点符号识别之前
			.use('PunctuationTokenizer')    // 标点符号识别
			.use('ForeignTokenizer')        // 外文字符、数字识别，必须在标点符号识别之后
			// 中文单词识别
			.use('DictTokenizer')           // 词典识别
			.use('ChsNameTokenizer')        // 人名识别，建议在词典识别之后

			// 优化模块
			.use('EmailOptimizer')          // 邮箱地址识别
			.use('ChsNameOptimizer')        // 人名识别优化
			.use('DictOptimizer')           // 词典识别优化
			.use('DatetimeOptimizer')       // 日期时间识别优化

			// 字典文件
			//.loadDict('jieba') <=== bad file

			.loadDict('dict4')

			.loadDict('char')

			.loadDict('phrases')
			.loadDict('phrases2')

			.loadDict('dict')           // 盘古词典
			.loadDict('dict2')          // 扩展词典（用于调整原盘古词典）
			.loadDict('dict3')          // 扩展词典（用于调整原盘古词典）
			.loadDict('names')          // 常见名词、人名
			.loadDict('wildcard', 'WILDCARD', true)   // 通配符
			.loadSynonymDict('synonym')   // 同义词
			.loadStopwordDict('stopword') // 停止符

			.loadDict('lazy/badword')
			.loadDict('lazy/dict_synonym')

			.loadDict('names/en')
			.loadDict('names/jp')
			.loadDict('lazy/index')

		;

		this.inited = true;

		return this;
		*/
	}

	autoInit(options?: {
		all_mod?: boolean,
	})
	{
		if (!this.inited)
		{
			this.inited = true;

			if (!this.modules.tokenizer.length)
			{
				this.useDefault(options);
			}
		}

		return this;
	}

	getOptionsDoSegment<T extends IOptionsDoSegment>(options?: T): T
	{
		return Object.assign({},
			Segment.defaultOptionsDoSegment,
			this.options.optionsDoSegment,
			options,
		);
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
	doSegment(text: string | Buffer, options: IOptionsDoSegment & {
		simple: true,
	}): string[]
	doSegment(text: string | Buffer, options?: IOptionsDoSegment): IWord[]
	doSegment(text, options: IOptionsDoSegment = {})
	{
		let me = this;

		options = this.getOptionsDoSegment(options);

		this.autoInit();

		try
		{
			if (Buffer.isBuffer(text))
			{
				text = text.toString();
			}
		}
		catch (e)
		{}
		finally
		{
			if (typeof text != 'string')
			{
				throw new TypeError(`text must is string or Buffer`)
			}

			text = crlf(text);
		}

		const split_r = /([\r\n]+)/g;
		const filter_r = new RegExp('^(?:' + split_r.source + ')$', 'g');

		// 将文本按照换行符分割成多段，并逐一分词
		let ret = text.split(/([\r\n]+|^[　\s+]+|[　\s]+$|[　\s]{2,})/gm).reduce(function (ret, section)
		{
			if (filter_r.test(section))
			{
				ret = ret.concat({ w: section });

				section = [];
			}

			//section = section.trim();
			if (section.length > 0)
			{
				// 分词
				let sret = me.tokenizer.split(section, me.modules.tokenizer);

				// 优化
				sret = me.optimizer.doOptimize(sret, me.modules.optimizer);

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
			ret = ret.filter(function (item)
			{
				return item.p !== POSTAG.D_W;
			});
		}

		if (options.convertSynonym)
		{
			ret = this.convertSynonym(ret);
		}

		/*
		// 转换同义词
		function convertSynonym(list)
		{
			let count = 0;
			let TABLE = me.getDict('SYNONYM');
			list = list.map(function (item)
			{
				if (item.w in TABLE)
				{
					count++;
					//return { w: TABLE[item.w], p: item.p };

					item.ow = item.w;
					item.w = TABLE[item.w];

					return item;
				}
				else
				{
					return item;
				}
			});
			return { count: count, list: list };
		}

		if (options.convertSynonym)
		{
			let result;
			do
			{
				result = convertSynonym(ret);
				ret = result.list;
			}
			while (result.count > 0);
		}
		*/

		// 去除停止符
		if (options.stripStopword)
		{
			let STOPWORD = me.getDict('STOPWORD');
			ret = ret.filter(function (item)
			{
				return !(item.w in STOPWORD);
			});
		}

		if (options.stripSpace)
		{
			ret = ret.filter(function (item)
			{
				return !/^\s+$/g.test(item.w);
			});
		}

		// 仅返回单词内容
		if (options.simple)
		{
			ret = ret.map(function (item)
			{
				return item.w;
			});
		}

		return ret;
	}

	/**
	 * 转换同义词
	 */
	convertSynonym(ret: IWordDebug[], showcount: true): { count: number, list: IWordDebug[] }
	convertSynonym(ret: IWordDebug[], showcount?: boolean): IWordDebug[]
	convertSynonym(ret: IWordDebug[], showcount?: boolean)
	{
		const me = this;
		let TABLE = me.getDict('SYNONYM');
		let TABLEDICT = me.getDict('TABLE');

		let total_count = 0;

		const RAW = Symbol.for('RAW');

		// 转换同义词
		function _convertSynonym(list: IWordDebug[])
		{
			let count = 0;
			list = list.reduce(function (a, item: IWordDebug)
			{
				let bool: boolean;
				let w = item.w;
				let nw: string;

				let debug = debugToken(item);

				if (w in TABLE)
				{
					bool = true;
					nw = TABLE[w];
				}
				else if (debug.autoCreate && !debug.convertSynonym && !item.ow && item.m && item.m.length)
				{
					nw = item.m.reduce(function (a: string[], b)
					{
						if (typeof b == 'string')
						{
							a.push(b);
						}
						else if (b.w in TABLE)
						{
							a.push(TABLE[b.w]);
							bool = true;
						}
						else
						{
							a.push(b.w);
						}

						return a;
					}, []).join('');
				}

				if (bool)
				{
					count++;
					total_count++;
					//return { w: TABLE[item.w], p: item.p };

					let p = item.p;

					if (w in TABLEDICT)
					{
						p = TABLEDICT[w].p || p;
					}

					if (p & me.POSTAG.BAD)
					{
						p = p ^ me.POSTAG.BAD;
					}

					let item_new = debugToken({
						...item,

						w: nw,
						ow: w,
						p,
						op: item.p,

						//[RAW]: item,

						//source: item,
					}, {
						convertSynonym: true,
						//_source: item,

						/**
						 * JSON.stringify
						 * avoid TypeError: Converting circular structure to JSON
						 */
						_source: deepmerge({}, item) as IWordDebug,

					}, true);

					a.push(item_new);
				}
				else
				{
					a.push(item);
				}

				return a;
			}, []);
			return { count: count, list: list };
		}

		let result: { count: number, list: IWordDebug[] };
		do
		{
			result = _convertSynonym(ret);
			ret = result.list;
		}
		while (result.count > 0);

		if (showcount)
		{
			return { count: total_count, list: ret };
		}

		return ret;
	}

	/**
	 * 将单词数组连接成字符串
	 *
	 * @param {Array} words 单词数组
	 * @return {String}
	 */
	stringify(words: IWord[], ...argv): string
	{
		return Segment.stringify(words, ...argv);
	}

	static stringify(words: IWord[], ...argv): string
	{
		return words.map(function (item)
		{
			return item.w;
		}).join('');
	}

	/**
	 * 根据某个单词或词性来分割单词数组
	 *
	 * @param {Array} words 单词数组
	 * @param {Number|String} s 用于分割的单词或词性
	 * @return {Array}
	 */
	split(words: IWord[], s: string | number): IWord[]
	{
		let ret = [];
		let lasti = 0;
		let i = 0;
		let f = typeof s === 'string' ? 'w' : 'p';

		while (i < words.length)
		{
			if (words[i][f] == s)
			{
				if (lasti < i) ret.push(words.slice(lasti, i));
				ret.push(words.slice(i, i + 1));
				i++;
				lasti = i;
			}
			else
			{
				i++;
			}
		}
		if (lasti < words.length - 1)
		{
			ret.push(words.slice(lasti, words.length));
		}

		return ret;
	}

	/**
	 * 在单词数组中查找某一个单词或词性所在的位置
	 *
	 * @param {Array} words 单词数组
	 * @param {Number|String} s 要查找的单词或词性
	 * @param {Number} cur 开始位置
	 * @return {Number} 找不到，返回-1
	 */
	indexOf(words: IWord[], s: string | number, cur?: number)
	{
		cur = isNaN(cur) ? 0 : cur;
		let f = typeof s === 'string' ? 'w' : 'p';

		while (cur < words.length)
		{
			if (words[cur][f] == s) return cur;
			cur++;
		}

		return -1;
	}
}

export namespace Segment
{
	export interface IDICT<T = any>
	{
		[key: string]: T,
	}

	export interface IDICT2<T = any>
	{
		[key: number]: IDICT<T>,
	}

	export type IOptionsSegment = IOptionsTableDict & {
		db?: TableDict[],
		optionsDoSegment?: IOptionsDoSegment,
	};

	export type IDICT_SYNONYM = IDICT<string>;
	export type IDICT_STOPWORD = IDICT<boolean>;

	export interface IWord
	{
		w: string,
		/**
		 * 詞性
		 */
		p?: number,
		/**
		 * 詞性名稱
		 */
		ps?: string,
		pp?: string,
		/**
		 * 權重
		 */
		f?: number,
		/**
		 * 开始位置
		 */
		c?: number,
		/**
		 * 合併項目
		 */
		m?: Array<IWord | string>,

		//convertSynonym?: boolean,
		//autoCreate?: boolean,
	}

	export interface IOptionsDoSegment
	{
		/**
		 * 不返回词性
		 */
		simple?: boolean,

		/**
		 * 去除标点符号
		 */
		stripPunctuation?: boolean,

		/**
		 * 转换同义词
		 */
		convertSynonym?: boolean,

		/**
		 * 去除停止符
		 */
		stripStopword?: boolean,

		stripSpace?: boolean,
	}
}

export import IOptionsSegment = Segment.IOptionsSegment;
export import IWord = Segment.IWord;
export import IOptionsDoSegment = Segment.IOptionsDoSegment;
export import IDICT_SYNONYM = Segment.IDICT_SYNONYM;
export import IDICT_STOPWORD = Segment.IDICT_STOPWORD;

export import IDICT = Segment.IDICT;
export import IDICT2 = Segment.IDICT2;

export default Segment;
