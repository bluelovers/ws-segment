/**
 * Created by user on 2018/8/18/018.
 */
import { SubSModuleOptimizer } from '../mod';
import { IDICT, IWord } from '../Segment';
import { IWordDebug } from '../util';
export declare class ForeignOptimizer extends SubSModuleOptimizer {
    name: string;
    protected _TABLE: IDICT<IWord>;
    _cache(): void;
    doOptimize<T extends IWordDebug>(words: T[]): T[];
}
export declare const init: typeof SubSModuleOptimizer.init;
export declare const type = "optimizer";
export default ForeignOptimizer;
