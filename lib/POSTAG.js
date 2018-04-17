'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("./util/core");
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
    POSTAG.POSTAG_KEYS = core_1.enumList(POSTAG);
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
    let ZHNAME;
    (function (ZHNAME) {
        ZHNAME["BAD"] = "\u932F\u5B57";
        ZHNAME["D_A"] = "\u5F62\u5BB9\u8A5E \u5F62\u8A9E\u7D20";
        ZHNAME["D_B"] = "\u5340\u5225\u8A5E \u5340\u5225\u8A9E\u7D20";
        ZHNAME["D_C"] = "\u9023\u8A5E \u9023\u8A9E\u7D20";
        ZHNAME["D_D"] = "\u526F\u8A5E \u526F\u8A9E\u7D20";
        ZHNAME["D_E"] = "\u5606\u8A5E \u5606\u8A9E\u7D20";
        ZHNAME["D_F"] = "\u65B9\u4F4D\u8A5E \u65B9\u4F4D\u8A9E\u7D20";
        ZHNAME["D_I"] = "\u6210\u8A9E";
        ZHNAME["D_L"] = "\u7FD2\u8A9E";
        ZHNAME["A_M"] = "\u6578\u8A5E \u6578\u8A9E\u7D20";
        ZHNAME["D_MQ"] = "\u6578\u91CF\u8A5E";
        ZHNAME["D_N"] = "\u540D\u8A5E \u540D\u8A9E\u7D20";
        ZHNAME["D_O"] = "\u64EC\u8072\u8A5E";
        ZHNAME["D_P"] = "\u4ECB\u8A5E";
        ZHNAME["A_Q"] = "\u91CF\u8A5E \u91CF\u8A9E\u7D20";
        ZHNAME["D_R"] = "\u4EE3\u8A5E \u4EE3\u8A9E\u7D20";
        ZHNAME["D_S"] = "\u8655\u6240\u8A5E";
        ZHNAME["D_T"] = "\u6642\u9593\u8A5E";
        ZHNAME["D_U"] = "\u52A9\u8A5E \u52A9\u8A9E\u7D20";
        ZHNAME["D_V"] = "\u52D5\u8A5E \u52D5\u8A9E\u7D20";
        ZHNAME["D_W"] = "\u6A19\u9EDE\u7B26\u865F";
        ZHNAME["D_X"] = "\u975E\u8A9E\u7D20\u5B57";
        ZHNAME["D_Y"] = "\u8A9E\u6C23\u8A5E \u8A9E\u6C23\u8A9E\u7D20";
        ZHNAME["D_Z"] = "\u72C0\u614B\u8A5E";
        ZHNAME["A_NR"] = "\u4EBA\u540D";
        ZHNAME["A_NS"] = "\u5730\u540D";
        ZHNAME["A_NT"] = "\u6A5F\u69CB\u5718\u9AD4";
        ZHNAME["A_NX"] = "\u5916\u6587\u5B57\u7B26";
        ZHNAME["A_NZ"] = "\u5176\u4ED6\u5C08\u540D";
        ZHNAME["D_ZH"] = "\u524D\u63A5\u6210\u5206";
        ZHNAME["D_K"] = "\u5F8C\u63A5\u6210\u5206";
        ZHNAME["URL"] = "\u7DB2\u5740 \u90F5\u7BB1\u5730\u5740";
        ZHNAME["UNK"] = "\u672A\u77E5";
    })(ZHNAME = POSTAG.ZHNAME || (POSTAG.ZHNAME = {}));
    let ENNAME;
    (function (ENNAME) {
        ENNAME["D_A"] = "a";
        ENNAME["D_B"] = "b";
        ENNAME["D_C"] = "c";
        ENNAME["D_D"] = "d";
        ENNAME["D_E"] = "e";
        ENNAME["D_F"] = "f";
        ENNAME["D_I"] = "i";
        ENNAME["D_L"] = "l";
        ENNAME["A_M"] = "m";
        ENNAME["D_MQ"] = "mq";
        ENNAME["D_N"] = "n";
        ENNAME["D_O"] = "o";
        ENNAME["D_P"] = "p";
        ENNAME["A_Q"] = "q";
        ENNAME["D_R"] = "r";
        ENNAME["D_S"] = "s";
        ENNAME["D_T"] = "t";
        ENNAME["D_U"] = "u";
        ENNAME["D_V"] = "v";
        ENNAME["D_W"] = "w";
        ENNAME["D_X"] = "x";
        ENNAME["D_Y"] = "y";
        ENNAME["D_Z"] = "z";
        ENNAME["A_NR"] = "nr";
        ENNAME["A_NS"] = "ns";
        ENNAME["A_NT"] = "nt";
        ENNAME["A_NX"] = "nx";
        ENNAME["A_NZ"] = "nz";
        ENNAME["D_ZH"] = "h";
        ENNAME["D_K"] = "k";
        ENNAME["URL"] = "uri";
        ENNAME["UNK"] = "un";
    })(ENNAME = POSTAG.ENNAME || (POSTAG.ENNAME = {}));
    POSTAG.POSTAG_KEYS.forEach(function (key) {
        let lc = key.toLowerCase();
        POSTAG[lc] = POSTAG[key];
        CHSNAME[lc] = CHSNAME[key];
        ZHNAME[lc] = ZHNAME[key];
        ENNAME[lc] = ENNAME[key];
    });
    POSTAG.enName = getPOSTagTranslator(POSTAG, ENNAME);
    POSTAG.chsName = getPOSTagTranslator(POSTAG, CHSNAME);
    POSTAG.zhName = getPOSTagTranslator(POSTAG, ZHNAME);
    function getPOSTagTranslator(POSTagDict, I18NDict) {
        return (p) => {
            if (core_1.enumIsNaN(p)) {
                return I18NDict[p] || I18NDict.UNK;
            }
            if (typeof p == 'string') {
                p = Number(p);
            }
            let ret = POSTAG.POSTAG_KEYS.reduce(function (ret, i) {
                if ((p & POSTAG[i])) 
                //if ((<number>p & <number>POSTAG[i]) > 0)
                {
                    ret.push(I18NDict[i] || i);
                }
                return ret;
            }, []);
            if (ret.length < 1) {
                return I18NDict.UNK;
            }
            else {
                return ret.toString();
            }
        };
    }
    POSTAG.getPOSTagTranslator = getPOSTagTranslator;
})(POSTAG = exports.POSTAG || (exports.POSTAG = {}));
//console.log(POSTAG);
//console.log(POSTAG.chsName(0x00000008 | 0x00000010));
exports.default = POSTAG;
