"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhDictCompare = exports.zhDictCompareNew = exports.RE_ZH = exports._zhDictCompareTable_chars = exports._zhDictCompareTable = void 0;
const tslib_1 = require("tslib");
const string_natural_compare_1 = tslib_1.__importDefault(require("@bluelovers/string-natural-compare"));
const array_hyper_unique_1 = require("array-hyper-unique");
const uni_string_1 = tslib_1.__importDefault(require("uni-string"));
const cjk_conv_1 = require("regexp-helper/lib/cjk-conv");
/**
 * @private
 */
exports._zhDictCompareTable = ((a, b) => {
    return (0, array_hyper_unique_1.array_unique)(a.map((value, index, array) => {
        return (0, array_hyper_unique_1.array_unique)(value.reduce(function (c, d, currentIndex) {
            c.push(d);
            c.push(b[index][currentIndex]);
            return c;
        }, []));
    }));
})([
    ['一', '二', '两', '三', '四', '五', '六', '七', '八', '九', '十', '十', '零', '幾', '個', '百', '千', '萬', '億'],
    ['初', '上', '中', '下', '左', '右'],
    ['東', '南', '西', '北'],
    ['大', '小'],
    ['高', '低'],
    ['長', '短', '粗', '細'],
    ['內', '外'],
    ['男', '女'],
    ['前', '後'],
    ['他', '她', '它', '我', '你', '吾', '汝'],
    ['快', '慢'],
    ['春', '夏', '秋', '冬'],
    ['壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖', '拾', '什'],
    ['劣', '優'],
], [
    ['一', '二', '两', '三', '四', '五', '六', '七', '八', '九', '十', '十', '零', '几', '个', '百', '千', '万', '亿'],
    ['初', '上', '中', '下', '左', '右'],
    ['东', '南', '西', '北'],
    ['大', '小'],
    ['高', '低'],
    ['长', '短', '粗', '细'],
    ['内', '外'],
    ['男', '女'],
    ['前', '后'],
    ['他', '她', '它', '我', '你', '吾', '汝'],
    ['快', '慢'],
    ['春', '夏', '秋', '冬'],
    ['壹', '贰', '参', '肆', '伍', '陆', '柒', '捌', '玖', '拾', '什'],
    ['劣', '优'],
]);
exports._zhDictCompareTable_chars = (0, array_hyper_unique_1.array_unique)(exports._zhDictCompareTable.flat());
//export const RE_ZH = /[\u3400-\u4DBF\u4E00-\u9FFF\u{20000}-\u{2FA1F}]/u;
exports.RE_ZH = (0, cjk_conv_1._re_cjk_conv)('u', 'のと㊥㊦㊤');
function zhDictCompareNew(options) {
    if (typeof options === 'function') {
        options = { failback: options };
    }
    let failback = (options = options || {}).failback;
    if (failback == null) {
        if (typeof string_natural_compare_1.default.caseInsensitive === 'function') {
            failback = string_natural_compare_1.default.caseInsensitive;
        }
        else {
            failback = (a, b) => (0, string_natural_compare_1.default)(a, b, {
                caseInsensitive: true
            });
        }
    }
    return function zhDictCompare(a, b) {
        let len01 = uni_string_1.default.size(a);
        let len02 = uni_string_1.default.size(b);
        /**
         * 優先排序單一字元
         */
        if ((len01 != len02) && (len01 === 1 || len02 === 1)) {
            return len01 - len02;
        }
        let _c = 0;
        let _a0 = a[0];
        let _b0 = b[0];
        let _a;
        let _b;
        let aa = exports.RE_ZH.test(a[0]);
        let bb = exports.RE_ZH.test(b[0]);
        if (aa && bb) {
            if (a.length != b.length && (a.length == 1 || b.length == 1)) {
                return a.length - b.length;
            }
            _a = exports._zhDictCompareTable[0].indexOf(a[0]);
            _b = exports._zhDictCompareTable[0].indexOf(b[0]);
            aa = _a != -1;
            bb = _b != -1;
            if (aa && !bb) {
                return -1;
            }
            else if (!aa && bb) {
                return 1;
            }
        }
        else {
            if (aa && !bb) {
                return 0;
            }
            else if (!aa && bb) {
                return -1;
            }
        }
        if (_a0 != null) {
            let len = a.length;
            for (let i = 0; i < len; i++) {
                if (!a[i] || !b[i] || a[i] == null || b[i] == null) {
                    break;
                }
                else if (a[i] !== b[i]) {
                    _a0 = a[i];
                    _b0 = b[i];
                    break;
                }
            }
        }
        if (exports._zhDictCompareTable_chars.includes(_a0) && exports._zhDictCompareTable_chars.includes(_b0)) {
            for (let _arr of exports._zhDictCompareTable) {
                _a = _arr.indexOf(_a0);
                _b = _arr.indexOf(_b0);
                if (_a > -1 && _b > -1) {
                    _c = (_a - _b) || 0;
                    break;
                }
            }
        }
        return _c || failback(a, b);
    };
}
exports.zhDictCompareNew = zhDictCompareNew;
/**
 * 排序字典專用的比較函數
 */
exports.zhDictCompare = zhDictCompareNew();
/*
export function zhDictCompare(a: string, b: string): number
{
    let _c = 0;

    let _a0 = a[0];
    let _b0 = b[0];

    let _a: number;
    let _b: number;

    let aa = RE_ZH.test(a[0]);
    let bb = RE_ZH.test(b[0]);

    if (aa && bb)
    {
        if (a.length != b.length && (a.length == 1 || b.length == 1))
        {
            return a.length - b.length
        }

        _a = _zhDictCompareTable[0].indexOf(a[0]);
        _b = _zhDictCompareTable[0].indexOf(b[0]);

        aa = _a != -1;
        bb = _b != -1;

        if (aa && !bb)
        {
            return -1
        }
        else if (!aa && bb)
        {
            return 1
        }
    }
    else
    {
        if (aa && !bb)
        {
            return 0
        }
        else if (!aa && bb)
        {
            return -1
        }
    }

    if (_a0 != null)
    {
        let len = a.length;

        for (let i = 0; i < len; i++)
        {
            if (!a[i] || !b[i] || a[i] == null || b[i] == null)
            {
                break;
            }
            else if (a[i] !== b[i])
            {
                _a0 = a[i];
                _b0 = b[i];

                break;
            }
        }
    }

    if (_zhDictCompareTable_chars.includes(_a0) && _zhDictCompareTable_chars.includes(_b0))
    {
        for (let _arr of _zhDictCompareTable)
        {
            _a = _arr.indexOf(_a0);
            _b = _arr.indexOf(_b0);

            if (_a > -1 && _b > -1)
            {
                _c = (_a - _b) || 0;

                break;
            }
        }
    }

    return _c || naturalCompare.caseInsensitive(a, b);
}
*/
exports.default = exports;
//# sourceMappingURL=sort.js.map