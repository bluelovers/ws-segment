import UString = require('uni-string');
import { array_unique } from 'array-hyper-unique';

export namespace NS_STOPWORD
{
	export const _TABLE = [
		' ,.;+-|/\\\'":?<>[]{}=!@#$%^&*()~`' +
		'。，、＇：∶；?‘’“”〝〞ˆˇ﹕︰﹔﹖﹑·¨….¸;！´？！～—ˉ｜‖＂〃｀@﹫¡¿﹏﹋﹌︴々﹟#﹩$﹠&﹪%*﹡﹢﹦' +
		'﹤‐￣¯―﹨ˆ˜﹍﹎+=<­＿_-\ˇ~﹉﹊（）〈〉‹›﹛﹜『』〖〗［］《》〔〕{}「」【】︵︷︿︹︽_﹁﹃︻︶︸' +
		'﹀︺︾ˉ﹂﹄︼＋－×÷﹢﹣±／＝≈≡≠∧∨∑∏∪∩∈⊙⌒⊥∥∠∽≌＜＞≤≥≮≯∧∨√﹙﹚[]﹛﹜∫∮∝∞⊙∏' +
		'┌┬┐┏┳┓╒╤╕─│├┼┤┣╋┫╞╪╡━┃└┴┘┗┻┛╘╧╛┄┆┅┇╭─╮┏━┓╔╦╗┈┊│╳│┃┃╠╬╣┉┋╰─╯┗━┛' +
		'╚╩╝╲╱┞┟┠┡┢┦┧┨┩┪╉╊┭┮┯┰┱┲┵┶┷┸╇╈┹┺┽┾┿╀╁╂╃╄╅╆' +
		'○◇□△▽☆●◆■▲▼★♠♥♦♣☼☺◘♀√☻◙♂×▁▂▃▄▅▆▇█⊙◎۞卍卐╱╲▁▏↖↗↑←↔◤◥╲╱▔▕↙↘↓→↕◣◢∷▒░℡™',
		'．・　※',
	].join('');

	export const { _STOPWORD, STOPWORD, STOPWORD2 } = parseStopWord(_TABLE);

	export function parseStopWord(_STOPWORD: string | string[])
	{
		if (typeof _STOPWORD === 'string')
		{
			_STOPWORD = _STOPWORD.split('');
			//_STOPWORD = UString.split(_STOPWORD, '');
		}
		else if (!Array.isArray(_STOPWORD))
		{
			throw new TypeError(`table must is string or string[]`)
		}

		_STOPWORD = array_unique(_STOPWORD);

		let STOPWORD = {} as {
			[key: string]: number,
		};
		let STOPWORD2 = {} as {
			[key: number]: typeof STOPWORD,
		};

		for (let i in _STOPWORD)
		{
			if (_STOPWORD[i] == '') continue;
			let len = _STOPWORD[i].length;
			STOPWORD[_STOPWORD[i]] = len;
			if (!STOPWORD2[len]) STOPWORD2[len] = {};
			STOPWORD2[len][_STOPWORD[i]] = len;
		}

		return {
			_STOPWORD,
			STOPWORD,
			STOPWORD2,
		}
	}
}

export const { _STOPWORD, STOPWORD, STOPWORD2 } = NS_STOPWORD;

import * as self from './STOPWORD';
export default self;
