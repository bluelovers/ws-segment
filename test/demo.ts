
import { textSegment, stringify, fileSegment, processText, processFile, enableDebug } from '../index';
import { console } from '../lib/util';
import jsdiff = require('diff');

(async () =>
{
	let input = `

「这里是···什么地方？」
「好了，这样最后的班会结束了」
「喂，灰斗，接下来干什么？」

`;

	enableDebug(true);

	let ls = await textSegment(input);

	//console.dir(ls);

	console.gray(`------------------`);

	let out = stringify(ls);

	console.dir(out);

	console.log(diff_log(input, out));

	console.gray(`------------------`);

	let text = await processText(input);

	console.dir(text);

})();

function diff_log(src_text: string, new_text: string): string
{
	let diff = jsdiff.diffChars(src_text, new_text);

	let diff_arr = diff
		.reduce(function (a, part)
		{
			let color = part.added ? 'green' :
				part.removed ? 'red' : 'grey';

			let t = console[color].chalk(part.value);

			a.push(t);

			return a;
		}, [])
	;

	return diff_arr.join('');
}
