/**
 * Created by user on 2018/4/16/016.
 */
import { SubSModule } from '../module';
import Segment, { IWord } from '../Segment';
/**
 * 自動處理 `里|裏|后`
 */
export declare class ZhtSynonymOptimizer extends SubSModule {
    static readonly type: string;
    readonly type: string;
    /**
     * 自動處理 `里|裏|后`
     */
    doOptimize(words: IWord[]): IWord[];
}
export declare function init(segment: Segment, ...argv: any[]): ZhtSynonymOptimizer;
export default init;
