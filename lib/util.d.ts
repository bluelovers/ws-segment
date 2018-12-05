import { Console } from 'debug-color2';
export declare const console: Console;
export declare const debugConsole: Console;
export declare function enableDebug(bool?: boolean): boolean;
export declare function getCacheDirPath(useGlobal?: boolean): string;
export declare function freeGC(): boolean;
import * as self from './util';
export default self;
