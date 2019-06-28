import express = require('express');
import { NextFunction, Request, Response } from 'express-serve-static-core';
import Segment, { IOptionsDoSegment } from 'novel-segment/lib/segment/core';
import { useModules } from 'novel-segment/lib/segment/methods/useModules2';
import getDefaultModList from 'novel-segment/lib/mod';
import { parse as url_parse } from 'url';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let CACHED_SEGMENT: Segment;

app.get('*', fn);
app.post('*', fn);

export default app

function fn (req: Request, res: Response, next: NextFunction)
{
	let rq: {
		input: string | (string | Buffer)[],
		options: IOptionsDoSegment,
		nocache: boolean,
		debug: boolean,
	} = Object.assign({}, req.query, url_parse(req.url, true).query, req.body);

	res.set({
		'Access-Control-Allow-Origin': '*',
		'Content-Type': 'application/json',
	});

	const timestamp = Date.now();

	let error: Error;

	if (rq.input && rq.input.length)
	{
		if (typeof rq.input === 'string')
		{
			rq.input = [rq.input];
		}

		if (Array.isArray(rq.input))
		{
			rq.options = rq.options || {};

			try
			{
				const CACHED_SEGMENT = getSegment();

				const results = rq.input.map(line => {

					if (typeof line !== 'string')
					{
						line = Buffer.from(line).toString();
					}

					return CACHED_SEGMENT.doSegment(line)
				});

				if (!rq.nocache && !rq.debug)
				{
					res.set({
						'Cache-Control': 'public, max-age=3600000',
					});
				}

				const json = {
					code: 1,
					count: results.length,
					timestamp,
					time: Date.now() - timestamp,
					results,
				};

				if (rq.debug)
				{
					// @ts-ignore
					json.request = {
						rq,
						params: req.params,
						query: req.query,
						body: req.body,
						baseUrl: req.baseUrl,
						url: req.url,
						query2: url_parse(req.url, true).query,
					};
				}

				res.status(200).json(json);

				return;
			}
			catch (e)
			{
				error = e;

				res.status(500).json({
					code: 0,
					error: true,
					timestamp,
					message: error.message,
					request: rq,
				});

				return;
			}
		}
	}

	if (!rq.nocache)
	{
		res.set({
			'Cache-Control': 'public, max-age=10000',
		});
	}

	res.status(400).json({
		code: 0,
		error: true,
		timestamp,
		message: '參數錯誤',
		request: rq,
	});
}

function createSegment()
{
	return new Segment({
		autoCjk: true,
		optionsDoSegment: {
			convertSynonym: true,
		},
		all_mod: true,
	});
}

export function getSegment()
{
	const DICT = require('./cache.json');

	CACHED_SEGMENT = createSegment();

	useModules(CACHED_SEGMENT as any, getDefaultModList(CACHED_SEGMENT.options.all_mod));

	CACHED_SEGMENT.DICT = DICT;
	CACHED_SEGMENT.inited = true;

	return CACHED_SEGMENT
}
