import SegmentCore from '../core';
import Segment from '../../Segment';
import { ISubOptimizer } from '../../mod/Optimizer';
import { ISubTokenizer } from '../../mod/Tokenizer';
export declare function useModules<T extends SegmentCore | Segment>(me: T, mod: ISubOptimizer | ISubTokenizer | any | string | (ISubTokenizer | ISubOptimizer | string)[], ...argv: any[]): T;
