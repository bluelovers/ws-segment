/**
 * Created by user on 2020/7/1.
 */

import FastGlob from '@bluelovers/fast-glob';
import { join, parse } from 'path';
import { outputFile } from 'fs-extra';

const __root = join(__dirname, '../..');

FastGlob
	.async<string>([
	'!*.d.ts',
	'*.ts',
], {
	cwd: join(__root, 'lib', 'submod')
})
	.then(ls => {

		let record = {
			Optimizer: [] as string[],
			Tokenizer: [] as string[],
			all: [] as string[],
		}

		ls.sort();

		let lines = [] as string[];

		lines.push('');

		ls.forEach(row => {

			let name = parse(row).name;

			if (/Optimizer$/.test(name))
			{
				record.Optimizer.push(name)
			}
			else if (/Tokenizer$/.test(name))
			{
				record.Tokenizer.push(name)
			}

			record.all.push(name)

			lines.push(`import * as ${name} from './submod/${name}';`)

		});

		lines.push('');

		record.all.forEach(name => {

			lines.push(`export { ${name} }`)

		})

		lines.push('');

		return outputFile(join(__root, 'lib', 'submod.ts'), lines.join(`\n`))
	})
;

function _record(list: string[])
{
	return list.map(m => `\t${m},`)
}
