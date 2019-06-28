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
        failback = naturalCompare.caseInsensitive;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5REFBMEQ7QUFDMUQsMkRBQWtEO0FBSWxELHNDQUF1QztBQUV2Qzs7R0FFRztBQUNRLFFBQUEsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLENBQWEsRUFBRSxDQUFhLEVBQUUsRUFBRTtJQUVsRSxPQUFPLGlDQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFFakQsT0FBTyxpQ0FBWSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVk7WUFFNUQsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNWLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFFL0IsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDLEVBQUUsRUFBYyxDQUFDLENBQUMsQ0FBQTtJQUNwQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDRixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUMvRixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQzlCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ25DLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUN2RCxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDVixFQUFFO0lBQ0YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDL0YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUM5QixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNwQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFD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O1lBQ0MsS0FBSyxJQUFJLElBQUksSUFBSSwyQkFBbUIsRUFDcEM7Z0JBQ0MsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZCLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUV2QixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQ3RCO29CQUNDLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRXBCLE1BQU07aUJBQ047YUFDRDtTQUNEO1FBRUQsT0FBTyxFQUFFLElBQUksUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM3QixDQUFDLENBQUE7QUFDRixDQUFDO0FBaEhELDRDQWdIQztBQUVEOztHQUVHO0FBQ1UsUUFBQSxhQUFhLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztBQUVoRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFzRkU7QUFFRixrQkFBZSxPQUFrQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG5hdHVyYWxDb21wYXJlID0gcmVxdWlyZSgnc3RyaW5nLW5hdHVyYWwtY29tcGFyZScpO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcbmltcG9ydCBTdHJVdGlsID0gcmVxdWlyZSgnc3RyLXV0aWwnKTtcbmltcG9ydCBsaWJUYWJsZSBmcm9tICdjamstY29udi9saWIvemgvdGFibGUnO1xuaW1wb3J0IHsgdGV4dExpc3QsIHNsdWdpZnkgfSBmcm9tICdjamstY29udi9saWIvemgvdGFibGUvbGlzdCc7XG5pbXBvcnQgVVN0cmluZyA9IHJlcXVpcmUoJ3VuaS1zdHJpbmcnKTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgbGV0IF96aERpY3RDb21wYXJlVGFibGUgPSAoKGE6IHN0cmluZ1tdW10sIGI6IHN0cmluZ1tdW10pID0+XG57XG5cdHJldHVybiBhcnJheV91bmlxdWUoYS5tYXAoKHZhbHVlLCBpbmRleCwgYXJyYXkpID0+XG5cdHtcblx0XHRyZXR1cm4gYXJyYXlfdW5pcXVlKHZhbHVlLnJlZHVjZShmdW5jdGlvbiAoYywgZCwgY3VycmVudEluZGV4KVxuXHRcdHtcblx0XHRcdGMucHVzaChkKTtcblx0XHRcdGMucHVzaChiW2luZGV4XVtjdXJyZW50SW5kZXhdKTtcblxuXHRcdFx0cmV0dXJuIGM7XG5cdFx0fSwgW10gYXMgc3RyaW5nW10pKVxuXHR9KSk7XG59KShbXG5cdFsn5LiAJywgJ+S6jCcsICfkuKQnLCAn5LiJJywgJ+WbmycsICfkupQnLCAn5YWtJywgJ+S4gycsICflhasnLCAn5LmdJywgJ+WNgScsICfljYEnLCAn6Zu2JywgJ+W5vicsICflgIsnLCAn55m+JywgJ+WNgycsICfokKwnLCAn5YSEJ10sXG5cdFsn5YidJywgJ+S4iicsICfkuK0nLCAn5LiLJywgJ+W3picsICflj7MnXSxcblx0WyfmnbEnLCAn5Y2XJywgJ+ilvycsICfljJcnXSxcblx0WyflpKcnLCAn5bCPJ10sXG5cdFsn6auYJywgJ+S9jiddLFxuXHRbJ+mVtycsICfnn60nLCAn57KXJywgJ+e0sCddLFxuXHRbJ+WFpycsICflpJYnXSxcblx0WyfnlLcnLCAn5aWzJ10sXG5cdFsn5YmNJywgJ+W+jCddLFxuXHRbJ+S7licsICflpbknLCAn5a6DJywgJ+aIkScsICfkvaAnLCAn5ZC+JywgJ+axnSddLFxuXHRbJ+W/qycsICfmhaInXSxcblx0WyfmmKUnLCAn5aSPJywgJ+eniycsICflhqwnXSxcblx0Wyflo7knLCAn6LKzJywgJ+WPgycsICfogoYnLCAn5LyNJywgJ+mZuCcsICfmn5InLCAn5o2MJywgJ+eOlicsICfmi74nLCAn5LuAJ10sXG5cdFsn5YqjJywgJ+WEqiddLFxuXSwgW1xuXHRbJ+S4gCcsICfkuownLCAn5LikJywgJ+S4iScsICflm5snLCAn5LqUJywgJ+WFrScsICfkuIMnLCAn5YWrJywgJ+S5nScsICfljYEnLCAn5Y2BJywgJ+mbticsICflh6AnLCAn5LiqJywgJ+eZvicsICfljYMnLCAn5LiHJywgJ+S6vyddLFxuXHRbJ+WInScsICfkuIonLCAn5LitJywgJ+S4iycsICflt6YnLCAn5Y+zJ10sXG5cdFsn5LicJywgJ+WNlycsICfopb8nLCAn5YyXJ10sXG5cdFsn5aSnJywgJ+WwjyddLFxuXHRbJ+mrmCcsICfkvY4nXSxcblx0Wyfplb8nLCAn55+tJywgJ+eylycsICfnu4YnXSxcblx0WyflhoUnLCAn5aSWJ10sXG5cdFsn55S3JywgJ+WlsyddLFxuXHRbJ+WJjScsICflkI4nXSxcblx0Wyfku5YnLCAn5aW5JywgJ+WugycsICfmiJEnLCAn5L2gJywgJ+WQvicsICfmsZ0nXSxcblx0Wyflv6snLCAn5oWiJ10sXG5cdFsn5pilJywgJ+WkjycsICfnp4snLCAn5YasJ10sXG5cdFsn5aO5JywgJ+i0sCcsICflj4InLCAn6IKGJywgJ+S8jScsICfpmYYnLCAn5p+SJywgJ+aNjCcsICfnjpYnLCAn5ou+JywgJ+S7gCddLFxuXHRbJ+WKoycsICfkvJgnXSxcbl0pO1xuXG5leHBvcnQgbGV0IF96aERpY3RDb21wYXJlVGFibGVfY2hhcnMgPSBhcnJheV91bmlxdWUoX3poRGljdENvbXBhcmVUYWJsZS5mbGF0KCkpO1xuXG5leHBvcnQgY29uc3QgUkVfWkggPSAvW1xcdTM0MDAtXFx1NERCRlxcdTRFMDAtXFx1OUZGRlxcdXsyMDAwMH0tXFx1ezJGQTFGfV0vdTtcblxuZXhwb3J0IGludGVyZmFjZSBJRm5Db21wYXJlXG57XG5cdChhOiBzdHJpbmcsIGI6IHN0cmluZyk6IG51bWJlclxufVxuXG4vKipcbiAqIOWMheijneaOkuW6j+avlOi8g+WHveaVuFxuICovXG5leHBvcnQgZnVuY3Rpb24gemhEaWN0Q29tcGFyZU5ldyhmYWlsYmFjaz86IElGbkNvbXBhcmUpOiBJRm5Db21wYXJlXG5leHBvcnQgZnVuY3Rpb24gemhEaWN0Q29tcGFyZU5ldyhvcHRpb25zPzoge1xuXHRmYWlsYmFjaz86IElGbkNvbXBhcmVcbn0pOiBJRm5Db21wYXJlXG5leHBvcnQgZnVuY3Rpb24gemhEaWN0Q29tcGFyZU5ldyhvcHRpb25zPzogSUZuQ29tcGFyZSB8IHtcblx0ZmFpbGJhY2s/OiBJRm5Db21wYXJlXG59KTogSUZuQ29tcGFyZVxue1xuXHRpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpXG5cdHtcblx0XHRvcHRpb25zID0geyBmYWlsYmFjazogb3B0aW9ucyB9O1xuXHR9XG5cblx0bGV0IGZhaWxiYWNrID0gKG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9KS5mYWlsYmFjaztcblxuXHRpZiAoZmFpbGJhY2sgPT0gbnVsbClcblx0e1xuXHRcdGZhaWxiYWNrID0gbmF0dXJhbENvbXBhcmUuY2FzZUluc2Vuc2l0aXZlXG5cdH1cblxuXHRyZXR1cm4gZnVuY3Rpb24gemhEaWN0Q29tcGFyZShhOiBzdHJpbmcsIGI6IHN0cmluZyk6IG51bWJlclxuXHR7XG5cdFx0bGV0IGxlbjAxID0gVVN0cmluZy5zaXplKGEpO1xuXHRcdGxldCBsZW4wMiA9IFVTdHJpbmcuc2l6ZShiKTtcblxuXHRcdC8qKlxuXHRcdCAqIOWEquWFiOaOkuW6j+WWruS4gOWtl+WFg1xuXHRcdCAqL1xuXHRcdGlmICgobGVuMDEgIT0gbGVuMDIpICYmIChsZW4wMSA9PT0gMSB8fCBsZW4wMiA9PT0gMSkpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGxlbjAxIC0gbGVuMDJcblx0XHR9XG5cblx0XHRsZXQgX2MgPSAwO1xuXG5cdFx0bGV0IF9hMCA9IGFbMF07XG5cdFx0bGV0IF9iMCA9IGJbMF07XG5cblx0XHRsZXQgX2E6IG51bWJlcjtcblx0XHRsZXQgX2I6IG51bWJlcjtcblxuXHRcdGxldCBhYSA9IFJFX1pILnRlc3QoYVswXSk7XG5cdFx0bGV0IGJiID0gUkVfWkgudGVzdChiWzBdKTtcblxuXHRcdGlmIChhYSAmJiBiYilcblx0XHR7XG5cdFx0XHRpZiAoYS5sZW5ndGggIT0gYi5sZW5ndGggJiYgKGEubGVuZ3RoID09IDEgfHwgYi5sZW5ndGggPT0gMSkpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBhLmxlbmd0aCAtIGIubGVuZ3RoXG5cdFx0XHR9XG5cblx0XHRcdF9hID0gX3poRGljdENvbXBhcmVUYWJsZVswXS5pbmRleE9mKGFbMF0pO1xuXHRcdFx0X2IgPSBfemhEaWN0Q29tcGFyZVRhYmxlWzBdLmluZGV4T2YoYlswXSk7XG5cblx0XHRcdGFhID0gX2EgIT0gLTE7XG5cdFx0XHRiYiA9IF9iICE9IC0xO1xuXG5cdFx0XHRpZiAoYWEgJiYgIWJiKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gLTFcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKCFhYSAmJiBiYilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIDFcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGlmIChhYSAmJiAhYmIpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAwXG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICghYWEgJiYgYmIpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAtMVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChfYTAgIT0gbnVsbClcblx0XHR7XG5cdFx0XHRsZXQgbGVuID0gYS5sZW5ndGg7XG5cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdGlmICghYVtpXSB8fCAhYltpXSB8fCBhW2ldID09IG51bGwgfHwgYltpXSA9PSBudWxsKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoYVtpXSAhPT0gYltpXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9hMCA9IGFbaV07XG5cdFx0XHRcdFx0X2IwID0gYltpXTtcblxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKF96aERpY3RDb21wYXJlVGFibGVfY2hhcnMuaW5jbHVkZXMoX2EwKSAmJiBfemhEaWN0Q29tcGFyZVRhYmxlX2NoYXJzLmluY2x1ZGVzKF9iMCkpXG5cdFx0e1xuXHRcdFx0Zm9yIChsZXQgX2FyciBvZiBfemhEaWN0Q29tcGFyZVRhYmxlKVxuXHRcdFx0e1xuXHRcdFx0XHRfYSA9IF9hcnIuaW5kZXhPZihfYTApO1xuXHRcdFx0XHRfYiA9IF9hcnIuaW5kZXhPZihfYjApO1xuXG5cdFx0XHRcdGlmIChfYSA+IC0xICYmIF9iID4gLTEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfYyA9IChfYSAtIF9iKSB8fCAwO1xuXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gX2MgfHwgZmFpbGJhY2soYSwgYik7XG5cdH1cbn1cblxuLyoqXG4gKiDmjpLluo/lrZflhbjlsIjnlKjnmoTmr5TovIPlh73mlbhcbiAqL1xuZXhwb3J0IGNvbnN0IHpoRGljdENvbXBhcmUgPSB6aERpY3RDb21wYXJlTmV3KCk7XG5cbi8qXG5leHBvcnQgZnVuY3Rpb24gemhEaWN0Q29tcGFyZShhOiBzdHJpbmcsIGI6IHN0cmluZyk6IG51bWJlclxue1xuXHRsZXQgX2MgPSAwO1xuXG5cdGxldCBfYTAgPSBhWzBdO1xuXHRsZXQgX2IwID0gYlswXTtcblxuXHRsZXQgX2E6IG51bWJlcjtcblx0bGV0IF9iOiBudW1iZXI7XG5cblx0bGV0IGFhID0gUkVfWkgudGVzdChhWzBdKTtcblx0bGV0IGJiID0gUkVfWkgudGVzdChiWzBdKTtcblxuXHRpZiAoYWEgJiYgYmIpXG5cdHtcblx0XHRpZiAoYS5sZW5ndGggIT0gYi5sZW5ndGggJiYgKGEubGVuZ3RoID09IDEgfHwgYi5sZW5ndGggPT0gMSkpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGEubGVuZ3RoIC0gYi5sZW5ndGhcblx0XHR9XG5cblx0XHRfYSA9IF96aERpY3RDb21wYXJlVGFibGVbMF0uaW5kZXhPZihhWzBdKTtcblx0XHRfYiA9IF96aERpY3RDb21wYXJlVGFibGVbMF0uaW5kZXhPZihiWzBdKTtcblxuXHRcdGFhID0gX2EgIT0gLTE7XG5cdFx0YmIgPSBfYiAhPSAtMTtcblxuXHRcdGlmIChhYSAmJiAhYmIpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIC0xXG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFhYSAmJiBiYilcblx0XHR7XG5cdFx0XHRyZXR1cm4gMVxuXHRcdH1cblx0fVxuXHRlbHNlXG5cdHtcblx0XHRpZiAoYWEgJiYgIWJiKVxuXHRcdHtcblx0XHRcdHJldHVybiAwXG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFhYSAmJiBiYilcblx0XHR7XG5cdFx0XHRyZXR1cm4gLTFcblx0XHR9XG5cdH1cblxuXHRpZiAoX2EwICE9IG51bGwpXG5cdHtcblx0XHRsZXQgbGVuID0gYS5sZW5ndGg7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICghYVtpXSB8fCAhYltpXSB8fCBhW2ldID09IG51bGwgfHwgYltpXSA9PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGFbaV0gIT09IGJbaV0pXG5cdFx0XHR7XG5cdFx0XHRcdF9hMCA9IGFbaV07XG5cdFx0XHRcdF9iMCA9IGJbaV07XG5cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aWYgKF96aERpY3RDb21wYXJlVGFibGVfY2hhcnMuaW5jbHVkZXMoX2EwKSAmJiBfemhEaWN0Q29tcGFyZVRhYmxlX2NoYXJzLmluY2x1ZGVzKF9iMCkpXG5cdHtcblx0XHRmb3IgKGxldCBfYXJyIG9mIF96aERpY3RDb21wYXJlVGFibGUpXG5cdFx0e1xuXHRcdFx0X2EgPSBfYXJyLmluZGV4T2YoX2EwKTtcblx0XHRcdF9iID0gX2Fyci5pbmRleE9mKF9iMCk7XG5cblx0XHRcdGlmIChfYSA+IC0xICYmIF9iID4gLTEpXG5cdFx0XHR7XG5cdFx0XHRcdF9jID0gKF9hIC0gX2IpIHx8IDA7XG5cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIF9jIHx8IG5hdHVyYWxDb21wYXJlLmNhc2VJbnNlbnNpdGl2ZShhLCBiKTtcbn1cbiovXG5cbmV4cG9ydCBkZWZhdWx0IGV4cG9ydHMgYXMgdHlwZW9mIGltcG9ydCgnLi9zb3J0Jyk7XG4iXX0=