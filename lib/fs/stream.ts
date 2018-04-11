import { createStreamLine, IStreamLineWithValue } from './line';

export interface ICallback<T>
{
	(err: Error, data?: T, stream?: IStreamLineWithValue<T>): void
}

export function createLoadStream<T>(file: string, options: {

	mapper?(line: string),
	ondata?(data),

	callback?: ICallback<T>,

} = {}): IStreamLineWithValue<T>
{

	options.mapper = options.mapper || function (data)
	{
		return data;
	};

	options.ondata = options.ondata || function (data)
	{
		this.value = this.value || [];
		this.value.push(data);
	};

	let stream: IStreamLineWithValue<any> = createStreamLine(file, options.mapper, {
		ondata: options.ondata,
		onclose()
		{
			if (options.callback)
			{
				options.callback.call(this, null, stream.value, stream)
			}
		}
	});

	return stream;
}

export default createLoadStream;
