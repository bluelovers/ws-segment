/**
 * Created by user on 2018/4/16/016.
 */
import getDefaultModList from './mod';
export { getDefaultModList };
import { Segment } from './Segment';
export { Segment };
export declare function useDefault(segment: Segment, options?: {
    all_mod?: boolean;
    nomod?: boolean;
    nodict?: boolean;
}): Segment;
export default Segment;
