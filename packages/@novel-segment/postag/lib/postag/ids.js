"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSTAG = void 0;
/**
 * 单词类型
 */
var POSTAG;
(function (POSTAG) {
    /**
     * 錯字
     */
    POSTAG[POSTAG["BAD"] = 2147483648] = "BAD";
    /**
     * 形容词 形语素
     */
    POSTAG[POSTAG["D_A"] = 1073741824] = "D_A";
    /**
     * 区别词 区别语素
     */
    POSTAG[POSTAG["D_B"] = 536870912] = "D_B";
    /**
     * 连词 连语素
     */
    POSTAG[POSTAG["D_C"] = 268435456] = "D_C";
    // ---
    /**
     * 副词 副语素
     */
    POSTAG[POSTAG["D_D"] = 134217728] = "D_D";
    /**
     * 叹词 叹语素
     */
    POSTAG[POSTAG["D_E"] = 67108864] = "D_E";
    /**
     * 方位词 方位语素
     */
    POSTAG[POSTAG["D_F"] = 33554432] = "D_F";
    /**
     * 成语
     */
    POSTAG[POSTAG["D_I"] = 16777216] = "D_I";
    // ---
    /**
     * 习语
     * 類似成語或者曖昧無法分明的用語
     */
    POSTAG[POSTAG["D_L"] = 8388608] = "D_L";
    /**
     * 数词 数语素
     * 可以與其他數詞或者量詞合併的詞
     */
    POSTAG[POSTAG["A_M"] = 4194304] = "A_M";
    /**
     * 数量词
     */
    POSTAG[POSTAG["D_MQ"] = 2097152] = "D_MQ";
    /**
     * 名词 名语素
     */
    POSTAG[POSTAG["D_N"] = 1048576] = "D_N";
    // ---
    /**
     * 拟声词
     */
    POSTAG[POSTAG["D_O"] = 524288] = "D_O";
    /**
     * 介词
     */
    POSTAG[POSTAG["D_P"] = 262144] = "D_P";
    /**
     * 量词 量语素
     * 可以與數詞合併的詞
     */
    POSTAG[POSTAG["A_Q"] = 131072] = "A_Q";
    /**
     * 代词 代语素
     */
    POSTAG[POSTAG["D_R"] = 65536] = "D_R";
    // ---
    /**
     * 处所词
     */
    POSTAG[POSTAG["D_S"] = 32768] = "D_S";
    /**
     * 时间词
     */
    POSTAG[POSTAG["D_T"] = 16384] = "D_T";
    /**
     * 助词 助语素
     */
    POSTAG[POSTAG["D_U"] = 8192] = "D_U";
    /**
     * 动词 动语素
     */
    POSTAG[POSTAG["D_V"] = 4096] = "D_V";
    // ---
    /**
     * 标点符号
     */
    POSTAG[POSTAG["D_W"] = 2048] = "D_W";
    /**
     * 非语素字
     */
    POSTAG[POSTAG["D_X"] = 1024] = "D_X";
    /**
     * 语气词 语气语素
     */
    POSTAG[POSTAG["D_Y"] = 512] = "D_Y";
    /**
     * 状态词
     */
    POSTAG[POSTAG["D_Z"] = 256] = "D_Z";
    // ---
    /**
     * 人名
     */
    POSTAG[POSTAG["A_NR"] = 128] = "A_NR";
    /**
     * 地名
     */
    POSTAG[POSTAG["A_NS"] = 64] = "A_NS";
    /**
     * 机构团体
     */
    POSTAG[POSTAG["A_NT"] = 32] = "A_NT";
    /**
     * 外文字符
     */
    POSTAG[POSTAG["A_NX"] = 16] = "A_NX";
    // ---
    /**
     * 其他专名
     */
    POSTAG[POSTAG["A_NZ"] = 8] = "A_NZ";
    /**
     * 前接成分
     */
    POSTAG[POSTAG["D_ZH"] = 4] = "D_ZH";
    /**
     * 后接成分
     */
    POSTAG[POSTAG["D_K"] = 2] = "D_K";
    /**
     * 网址、邮箱地址
     */
    POSTAG[POSTAG["URL"] = 1] = "URL";
    /**
     * 未知词性
     */
    POSTAG[POSTAG["UNK"] = 0] = "UNK";
})(POSTAG = exports.POSTAG || (exports.POSTAG = {}));
exports.default = POSTAG;
//# sourceMappingURL=ids.js.map