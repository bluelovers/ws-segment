import CrossSpawn from 'cross-spawn-extra';
import Bluebird from 'bluebird';
import __root_ws from '../../__root_ws';

(async () => {

	await CrossSpawn.async('git', [
		'add',
		'-f',
		'*.info.json',
	], {
		cwd: __root_ws,
		stdio: 'inherit',
	});

	await CrossSpawn.async('git', [
		'add',
		'-f',
		'*.db',
	], {
		cwd: __root_ws,
		stdio: 'inherit',
	});

	await CrossSpawn.async('git', [
		'commit',
		'-m',
		'build(cache): build segment cache',
		'./packages/novel-segment/test/temp/',
	], {
		cwd: __root_ws,
		stdio: 'inherit',
	});

})();
