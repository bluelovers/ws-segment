import cacache = require('cacache');
import crlf from 'crlf-normalize';
import Segment, { stringify } from 'novel-segment';
import bluebird = require('bluebird');
import * as fs from 'fs-extra';
import { useDefault } from 'novel-segment/lib';
import { Cacache } from './lib/cache';
import { console, debugConsole, getCacheDirPath, enableDebug, freeGC } from './lib/util';
import PACKAGE_JSON = require('./package.json');
import { debug_token } from 'novel-segment/lib/util'
import * as iconv from 'iconv-jschardet';

let CACHED_SEGMENT: import("novel-segment/lib/Segment").Segment;
let CACHED_CACACHE: Cacache;

const DB_KEY = 'cache.db';
const DB_KEY_INFO = 'cache.info';
const DB_TTL = 3600 * 1000;

export { enableDebug, stringify }

export interface ISegmentCLIOptions
{
	/**
	 * 格式化分行符號
	 */
	crlf?: string | boolean,

	useGlobalCache?: boolean,
	disableCache?: boolean,

	disableWarn?: boolean,

	ttl?: number,
}

export function textSegment(text: string, options?: ISegmentCLIOptions)
{
	return getSegment(options)
		.then(function (segment)
		{
			return segment.doSegment(text);
		})
		.tap(function (data)
		{
			return debug_token(data)
		})
		;
}

export function fileSegment(file: string, options?: ISegmentCLIOptions)
{
	return bluebird.resolve(readFile(file))
		.then(function (buf)
		{
			return textSegment(buf.toString(), options);
		})
		;
}

export function processText(text: string, options?: ISegmentCLIOptions)
{
	if (!text.length || !text.replace(/\s+/g, '').length)
	{
		return bluebird.resolve('');
	}

	return textSegment(text, options)
		.then(function (data)
		{
			let text = stringify(data);
			if (options)
			{
				if (options.crlf)
				{
					if (typeof options.crlf === 'string')
					{
						text = crlf(text, options.crlf);
					}
					else
					{
						text = crlf(text);
					}
				}
			}

			freeGC();

			return text;
		})
		;
}

export function processFile(file: string, options?: ISegmentCLIOptions)
{
	return bluebird.resolve(readFile(file, options))
		.then(function (buf)
		{
			return processText(buf.toString(), options);
		})
		;
}

export class SegmentCliError extends Error
{

}

export function readFile(file: string, options?: ISegmentCLIOptions): bluebird<Buffer>
{
	return new bluebird<Buffer>((resolve, reject) =>
	{
		if (!fs.existsSync(file))
		{
			let e = new SegmentCliError(`ENOENT: no such file or directory, open '${file}'`);
			reject(e)
		}
		else
		{

			fs.readFile(file).then(resolve);
		}
	})
		.tap(function (buf)
		{
			if (options && options.disableWarn)
			{
				return;
			}

			if (!buf.length)
			{
				console.warn(`此檔案無內容`, file);
			}
			else
			{
				let chk = iconv.detect(buf);

				if (chk.encoding != 'UTF-8' && chk.encoding != 'ascii')
				{
					console.warn('此檔案可能不是 UTF8 請檢查編碼或利用 MadEdit 等工具轉換', chk, file);
				}
			}
		})
		;
}

export function fixOptions(options?: ISegmentCLIOptions): ISegmentCLIOptions
{
	options = options || {};

	if (typeof options.ttl !== 'number' || options.ttl < 1)
	{
		delete options.ttl;
	}

	return options;
}

export function getCacache(options?: ISegmentCLIOptions)
{
	return new bluebird<Cacache>(function (resolve, reject)
	{
		if (!CACHED_CACACHE)
		{
			if (options && options.useGlobalCache)
			{
				CACHED_CACACHE = new Cacache({
					name: PACKAGE_JSON.name,
					useGlobalCache: options.useGlobalCache,
				});
			}
			else
			{
				CACHED_CACACHE = new Cacache(PACKAGE_JSON.name);
			}
		}

		resolve(CACHED_CACACHE)
	});
}

export function resetSegment()
{
	CACHED_SEGMENT = void 0;
}

