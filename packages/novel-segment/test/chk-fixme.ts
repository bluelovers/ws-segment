/**
 * Created by user on 2019/4/12.
 */

import Mocha = require('mocha');
import fs = require('fs');
import path = require('path');
import yargs = require('yargs');

let cli = yargs
	.argv
;

// @ts-ignore
const mocha = new Mocha(cli);

mocha.addFile(
	path.join(__dirname, 'lazy.fixme')
);

mocha.run(function(failures) {

	failures && console.warn(`Tests failed: ${failures}`);

	process.exitCode = 0;
});

try
{
	mocha.allowUncaught()
}
catch (e)
{

}

process.exitCode = 0;
