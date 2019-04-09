/**
 * 分词器接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */

'use strict';

// @ts-ignore
// @ts-ignore
import path = require('path');
import { searchFirstSync, searchGlobSync } from './fs/get';
import { useDefault } from './index';
import POSTAG from './POSTAG';
import TableDictBlacklist from './table/blacklist';
import AbstractTableDictCore from './table/core';
import { IOptions as IOptionsTableDict, TableDict } from './table/dict';

import Loader from './loader';
import { crlf } from 'crlf-normalize';
import { TableDictStopword } from './table/stopword';
import TableDictSynonym from './table/synonym';
import SegmentDict from 'segment-dict';
import { ISubOptimizer, ISubTokenizer, Optimizer, Tokenizer } from './mod';
import { debugToken } from './util/debug';
import { IWordDebug } from './util/index';

import ProjectConfig from '../project.config';

import deepmerge = require('deepmerge-plus');
import { EnumDictDatabase } from './const';
import { ENUM_SUBMODS, ENUM_SUBMODS_NAME, ENUM_SUBMODS_OTHER } from './mod/index';

/**
 * 创建分词器接口
 */
export class Segment
{

	static defaultOptionsDoSegment: IOptionsDoSegment = {};

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
		if ((autocreate || this.inited) && !this.db[type])
		{
			if (type == TableDictSynonym.type)
			{
				libTableDict = libTableDict || TableDictSynonym;
			}
			else if (type == TableDictStopword.type)
			{
				libTableDict = libTableDict || TableDictStopword;
			}
			else if (type == TableDictBlacklist.type)
			{
				libTableDict = libTableDict || TableDictStopword;
			}
			else
			{
				libTableDict = libTableDict || TableDict;
			}

			this.db[type] = new libTableDict(type, this.options, {
				TABLE: this.DICT[type],
			});
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
		else if (me.options && me.options.disableModules && me.options.disableModules.includes(mod))
		{
			console.warn(`can't use this mod, because it got disable: ${mod}`)
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

	_resolveDictFilename(name: string, pathPlus: string[] = [], extPlus: string[] = []): string | string[]
	{
		let options = {
			paths: [
				'',
				ProjectConfig.dict_root,

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
		};

		if (name.indexOf('*') != -1)
		{
			let ls = searchGlobSync(name, options);

			if (!ls || !ls.length)
			{
				throw Error(`Cannot find dict glob file "${name}".`);
			}

			return ls;
		}

		let filename = searchFirstSync(name, options);

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

		if (Array.isArray(filename))
		{
			let self = this;

			filename.forEach(v => this.loadDict(v, type, convert_to_lower, skipExists));

			//console.log(filename);

			return this;
		}

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

		data = undefined;

		this.inited = true;

		return this;
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

		if (Array.isArray(filename))
		{
			let self = this;

			filename.forEach(v => this.loadSynonymDict(v, skipExists));

			return this;
		}

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

		data = undefined;

		this.inited = true;

		return this;
	}

	protected _loadBlacklistDict(name: string, type: EnumDictDatabase)
	{
		let filename = this._resolveDictFilename(name, [
			path.resolve(SegmentDict.DICT_ROOT, 'blacklist'),
		]);

		if (Array.isArray(filename))
		{
			let self = this;

			filename.forEach(v => this._loadBlacklistDict(v, type));

			return this;
		}

		const db = this.getDictDatabase(type, true);

		const TABLE = this.DICT[type] = db.TABLE;

		let data = Loader.SegmentDict
			.requireLoaderModule('line')
			.loadSync(filename, {
				filter(line: string)
				{
					return line.trim();
				},
			})
		;

		data.forEach(v => db.add(v));

		data = undefined;

		this.inited = true;

		return this;
	}

	loadBlacklistDict(name: string)
	{
		return this._loadBlacklistDict(name, EnumDictDatabase.BLACKLIST)
	}

	loadBlacklistOptimizerDict(name: string)
	{
		return this._loadBlacklistDict(name, EnumDictDatabase.BLACKLIST_FOR_OPTIMIZER)
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

		if (Array.isArray(filename))
		{
			let self = this;

			filename.forEach(v => this.loadStopwordDict(v));

			return this;
		}

		const type = EnumDictDatabase.STOPWORD;

		const db = this.getDictDatabase(type, true);

		const TABLE = this.DICT[type] = db.TABLE;

		let data = Loader.SegmentDict
			.requireLoaderModule('line')
			.loadSync(filename, {
				filter(line: string)
				{
					return line.trim();
				},
			})
		;

		data.forEach(v => db.add(v));

		data = undefined;

		this.inited = true;

		return this;
	}

	/**
	 * 使用默认的识别模块和字典文件
	 * 在使用預設值的情況下，不需要主動呼叫此函數
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

	/**
	 * 此函數只需執行一次，並且一般狀況下不需要手動呼叫
	 */
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

	protected _get_text(text: string | Buffer): string
	{
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

		return text;
	}

	addBlacklist(word: string, remove?: boolean)
	{
		let me = this;

		this.autoInit(this.options);

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

		this.autoInit(this.options);

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
		let me = this;

		options = this.getOptionsDoSegment(options);

		let ret = {
			enable: {
				tokenizer: [] as ISubTokenizer[],
				optimizer: [] as ISubOptimizer[],
			},
			disable: {
				tokenizer: [] as ISubTokenizer[],
				optimizer: [] as ISubOptimizer[],
			},
		};

		if (options && options.disableModules)
		{
			me.modules.tokenizer
				.forEach(function (mod)
				{
					let bool: boolean;

					if (mod.name)
					{
						if (options.disableModules.includes(mod.name))
						{
							bool = true;
						}
					}
					else
					{
						if (options.disableModules.includes(mod as any))
						{
							bool = true;
						}
					}

					ret[bool ? 'disable' : 'enable'].tokenizer.push(mod);
				})
			;

			me.modules.optimizer
				.forEach(function (mod)
				{
					let bool: boolean;

					if (mod.name)
					{
						if (options.disableModules.includes(mod.name))
						{
							bool = true;
						}
					}
					else
					{
						if (options.disableModules.includes(mod as any))
						{
							bool = true;
						}
					}

					ret[bool ? 'disable' : 'enable'].optimizer.push(mod);
				})
			;
		}
		else
		{
			ret.enable.tokenizer = me.modules.tokenizer.slice();
			ret.enable.optimizer = me.modules.optimizer.slice();
		}

		return ret;
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

		//console.dir(options);

		this.autoInit(this.options);

		let text_list = this._get_text(text)
			// @ts-ignore
			.split(this.SPLIT)
		;
		text = undefined;

		const mods = this.listModules(options).enable;

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

		//const RAW = Symbol.for('RAW');

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
	stringify(words: Array<IWord | string>, ...argv): string
	{
		return Segment.stringify(words, ...argv);
	}

	static stringify(words: Array<IWord | string>, ...argv): string
	{
		return words.map(function (item)
		{
			if (typeof item === 'string')
			{
				return item;
			}
			else if ('w' in item)
			{
				return item.w;
			}
			else
			{
				throw new TypeError(`not a valid segment result list`)
			}
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

	export type ISPLIT = RegExp | string | {
		[Symbol.split](input: string, limit?: number): string[],
	};

	export type ISPLIT_FILTER = RegExp | {
		test(input: string): boolean,
	};

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

		all_mod?: boolean,

		maxChunkCount?: number,

		disableModules?: (ENUM_SUBMODS_NAME | unknown)[],
	};

	export type IDICT_SYNONYM = IDICT<string>;
	export type IDICT_STOPWORD = IDICT<boolean>;
	export type IDICT_BLACKLIST = IDICT<boolean>;

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

		/**
		 * 代表原生存在於字典內的項目
		 */
		s?: boolean,
		os?: boolean,
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

		disableModules?: (ENUM_SUBMODS_NAME | unknown)[],
	}
}

export import IOptionsSegment = Segment.IOptionsSegment;
export import IWord = Segment.IWord;
export import IOptionsDoSegment = Segment.IOptionsDoSegment;
export import IDICT_SYNONYM = Segment.IDICT_SYNONYM;
export import IDICT_STOPWORD = Segment.IDICT_STOPWORD;
export import IDICT_BLACKLIST = Segment.IDICT_BLACKLIST;

export import IDICT = Segment.IDICT;
export import IDICT2 = Segment.IDICT2;

export import ISPLIT = Segment.ISPLIT;
export import ISPLIT_FILTER = Segment.ISPLIT_FILTER;

export default Segment;
