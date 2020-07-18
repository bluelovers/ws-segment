import POSTAG from './postag/ids';
import { $enum } from "ts-enum-util";
import { IEnumKeyOf, IEnumLike } from './types';

export const POSTAG_KEYS = $enum(POSTAG).getKeys();

export type IPOSTAG_KEYS = IEnumKeyOf<typeof POSTAG>;

export default POSTAG_KEYS;
