/**
 * Created by user on 2018/3/16/016.
 */
import { requireLoader, requireLoaderModule, getDictPath } from '..';

requireLoader('jieba')('../dict/nodejieba/user.dict.utf8')
	.then(function (dict)
	{
		console.log(dict);
	})
;

requireLoaderModule('segment').load(getDictPath('segment', 'dict.txt'))
	.then(function (dict)
	{
		console.log(dict);
	})
;

let r = requireLoaderModule('segment', 'synonym').loadSync(getDictPath('synonym', 'synonym.txt'));

console.log(r);
