import POSTAG_KEYS from '../keys';
import POSTAG from '../postag/ids';
import CHSNAME from '../postag/chs';
import ZHNAME from '../postag/cht';
import ENNAME from '../postag/en';
import getPOSTagTranslator from '../util/getPOSTagTranslator';

POSTAG_KEYS.forEach(function (key)
{
	let lc = key.toLowerCase();

	// @ts-ignore
	POSTAG[lc] = POSTAG[key];
	// @ts-ignore
	CHSNAME[lc] = CHSNAME[key];
	// @ts-ignore
	ZHNAME[lc] = ZHNAME[key];
	// @ts-ignore
	ENNAME[lc] = ENNAME[key];
});

export const enName = getPOSTagTranslator(POSTAG, ENNAME);
export const chsName = getPOSTagTranslator(POSTAG, CHSNAME);
export const zhName = getPOSTagTranslator(POSTAG, ZHNAME);
