export declare namespace NS_STOPWORD {
    const _TABLE: string;
    const _STOPWORD: string[], STOPWORD: {
        [key: string]: number;
    }, STOPWORD2: {
        [key: number]: {
            [key: string]: number;
        };
    };
    function parseStopWord(_STOPWORD: string | string[]): {
        _STOPWORD: string[];
        STOPWORD: {
            [key: string]: number;
        };
        STOPWORD2: {
            [key: number]: {
                [key: string]: number;
            };
        };
    };
}
export declare const _STOPWORD: string[], STOPWORD: {
    [key: string]: number;
}, STOPWORD2: {
    [key: number]: {
        [key: string]: number;
    };
};
import * as self from './STOPWORD';
export default self;
