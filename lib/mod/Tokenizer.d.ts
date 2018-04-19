import { Segment, IWord } from '../Segment';
import { ISubSModule, SModule, SubSModule } from './mod';
export declare type ISubTokenizer = ISubSModule & {
    type: 'tokenizer';
    split(words: IWord[], ...argv): IWord[];
};
export declare type ISubTokenizerCreate<T extends SubSModuleTokenizer, R extends SubSModuleTokenizer = SubSModuleTokenizer> = {
    (segment: Segment, ...argv): T & R;
};
export declare abstract class SubSModuleTokenizer extends SubSModule implements ISubTokenizer {
    static readonly type: string;
    readonly type: string;
    abstract split(words: IWord[], ...argv: any[]): IWord[];
    init(segment: Segment, ...argv: any[]): this;
    static init<T extends SubSModuleTokenizer = SubSModuleTokenizer>(segment: Segment, ...argv: any[]): T;
    /**
     * 仅对未识别的词进行匹配
     * 不包含 p 為 0
     */
    protected _splitUnset<T extends IWord, U extends IWord = T>(words: T[], fn: (text: string, ...argv) => U[]): U[];
    /**
     * 仅对未识别的词进行匹配
     * 包含已存在 但 p 為 0
     */
    protected _splitUnknow<T extends IWord, U extends IWord = T>(words: T[], fn: (text: string, ...argv) => U[]): U[];
}
/**
 * 分词模块管理器
 */
export declare class Tokenizer extends SModule {
    type: string;
    /**
     * 对一段文本进行分词
     *
     * @param {string} text 文本
     * @param {array} modules 分词模块数组
     * @return {array}
     */
    split(text: string, mods: ISubTokenizer[], ...argv: any[]): Segment.IWord[];
}
export default Tokenizer;
