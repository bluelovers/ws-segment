import FastGlob from '@bluelovers/fast-glob/bluebird';
import { join, parse } from 'path';
import { writeFileSync } from 'fs';

FastGlob
	.async([
		'*.ts',
		'*/*.ts',
		'!**/*.d.ts',
		'!**/_*',
		'!lib',
		'!test',
		'!index.ts',
	], {
		cwd: join(__dirname, '..', '..'),
	})
	.map((row) =>
	{
		let ps = row.split(/[\\\/]/g) as string[];

		ps[ps.length - 1] = parse(ps[ps.length - 1]).name;

		return ps
	})
	.reduce((a, ps) => {

		let argv = `id: '${ps[0]}'`
		let name = ps[0];
		let iif = `id === '${ps[0]}'`;

		if (ps.length === 2 && ps[1] !== 'index')
		{
			argv += `, subtype: '${ps[1]}'`
			name = ps.join('/');

			iif += ` && subtype === '${ps[1]}'`;
		}
		else
		{
			iif += ` && isUndefined(subtype)`;
		}

		name = `../${name}`;

		let type = `typeof import('${name}')`;

		a.requireDefault.push(`export function requireDefault(${argv}): ${type}.default`);
		a.requireModule.push(`export function requireModule(${argv}): ${type}`);

		a.require.push(`if (${iif}) return require('${name}');`);

		return a
	}, {
		requireDefault: [],
		requireModule: [],
		require: [],
	})
	.tap(a => {

		let output = `
import { IRequireModule, isUndefined } from './types';

${a.requireDefault.join('\n')}
export function requireDefault<T = any>(id, subtype?: string): (file: string) => Promise<T>
export function requireDefault(id, subtype?)
{
\treturn requireModule(id, subtype).default as any;
}

${a.requireModule.join('\n')}
export function requireModule<T = any>(id: string, subtype?: string): IRequireModule<T>
export function requireModule(id, subtype?)
{
\t${a.require.join('\n\t')}

\tthrow new Error(\`module not defined. id: $\{id\}, subtype: $\{subtype\}\`)
}
`

		return writeFileSync('../../lib/index.ts', output)
	})
;

