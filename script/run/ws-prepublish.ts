/**
 * Created by user on 2020/6/27.
 */

import { wsPkgDepsListableRecord } from 'ws-pkg-list';
import wsChanged from '@yarn-tool/ws-changed';
import { findUpDepsAllDeep } from '@yarn-tool/find-deps';
import Bluebird from 'bluebird';
import crossSpawnExtra from 'cross-spawn-extra';
import { array_unique_overwrite } from 'array-hyper-unique';

export default (async () => {

	let record = wsPkgDepsListableRecord()

	const listChanged = wsChanged()

	const cwd = listChanged.cwd;

	let list = listChanged.changed.concat(listChanged.staged).map(row => row.name)

	if (list.includes("segment-dict") || list.includes("novel-segment"))
	{
		list.push("segment-dict")
		list.push("novel-segment")

		array_unique_overwrite(list)
	}

	list = list.filter(name => [
		"novel-segment",
		"segment-dict",
	].includes(name));

	let list2 = findUpDepsAllDeep(list, record);

	let list3 = list2.reduce((a, b) => {

		a.push(b[0])

		return a
	}, [] as string[])

	console.log(list2)

	if (list3.length)
	{
		let cp = await crossSpawnExtra.async('lerna', [
			`run`,
			...list3.map(v => `--scope=${v}`),
			`--concurrency`,
			1,
			`version`,
		], {
			cwd,
			stdio: 'inherit',
		})

		if (cp.exitCode)
		{
			process.exit(cp.exitCode)
		}
	}

})();
