import express = require('express');
import cors = require('cors');
import {
	default as core,
	NextFunction,
	Request,
	Response,
	Express,
	RequestHandlerParams,
} from 'express-serve-static-core';
import Segment, { IOptionsDoSegment } from 'novel-segment/lib/segment/core';
import { useModules } from 'novel-segment/lib/segment/methods/useModules2';
import getDefaultModList from 'novel-segment/lib/mod';
import { parse as url_parse } from 'url';
import { crlf } from 'crlf-normalize';
import { cn2tw_min, tw2cn_min } from 'cjk-conv/lib/zh/convert/min';

const app = express();
let CACHED_SEGMENT: Segment;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

all_method(app, '/conv', app_conv);
all_method(app, '*', app_segment);

export default app

async function app_segment(req: Request, res: Response, next: NextFunction)
{
	let rq = get_query<{
		input: string | (string | Buffer)[],
		options: IOptionsDoSegment,
		nocache: boolean,
		debug: boolean,
	}>(req);

	res.set({
		//'Access-Control-Allow-Origin': '*',
		'Content-Type': 'application/json',
	});

	const timestamp = Date.now();

	let error: Error;

	if (rq.input && rq.input.length)
	{
		rq.input = handle_input(rq.input).input;

		if (Array.isArray(rq.input))
		{
			rq.options = rq.options || {};

			try
			{
				const results = rq.input.map(line =>
				{

					if (typeof line !== 'string')
					{
						line = Buffer.from(line).toString();
					}

					return doSegment(line, rq.options)
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
					options: rq.options,
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

async function app_conv(req: Request, res: Response, next: NextFunction)
{
	let rq = get_query<{
		input: string | (string | Buffer)[],
		options: {
			tw2cn?: boolean,
		}
		nocache: boolean,
		debug: boolean,
	}>(req, {
		options: {},
	});

	const timestamp = Date.now();

	let error: Error;

	try
	{
		const { input, empty } = handle_input(rq.input);
		delete rq.input;

		const { tw2cn } = rq.options;

		const results = input_map(input, (input) =>
		{
			let text = doSegment(input, {
				simple: true,
			}).join('');

			return tw2cn ? tw2cn_min(text) : cn2tw_min(text)
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

		res.status(200).json(json);

		return;
	}
	catch (e)
	{
		if (!rq.nocache)
		{
			res.set({
				'Cache-Control': 'public, max-age=10000',
			});
		}

		res.status(500).json({
			code: 0,
			error: true,
			timestamp,
			message: e.message,
			request: rq,
		});
	}
}

function handle_input(input: string | (string | Buffer)[])
{
	if (typeof input === 'string')
	{
		input = [input];
	}

	let empty = (input.length === 0 || input.length === 1 && input[0].length === 0);

	return {
		input,
		empty,
	};
}

function input_map<T>(input: (string | Buffer)[], fn: (input: string) => T): T[]
{
	return input.map(input =>
	{

		if (typeof input !== 'string')
		{
			input = Buffer.from(input).toString();
		}

		return fn(input)
	})
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

function getSegment()
{
	if (CACHED_SEGMENT)
	{
		return CACHED_SEGMENT;
	}

	const DICT = require('./cache/cache.json');

	CACHED_SEGMENT = createSegment();

	useModules(CACHED_SEGMENT as any, getDefaultModList(CACHED_SEGMENT.options.all_mod));

	CACHED_SEGMENT.DICT = DICT;
	CACHED_SEGMENT.inited = true;

	return CACHED_SEGMENT
}

function doSegment(text: string, options?: IOptionsDoSegment)
{
	return getSegment().doSegment(text, options)
}

function all_method(app: Express, routerPath: string, ...cb: RequestHandlerParams[])
{
	app.get(routerPath, ...cb);
	app.post(routerPath, ...cb);

	return app;
}

function get_query<T>(req: Request, init: Partial<T> = {}): T
{
	return Object.assign(init, url_parse(req.url, true).query, req.body);
}
