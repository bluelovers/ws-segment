/**
 * 類型定義模組
 * Type Definitions Module
 *
 * 定義列舉相關的通用類型工具。
 * 用於簡化列舉類型的宣告與使用。
 *
 * Defines generic type utilities for enumerations.
 * Used to simplify enumeration type declarations and usage.
 *
 * @module @novel-segment/postag
 */

import type { StringKeyOf } from "ts-enum-util/src/types";

/**
 * 列舉類型介面
 * Enum-like Type Interface
 *
 * 定義類似列舉的物件類型。
 * 支援數字或字串作為列舉值。
 *
 * Defines enum-like object types.
 * Supports numbers or strings as enum values.
 *
 * @template T - 列舉物件類型 / Enum object type
 * @template V - 列舉值類型（預設為 number | string）/ Enum value type (defaults to number | string)
 */
export type IEnumLike<T extends Record<StringKeyOf<T>, V>, V extends number | string = number | string> = T

/**
 * 列舉鍵值類型
 * Enum Key Type
 *
 * 提取列舉物件的所有鍵名稱組成的聯合類型。
 * 用於型別安全的列舉鍵引用。
 *
 * Extracts union type of all key names from enum object.
 * Used for type-safe enum key references.
 *
 * @template T - 列舉物件類型 / Enum object type
 * @template V - 列舉值類型（預設為 number | string）/ Enum value type (defaults to number | string)
 */
export type IEnumKeyOf<T extends Record<StringKeyOf<T>, V>, V extends number | string = number | string> = StringKeyOf<T>
