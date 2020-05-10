import SegmentCore from '../core';
import { ISubOptimizer } from '../../mod/Optimizer';
import { ISubTokenizer } from '../../mod/Tokenizer';
export declare function _isIgnoreModules<T extends SegmentCore>(me: T, mod: ISubOptimizer | ISubTokenizer | any, ...argv: any[]): boolean;
export declare function _warnIgnoreModules(mod: any): void;
export declare function useModules<T>(me: T, mod: ISubOptimizer | ISubTokenizer | any, ...argv: any[]): T;
