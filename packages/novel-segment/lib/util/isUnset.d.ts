export declare function isUnset<T>(val: T): val is Extract<T, null | undefined>;
export declare function isSet<T>(val: T): val is Exclude<T, null | undefined>;
export default isUnset;
