/**
 * Created by user on 2018/7/24/024.
 */

import path from 'path';
import ProjectConfig from '../project.config';
import * as PackageJson from '../package.json';
import CrossSpawn = require('cross-spawn-extra');
import { join } from 'path';
/// <reference types="cross-spawn" />

(async () =>
{
	let crossSpawn: typeof CrossSpawn;
	// @ts-ignore
	crossSpawn = await import('cross-spawn-extra');

	let gitroot: string;

	// @ts-ignore
	gitroot = await import('git-root2').then(m => m.sync);
	// @ts-ignore
	gitroot = gitroot(__dirname);

	if (!gitroot || path.relative(gitroot, ProjectConfig.project_root))
	{
		let __root_ws = await import('../../../__root_ws')
			.then(m => m.__root_ws)
			.catch(e => null)
		;

		if (!__root_ws || path.relative(gitroot, __root_ws))
		{
			console.warn(`no git exists`);
			console.warn(`__root_ws`, __root_ws);
			console.warn(`gitroot`, gitroot);
			console.warn(`path.relative`, path.relative(gitroot, ProjectConfig.project_root));
			return;
		}
	}

	let cwd = join(ProjectConfig.project_root, 'dict');

	let options = {
		cwd,
		stdio: 'inherit',
	};

	let msg = `npm publish ${PackageJson.version}`;

	await crossSpawn('git', [
		'commit',
		//'-a',
		'-m',
		msg,
		'.',
		// @ts-ignore
	], options);

	/*
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
		// @ts-ignore
	], options);
	 */

})().catch(e => console.error(e));
