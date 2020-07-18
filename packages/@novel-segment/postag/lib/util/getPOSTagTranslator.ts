import POSTAG from '../postag/ids';
import POSTAG_KEYS, { IPOSTAG_KEYS } from '../keys';
import { ITSPartialRecord } from 'ts-type/lib/type/record';
import { enumIsNaN } from './enum';

export function getPOSTagTranslator(POSTagDict: typeof POSTAG, I18NDict: ITSPartialRecord<IPOSTAG_KEYS, string>)
{
	return (p: POSTAG | IPOSTAG_KEYS | number): string =>
	{
		if (enumIsNaN(p))
		{
			return I18NDict[p] || I18NDict.UNK;
		}

		if (typeof p === 'string')
		{
			p = Number(p);
		}

		let ret = POSTAG_KEYS.reduce(function (ret, i)
		{
			if ((<number>p & <number>POSTAG[i]))
				//if ((<number>p & <number>POSTAG[i]) > 0)
			{
				ret.push(I18NDict[i] || i);
			}

			return ret;
		}, [] as string[]);

		if (ret.length < 1)
		{
			return I18NDict.UNK;
		}
		else
		{
			return ret.toString();
		}
	};
}

export default getPOSTagTranslator
