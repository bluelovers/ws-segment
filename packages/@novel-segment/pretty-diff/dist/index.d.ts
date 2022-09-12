import { ITSValueOrArrayMaybeReadonly } from 'ts-type/lib/type/base';
import { IWord } from '@novel-segment/types';
export type ITextInput = ITSValueOrArrayMaybeReadonly<IWord | string>;
export declare function printPrettyDiff(text_old: ITextInput, text_new: ITextInput): {
    text_old: string;
    text_new: string;
    changed: boolean;
    text_new2: string;
};
export declare function diff_log(src_text: string, new_text: string): string;
export default printPrettyDiff;
