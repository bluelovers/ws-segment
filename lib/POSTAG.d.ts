/**
 * 单词类型
 */
export declare enum POSTAG {
    BAD = 2147483648,
    D_A = 1073741824,
    D_B = 536870912,
    D_C = 268435456,
    D_D = 134217728,
    D_E = 67108864,
    D_F = 33554432,
    D_I = 16777216,
    D_L = 8388608,
    A_M = 4194304,
    D_MQ = 2097152,
    D_N = 1048576,
    D_O = 524288,
    D_P = 262144,
    A_Q = 131072,
    D_R = 65536,
    D_S = 32768,
    D_T = 16384,
    D_U = 8192,
    D_V = 4096,
    D_W = 2048,
    D_X = 1024,
    D_Y = 512,
    D_Z = 256,
    A_NR = 128,
    A_NS = 64,
    A_NT = 32,
    A_NX = 16,
    A_NZ = 8,
    D_ZH = 4,
    D_K = 2,
    URL = 1,
    UNK = 0,
}
export declare namespace POSTAG {
    const POSTAG_KEYS: string[];
    /**
     * 中文说明
     */
    enum CHSNAME {
        BAD = "\u932F\u5B57",
        D_A = "\u5F62\u5BB9\u8BCD \u5F62\u8BED\u7D20",
        D_B = "\u533A\u522B\u8BCD \u533A\u522B\u8BED\u7D20",
        D_C = "\u8FDE\u8BCD \u8FDE\u8BED\u7D20",
        D_D = "\u526F\u8BCD \u526F\u8BED\u7D20",
        D_E = "\u53F9\u8BCD \u53F9\u8BED\u7D20",
        D_F = "\u65B9\u4F4D\u8BCD \u65B9\u4F4D\u8BED\u7D20",
        D_I = "\u6210\u8BED",
        D_L = "\u4E60\u8BED",
        A_M = "\u6570\u8BCD \u6570\u8BED\u7D20",
        D_MQ = "\u6570\u91CF\u8BCD",
        D_N = "\u540D\u8BCD \u540D\u8BED\u7D20",
        D_O = "\u62DF\u58F0\u8BCD",
        D_P = "\u4ECB\u8BCD",
        A_Q = "\u91CF\u8BCD \u91CF\u8BED\u7D20",
        D_R = "\u4EE3\u8BCD \u4EE3\u8BED\u7D20",
        D_S = "\u5904\u6240\u8BCD",
        D_T = "\u65F6\u95F4\u8BCD",
        D_U = "\u52A9\u8BCD \u52A9\u8BED\u7D20",
        D_V = "\u52A8\u8BCD \u52A8\u8BED\u7D20",
        D_W = "\u6807\u70B9\u7B26\u53F7",
        D_X = "\u975E\u8BED\u7D20\u5B57",
        D_Y = "\u8BED\u6C14\u8BCD \u8BED\u6C14\u8BED\u7D20",
        D_Z = "\u72B6\u6001\u8BCD",
        A_NR = "\u4EBA\u540D",
        A_NS = "\u5730\u540D",
        A_NT = "\u673A\u6784\u56E2\u4F53",
        A_NX = "\u5916\u6587\u5B57\u7B26",
        A_NZ = "\u5176\u4ED6\u4E13\u540D",
        D_ZH = "\u524D\u63A5\u6210\u5206",
        D_K = "\u540E\u63A5\u6210\u5206",
        URL = "\u7F51\u5740 \u90AE\u7BB1\u5730\u5740",
        UNK = "\u672A\u77E5",
    }
    /**
     * 中文说明
     *
     * @example POSTAG.chsName(0x00000008 | 0x00000010)
     * @param {number | string} p
     * @returns {string}
     */
    function chsName(p: number | string): string;
}
export default POSTAG;