export function getSegment(options?: ISegmentCLIOptions)
{
	options = fixOptions(options);
	let { disableCache } = options;

	return bluebird
		.resolve()
		.then(async function ()
		{
			await getCacache(options);

			if (!CACHED_SEGMENT)
			{
				CACHED_SEGMENT = new Segment({
					autoCjk: true,

					optionsDoSegment: {

						convertSynonym: true,

					},

					all_mod: true,
				});

				let _options = {
					/**
					 * 開啟 all_mod 才會在自動載入時包含 ZhtSynonymOptimizer
					 */
					all_mod: true,
				};

				let _info = await loadCacheInfo(options);

				let version = {
					[PACKAGE_JSON.name]: PACKAGE_JSON.version,
					...Segment.versions,
					[PACKAGE_JSON.name]: PACKAGE_JSON.version,
				};

				let cache_db = await loadCacheDb(options);

				let _do_init: boolean;

				if (disableCache)
				{
					_do_init = true;
				}

				if (typeof _do_init == 'undefined'
					&& _info
					&& _info.current
					&& _info.current[PACKAGE_JSON.name]
				)
				{
					Object.keys(version)
						.some(key =>
						{
							let bool = _info[key] != version[key];

							if (bool)
							{
								debugConsole.debug(`本次執行的版本與上次緩存的版本不同`);
								_do_init = true;
							}

							return bool;
						})
					;
				}

				if (typeof _do_init == 'undefined' && cache_db)
				{
					if (cache_db.DICT)
					{
						debugConsole.debug(`載入緩存字典`);

						useDefault(CACHED_SEGMENT, {
							...options,
							nodict: true,
							all_mod: true,
						});

						CACHED_SEGMENT.DICT = cache_db.DICT;

						CACHED_SEGMENT.inited = true;

						_do_init = false;

						//console.dir(CACHED_SEGMENT.modules);
					}
				}

				if (typeof _do_init == 'undefined' || _do_init)
				{
					debugConsole.debug(`重新載入分析字典`);

					CACHED_SEGMENT.autoInit(_options);

					_do_init = true;
				}
				else
				{
					CACHED_SEGMENT
						.loadSynonymDict('synonym')
						.loadSynonymDict('zht.synonym')

						.loadBlacklistDict('blacklist')
						.loadBlacklistOptimizerDict('blacklist.name')
					;

					CACHED_SEGMENT.doBlacklist();
				}

				let db_dict = CACHED_SEGMENT.getDictDatabase('TABLE', true);
				db_dict.TABLE = CACHED_SEGMENT.DICT['TABLE'];
				db_dict.TABLE2 = CACHED_SEGMENT.DICT['TABLE2'];

				db_dict.options.autoCjk = true;

				//CACHED_SEGMENT.loadSynonymDict('synonym', true);

				let size_db_dict = db_dict.size();

				CACHED_SEGMENT.loadSynonymDict('synonym', true);

				let size_segment = Object.keys(CACHED_SEGMENT.getDict('SYNONYM')).length;

				debugConsole.debug('主字典總數', size_db_dict);
				debugConsole.debug('Synonym', size_segment);

				_info.last = Object.assign({}, _info.current);

				_info.current = {
					size_db_dict,
					size_segment,
					size_db_dict_diff: size_db_dict - (_info.last.size_db_dict || 0),
					size_segment_diff: size_segment - (_info.last.size_segment || 0),

					version,
				};

				debugConsole.debug(_info);

				if (!disableCache
					&& (_do_init || !cache_db || !cache_db.DICT)
				)
				{
					await CACHED_CACACHE.writeJSON(DB_KEY, {

						..._info,

						DICT: CACHED_SEGMENT.DICT,
					} as IDataCache);

					debugConsole.debug(`緩存字典於 ${DB_KEY}`, CACHED_CACACHE.cachePath);
				}

				freeGC();
			}

			return CACHED_SEGMENT;
		})
		;
}

export interface IDataCacheInfo
{
	size_db_dict?: number,
	size_segment?: number,
	size_db_dict_diff?: number,
	size_segment_diff?: number,

	version?: {
		'novel-segment-cli'?: string,
		'novel-segment'?: string,
		'segment-dict'?: string,
	},
}

export interface IDataCache
{
	last?: IDataCacheInfo,
	current?: IDataCacheInfo,
	DICT?: any,
}

export function loadCacheInfo(options?: ISegmentCLIOptions)
{
	return bluebird
		.resolve()
		.then(async function ()
		{
			await getCacache(options);

			let has_cache_db = await CACHED_CACACHE.hasData(DB_KEY_INFO);

			let data: IDataCache;

			if (has_cache_db)
			{
				data = await CACHED_CACACHE
					.readJSON<IDataCache>(DB_KEY_INFO)
					.then(function (ret)
					{
						return ret.json;
					})
				;
			}

			data = data || {};

			data.last = data.last || {};
			data.current = data.current || {};
			data.last.version = data.last.version || {};
			data.current.version = data.current.version || {};

			return data;
		})
		;
}

export function loadCacheDb(options?: ISegmentCLIOptions): bluebird<IDataCache>
{
	options = fixOptions(options);
	let { disableCache } = options;

	if (disableCache)
	{
		return bluebird
			.resolve(null)
			;
	}

	return bluebird
		.resolve()
		.then(async function ()
		{
			await getCacache(options);

			let has_cache_db = await CACHED_CACACHE.hasData(DB_KEY, {
				ttl: options.ttl > 0 ? options.ttl : DB_TTL,
			});

			if (has_cache_db)
			{
				debugConsole.debug(`發現緩存 ${DB_KEY}`, has_cache_db.path);

				return CACHED_CACACHE
					.readJSON<IDataCache>(DB_KEY)
					.then(function (ret)
					{
						return ret.json;
					})
					;
			}

			return null;
		})
		;
}

export function removeCache(options?: ISegmentCLIOptions)
{
	return getCacache(fixOptions(options))
		.tap(async function (cache)
		{
			await cache.clearMemoized();
			await cache.removeAll();
		})
	;
}

export function resetCache()
{
	CACHED_CACACHE = void 0
}
