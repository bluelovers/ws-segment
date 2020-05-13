/**
 * Created by user on 2018/7/24/024.
 */

import path = require('path');
import ProjectConfig from '../project.config';
// @ts-ignore
import PackageJson = require('../package.json');
import CrossSpawn = require('cross-spawn-extra');
/// <reference types="cross-spawn" />

import index = require('../index');
import { join } from "path";

(async () =>
{
	let crossSpawn: typeof CrossSpawn;
	// @ts-ignore
	crossSpawn = await import('cross-spawn-extra');

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

	let cwd = join(ProjectConfig.project_root, 'test');

	let options = {
		cwd,
		stdio: 'inherit',
	};

	let msg = `novel-segment@${index.versions['novel-segment']}, segment-dict@${index.versions['segment-dict']}, cjk-conv@${index.versions['cjk-conv']}, regexp-cjk@${index.versions['regexp-cjk']}`;

	await crossSpawn('git', [
		'commit',
		'-a',
		'-m',
		msg,
	], options);

})().catch(e => console.error(e));
