import POSTAG from '../postag/ids';
import { IPOSTAG_KEYS } from '../keys';
import { ITSPartialRecord } from 'ts-type/lib/type/record';
export declare function getPOSTagTranslator(POSTagDict: typeof POSTAG, I18NDict: ITSPartialRecord<IPOSTAG_KEYS, string>): (p: POSTAG | IPOSTAG_KEYS | number) => string;
export default getPOSTagTranslator;
