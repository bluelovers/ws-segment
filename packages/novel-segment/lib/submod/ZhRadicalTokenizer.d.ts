import { ISubTokenizerCreate, SubSModuleTokenizer } from '../mod';
import { IDICT, IDICT2, IWord } from '../Segment';
/**
 * 此模組目前無任何用處與效果
 *
 * @todo 部首
 */
export declare class ZhRadicalTokenizer extends SubSModuleTokenizer {
    name: string;
    protected _TABLE: IDICT<IWord>;
    protected _TABLE2: IDICT2<IWord>;
    protected _cache(...argv: any[]): void;
    split(words: IWord[]): IWord[];
    splitZhRadical(text: string, cur?: number): IWord[];
}
export declare const init: ISubTokenizerCreate<ZhRadicalTokenizer, SubSModuleTokenizer>;
export declare const type = "tokenizer";
export default ZhRadicalTokenizer;
