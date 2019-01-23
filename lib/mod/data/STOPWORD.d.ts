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
declare const _default: typeof import("./STOPWORD");
export default _default;
