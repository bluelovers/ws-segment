import { crlf } from 'crlf-normalize';

export function _get_text(text: string | Buffer): string
{
	try
	{
		if (Buffer.isBuffer(text))
		{
			text = text.toString();
		}
	}
	catch (e)
	{}
	finally
	{
		if (typeof text != 'string')
		{
			throw new TypeError(`text must is string or Buffer`)
		}

		text = crlf(text);
	}

	return text;
}
