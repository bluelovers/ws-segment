/**
 * Created by user on 2018/4/13/013.
 */

import DeAsync from 'deasync';

export let hasSupport: boolean = null;
export let libDeAsync: typeof DeAsync;

try
{
	let s = require.resolve('deasync');

	if (s)
	{
		hasSupport = true;
	}
}
catch (e)
{
	if (e.code == 'MODULE_NOT_FOUND')
	{
		hasSupport = false;
	}
	else
	{
		console.error(e);
	}
}

export function initDeAsync(): DeAsync.IApi
{
	if (!libDeAsync)
	{
		libDeAsync = require('deasync');
	}

	return libDeAsync;
}

export function sleepSync(timeout: number)
{
	let p = new Promise(function (done)
	{
		setTimeout(done, timeout);
	});

	initDeAsync().await(p);

	p = p.then(function ()
	{
		return timeout;
	});

	return wrapPromiseFakeSync(p, timeout);
}

export function awaitSync<T>(pr: Promise<T>): IWrapPromiseFakeSync<T>
export function awaitSync<T>(pr: T): IWrapPromiseFakeSync<T>
export function awaitSync(pr)
{
	pr = pr instanceof Promise ? pr : Promise.resolve(pr);

	let v = initDeAsync().await(pr);

	return wrapPromiseFakeSync(pr, v);
}

export type IWrapPromiseFakeSync<T> = Promise<T> & {
	thenSync<U>(fn: (value: T) => U): U
};

export function wrapPromiseFakeSync<T>(pr: Promise<any>, value: T)
{
	let p = pr as IWrapPromiseFakeSync<T>;

	p.thenSync = function (fn)
	{
		return fn(value);
	};

	return p;
}

export default sleepSync
