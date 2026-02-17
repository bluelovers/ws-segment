/**
 * 詞性標記鍵值模組
 * POS Tag Keys Module
 *
 * 提供詞性標記列舉的鍵值陣列與類型定義。
 * 用於取得所有詞性標記的名稱列表。
 *
 * Provides key array and type definitions for POS tag enumeration.
 * Used to get the list of all POS tag names.
 *
 * @module @novel-segment/postag
 */
import POSTAG from './postag/ids';
import { IEnumKeyOf } from './types';
/**
 * 詞性標記鍵值陣列
 * POS Tag Keys Array
 *
 * 包含所有詞性標記名稱的字串陣列。
 * 可用於迭代所有詞性類型。
 *
 * String array containing all POS tag names.
 * Can be used to iterate through all POS types.
 */
export declare const POSTAG_KEYS: ("BAD" | "D_A" | "D_B" | "D_C" | "D_D" | "D_E" | "D_F" | "D_I" | "D_L" | "A_M" | "D_MQ" | "D_N" | "D_O" | "D_P" | "A_Q" | "D_R" | "D_S" | "D_T" | "D_U" | "D_V" | "D_W" | "D_X" | "D_Y" | "D_Z" | "A_NR" | "A_NS" | "A_NT" | "A_NX" | "A_NZ" | "D_ZH" | "D_K" | "URL" | "UNK")[];
/**
 * 詞性標記鍵值類型
 * POS Tag Key Type
 *
 * 定義詞性標記名稱的聯合類型。
 * 用於型別安全的詞性標記名稱引用。
 *
 * Defines union type for POS tag names.
 * Used for type-safe POS tag name references.
 */
export type IPOSTAG_KEYS = IEnumKeyOf<typeof POSTAG>;
export default POSTAG_KEYS;
