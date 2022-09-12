import type { StringKeyOf } from "ts-enum-util/src/types";
export type IEnumLike<T extends Record<StringKeyOf<T>, V>, V extends number | string = number | string> = T;
export type IEnumKeyOf<T extends Record<StringKeyOf<T>, V>, V extends number | string = number | string> = StringKeyOf<T>;
