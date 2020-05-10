import { createStreamLine, IStreamLineWithValue } from './line';

export interface ICallback<T>
{
	(err: Error, data?: T, stream?: IStreamLineWithValue<T>): void
}

export function createLoadStream<T>(file: string, options: {

	mapper?(line: string),
	ondata?(data),

	callback?: ICallback<T>,

	onready?(...argv),

} = {}): IStreamLineWithValue<T>
{

	options.onready = options.onready || function (src, ...argv)
	{
		// @ts-ignore
		this.value = this.value || [];
	};

	options.mapper = options.mapper || function (data)
	{
		return data;
	};

	options.ondata = options.ondata || function (data)
	{
		// @ts-ignore
		this.value = this.value || [];
		// @ts-ignore
		this.value.push(data);
	};

	let stream: IStreamLineWithValue<any> = createStreamLine(file, options.mapper, {

		onready: options.onready,

		ondata: options.ondata,

		onclose()
		{
			if (options.callback)
			{
				options.callback.call(this, null, stream.value, stream)
			}
		},
	});

	return stream;
}

export default createLoadStream;
