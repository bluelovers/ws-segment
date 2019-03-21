"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const naturalCompare = require("string-natural-compare");
const array_hyper_unique_1 = require("array-hyper-unique");
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
    ['上', '下', '左', '右'],
    ['東', '南', '西', '北'],
    ['大', '小'],
    ['高', '低'],
    ['長', '短'],
    ['內', '外'],
    ['男', '女'],
    ['前', '後'],
    ['只', '支', '隻'],
    ['他', '她', '它', '我', '你', '吾', '汝'],
    ['快', '慢'],
    ['春', '夏', '秋', '冬'],
    ['什', '甚'],
    ['侭', '儘', '尽', '盡'],
    ['的', '得'],
    ['胡', '糊', '鬍'],
    ['壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖', '拾', '什'],
    ['儅', '噹', '当', '當'],
    ['炮', '砲', '炰', '泡'],
    ['仲'],
    ['原'],
], [
    ['一', '二', '两', '三', '四', '五', '六', '七', '八', '九', '十', '十', '零', '几', '个', '百', '千', '万', '亿'],
    ['上', '下', '左', '右'],
    ['东', '南', '西', '北'],
    ['大', '小'],
    ['高', '低'],
    ['长', '短'],
    ['内', '外'],
    ['男', '女'],
    ['前', '后'],
    ['只', '支', '隻'],
    ['他', '她', '它', '我', '你', '吾', '汝'],
    ['快', '慢'],
    ['春', '夏', '秋', '冬'],
    ['什', '甚'],
    ['侭', '儘', '尽', '盡'],
    ['的', '得'],
    ['胡', '糊', '鬍'],
    ['壹', '贰', '参', '肆', '伍', '陆', '柒', '捌', '玖', '拾', '什'],
    ['儅', '噹', '当', '當'],
    ['炮', '砲', '炰', '泡'],
    ['中'],
    ['元'],
]);
exports._zhDictCompareTable_chars = array_hyper_unique_1.array_unique(exports._zhDictCompareTable.flat());
exports.RE_ZH = /[\u3400-\u4DBF\u4E00-\u9FFF\u{20000}-\u{2FA1F}]/u;
function zhDictCompareNew(options) {
    if (typeof options === 'function') {
        options = { failback: options };
    }
    let failback = (options = options || {}).failback;
    if (failback == null) {
        failback = naturalCompare.caseInsensitive;
    }
    return function zhDictCompare(a, b) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5REFBMEQ7QUFDMUQsMkRBQWtEO0FBS2xEOztHQUVHO0FBQ1EsUUFBQSxtQkFBbUIsR0FBRyxDQUFDLENBQUMsQ0FBYSxFQUFFLENBQWEsRUFBRSxFQUFFO0lBRWxFLE9BQU8saUNBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUVqRCxPQUFPLGlDQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWTtZQUU1RCxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1YsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUUvQixPQUFPLENBQUMsQ0FBQztRQUNWLENBQUMsRUFBRSxFQUFjLENBQUMsQ0FBQyxDQUFBO0lBQ3BCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztJQUNGLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQy9GLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDZixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNuQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDVixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNwQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDVixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNwQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDVixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ2YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ3ZELENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFFO0lBQ3RCLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFFO0lBQ3RCLENBQUUsR0FBRyxDQUFFO0lBQ1AsQ0FBRSxHQUFHLENBQUU7Q0FDUCxFQUFFO0lBQ0YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDL0YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDcEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDcEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNmLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ25DLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDZixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDdkQsQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUU7SUFDdEIsQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFF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aUJBQ047cUJBQ0ksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN0QjtvQkFDQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRVgsTUFBTTtpQkFDTjthQUNEO1NBQ0Q7UUFFRCxJQUFJLGlDQUF5QixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxpQ0FBeUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQ3RGO1lBQ0MsS0FBSyxJQUFJLElBQUksSUFBSSwyQkFBbUIsRUFDcEM7Z0JBQ0MsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZCLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUV2QixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQ3RCO29CQUNDLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRXBCLE1BQU07aUJBQ047YUFDRDtTQUNEO1FBRUQsT0FBTyxFQUFFLElBQUksUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM3QixDQUFDLENBQUE7QUFDRixDQUFDO0FBckdELDRDQXFHQztBQUVZLFFBQUEsYUFBYSxHQUFHLGdCQUFnQixFQUFFLENBQUM7QUFFaEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBc0ZFO0FBRUYsa0JBQWUsT0FBa0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBuYXR1cmFsQ29tcGFyZSA9IHJlcXVpcmUoJ3N0cmluZy1uYXR1cmFsLWNvbXBhcmUnKTtcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSB9IGZyb20gJ2FycmF5LWh5cGVyLXVuaXF1ZSc7XG5pbXBvcnQgU3RyVXRpbCA9IHJlcXVpcmUoJ3N0ci11dGlsJyk7XG5pbXBvcnQgbGliVGFibGUgZnJvbSAnY2prLWNvbnYvbGliL3poL3RhYmxlJztcbmltcG9ydCB7IHRleHRMaXN0LCBzbHVnaWZ5IH0gZnJvbSAnY2prLWNvbnYvbGliL3poL3RhYmxlL2xpc3QnO1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBsZXQgX3poRGljdENvbXBhcmVUYWJsZSA9ICgoYTogc3RyaW5nW11bXSwgYjogc3RyaW5nW11bXSkgPT5cbntcblx0cmV0dXJuIGFycmF5X3VuaXF1ZShhLm1hcCgodmFsdWUsIGluZGV4LCBhcnJheSkgPT5cblx0e1xuXHRcdHJldHVybiBhcnJheV91bmlxdWUodmFsdWUucmVkdWNlKGZ1bmN0aW9uIChjLCBkLCBjdXJyZW50SW5kZXgpXG5cdFx0e1xuXHRcdFx0Yy5wdXNoKGQpO1xuXHRcdFx0Yy5wdXNoKGJbaW5kZXhdW2N1cnJlbnRJbmRleF0pO1xuXG5cdFx0XHRyZXR1cm4gYztcblx0XHR9LCBbXSBhcyBzdHJpbmdbXSkpXG5cdH0pKTtcbn0pKFtcblx0WyfkuIAnLCAn5LqMJywgJ+S4pCcsICfkuIknLCAn5ZubJywgJ+S6lCcsICflha0nLCAn5LiDJywgJ+WFqycsICfkuZ0nLCAn5Y2BJywgJ+WNgScsICfpm7YnLCAn5bm+JywgJ+WAiycsICfnmb4nLCAn5Y2DJywgJ+iQrCcsICflhIQnXSxcblx0WyfkuIonLCAn5LiLJywgJ+W3picsICflj7MnXSxcblx0WyfmnbEnLCAn5Y2XJywgJ+ilvycsICfljJcnXSxcblx0WyflpKcnLCAn5bCPJ10sXG5cdFsn6auYJywgJ+S9jiddLFxuXHRbJ+mVtycsICfnn60nXSxcblx0WyflhacnLCAn5aSWJ10sXG5cdFsn55S3JywgJ+WlsyddLFxuXHRbJ+WJjScsICflvownXSxcblx0Wyflj6onLCAn5pSvJywgJ+mauyddLFxuXHRbJ+S7licsICflpbknLCAn5a6DJywgJ+aIkScsICfkvaAnLCAn5ZC+JywgJ+axnSddLFxuXHRbJ+W/qycsICfmhaInXSxcblx0WyfmmKUnLCAn5aSPJywgJ+eniycsICflhqwnXSxcblx0Wyfku4AnLCAn55SaJ10sXG5cdFsn5L6tJywgJ+WEmCcsICflsL0nLCAn55uhJ10sXG5cdFsn55qEJywgJ+W+lyddLFxuXHRbJ+iDoScsICfns4onLCAn6ayNJ10sXG5cdFsn5aO5JywgJ+iysycsICflj4MnLCAn6IKGJywgJ+S8jScsICfpmbgnLCAn5p+SJywgJ+aNjCcsICfnjpYnLCAn5ou+JywgJ+S7gCddLFxuXHRbICflhIUnLCAn5Zm5JywgJ+W9kycsICfnlbYnIF0sXG5cdFsgJ+eCricsICfnoLInLCAn54KwJywgJ+azoScgXSxcblx0WyAn5LuyJyBdLFxuXHRbICfljp8nIF0sXG5dLCBbXG5cdFsn5LiAJywgJ+S6jCcsICfkuKQnLCAn5LiJJywgJ+WbmycsICfkupQnLCAn5YWtJywgJ+S4gycsICflhasnLCAn5LmdJywgJ+WNgScsICfljYEnLCAn6Zu2JywgJ+WHoCcsICfkuKonLCAn55m+JywgJ+WNgycsICfkuIcnLCAn5Lq/J10sXG5cdFsn5LiKJywgJ+S4iycsICflt6YnLCAn5Y+zJ10sXG5cdFsn5LicJywgJ+WNlycsICfopb8nLCAn5YyXJ10sXG5cdFsn5aSnJywgJ+WwjyddLFxuXHRbJ+mrmCcsICfkvY4nXSxcblx0Wyfplb8nLCAn55+tJ10sXG5cdFsn5YaFJywgJ+WkliddLFxuXHRbJ+eUtycsICflpbMnXSxcblx0WyfliY0nLCAn5ZCOJ10sXG5cdFsn5Y+qJywgJ+aUrycsICfpmrsnXSxcblx0Wyfku5YnLCAn5aW5JywgJ+WugycsICfmiJEnLCAn5L2gJywgJ+WQvicsICfmsZ0nXSxcblx0Wyflv6snLCAn5oWiJ10sXG5cdFsn5pilJywgJ+WkjycsICfnp4snLCAn5YasJ10sXG5cdFsn5LuAJywgJ+eUmiddLFxuXHRbJ+S+rScsICflhJgnLCAn5bC9JywgJ+eboSddLFxuXHRbJ+eahCcsICflvpcnXSxcblx0Wyfog6EnLCAn57OKJywgJ+msjSddLFxuXHRbJ+WjuScsICfotLAnLCAn5Y+CJywgJ+iChicsICfkvI0nLCAn6ZmGJywgJ+afkicsICfmjYwnLCAn546WJywgJ+aLvicsICfku4AnXSxcblx0WyAn5YSFJywgJ+WZuScsICflvZMnLCAn55W2JyBdLFxuXHRbICfngq4nLCAn56CyJywgJ+eCsCcsICfms6EnIF0sXG5cdFsgJ+S4rScgXSxcblx0WyAn5YWDJyBdLFxuXSk7XG5cbmV4cG9ydCBsZXQgX3poRGljdENvbXBhcmVUYWJsZV9jaGFycyA9IGFycmF5X3VuaXF1ZShfemhEaWN0Q29tcGFyZVRhYmxlLmZsYXQoKSk7XG5cbmV4cG9ydCBjb25zdCBSRV9aSCA9IC9bXFx1MzQwMC1cXHU0REJGXFx1NEUwMC1cXHU5RkZGXFx1ezIwMDAwfS1cXHV7MkZBMUZ9XS91O1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSUZuQ29tcGFyZVxue1xuXHQoYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBudW1iZXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHpoRGljdENvbXBhcmVOZXcoZmFpbGJhY2s/OiBJRm5Db21wYXJlKTogSUZuQ29tcGFyZVxuZXhwb3J0IGZ1bmN0aW9uIHpoRGljdENvbXBhcmVOZXcob3B0aW9ucz86IHtcblx0ZmFpbGJhY2s/OiBJRm5Db21wYXJlXG59KTogSUZuQ29tcGFyZVxuZXhwb3J0IGZ1bmN0aW9uIHpoRGljdENvbXBhcmVOZXcob3B0aW9ucz86IElGbkNvbXBhcmUgfCB7XG5cdGZhaWxiYWNrPzogSUZuQ29tcGFyZVxufSk6IElGbkNvbXBhcmVcbntcblx0aWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKVxuXHR7XG5cdFx0b3B0aW9ucyA9IHsgZmFpbGJhY2s6IG9wdGlvbnMgfTtcblx0fVxuXG5cdGxldCBmYWlsYmFjayA9IChvcHRpb25zID0gb3B0aW9ucyB8fCB7fSkuZmFpbGJhY2s7XG5cblx0aWYgKGZhaWxiYWNrID09IG51bGwpXG5cdHtcblx0XHRmYWlsYmFjayA9IG5hdHVyYWxDb21wYXJlLmNhc2VJbnNlbnNpdGl2ZVxuXHR9XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHpoRGljdENvbXBhcmUoYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBudW1iZXJcblx0e1xuXHRcdGxldCBfYyA9IDA7XG5cblx0XHRsZXQgX2EwID0gYVswXTtcblx0XHRsZXQgX2IwID0gYlswXTtcblxuXHRcdGxldCBfYTogbnVtYmVyO1xuXHRcdGxldCBfYjogbnVtYmVyO1xuXG5cdFx0bGV0IGFhID0gUkVfWkgudGVzdChhWzBdKTtcblx0XHRsZXQgYmIgPSBSRV9aSC50ZXN0KGJbMF0pO1xuXG5cdFx0aWYgKGFhICYmIGJiKVxuXHRcdHtcblx0XHRcdGlmIChhLmxlbmd0aCAhPSBiLmxlbmd0aCAmJiAoYS5sZW5ndGggPT0gMSB8fCBiLmxlbmd0aCA9PSAxKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGEubGVuZ3RoIC0gYi5sZW5ndGhcblx0XHRcdH1cblxuXHRcdFx0X2EgPSBfemhEaWN0Q29tcGFyZVRhYmxlWzBdLmluZGV4T2YoYVswXSk7XG5cdFx0XHRfYiA9IF96aERpY3RDb21wYXJlVGFibGVbMF0uaW5kZXhPZihiWzBdKTtcblxuXHRcdFx0YWEgPSBfYSAhPSAtMTtcblx0XHRcdGJiID0gX2IgIT0gLTE7XG5cblx0XHRcdGlmIChhYSAmJiAhYmIpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAtMVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoIWFhICYmIGJiKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gMVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0aWYgKGFhICYmICFiYilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIDBcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKCFhYSAmJiBiYilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIC0xXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKF9hMCAhPSBudWxsKVxuXHRcdHtcblx0XHRcdGxldCBsZW4gPSBhLmxlbmd0aDtcblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKCFhW2ldIHx8ICFiW2ldIHx8IGFbaV0gPT0gbnVsbCB8fCBiW2ldID09IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhW2ldICE9PSBiW2ldKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X2EwID0gYVtpXTtcblx0XHRcdFx0XHRfYjAgPSBiW2ldO1xuXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoX3poRGljdENvbXBhcmVUYWJsZV9jaGFycy5pbmNsdWRlcyhfYTApICYmIF96aERpY3RDb21wYXJlVGFibGVfY2hhcnMuaW5jbHVkZXMoX2IwKSlcblx0XHR7XG5cdFx0XHRmb3IgKGxldCBfYXJyIG9mIF96aERpY3RDb21wYXJlVGFibGUpXG5cdFx0XHR7XG5cdFx0XHRcdF9hID0gX2Fyci5pbmRleE9mKF9hMCk7XG5cdFx0XHRcdF9iID0gX2Fyci5pbmRleE9mKF9iMCk7XG5cblx0XHRcdFx0aWYgKF9hID4gLTEgJiYgX2IgPiAtMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9jID0gKF9hIC0gX2IpIHx8IDA7XG5cblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBfYyB8fCBmYWlsYmFjayhhLCBiKTtcblx0fVxufVxuXG5leHBvcnQgY29uc3QgemhEaWN0Q29tcGFyZSA9IHpoRGljdENvbXBhcmVOZXcoKTtcblxuLypcbmV4cG9ydCBmdW5jdGlvbiB6aERpY3RDb21wYXJlKGE6IHN0cmluZywgYjogc3RyaW5nKTogbnVtYmVyXG57XG5cdGxldCBfYyA9IDA7XG5cblx0bGV0IF9hMCA9IGFbMF07XG5cdGxldCBfYjAgPSBiWzBdO1xuXG5cdGxldCBfYTogbnVtYmVyO1xuXHRsZXQgX2I6IG51bWJlcjtcblxuXHRsZXQgYWEgPSBSRV9aSC50ZXN0KGFbMF0pO1xuXHRsZXQgYmIgPSBSRV9aSC50ZXN0KGJbMF0pO1xuXG5cdGlmIChhYSAmJiBiYilcblx0e1xuXHRcdGlmIChhLmxlbmd0aCAhPSBiLmxlbmd0aCAmJiAoYS5sZW5ndGggPT0gMSB8fCBiLmxlbmd0aCA9PSAxKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gYS5sZW5ndGggLSBiLmxlbmd0aFxuXHRcdH1cblxuXHRcdF9hID0gX3poRGljdENvbXBhcmVUYWJsZVswXS5pbmRleE9mKGFbMF0pO1xuXHRcdF9iID0gX3poRGljdENvbXBhcmVUYWJsZVswXS5pbmRleE9mKGJbMF0pO1xuXG5cdFx0YWEgPSBfYSAhPSAtMTtcblx0XHRiYiA9IF9iICE9IC0xO1xuXG5cdFx0aWYgKGFhICYmICFiYilcblx0XHR7XG5cdFx0XHRyZXR1cm4gLTFcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIWFhICYmIGJiKVxuXHRcdHtcblx0XHRcdHJldHVybiAxXG5cdFx0fVxuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdGlmIChhYSAmJiAhYmIpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIDBcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIWFhICYmIGJiKVxuXHRcdHtcblx0XHRcdHJldHVybiAtMVxuXHRcdH1cblx0fVxuXG5cdGlmIChfYTAgIT0gbnVsbClcblx0e1xuXHRcdGxldCBsZW4gPSBhLmxlbmd0aDtcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKCFhW2ldIHx8ICFiW2ldIHx8IGFbaV0gPT0gbnVsbCB8fCBiW2ldID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoYVtpXSAhPT0gYltpXSlcblx0XHRcdHtcblx0XHRcdFx0X2EwID0gYVtpXTtcblx0XHRcdFx0X2IwID0gYltpXTtcblxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRpZiAoX3poRGljdENvbXBhcmVUYWJsZV9jaGFycy5pbmNsdWRlcyhfYTApICYmIF96aERpY3RDb21wYXJlVGFibGVfY2hhcnMuaW5jbHVkZXMoX2IwKSlcblx0e1xuXHRcdGZvciAobGV0IF9hcnIgb2YgX3poRGljdENvbXBhcmVUYWJsZSlcblx0XHR7XG5cdFx0XHRfYSA9IF9hcnIuaW5kZXhPZihfYTApO1xuXHRcdFx0X2IgPSBfYXJyLmluZGV4T2YoX2IwKTtcblxuXHRcdFx0aWYgKF9hID4gLTEgJiYgX2IgPiAtMSlcblx0XHRcdHtcblx0XHRcdFx0X2MgPSAoX2EgLSBfYikgfHwgMDtcblxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gX2MgfHwgbmF0dXJhbENvbXBhcmUuY2FzZUluc2Vuc2l0aXZlKGEsIGIpO1xufVxuKi9cblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0cyBhcyB0eXBlb2YgaW1wb3J0KCcuL3NvcnQnKTtcbiJdfQ==