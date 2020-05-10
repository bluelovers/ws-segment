/**
 * Created by user on 2018/3/15/015.
 */

import { LF } from 'crlf-normalize';
import jiebaLoader from '@novel-segment/loaders/jieba';
import { parseLine } from '@novel-segment/loaders/jieba/index';
import ReadlineStream from './fs/stream';
import * as fs from 'fs';

jiebaLoader
	.load('../dict/nodejieba/jieba.dict.utf8')
	.then(function (dict)
	{
		return dict
			.reduce(function (a, b)
			{
				a[b[0]] = b;

				return a;
			}, {})
			;
	})
	.then(function (dict)
	{
		return new Promise(function (resolve, reject)
		{
			let stream = ReadlineStream.createReadStream('../dict/jieba-js/jieba-js.txt', {
				trailing: true,
				allowEmptyLine: false,
			});

			let dict_match = [];
			let dict_match_not = [];

			stream.on('data', function (line, ...argv)
			{
				//console.log('data', i++, line);
				let row = parseLine(line as string);

				if (dict[row[0]])
				{
					dict_match.push(row);
				}
				else
				{
					dict_match_not.push(row);
				}
			});

			stream.on('close', function (line, ...argv)
			{
				if (typeof line == 'string' && line)
				{
					let row = parseLine(line as string);

					if (dict[row[0]])
					{
						dict_match.push(row);
					}
					else
					{
						dict_match_not.push(row);
					}
				}
			});

			stream.on('end', function ()
			{
				resolve({
					dict_match,
					dict_match_not,
				});
			});
		})
	})
	.then(function ({
		dict_match,
		dict_match_not,
	})
	{
		fs.writeFileSync('./temp/dict_match.txt', dict_match.map(v => v.join(' ')).join(LF));
		fs.writeFileSync('./temp/dict_match_not.txt', dict_match_not.map(v => v.join(' ')).join(LF));
	})
;
