/**
 * Created by user on 2018/7/24/024.
 */

import * as path from 'path';
import ProjectConfig from '../project.config';
// @ts-ignore
import * as PackageJson from '../package.json';
import * as CrossSpawn from 'cross-spawn';
/// <reference types="cross-spawn" />

(async () =>
{
	let crossSpawn: typeof CrossSpawn;
	// @ts-ignore
	crossSpawn = await import('cross-spawn');

	let gitroot: string;

	// @ts-ignore
	gitroot = await import('git-root2');
	// @ts-ignore
	gitroot = gitroot(__dirname);

	if (!gitroot || path.relative(gitroot, ProjectConfig.project_root))
	{
		console.warn(`no git exists`);
		return;
	}

	let options = {
		cwd: ProjectConfig.project_root,
		stdio: 'inherit',
	};

	let msg = `npm publish ${PackageJson.version}`;

	await crossSpawn('git', [
		'commit',
		'-a',
		'-m',
		msg,
	], options);

	await new Promise(function (done)
	{
		setTimeout(done, 500);
	});

	await crossSpawn('git', [
		'tag',
		'-a',
		PackageJson.version,
		'-m',
		msg,
	], options);

})().catch(e => console.error(e));
