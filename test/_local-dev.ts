// @ts-ignore
import _chai = require('chai');
// @ts-ignore
// @ts-ignore
//import { expect, assert } from 'chai';

import ChaiPlugin from 'chai-asserttype-extra'
//import ChaiPlugin = require('chai-asserttype-extra');

const chai = ChaiPlugin.install(_chai);
let { expect, assert } = chai;

chai.use(require('chai-string'));

export { chai, expect, assert }

// @ts-ignore
import path = require('path');
// @ts-ignore
import util = require('util');

export { path, util };

// @ts-ignore
export const rootDir: string = path.join(__dirname, '..');

export function relative(filename: string): string
{
	return path.relative(rootDir, filename);
}

export function mochaAsync(fn: Function)
{
	return async (done) =>
	{
		try
		{
			await fn();
			done();
		}
		catch (err)
		{
			done(err);
		}
	};
}

export default exports as typeof import('./_local-dev');
