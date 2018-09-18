import cacache = require('cacache');
import { getCacheDirPath } from './util';
import bluebird = require('bluebird');
import TypedArray = NodeJS.TypedArray;
import crypto = require('crypto');

export interface ICacacheOptionsCore
{
	integrity?,
	algorithms?: ICacacheAlgorithm,
	memoize?,
	uid?
	git?
}

export interface ICacacheOptionsPlus extends ICacacheOptionsCore
{
	ttl?: number,
}

export interface ICacacheOptions extends ICacacheOptionsCore
{
	cachePath?: string,
}

type valueof<T> = T[keyof T]

export type ICacacheAlgorithm = 'sha512' | string;

export interface ICacacheIntegrity<T = ICacacheHash>
{
	sha512?: T[],

	[k: string]: T[],
}

export interface ICacacheHash<O = any>
{
	source: string,
	algorithm: ICacacheAlgorithm,
	digest: string,
	options: O[],
}

export interface ICacacheListEntry<M = any>
{
	key: string,
	integrity: string,
	path: string,
	size: number,
	time: number,
	metadata: M,
}

export interface ICacacheList<M = any>
{
	[k: string]: ICacacheListEntry<M>,
}

export interface ICacacheData<D = Buffer, M = any>
{
	metadata: M,
	integrity: string,
	data: D | Buffer | DataView | TypedArray,
	size: string,
}

export interface ICacacheJSON<D = Buffer, M = any>
{
	metadata: M,
	integrity: string,
	data: Buffer | DataView | TypedArray,
	size: string,
	json: D,
}

export interface ICacacheDataHasContent<O = any>
{
	sri: ICacacheHash<O>,
	size: number,
}

export class Cacache
{
	cachePath: string;

	static getHashes()
	{
		return crypto.getHashes();
	}

	constructor(options?: ICacacheOptions)
	{
		options = options || {};

		if (!options.cachePath)
		{
			options.cachePath = getCacheDirPath();
		}

		this.cachePath = options.cachePath;
	}

	list<M>(): bluebird<ICacacheList<M>>
	{
		return bluebird
			.resolve(cacache.ls(this.cachePath))
			;
	}

	readData<D = Buffer, M = any>(key: string,
		options?: ICacacheOptionsCore,
	): bluebird<ICacacheData<D, M>>
	{
		return bluebird
			.resolve(cacache.get(this.cachePath, key, options));
	}

	readJSON<D = any, M = any>(key: string,
		options?: ICacacheOptionsCore,
	)
	{
		return this.readData(key, options)
			.then(function (ret)
			{
				let ret2 = ret as any as ICacacheJSON<D, M>;

				ret2.json = JSON.parse(ret2.data.toString());

				return ret2;
			})
			;
	}

	readDataInfo<M>(key: string,
		options?: ICacacheOptionsCore,
	): bluebird<ICacacheListEntry<M>>
	{
		return bluebird
			.resolve(cacache.get.info(this.cachePath, key, options));
	}

	hasContent<O>(integrity: string): bluebird<ICacacheDataHasContent<O>>
	{
		return bluebird
			.resolve(cacache.get.hasContent(this.cachePath, integrity));
	}

	hasData<M>(key: string,
		options?: ICacacheOptionsPlus,
	)
	{
		let self = this;

		return bluebird
			.resolve()
			.bind(this)
			.then(async function ()
			{
				let info = await self.readDataInfo<M>(key);

				if (info
					&& options
					&& options.ttl
					&& (info.time + options.ttl) <= Date.now()
				)
				{
					await self.remove(key);

					return null;
				}

				return info || null;
			})
			;
	}

	writeData<O>(key: string,
		data: string | DataView | TypedArray,
		options?: ICacacheOptionsCore,
	): bluebird<ICacacheIntegrity<ICacacheHash<O>>>
	{
		return bluebird
			.resolve(cacache.put(this.cachePath, key, data, options))
			;
	}

	writeJSON<O>(key: string, data, options?: ICacacheOptionsCore)
	{
		return this.writeData<O>(key, JSON.stringify(data), options);
	}

	removeAll(): bluebird<void>
	{
		return bluebird.resolve(cacache.rm.all(this.cachePath));
	}

	remove(key: string): bluebird<void>
	{
		return bluebird.resolve(cacache.rm.entry(this.cachePath, key));
	}

	removeContent(data_integrity: string): bluebird<void>
	{
		return bluebird.resolve(cacache.rm.content(this.cachePath, data_integrity));
	}

	clearMemoized()
	{
		cacache.clearMemoized();
		return bluebird.resolve();
	}

	createTempDirPath(options?: ICacacheOptionsCore): bluebird<string>
	{
		return bluebird.resolve(cacache.tmp.mkdir(this.cachePath, options));
	}

	withTempDirPath(options?: ICacacheOptionsCore): bluebird<string>
	{
		return new bluebird((resolve, reject) =>
		{
			cacache.tmp.withTmp(this.cachePath, resolve, options)
		});
	}
}

export default Cacache
