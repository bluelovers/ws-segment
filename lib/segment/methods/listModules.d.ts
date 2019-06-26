import { IOptionsDoSegment } from '../types';
import { ISubTokenizer } from '../../mod/Tokenizer';
import { ISubOptimizer } from '../../mod/Optimizer';
import { Segment } from '../../Segment';
export declare function listModules(modules: Segment["modules"], options: IOptionsDoSegment): {
    enable: {
        tokenizer: ISubTokenizer[];
        optimizer: ISubOptimizer[];
    };
    disable: {
        tokenizer: ISubTokenizer[];
        optimizer: ISubOptimizer[];
    };
};
