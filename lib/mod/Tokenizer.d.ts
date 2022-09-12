/**
 * 分词模块管理器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
import { IWord, Segment } from '../Segment';
import { ISubSModule, SModule, SubSModule } from './mod';
export type ISubTokenizer = ISubSModule & {
    type: 'tokenizer';
    split(words: IWord[], ...argv: any[]): IWord[];
};
export type ISubTokenizerCreate<T extends SubSModuleTokenizer, R extends SubSModuleTokenizer = SubSModuleTokenizer> = {
    (...argv: Parameters<T["init"]>): T & R;
    (segment: Segment, ...argv: any[]): T & R;
};
export declare abstract class SubSModuleTokenizer extends SubSModule implements ISubTokenizer {
    static readonly type = "tokenizer";
    readonly type = "tokenizer";
    abstract split(words: IWord[], ...argv: any[]): IWord[];
    init(segment: Segment, ...argv: any[]): this;
    static init<T extends SubSModuleTokenizer = SubSModuleTokenizer>(segment: Segment, ...argv: any[]): T;
    /**
     * 仅对未识别的词进行匹配
     * 不包含 p 為 0
     */
    protected _splitUnset<T extends IWord, U extends IWord = T>(words: T[], fn: (text: string, ...argv: any[]) => U[]): U[];
    /**
     * 仅对未识别的词进行匹配
     * 包含已存在 但 p 為 0
     */
    protected _splitUnknow<T extends IWord, U extends IWord = T>(words: T[], fn: (text: string, ...argv: any[]) => U[]): U[];
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
    split(text: string, mods: ISubTokenizer[], ...argv: any[]): IWord[];
}
export default Tokenizer;
