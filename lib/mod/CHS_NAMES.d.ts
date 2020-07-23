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
    const SINGLE_NAME_NO_REPEAT: string[];
    const SHARE_NAME: string[];
    function p(a: string[], n: number): IDICT<number>;
}
/**
 * 单姓
 */
export declare const FAMILY_NAME_1: IDICT<number>;
/**
 * 复姓
 */
export declare const FAMILY_NAME_2: IDICT<number>;
/**
 * 双字姓名第一个字
 */
export declare const DOUBLE_NAME_1: IDICT<number>;
/**
 * 双字姓名第二个字
 */
export declare const DOUBLE_NAME_2: IDICT<number>;
/**
 * 单字姓名
 */
export declare const SINGLE_NAME: IDICT<number>;
/**
 * 单字姓名 不重覆
 */
export declare const SINGLE_NAME_NO_REPEAT: IDICT<number>;
declare const _default: typeof import("./CHS_NAMES");
export default _default;
