/**
 * 中文姓
 */
import { IDICT } from '../Segment';
export declare namespace _CHS_NAMES {
    const FAMILY_NAME_1: string[];
    const FAMILY_NAME_2: string[];
    const DOUBLE_NAME_1: string[];
    const DOUBLE_NAME_2: string[];
    const SINGLE_NAME: string[];
    const SHARE_NAME: string[];
    function p(a: string[], n: number): IDICT<number>;
}
export declare const FAMILY_NAME_1: IDICT<number>;
export declare const FAMILY_NAME_2: IDICT<number>;
export declare const DOUBLE_NAME_1: IDICT<number>;
export declare const DOUBLE_NAME_2: IDICT<number>;
export declare const SINGLE_NAME: IDICT<number>;
declare const _default: typeof import("./CHS_NAMES");
export default _default;
