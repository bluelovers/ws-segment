'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
/**
 * 单词类型
 */
var POSTAG;
(function (POSTAG) {
    POSTAG[POSTAG["BAD"] = 2147483648] = "BAD";
    POSTAG[POSTAG["D_A"] = 1073741824] = "D_A";
    POSTAG[POSTAG["D_B"] = 536870912] = "D_B";
    POSTAG[POSTAG["D_C"] = 268435456] = "D_C";
    POSTAG[POSTAG["D_D"] = 134217728] = "D_D";
    POSTAG[POSTAG["D_E"] = 67108864] = "D_E";
    POSTAG[POSTAG["D_F"] = 33554432] = "D_F";
    POSTAG[POSTAG["D_I"] = 16777216] = "D_I";
    POSTAG[POSTAG["D_L"] = 8388608] = "D_L";
    POSTAG[POSTAG["A_M"] = 4194304] = "A_M";
    POSTAG[POSTAG["D_MQ"] = 2097152] = "D_MQ";
    POSTAG[POSTAG["D_N"] = 1048576] = "D_N";
    POSTAG[POSTAG["D_O"] = 524288] = "D_O";
    POSTAG[POSTAG["D_P"] = 262144] = "D_P";
    POSTAG[POSTAG["A_Q"] = 131072] = "A_Q";
    POSTAG[POSTAG["D_R"] = 65536] = "D_R";
    POSTAG[POSTAG["D_S"] = 32768] = "D_S";
    POSTAG[POSTAG["D_T"] = 16384] = "D_T";
    POSTAG[POSTAG["D_U"] = 8192] = "D_U";
    POSTAG[POSTAG["D_V"] = 4096] = "D_V";
    POSTAG[POSTAG["D_W"] = 2048] = "D_W";
    POSTAG[POSTAG["D_X"] = 1024] = "D_X";
    POSTAG[POSTAG["D_Y"] = 512] = "D_Y";
    POSTAG[POSTAG["D_Z"] = 256] = "D_Z";
    POSTAG[POSTAG["A_NR"] = 128] = "A_NR";
    POSTAG[POSTAG["A_NS"] = 64] = "A_NS";
    POSTAG[POSTAG["A_NT"] = 32] = "A_NT";
    POSTAG[POSTAG["A_NX"] = 16] = "A_NX";
    POSTAG[POSTAG["A_NZ"] = 8] = "A_NZ";
    POSTAG[POSTAG["D_ZH"] = 4] = "D_ZH";
    POSTAG[POSTAG["D_K"] = 2] = "D_K";
    POSTAG[POSTAG["URL"] = 1] = "URL";
    POSTAG[POSTAG["UNK"] = 0] = "UNK";
})(POSTAG = exports.POSTAG || (exports.POSTAG = {}));
(function (POSTAG) {
    POSTAG.POSTAG_KEYS = util_1.enumList(POSTAG);
    /**
     * 中文说明
     */
    let CHSNAME;
    (function (CHSNAME) {
        CHSNAME["BAD"] = "\u932F\u5B57";
        CHSNAME["D_A"] = "\u5F62\u5BB9\u8BCD \u5F62\u8BED\u7D20";
        CHSNAME["D_B"] = "\u533A\u522B\u8BCD \u533A\u522B\u8BED\u7D20";
        CHSNAME["D_C"] = "\u8FDE\u8BCD \u8FDE\u8BED\u7D20";
        CHSNAME["D_D"] = "\u526F\u8BCD \u526F\u8BED\u7D20";
        CHSNAME["D_E"] = "\u53F9\u8BCD \u53F9\u8BED\u7D20";
        CHSNAME["D_F"] = "\u65B9\u4F4D\u8BCD \u65B9\u4F4D\u8BED\u7D20";
        CHSNAME["D_I"] = "\u6210\u8BED";
        CHSNAME["D_L"] = "\u4E60\u8BED";
        CHSNAME["A_M"] = "\u6570\u8BCD \u6570\u8BED\u7D20";
        CHSNAME["D_MQ"] = "\u6570\u91CF\u8BCD";
        CHSNAME["D_N"] = "\u540D\u8BCD \u540D\u8BED\u7D20";
        CHSNAME["D_O"] = "\u62DF\u58F0\u8BCD";
        CHSNAME["D_P"] = "\u4ECB\u8BCD";
        CHSNAME["A_Q"] = "\u91CF\u8BCD \u91CF\u8BED\u7D20";
        CHSNAME["D_R"] = "\u4EE3\u8BCD \u4EE3\u8BED\u7D20";
        CHSNAME["D_S"] = "\u5904\u6240\u8BCD";
        CHSNAME["D_T"] = "\u65F6\u95F4\u8BCD";
        CHSNAME["D_U"] = "\u52A9\u8BCD \u52A9\u8BED\u7D20";
        CHSNAME["D_V"] = "\u52A8\u8BCD \u52A8\u8BED\u7D20";
        CHSNAME["D_W"] = "\u6807\u70B9\u7B26\u53F7";
        CHSNAME["D_X"] = "\u975E\u8BED\u7D20\u5B57";
        CHSNAME["D_Y"] = "\u8BED\u6C14\u8BCD \u8BED\u6C14\u8BED\u7D20";
        CHSNAME["D_Z"] = "\u72B6\u6001\u8BCD";
        CHSNAME["A_NR"] = "\u4EBA\u540D";
        CHSNAME["A_NS"] = "\u5730\u540D";
        CHSNAME["A_NT"] = "\u673A\u6784\u56E2\u4F53";
        CHSNAME["A_NX"] = "\u5916\u6587\u5B57\u7B26";
        CHSNAME["A_NZ"] = "\u5176\u4ED6\u4E13\u540D";
        CHSNAME["D_ZH"] = "\u524D\u63A5\u6210\u5206";
        CHSNAME["D_K"] = "\u540E\u63A5\u6210\u5206";
        CHSNAME["URL"] = "\u7F51\u5740 \u90AE\u7BB1\u5730\u5740";
        CHSNAME["UNK"] = "\u672A\u77E5";
    })(CHSNAME = POSTAG.CHSNAME || (POSTAG.CHSNAME = {}));
    POSTAG.POSTAG_KEYS.forEach(function (key) {
        let lc = key.toLowerCase();
        POSTAG[lc] = POSTAG[key];
        CHSNAME[lc] = CHSNAME[key];
    });
    /**
     * 中文说明
     *
     * @example POSTAG.chsName(0x00000008 | 0x00000010)
     * @param {number | string} p
     * @returns {string}
     */
    function chsName(p) {
        let bool = util_1.enumIsNaN(p);
        if (bool) {
            //console.log(1, p, CHSNAME[p]);
            return CHSNAME[p] || CHSNAME.UNK;
        }
        else {
            //console.log(2, p, POSTAG[p]);
            if (typeof p == 'string') {
                p = Number(p);
            }
            let ret = POSTAG.POSTAG_KEYS.reduce(function (ret, i) {
                if ((p & POSTAG[i])) 
                //if ((<number>p & <number>POSTAG[i]) > 0)
                {
                    ret.push(CHSNAME[i]);
                }
                else {
                    // @ts-ignore
                    //console.log(p & POSTAG[i], p, POSTAG[i], i);
                }
                return ret;
            }, []);
            if (ret.length < 1) {
                return CHSNAME.UNK;
            }
            else {
                return ret.toString();
            }
        }
    }
    POSTAG.chsName = chsName;
})(POSTAG = exports.POSTAG || (exports.POSTAG = {}));
//console.log(POSTAG);
//console.log(POSTAG.chsName(0x00000008 | 0x00000010));
exports.default = POSTAG;
