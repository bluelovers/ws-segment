/**
 * Created by user on 2018/7/24/024.
 */

import * as path from 'path';
import ProjectConfig from '../project.config';
import * as PackageJson from '../package.json';
import * as crossSpawn from 'cross-spawn';

(async () =>
{
	let gitroot: string;

	// @ts-ignore
	gitroot = await import('git-root2');
	// @ts-ignore
	gitroot = gitroot();

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

	await crossSpawn('git', [
		'tag',
		'-a',
		PackageJson.version,
		'-m',
		msg,
	], options);

})().catch(e => console.error(e));
