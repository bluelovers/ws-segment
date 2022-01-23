import { crlf } from 'crlf-normalize';
import { chalkByConsole, console } from 'debug-color2';
import { ITSValueOrArrayMaybeReadonly } from 'ts-type/lib/type/base';
import { IStylesColorNames } from 'debug-color2/lib/styles';
import { diffChars } from 'diff';
import { cn2tw_min } from '@lazy-cjk/zh-convert/min';
import { IWord } from '@novel-segment/types';
import { stringify } from '@novel-segment/stringify';

export type ITextInput = ITSValueOrArrayMaybeReadonly<IWord | string>;

export function printPrettyDiff(text_old: ITextInput, text_new: ITextInput)
{
	text_old = crlf(stringify([text_old].flat()));
	text_new = crlf(stringify([text_new].flat()));

	const changed = text_old !== text_new;

	if (changed)
	{
		console.red(`changed: ${changed}`);
	}

	console.gray("------------------");

	if (changed)
	{
		console.success(diff_log(text_old, text_new));
	}
	else
	{
		console.log(text_new);
	}

	console.gray("------------------");

	const text_new2 = cn2tw_min(text_new);

	if (text_new !== text_new2)
	{
		console.log(diff_log(text_new, text_new2));
		console.gray("------------------");
	}

	return {
		text_old,
		text_new,
		changed,
		text_new2,
	}
}

export function diff_log(src_text: string, new_text: string): string
{
	let diff = diffChars(src_text, new_text);

	return chalkByConsole(function (chalk, _console)
	{
		let diff_arr: string[] = diff
			.reduce(function (a: string[], part)
			{
				let color: IStylesColorNames = part.added ? 'green' :
					part.removed ? 'red' : 'grey';

				let t = chalk[color](part.value);

				a.push(t);

				return a;
			}, [])
		;

		return diff_arr.join('');
	});
}

export default printPrettyDiff
