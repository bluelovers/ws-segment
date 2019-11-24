"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const naturalCompare = require("string-natural-compare");
const array_hyper_unique_1 = require("array-hyper-unique");
const UString = require("uni-string");
/**
 * @private
 */
exports._zhDictCompareTable = ((a, b) => {
    return array_hyper_unique_1.array_unique(a.map((value, index, array) => {
        return array_hyper_unique_1.array_unique(value.reduce(function (c, d, currentIndex) {
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
exports._zhDictCompareTable_chars = array_hyper_unique_1.array_unique(exports._zhDictCompareTable.flat());
exports.RE_ZH = /[\u3400-\u4DBF\u4E00-\u9FFF\u{20000}-\u{2FA1F}]/u;
function zhDictCompareNew(options) {
    if (typeof options === 'function') {
        options = { failback: options };
    }
    let failback = (options = options || {}).failback;
    if (failback == null) {
        if (typeof naturalCompare.caseInsensitive === 'function') {
            failback = naturalCompare.caseInsensitive;
        }
        else {
            failback = (a, b) => naturalCompare(a, b, {
                caseInsensitive: true
            });
        }
    }
    return function zhDictCompare(a, b) {
        let len01 = UString.size(a);
        let len02 = UString.size(b);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5REFBMEQ7QUFDMUQsMkRBQWtEO0FBSWxELHNDQUF1QztBQUV2Qzs7R0FFRztBQUNRLFFBQUEsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLENBQWEsRUFBRSxDQUFhLEVBQUUsRUFBRTtJQUVsRSxPQUFPLGlDQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFFakQsT0FBTyxpQ0FBWSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVk7WUFFNUQsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNWLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFFL0IsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDLEVBQUUsRUFBYyxDQUFDLENBQUMsQ0FBQTtJQUNwQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDRixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUMvRixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQzlCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ25DLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUN2RCxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixFQUFFO0lBQ0YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDL0YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUM5QixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNwQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFD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RyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFWCxNQUFNO2lCQUNOO2FBQ0Q7U0FDRDtRQUVELElBQUksaUNBQXlCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGlDQUF5QixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFDdEY7WUFDQyxLQUFLLElBQUksSUFBSSxJQUFJLDJCQUFtQixFQUNwQztnQkFDQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdkIsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRXZCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFDdEI7b0JBQ0MsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFcEIsTUFBTTtpQkFDTjthQUNEO1NBQ0Q7UUFFRCxPQUFPLEVBQUUsSUFBSSxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzdCLENBQUMsQ0FBQTtBQUNGLENBQUM7QUExSEQsNENBMEhDO0FBRUQ7O0dBRUc7QUFDVSxRQUFBLGFBQWEsR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO0FBRWhEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXNGRTtBQUVGLGtCQUFlLE9BQWtDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbmF0dXJhbENvbXBhcmUgPSByZXF1aXJlKCdzdHJpbmctbmF0dXJhbC1jb21wYXJlJyk7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuaW1wb3J0IFN0clV0aWwgPSByZXF1aXJlKCdzdHItdXRpbCcpO1xuaW1wb3J0IGxpYlRhYmxlIGZyb20gJ2Nqay1jb252L2xpYi96aC90YWJsZSc7XG5pbXBvcnQgeyB0ZXh0TGlzdCwgc2x1Z2lmeSB9IGZyb20gJ2Nqay1jb252L2xpYi96aC90YWJsZS9saXN0JztcbmltcG9ydCBVU3RyaW5nID0gcmVxdWlyZSgndW5pLXN0cmluZycpO1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBsZXQgX3poRGljdENvbXBhcmVUYWJsZSA9ICgoYTogc3RyaW5nW11bXSwgYjogc3RyaW5nW11bXSkgPT5cbntcblx0cmV0dXJuIGFycmF5X3VuaXF1ZShhLm1hcCgodmFsdWUsIGluZGV4LCBhcnJheSkgPT5cblx0e1xuXHRcdHJldHVybiBhcnJheV91bmlxdWUodmFsdWUucmVkdWNlKGZ1bmN0aW9uIChjLCBkLCBjdXJyZW50SW5kZXgpXG5cdFx0e1xuXHRcdFx0Yy5wdXNoKGQpO1xuXHRcdFx0Yy5wdXNoKGJbaW5kZXhdW2N1cnJlbnRJbmRleF0pO1xuXG5cdFx0XHRyZXR1cm4gYztcblx0XHR9LCBbXSBhcyBzdHJpbmdbXSkpXG5cdH0pKTtcbn0pKFtcblx0WyfkuIAnLCAn5LqMJywgJ+S4pCcsICfkuIknLCAn5ZubJywgJ+S6lCcsICflha0nLCAn5LiDJywgJ+WFqycsICfkuZ0nLCAn5Y2BJywgJ+WNgScsICfpm7YnLCAn5bm+JywgJ+WAiycsICfnmb4nLCAn5Y2DJywgJ+iQrCcsICflhIQnXSxcblx0WyfliJ0nLCAn5LiKJywgJ+S4rScsICfkuIsnLCAn5bemJywgJ+WPsyddLFxuXHRbJ+adsScsICfljZcnLCAn6KW/JywgJ+WMlyddLFxuXHRbJ+WkpycsICflsI8nXSxcblx0Wyfpq5gnLCAn5L2OJ10sXG5cdFsn6ZW3JywgJ+efrScsICfnspcnLCAn57SwJ10sXG5cdFsn5YWnJywgJ+WkliddLFxuXHRbJ+eUtycsICflpbMnXSxcblx0WyfliY0nLCAn5b6MJ10sXG5cdFsn5LuWJywgJ+WluScsICflroMnLCAn5oiRJywgJ+S9oCcsICflkL4nLCAn5rGdJ10sXG5cdFsn5b+rJywgJ+aFoiddLFxuXHRbJ+aYpScsICflpI8nLCAn56eLJywgJ+WGrCddLFxuXHRbJ+WjuScsICfosrMnLCAn5Y+DJywgJ+iChicsICfkvI0nLCAn6Zm4JywgJ+afkicsICfmjYwnLCAn546WJywgJ+aLvicsICfku4AnXSxcblx0WyfliqMnLCAn5YSqJ10sXG5dLCBbXG5cdFsn5LiAJywgJ+S6jCcsICfkuKQnLCAn5LiJJywgJ+WbmycsICfkupQnLCAn5YWtJywgJ+S4gycsICflhasnLCAn5LmdJywgJ+WNgScsICfljYEnLCAn6Zu2JywgJ+WHoCcsICfkuKonLCAn55m+JywgJ+WNgycsICfkuIcnLCAn5Lq/J10sXG5cdFsn5YidJywgJ+S4iicsICfkuK0nLCAn5LiLJywgJ+W3picsICflj7MnXSxcblx0WyfkuJwnLCAn5Y2XJywgJ+ilvycsICfljJcnXSxcblx0WyflpKcnLCAn5bCPJ10sXG5cdFsn6auYJywgJ+S9jiddLFxuXHRbJ+mVvycsICfnn60nLCAn57KXJywgJ+e7hiddLFxuXHRbJ+WGhScsICflpJYnXSxcblx0WyfnlLcnLCAn5aWzJ10sXG5cdFsn5YmNJywgJ+WQjiddLFxuXHRbJ+S7licsICflpbknLCAn5a6DJywgJ+aIkScsICfkvaAnLCAn5ZC+JywgJ+axnSddLFxuXHRbJ+W/qycsICfmhaInXSxcblx0WyfmmKUnLCAn5aSPJywgJ+eniycsICflhqwnXSxcblx0Wyflo7knLCAn6LSwJywgJ+WPgicsICfogoYnLCAn5LyNJywgJ+mZhicsICfmn5InLCAn5o2MJywgJ+eOlicsICfmi74nLCAn5LuAJ10sXG5cdFsn5YqjJywgJ+S8mCddLFxuXSk7XG5cbmV4cG9ydCBsZXQgX3poRGljdENvbXBhcmVUYWJsZV9jaGFycyA9IGFycmF5X3VuaXF1ZShfemhEaWN0Q29tcGFyZVRhYmxlLmZsYXQoKSk7XG5cbmV4cG9ydCBjb25zdCBSRV9aSCA9IC9bXFx1MzQwMC1cXHU0REJGXFx1NEUwMC1cXHU5RkZGXFx1ezIwMDAwfS1cXHV7MkZBMUZ9XS91O1xuXG5leHBvcnQgaW50ZXJmYWNlIElGbkNvbXBhcmVcbntcblx0KGE6IHN0cmluZywgYjogc3RyaW5nKTogbnVtYmVyXG59XG5cbi8qKlxuICog5YyF6KOd5o6S5bqP5q+U6LyD5Ye95pW4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6aERpY3RDb21wYXJlTmV3KGZhaWxiYWNrPzogSUZuQ29tcGFyZSk6IElGbkNvbXBhcmVcbmV4cG9ydCBmdW5jdGlvbiB6aERpY3RDb21wYXJlTmV3KG9wdGlvbnM/OiB7XG5cdGZhaWxiYWNrPzogSUZuQ29tcGFyZVxufSk6IElGbkNvbXBhcmVcbmV4cG9ydCBmdW5jdGlvbiB6aERpY3RDb21wYXJlTmV3KG9wdGlvbnM/OiBJRm5Db21wYXJlIHwge1xuXHRmYWlsYmFjaz86IElGbkNvbXBhcmVcbn0pOiBJRm5Db21wYXJlXG57XG5cdGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJylcblx0e1xuXHRcdG9wdGlvbnMgPSB7IGZhaWxiYWNrOiBvcHRpb25zIH07XG5cdH1cblxuXHRsZXQgZmFpbGJhY2sgPSAob3B0aW9ucyA9IG9wdGlvbnMgfHwge30pLmZhaWxiYWNrO1xuXG5cdGlmIChmYWlsYmFjayA9PSBudWxsKVxuXHR7XG5cdFx0aWYgKHR5cGVvZiBuYXR1cmFsQ29tcGFyZS5jYXNlSW5zZW5zaXRpdmUgPT09ICdmdW5jdGlvbicpXG5cdFx0e1xuXHRcdFx0ZmFpbGJhY2sgPSBuYXR1cmFsQ29tcGFyZS5jYXNlSW5zZW5zaXRpdmVcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGZhaWxiYWNrID0gKGEsIGIpID0+IG5hdHVyYWxDb21wYXJlKGEsIGIsIHtcblx0XHRcdFx0Y2FzZUluc2Vuc2l0aXZlOiB0cnVlXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0fVxuXG5cdHJldHVybiBmdW5jdGlvbiB6aERpY3RDb21wYXJlKGE6IHN0cmluZywgYjogc3RyaW5nKTogbnVtYmVyXG5cdHtcblx0XHRsZXQgbGVuMDEgPSBVU3RyaW5nLnNpemUoYSk7XG5cdFx0bGV0IGxlbjAyID0gVVN0cmluZy5zaXplKGIpO1xuXG5cdFx0LyoqXG5cdFx0ICog5YSq5YWI5o6S5bqP5Zau5LiA5a2X5YWDXG5cdFx0ICovXG5cdFx0aWYgKChsZW4wMSAhPSBsZW4wMikgJiYgKGxlbjAxID09PSAxIHx8IGxlbjAyID09PSAxKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gbGVuMDEgLSBsZW4wMlxuXHRcdH1cblxuXHRcdGxldCBfYyA9IDA7XG5cblx0XHRsZXQgX2EwID0gYVswXTtcblx0XHRsZXQgX2IwID0gYlswXTtcblxuXHRcdGxldCBfYTogbnVtYmVyO1xuXHRcdGxldCBfYjogbnVtYmVyO1xuXG5cdFx0bGV0IGFhID0gUkVfWkgudGVzdChhWzBdKTtcblx0XHRsZXQgYmIgPSBSRV9aSC50ZXN0KGJbMF0pO1xuXG5cdFx0aWYgKGFhICYmIGJiKVxuXHRcdHtcblx0XHRcdGlmIChhLmxlbmd0aCAhPSBiLmxlbmd0aCAmJiAoYS5sZW5ndGggPT0gMSB8fCBiLmxlbmd0aCA9PSAxKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGEubGVuZ3RoIC0gYi5sZW5ndGhcblx0XHRcdH1cblxuXHRcdFx0X2EgPSBfemhEaWN0Q29tcGFyZVRhYmxlWzBdLmluZGV4T2YoYVswXSk7XG5cdFx0XHRfYiA9IF96aERpY3RDb21wYXJlVGFibGVbMF0uaW5kZXhPZihiWzBdKTtcblxuXHRcdFx0YWEgPSBfYSAhPSAtMTtcblx0XHRcdGJiID0gX2IgIT0gLTE7XG5cblx0XHRcdGlmIChhYSAmJiAhYmIpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAtMVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoIWFhICYmIGJiKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gMVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0aWYgKGFhICYmICFiYilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIDBcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKCFhYSAmJiBiYilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIC0xXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKF9hMCAhPSBudWxsKVxuXHRcdHtcblx0XHRcdGxldCBsZW4gPSBhLmxlbmd0aDtcblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKCFhW2ldIHx8ICFiW2ldIHx8IGFbaV0gPT0gbnVsbCB8fCBiW2ldID09IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhW2ldICE9PSBiW2ldKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X2EwID0gYVtpXTtcblx0XHRcdFx0XHRfYjAgPSBiW2ldO1xuXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoX3poRGljdENvbXBhcmVUYWJsZV9jaGFycy5pbmNsdWRlcyhfYTApICYmIF96aERpY3RDb21wYXJlVGFibGVfY2hhcnMuaW5jbHVkZXMoX2IwKSlcblx0XHR7XG5cdFx0XHRmb3IgKGxldCBfYXJyIG9mIF96aERpY3RDb21wYXJlVGFibGUpXG5cdFx0XHR7XG5cdFx0XHRcdF9hID0gX2Fyci5pbmRleE9mKF9hMCk7XG5cdFx0XHRcdF9iID0gX2Fyci5pbmRleE9mKF9iMCk7XG5cblx0XHRcdFx0aWYgKF9hID4gLTEgJiYgX2IgPiAtMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9jID0gKF9hIC0gX2IpIHx8IDA7XG5cblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBfYyB8fCBmYWlsYmFjayhhLCBiKTtcblx0fVxufVxuXG4vKipcbiAqIOaOkuW6j+Wtl+WFuOWwiOeUqOeahOavlOi8g+WHveaVuFxuICovXG5leHBvcnQgY29uc3QgemhEaWN0Q29tcGFyZSA9IHpoRGljdENvbXBhcmVOZXcoKTtcblxuLypcbmV4cG9ydCBmdW5jdGlvbiB6aERpY3RDb21wYXJlKGE6IHN0cmluZywgYjogc3RyaW5nKTogbnVtYmVyXG57XG5cdGxldCBfYyA9IDA7XG5cblx0bGV0IF9hMCA9IGFbMF07XG5cdGxldCBfYjAgPSBiWzBdO1xuXG5cdGxldCBfYTogbnVtYmVyO1xuXHRsZXQgX2I6IG51bWJlcjtcblxuXHRsZXQgYWEgPSBSRV9aSC50ZXN0KGFbMF0pO1xuXHRsZXQgYmIgPSBSRV9aSC50ZXN0KGJbMF0pO1xuXG5cdGlmIChhYSAmJiBiYilcblx0e1xuXHRcdGlmIChhLmxlbmd0aCAhPSBiLmxlbmd0aCAmJiAoYS5sZW5ndGggPT0gMSB8fCBiLmxlbmd0aCA9PSAxKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gYS5sZW5ndGggLSBiLmxlbmd0aFxuXHRcdH1cblxuXHRcdF9hID0gX3poRGljdENvbXBhcmVUYWJsZVswXS5pbmRleE9mKGFbMF0pO1xuXHRcdF9iID0gX3poRGljdENvbXBhcmVUYWJsZVswXS5pbmRleE9mKGJbMF0pO1xuXG5cdFx0YWEgPSBfYSAhPSAtMTtcblx0XHRiYiA9IF9iICE9IC0xO1xuXG5cdFx0aWYgKGFhICYmICFiYilcblx0XHR7XG5cdFx0XHRyZXR1cm4gLTFcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIWFhICYmIGJiKVxuXHRcdHtcblx0XHRcdHJldHVybiAxXG5cdFx0fVxuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdGlmIChhYSAmJiAhYmIpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIDBcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIWFhICYmIGJiKVxuXHRcdHtcblx0XHRcdHJldHVybiAtMVxuXHRcdH1cblx0fVxuXG5cdGlmIChfYTAgIT0gbnVsbClcblx0e1xuXHRcdGxldCBsZW4gPSBhLmxlbmd0aDtcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKCFhW2ldIHx8ICFiW2ldIHx8IGFbaV0gPT0gbnVsbCB8fCBiW2ldID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoYVtpXSAhPT0gYltpXSlcblx0XHRcdHtcblx0XHRcdFx0X2EwID0gYVtpXTtcblx0XHRcdFx0X2IwID0gYltpXTtcblxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRpZiAoX3poRGljdENvbXBhcmVUYWJsZV9jaGFycy5pbmNsdWRlcyhfYTApICYmIF96aERpY3RDb21wYXJlVGFibGVfY2hhcnMuaW5jbHVkZXMoX2IwKSlcblx0e1xuXHRcdGZvciAobGV0IF9hcnIgb2YgX3poRGljdENvbXBhcmVUYWJsZSlcblx0XHR7XG5cdFx0XHRfYSA9IF9hcnIuaW5kZXhPZihfYTApO1xuXHRcdFx0X2IgPSBfYXJyLmluZGV4T2YoX2IwKTtcblxuXHRcdFx0aWYgKF9hID4gLTEgJiYgX2IgPiAtMSlcblx0XHRcdHtcblx0XHRcdFx0X2MgPSAoX2EgLSBfYikgfHwgMDtcblxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gX2MgfHwgbmF0dXJhbENvbXBhcmUuY2FzZUluc2Vuc2l0aXZlKGEsIGIpO1xufVxuKi9cblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0cyBhcyB0eXBlb2YgaW1wb3J0KCcuL3NvcnQnKTtcbiJdfQ==