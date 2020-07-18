import type { StringKeyOf } from "ts-enum-util/src/types";
export declare type IEnumLike<T extends Record<StringKeyOf<T>, V>, V extends number | string = number | string> = T;
export declare type IEnumKeyOf<T extends Record<StringKeyOf<T>, V>, V extends number | string = number | string> = StringKeyOf<T>;
