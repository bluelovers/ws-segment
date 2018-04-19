/**
 * Created by user on 2018/4/19/019.
 */
import { SubSModuleTokenizer } from '../mod';
import { IWord } from '../Segment';
export declare class JpSimpleTokenizer extends SubSModuleTokenizer {
    name: string;
    split(words: IWord[], ...argv: any[]): IWord[];
    protected _splitText(text: string): IWord[];
}
export declare const init: typeof SubSModuleTokenizer.init;
export default JpSimpleTokenizer;
