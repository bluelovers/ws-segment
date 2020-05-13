/**
 * Created by user on 2020/5/11.
 */

import FastGlob from '@bluelovers/fast-glob/bluebird';
import { join } from "path";
import __root_ws from '../../__root_ws';
import { readFile } from 'fs-extra';
import crossSpawn from 'cross-spawn-extra'
import { del } from '../util/add-to-postpublish-task';
import Bluebird = require('bluebird')
import console from 'debug-color2/logger'
import { gitSubtreePush } from '../util/git-subtree-push';

FastGlob
	.async([
		'**/*',
	], {
		cwd: join(__root_ws, 'temp', 'postpublish'),
		absolute: true,
	})
	.map(file => readFile(file, 'utf8'))
	.then(async (ls) =>
	{
		console.dir(ls)

		return Bluebird
			.mapSeries([
				'@novel-segment/api-server' as const,
			], async (module_name) =>
			{
				let bool = ls.includes(module_name);

				console.debug(`check`, module_name, bool)

				if (bool)
				{
					await crossSpawn.async('lerna', [
						'run',
						'--stream',
						'--scope',
						module_name,
						'postpublish:done',
					], {
						cwd: __root_ws,
						stdio: 'inherit',
					})

					await del(module_name)

					await gitSubtreePush(module_name)
				}

				return bool
			})
			;

	})
;

