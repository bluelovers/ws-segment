import { inspect } from 'util';
import { fail } from 'assert';

export interface IOptionsLazyMatch
{
	firstOne?: boolean,

	/**
	 * @example
	 * inspectFn = chai.util.inspect
	 * @example
	 * import { inspect } from 'util';
	 * inspectFn = inspect
	 */
	inspectFn?(input: any, ...argv: any[]): any,
}

export function _handleLazyMatchOptions(options: IOptionsLazyMatch = {})
{
	options ??= {};
	return {
		...options ,
		inspectFn: options.inspectFn ?? inspect,
	}
}

/**
 * 分析後應該要符合以下結果
 * @example
 * [
 * 		'胡锦涛出席APEC领导人会议后回京',
 * 		[
 * 			'会议',
 * 			'回京',
 * 		],
 * 	],
 */
export function lazyMatch(a: string[], b: string[] | (string | string[])[], options: IOptionsLazyMatch = {})
{
	let i: number = null;

	const { inspectFn, firstOne } = _handleLazyMatchOptions(options);

	let bool = b.every(function (value, index, array)
	{
		let j: number = -1;
		let ii = i;

		if (i == null)
		{
			i = -1;
		}

		if (Array.isArray(value))
		{
			if (firstOne)
			{
				value.some(function (bb)
				{
					let jj = a.indexOf(bb, ii);

					if ((jj > -1) && (jj > i))
					{
						j = jj;

						return true
					}
				});
			}
			else
			{
				j = value.reduce(function (aa, bb)
				{
					let jj = a.indexOf(bb, ii);

					if ((jj > -1) && (jj > i))
					{
						if (aa == -1)
						{
							return jj;
						}

						return Math.min(jj, aa)
					}

					return aa;
				}, -1)
			}
		}
		else
		{
			j = a.indexOf(value, ii);
		}

		if ((j > -1) && (j > i))
		{
			i = j;

			return true;
		}
	});

	if (i === -1)
	{
		bool = false;
	}

	!bool && fail(`expected ${inspectFn(a)} to have includes ordered members ${inspectFn(b)}`);

	return bool;
}

/**
 * 分析後應該要符合以下其中一個結果
 * @example
 * [
 * 		'在這裡有兩具自動人偶隨侍在側的烏列爾',
 * 		[
 * 			[
 * 				'兩具',
 * 				'自動',
 * 				'人偶',
 * 				'隨侍',
 * 			],
 * 			[
 * 				'兩具',
 * 				'自動人偶',
 * 				'隨侍',
 * 			],
 * 		],
 * 	],
 */
export function lazyMatch002(a: string[], b_arr: Parameters<typeof lazyMatch>['1'][], options: IOptionsLazyMatch = {})
{
	let bool: boolean;

	options = _handleLazyMatchOptions(options);

	for (let b of b_arr)
	{
		try
		{
			bool = lazyMatch(a, b, options);

			if (bool)
			{
				break;
			}
		}
		catch (e)
		{

		}
	}

	!bool && fail(`expected ${options.inspectFn(a)} to have includes one of ordered members in ${options.inspectFn(b_arr)}`);
}

/**
 * 分析轉換後應該要具有以下字詞
 * @example
 * [
 * 		'大家干的好',
 * 		[
 * 			'幹',
 * 		],
 * 	],
 */
export function lazyMatchSynonym001(a: string, b_arr: (string | string[])[], options: IOptionsLazyMatch = {})
{
	let bool: boolean;
	let i: number = undefined;

	const { inspectFn, firstOne } = _handleLazyMatchOptions(options);

	bool = b_arr.every(function (bb)
	{
		let ii = i;

		if (i == null)
		{
			i = -1;
		}

		let j: number = -1;

		if (Array.isArray(bb))
		{
			bb.some(v =>
			{

				let jj = a.indexOf(v, ii);

				if (jj > -1)
				{
					j = jj;
					bb = v;

					return true;
				}
			})
		}
		else
		{
			j = a.indexOf(bb, ii);
		}

		if ((j > -1) && (j >= i))
		{
			i = j + bb.length;

			return true;
		}
		else if (i > -1)
		{
			fail(`expected ${inspectFn(a)} to have have ${inspectFn(bb)} on index > ${i}, but got ${j}`);
		}
	});

	if (i === -1)
	{
		bool = false;
	}

	!bool && fail(`expected ${inspectFn(a)} to have index of ordered members in ${inspectFn(b_arr)}`);
}

/**
 * 分析轉換後不應該具有以下字詞
 * @example
 * [
 * 		'那是里靈魂的世界。',
 * 		[
 * 			'裡',
 * 		],
 * 	],
 */
export function lazyMatchSynonym001Not(a: string, b_arr: (string | string[])[], options: IOptionsLazyMatch = {})
{
	let bool: boolean;
	let i: number = undefined;

	const { inspectFn, firstOne } = _handleLazyMatchOptions(options);

	bool = b_arr.every(function (bb)
	{
		let ii = i;

		if (i == null)
		{
			i = -1;
		}

		let j: number = -1;

		if (Array.isArray(bb))
		{
			bb.some(v =>
			{

				let jj = a.indexOf(v, ii);

				if (jj > -1)
				{
					j = jj;
					bb = v;

					return true;
				}
			})
		}
		else
		{
			j = a.indexOf(bb, ii);
		}

		if ((j > -1) && (j > i))
		{
			fail(`expected ${inspectFn(a)} to not have ${inspectFn(bb)} on index > ${i}, but got ${j}`);

			return true;
		}
		else
		{
			i++;
		}
	});
}

/**
 * 分析後不應該存在符合以下結果
 * @example
 * [
 * 		'這份毫不守舊的率直',
 * 		[
 * 			'份毫',
 * 		],
 * 	],
 */
export function lazyMatchNot(a: string[], b: string[] | (string | string[])[], options: IOptionsLazyMatch = {})
{
	let i: number = null;

	const { inspectFn, firstOne } = _handleLazyMatchOptions(options);

	let bool = b.every(function (value, index, array)
	{
		let j: number = -1;
		let ii = i;

		if (i == null)
		{
			i = -1;
		}

		if (Array.isArray(value))
		{
			if (options.firstOne)
			{
				value.some(function (bb)
				{
					let jj = a.indexOf(bb, ii);

					if ((jj > -1) && (jj > i))
					{
						j = jj;

						return true
					}
				});
			}
			else
			{
				j = value.reduce(function (aa, bb)
				{
					let jj = a.indexOf(bb, ii);

					if ((jj > -1) && (jj > i))
					{
						if (aa == -1)
						{
							return jj;
						}

						return Math.min(jj, aa)
					}

					return aa;
				}, -1)
			}
		}
		else
		{
			j = a.indexOf(value, ii);
		}

		if (j > -1)
		{
			i = j;

			return false;
		}
		else
		{
			return true;
		}
	});

	if (i === -1)
	{
		bool = true;
	}

	!bool && fail(`expected ${inspectFn(a)} should not have includes ordered members ${inspectFn(b)}`);

	return bool;
}
