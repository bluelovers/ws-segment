/**
 * Created by user on 2019/6/26.
 */
import { Segment } from '../Segment';
export interface IUseDefaultOptions {
    all_mod?: boolean;
    nomod?: boolean;
    nodict?: boolean;
}
export declare function useDefault(segment: Segment, options?: IUseDefaultOptions): Segment;
