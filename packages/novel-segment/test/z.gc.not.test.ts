import { createSegment } from './lib';
import FastGlob from '@bluelovers/fast-glob/bluebird';
import { join } from 'path';
import { readFileSync } from 'fs';

describe(`check not gc`, () =>
{
	const segment = createSegment(true, {
		nodeNovelMode: true,
	});

	const __res = join(__dirname, 'res/gc.not');

	FastGlob
		.sync([
		'**/*.txt',
	], {
		cwd: __res
	})
		.forEach(file => {

			it(file, () =>
			{
				console.time(file)
				const text = readFileSync(join(__res, file))
				let actual = segment.doSegment(text);
				console.timeEnd(file)
			});

		})
	;

})
