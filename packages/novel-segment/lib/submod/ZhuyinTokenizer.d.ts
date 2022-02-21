import { ISubTokenizerCreate, SubSModuleTokenizer } from '../mod';
import { IDICT, IDICT2, IWord } from '../Segment';
/**
 * 注音
 */
export declare class ZhuyinTokenizer extends SubSModuleTokenizer {
    name: string;
    protected _TABLE: IDICT<IWord>;
    protected _TABLE2: IDICT2<IWord>;
    protected _cache(...argv: any[]): void;
    split(words: IWord[]): IWord[];
    splitZhuyin(text: string, cur?: number): IWord[];
}
export declare const init: ISubTokenizerCreate<ZhuyinTokenizer, SubSModuleTokenizer>;
export declare const type = "tokenizer";
export default ZhuyinTokenizer;
