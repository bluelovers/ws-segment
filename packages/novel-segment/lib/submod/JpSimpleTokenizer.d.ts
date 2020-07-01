/**
 * Created by user on 2018/4/19/019.
 */
import { SubSModuleTokenizer } from '../mod';
import { IWord } from '../Segment';
import { IWordDebug } from '../util';
export declare const enum EnumJpSimpleTokenizerType {
    /**
     * 平仮名
     * https://en.wikipedia.org/wiki/Hiragana
     */
    HIRAGANA = 1,
    /**
     * 片仮名
     * https://en.wikipedia.org/wiki/Katakana
     */
    KATAKANA = 2
}
export declare class JpSimpleTokenizer extends SubSModuleTokenizer {
    static NAME: "JpSimpleTokenizer";
    name: "JpSimpleTokenizer";
    split(words: IWord[], ...argv: any[]): IWord[];
    protected createJpSimpleToken<T extends IWordDebug>(data: T, type: EnumJpSimpleTokenizerType): T;
    protected _splitText(text: string): IWord[];
}
export declare const init: typeof SubSModuleTokenizer.init;
export declare const type = "tokenizer";
export default JpSimpleTokenizer;
