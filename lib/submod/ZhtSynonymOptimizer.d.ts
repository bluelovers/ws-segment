/**
 * Created by user on 2018/4/16/016.
 */
import { SubSModule, SubSModuleOptimizer } from '../mod';
import { IWord } from '../Segment';
/**
 * 自動處理 `里|裏|后`
 */
export declare class ZhtSynonymOptimizer extends SubSModuleOptimizer {
    static readonly type: string;
    readonly type: string;
    /**
     * 自動處理 `里|裏|后`
     */
    doOptimize(words: IWord[]): IWord[];
}
export declare const init: typeof SubSModule.init;
export default ZhtSynonymOptimizer;
