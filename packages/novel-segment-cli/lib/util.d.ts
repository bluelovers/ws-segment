import { Console } from 'debug-color2';
export declare const console: Console;
export declare const debugConsole: Console;
export declare function enableDebug(bool?: boolean): boolean;
export declare function getCacheDirPath(useGlobal?: boolean): string;
export declare function freeGC(): boolean;
declare const _default: typeof import("./util");
export default _default;
