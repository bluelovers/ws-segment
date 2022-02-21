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
		'⋯',
		/**
		 * 丶並非標點符號 而為部首 但有的人會用這個作為 標點符號使用
		 */
		'丶',
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

		for (const _STOPWORDItem of _STOPWORD)
		{
			if (_STOPWORDItem === '') continue;
			let len = _STOPWORDItem.length;
			STOPWORD[_STOPWORDItem] = len;
			STOPWORD2[len] = STOPWORD2[len] ?? {};
			STOPWORD2[len][_STOPWORDItem] = len;
		}

		return {
			_STOPWORD,
			STOPWORD,
			STOPWORD2,
		}
	}
}

export const { _STOPWORD, STOPWORD, STOPWORD2 } = NS_STOPWORD;

export default exports as typeof import('./STOPWORD');
