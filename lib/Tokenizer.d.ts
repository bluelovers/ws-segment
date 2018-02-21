import { IWord } from './Segment';
import { ISubSModule, SModule } from './module';
export declare type ISubTokenizer = ISubSModule & {
    type: 'tokenizer';
    split(words: IWord[]): IWord[];
};
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
    split(text: string, modules: ISubTokenizer[]): {
        w: string;
    }[];
}
export default Tokenizer;
