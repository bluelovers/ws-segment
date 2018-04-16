/**
 * Created by user on 2018/4/16/016.
 */
import { SubSModule } from '../module';
import Segment, { IWord } from '../Segment';
export declare class ZhtSynonymOptimizer extends SubSModule {
    static readonly type: string;
    readonly type: string;
    segment: Segment;
    init(_segment: Segment): this;
    doOptimize(words: IWord[]): IWord[];
}
export declare function init(segment: Segment): ZhtSynonymOptimizer;
