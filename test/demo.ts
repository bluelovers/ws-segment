/**
 * Created by user on 2018/3/16/016.
 */
import { requireLoader, requireLoaderModule } from '..';

requireLoader('jieba')('../dict/nodejieba/user.dict.utf8')
	.then(function (dict)
	{
		console.log(dict);
	})
;

requireLoaderModule('segment').load('../dict/segment/dict.txt')
	.then(function (dict)
	{
		console.log(dict);
	})
;
