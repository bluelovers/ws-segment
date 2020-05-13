/**
 * Created by user on 2020/5/11.
 */

import FastGlob from '@bluelovers/fast-glob/bluebird';
import { join } from "path";
import __root_ws from '../../__root_ws';
import { readFile, outputFileSync } from 'fs-extra';
import crossSpawn from 'cross-spawn-extra'
import { del, name } from '../util/add-to-postpublish-task';
import Bluebird = require('bluebird')
import console from 'debug-color2/logger'
import { gitSubtreePush } from '../util/git-subtree-push';
import createCacheName from '../util/create-cache-name';

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
				'segment-dict',
				'novel-segment',
			] as const, async (module_name) =>
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

					console.debug(`[postpublish:script]`, `add`, module_name);
					outputFileSync(createCacheName('subtree', module_name), module_name);
				}

				return bool
			})
			;

	})
;

