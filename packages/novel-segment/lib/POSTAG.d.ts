/**
 * 单词类型
 */
export declare enum POSTAG {
    /**
     * 錯字
     */
    BAD = 2147483648,
    /**
     * 形容词 形语素
     */
    D_A = 1073741824,
    /**
     * 区别词 区别语素
     */
    D_B = 536870912,
    /**
     * 连词 连语素
     */
    D_C = 268435456,
    /**
     * 副词 副语素
     */
    D_D = 134217728,
    /**
     * 叹词 叹语素
     */
    D_E = 67108864,
    /**
     * 方位词 方位语素
     */
    D_F = 33554432,
    /**
     * 成语
     */
    D_I = 16777216,
    /**
     * 习语
     * 類似成語或者曖昧無法分明的用語
     */
    D_L = 8388608,
    /**
     * 数词 数语素
     * 可以與其他數詞或者量詞合併的詞
     */
    A_M = 4194304,
    /**
     * 数量词
     */
    D_MQ = 2097152,
    /**
     * 名词 名语素
     */
    D_N = 1048576,
    /**
     * 拟声词
     */
    D_O = 524288,
    /**
     * 介词
     */
    D_P = 262144,
    /**
     * 量词 量语素
     * 可以與數詞合併的詞
     */
    A_Q = 131072,
    /**
     * 代词 代语素
     */
    D_R = 65536,
    /**
     * 处所词
     */
    D_S = 32768,
    /**
     * 时间词
     */
    D_T = 16384,
    /**
     * 助词 助语素
     */
    D_U = 8192,
    /**
     * 动词 动语素
     */
    D_V = 4096,
    /**
     * 标点符号
     */
    D_W = 2048,
    /**
     * 非语素字
     */
    D_X = 1024,
    /**
     * 语气词 语气语素
     */
    D_Y = 512,
    /**
     * 状态词
     */
    D_Z = 256,
    /**
     * 人名
     */
    A_NR = 128,
    /**
     * 地名
     */
    A_NS = 64,
    /**
     * 机构团体
     */
    A_NT = 32,
    /**
     * 外文字符
     */
    A_NX = 16,
    /**
     * 其他专名
     */
    A_NZ = 8,
    /**
     * 前接成分
     */
    D_ZH = 4,
    /**
     * 后接成分
     */
    D_K = 2,
    /**
     * 网址、邮箱地址
     */
    URL = 1,
    /**
     * 未知词性
     */
    UNK = 0
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
        UNK = "\u672A\u77E5"
    }
    /**
     * 繁體中文说明
     */
    enum ZHNAME {
        BAD = "\u932F\u5B57",
        D_A = "\u5F62\u5BB9\u8A5E \u5F62\u8A9E\u7D20",
        D_B = "\u5340\u5225\u8A5E \u5340\u5225\u8A9E\u7D20",
        D_C = "\u9023\u8A5E \u9023\u8A9E\u7D20",
        D_D = "\u526F\u8A5E \u526F\u8A9E\u7D20",
        D_E = "\u5606\u8A5E \u5606\u8A9E\u7D20",
        D_F = "\u65B9\u4F4D\u8A5E \u65B9\u4F4D\u8A9E\u7D20",
        D_I = "\u6210\u8A9E",
        D_L = "\u7FD2\u8A9E",
        A_M = "\u6578\u8A5E \u6578\u8A9E\u7D20",
        D_MQ = "\u6578\u91CF\u8A5E",
        D_N = "\u540D\u8A5E \u540D\u8A9E\u7D20",
        D_O = "\u64EC\u8072\u8A5E",
        D_P = "\u4ECB\u8A5E",
        A_Q = "\u91CF\u8A5E \u91CF\u8A9E\u7D20",
        D_R = "\u4EE3\u8A5E \u4EE3\u8A9E\u7D20",
        D_S = "\u8655\u6240\u8A5E",
        D_T = "\u6642\u9593\u8A5E",
        D_U = "\u52A9\u8A5E \u52A9\u8A9E\u7D20",
        D_V = "\u52D5\u8A5E \u52D5\u8A9E\u7D20",
        D_W = "\u6A19\u9EDE\u7B26\u865F",
        D_X = "\u975E\u8A9E\u7D20\u5B57",
        D_Y = "\u8A9E\u6C23\u8A5E \u8A9E\u6C23\u8A9E\u7D20",
        D_Z = "\u72C0\u614B\u8A5E",
        A_NR = "\u4EBA\u540D",
        A_NS = "\u5730\u540D",
        A_NT = "\u6A5F\u69CB\u5718\u9AD4",
        A_NX = "\u5916\u6587\u5B57\u7B26",
        A_NZ = "\u5176\u4ED6\u5C08\u540D",
        D_ZH = "\u524D\u63A5\u6210\u5206",
        D_K = "\u5F8C\u63A5\u6210\u5206",
        URL = "\u7DB2\u5740 \u90F5\u7BB1\u5730\u5740",
        UNK = "\u672A\u77E5"
    }
    /**
     * 英文
     */
    enum ENNAME {
        D_A = "a",
        D_B = "b",
        D_C = "c",
        D_D = "d",
        D_E = "e",
        D_F = "f",
        D_I = "i",
        D_L = "l",
        A_M = "m",
        D_MQ = "mq",
        D_N = "n",
        D_O = "o",
        D_P = "p",
        A_Q = "q",
        D_R = "r",
        D_S = "s",
        D_T = "t",
        D_U = "u",
        D_V = "v",
        D_W = "w",
        D_X = "x",
        D_Y = "y",
        D_Z = "z",
        A_NR = "nr",
        A_NS = "ns",
        A_NT = "nt",
        A_NX = "nx",
        A_NZ = "nz",
        D_ZH = "h",
        D_K = "k",
        URL = "uri",
        UNK = "un"
    }
    const enName: (p: number | string) => string;
    const chsName: (p: number | string) => string;
    const zhName: (p: number | string) => string;
    function getPOSTagTranslator(POSTagDict: typeof POSTAG, I18NDict: any): (p: number | string) => string;
}
export default POSTAG;
