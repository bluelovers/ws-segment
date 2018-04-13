/**
 * Created by user on 2018/4/13/013.
 */

import * as FastGlob from 'fast-glob';
import * as path from 'path';
import * as fs from 'fs';

export type IOptions = {
	extensions?: string[],
	paths: string[],

	onlyDir?: boolean,
	onlyFile?: boolean,
};

export function searchFirst(file: string, paths: IOptions): string
export function searchFirst(file: string, paths?: string[]): string
// @ts-ignore
export function searchFirst(file: string, options: IOptions | string[] = {}): string
{
	if (typeof file !== 'string' || file === '')
	{
		throw new TypeError();
	}

	let fp: string;

	if (Array.isArray(options))
	{
		let paths: string[];
		[paths, options] = [options, {} as IOptions];

		options.paths = paths;
	}

	options = Object.assign({}, options) as IOptions;

	// typescript know options is IOptions
	if (options.onlyDir || options.extensions && !options.extensions.length)
	{
		delete options.extensions;
	}

	let bool = options.paths.some(function (dir)
	{
		fp = path.join(dir, file);

		let bool: boolean;

		// typescript don't know what type about options
		if ((options as IOptions).extensions)
		{
			for (let ext of (options as IOptions).extensions)
			{
				let file = fp + ext;
				bool = existsSync(file, options as IOptions);
				if (bool)
				{
					fp = file;
					break;
				}
			}
		}
		else
		{
			bool = existsSync(fp, options as IOptions);
		}

		return bool;
	});

	if (bool)
	{
		return path.resolve(fp);
	}

	return null;
}

export function existsSync(path: string, options: {
	onlyDir?: boolean,
	onlyFile?: boolean,
} = {}): boolean
{
	let bool = fs.existsSync(path);

	if (bool && (options.onlyDir || options.onlyFile))
	{
		let stat = fs.statSync(path);

		if (options.onlyDir && !stat.isDirectory())
		{
			bool = false;
		}
		else if (options.onlyFile && !stat.isFile())
		{
			bool = false;
		}
	}

	return bool;
}

/*
let k = searchFirst('index', {
	paths: [
		'.',
		'..',
		'../..',
	],
	extensions: [
		'.ts',
	],
});

console.log(k);
*/

export default searchFirst;
