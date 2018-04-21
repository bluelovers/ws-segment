/**
 * Created by user on 2018/4/21/021.
 */

const path = require('path');

let p = path.resolve(path.join(path.dirname(require.resolve('typedoc-themes-color'), 'theme')));

console.log(p);
console.log(path.relative(process.cwd(), p));

module.exports = {
	src : '.',
	out: './docs',
	//theme: './my-theme',
//	theme: path.relative(process.cwd(), p),
	theme: p,
	ignoreCompilerErrors: true,
	exclude: [
		"**/test/*",
		"**/node_modules/**/*",
	],
};
