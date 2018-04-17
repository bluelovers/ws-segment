/**
 * Created by user on 2018/4/16/016.
 */
import { SubSModule, SubSModuleOptimizer } from '../mod';
import { IWord } from '../Segment';
export declare type IWordSynonym = IWord & {
    ow?: string;
    op?: number;
};
/**
 * 自動處理 `里|后`
 *
 * @todo 發于余干松冲准呆只范舍涂
 */
export declare class ZhtSynonymOptimizer extends SubSModuleOptimizer {
    static readonly type: string;
    readonly type: string;
    doOptimize(words: IWordSynonym[]): IWordSynonym[];
}
export declare const init: typeof SubSModule.init;
export default ZhtSynonymOptimizer;
