/**
 * Created by user on 2018/4/13/013.
 */

import * as deasync from 'deasync';
import { sleepSync, awaitSync } from '../lib/util/sleep';

const timstamp = Date.now();

function f(n: number)
{
	return new Promise(function (done)
	{
		setTimeout(done, n);
	})
		.then(function ()
		{
			logWithTime(n);

			return n;
		})
	;
}

console.time();

f(500);

let p2 = sleepSync(250);

p2.thenSync(function (n)
{
	return logWithTime('thenSync', n);
});
p2.then(function (n)
{
	return logWithTime(n);
});

awaitSync(p2)

	.then(function (n)
{
	logWithTime(666, n);
});

let p = f(1500);

deasync.sleep(1000);
//msleep(1000);
logWithTime(1000);

let p33 = awaitSync(p);

let v33 = p33.thenSync(function (n)
{
	return logWithTime('thenSync', n);
});

logWithTime('print v33', v33);

p33
	.then(function (n)
{
	logWithTime(777, n);
});

console.timeEnd();

function logWithTime(...argv)
{
	console.log(`[${Date.now() - timstamp}]`, ...argv);

	return argv;
}
