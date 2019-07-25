"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FastGlob = require("fast-glob");
const BluebirdPromise = require("bluebird");
const line_1 = require("../lib/loader/line");
const index_1 = require("../lib/loader/segment/index");
const naturalCompare = require("string-natural-compare");
const util_1 = require("@novel-segment/util");
exports.zhDictCompare = util_1.zhDictCompare;
exports.getCjkName = util_1.getCjkName;
exports.DEFAULT_IGNORE = [
    //'char*',
    '**/skip',
    '**/jieba',
    '**/lazy',
    '**/synonym',
    '**/names',
];
function globDict(cwd, pattern, ignore = exports.DEFAULT_IGNORE) {
    return BluebirdPromise
        .resolve(FastGlob(pattern, {
        cwd,
        absolute: true,
        ignore,
        markDirectories: true,
    }));
}
exports.globDict = globDict;
function loadDictFile(file, fn, options) {
    options = options || {};
    const parseFn = options.parseFn = options.parseFn || index_1.parseLine;
    return line_1.default(file)
        .then(function (b) {
        if (!b) {
            return [];
        }
        return b.reduce(function (a, line, index, arr) {
            let bool;
            let data = parseFn(line);
            let cur = {
                data,
                line,
                index,
            };
            if (fn) {
                // @ts-ignore
                bool = fn(a, cur);
            }
            else {
                bool = true;
            }
            if (bool) {
                a.push(cur);
            }
            return a;
        }, []);
    });
}
exports.loadDictFile = loadDictFile;
var EnumLineType;
(function (EnumLineType) {
    EnumLineType[EnumLineType["BASE"] = 0] = "BASE";
    EnumLineType[EnumLineType["COMMENT"] = 1] = "COMMENT";
    EnumLineType[EnumLineType["COMMENT_TAG"] = 2] = "COMMENT_TAG";
})(EnumLineType = exports.EnumLineType || (exports.EnumLineType = {}));
function chkLineType(line) {
    let ret = EnumLineType.BASE;
    if (line.indexOf('//') == 0) {
        ret = EnumLineType.COMMENT;
        if (/ @todo/i.test(line)) {
            ret = EnumLineType.COMMENT_TAG;
        }
    }
    return ret;
}
exports.chkLineType = chkLineType;
function baseSortList(ls, bool) {
    return ls.sort(function (a, b) {
        // @ts-ignore
        return naturalCompare.caseInsensitive(a.cjk_id, b.cjk_id)
            // @ts-ignore
            || naturalCompare.caseInsensitive(a.data[1], b.data[1])
            // @ts-ignore
            || naturalCompare.caseInsensitive(a.data[0], b.data[0])
            // @ts-ignore
            || naturalCompare.caseInsensitive(a.data[2], b.data[2]);
    });
}
exports.baseSortList = baseSortList;
function all_default_load_dict() {
    return [
        'dict_synonym/*.txt',
        'names/*.txt',
        'lazy/*.txt',
        'dict*.txt',
        'phrases/*.txt',
        'pangu/*.txt',
        'char.txt',
    ];
}
exports.all_default_load_dict = all_default_load_dict;
function all_extra_dict() {
    return [
        'infrequent/**/*.txt',
    ];
}
exports.all_extra_dict = all_extra_dict;
/*
export function getCjkName(w: string, USE_CJK_MODE: number)
{
    let cjk_id = w;

    if (1)
    {
        cjk_id = slugify(w, true);
    }
    else if (USE_CJK_MODE > 1)
    {
        let cjk_list = textList(w);
        cjk_list.sort();
        cjk_id = cjk_list[0];
    }
    else if (USE_CJK_MODE)
    {
        let cjk_list = libTable.auto(w);
        cjk_list.sort();
        cjk_id = cjk_list[0];
    }

    return StrUtil.toHalfWidth(cjk_id);
}
*/
//console.log(['第', '一', 'Ｔ', '网开一面', '三街六市'].sort(zhDictCompare));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxzQ0FBdUM7QUFDdkMsNENBQTZDO0FBQzdDLDZDQUErRTtBQUMvRSx1REFBcUg7QUFFckgseURBQTBEO0FBSTFELDhDQUFnRTtBQUV2RCx3QkFGQSxvQkFBYSxDQUVBO0FBQUUscUJBRkEsaUJBQVUsQ0FFQTtBQVNyQixRQUFBLGNBQWMsR0FBRztJQUM3QixVQUFVO0lBQ1YsU0FBUztJQUNULFVBQVU7SUFDVixTQUFTO0lBQ1QsWUFBWTtJQUNaLFVBQVU7Q0FDVixDQUFDO0FBRUYsU0FBZ0IsUUFBUSxDQUFDLEdBQVcsRUFBRSxPQUFrQixFQUFFLE1BQU0sR0FBRyxzQkFBYztJQUVoRixPQUFPLGVBQWU7U0FDcEIsT0FBTyxDQUFXLFFBQVEsQ0FBQyxPQUFPLEVBQUU7UUFDcEMsR0FBRztRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTTtRQUNOLGVBQWUsRUFBRSxJQUFJO0tBQ3JCLENBQUMsQ0FBQyxDQUNGO0FBQ0gsQ0FBQztBQVZELDRCQVVDO0FBU0QsU0FBZ0IsWUFBWSxDQUF1QixJQUFZLEVBQzlELEVBQW1DLEVBQ25DLE9BRUM7SUFHRCxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUN4QixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksaUJBQWdCLENBQUM7SUFFdEUsT0FBTyxjQUFJLENBQUMsSUFBSSxDQUFDO1NBQ2YsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUVoQixJQUFJLENBQUMsQ0FBQyxFQUNOO1lBQ0MsT0FBTyxFQUFFLENBQUE7U0FDVDtRQUVELE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUc7WUFFNUMsSUFBSSxJQUFhLENBQUM7WUFFbEIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXpCLElBQUksR0FBRyxHQUFHO2dCQUNULElBQUk7Z0JBQ0osSUFBSTtnQkFDSixLQUFLO2FBQ0wsQ0FBQztZQUVGLElBQUksRUFBRSxFQUNOO2dCQUNDLGFBQWE7Z0JBQ2IsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7YUFDakI7aUJBRUQ7Z0JBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQzthQUNaO1lBRUQsSUFBSSxJQUFJLEVBQ1I7Z0JBQ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNaO1lBRUQsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDUixDQUFDLENBQUMsQ0FDRDtBQUNILENBQUM7QUFqREQsb0NBaURDO0FBRUQsSUFBWSxZQUtYO0FBTEQsV0FBWSxZQUFZO0lBRXZCLCtDQUFRLENBQUE7SUFDUixxREFBVyxDQUFBO0lBQ1gsNkRBQWUsQ0FBQTtBQUNoQixDQUFDLEVBTFcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFLdkI7QUFFRCxTQUFnQixXQUFXLENBQUMsSUFBWTtJQUV2QyxJQUFJLEdBQUcsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDO0lBRTVCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQzNCO1FBQ0MsR0FBRyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUM7UUFFM0IsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUN4QjtZQUNDLEdBQUcsR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDO1NBQy9CO0tBQ0Q7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNaLENBQUM7QUFmRCxrQ0FlQztBQUVELFNBQWdCLFlBQVksQ0FBd0IsRUFBTyxFQUFFLElBQWM7SUFFMUUsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFFNUIsYUFBYTtRQUNiLE9BQU8sY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDeEQsYUFBYTtlQUNWLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELGFBQWE7ZUFDVixjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2RCxhQUFhO2VBQ1YsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDdEQ7SUFDSCxDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFkRCxvQ0FjQztBQUVELFNBQWdCLHFCQUFxQjtJQUVwQyxPQUFPO1FBQ04sb0JBQW9CO1FBQ3BCLGFBQWE7UUFDYixZQUFZO1FBQ1osV0FBVztRQUNYLGVBQWU7UUFDZixhQUFhO1FBQ2IsVUFBVTtLQUNWLENBQUM7QUFDSCxDQUFDO0FBWEQsc0RBV0M7QUFFRCxTQUFnQixjQUFjO0lBRTdCLE9BQU87UUFDTixxQkFBcUI7S0FDckIsQ0FBQztBQUNILENBQUM7QUFMRCx3Q0FLQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUF3QkU7QUFFRixtRUFBbUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbGliVGFibGUgZnJvbSAnY2prLWNvbnYvbGliL3poL3RhYmxlJztcbmltcG9ydCB7IHRleHRMaXN0LCBzbHVnaWZ5IH0gZnJvbSAnY2prLWNvbnYvbGliL3poL3RhYmxlL2xpc3QnO1xuaW1wb3J0IEZhc3RHbG9iID0gcmVxdWlyZSgnZmFzdC1nbG9iJyk7XG5pbXBvcnQgQmx1ZWJpcmRQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCBsb2FkLCB7IHBhcnNlTGluZSwgc3RyaW5naWZ5TGluZSwgc2VyaWFsaXplIH0gZnJvbSAnLi4vbGliL2xvYWRlci9saW5lJztcbmltcG9ydCB7IElEaWN0Um93LCBwYXJzZUxpbmUgYXMgcGFyc2VMaW5lU2VnbWVudCwgc2VyaWFsaXplIGFzIHNlcmlhbGl6ZVNlZ21lbnQgfSBmcm9tICcuLi9saWIvbG9hZGVyL3NlZ21lbnQvaW5kZXgnO1xuaW1wb3J0IHsgSUNVUl9XT1JEIH0gZnJvbSAnLi4vdGVzdC9zb3J0JztcbmltcG9ydCBuYXR1cmFsQ29tcGFyZSA9IHJlcXVpcmUoJ3N0cmluZy1uYXR1cmFsLWNvbXBhcmUnKTtcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSB9IGZyb20gJ2FycmF5LWh5cGVyLXVuaXF1ZSc7XG5pbXBvcnQgU3RyVXRpbCA9IHJlcXVpcmUoJ3N0ci11dGlsJyk7XG5cbmltcG9ydCB7IHpoRGljdENvbXBhcmUsIGdldENqa05hbWUgfSBmcm9tICdAbm92ZWwtc2VnbWVudC91dGlsJztcblxuZXhwb3J0IHsgemhEaWN0Q29tcGFyZSwgZ2V0Q2prTmFtZSB9XG5cbmV4cG9ydCB0eXBlIElMb2FkRGljdEZpbGVSb3cyPEQgZXh0ZW5kcyBhbnkgPSBbc3RyaW5nLCBudW1iZXIsIG51bWJlciwgLi4uYW55W11dPiA9IElMb2FkRGljdEZpbGVSb3c8RD4gJiB7XG5cdGZpbGU6IHN0cmluZyxcblx0Y2prX2lkOiBzdHJpbmcsXG5cblx0bGluZV90eXBlOiBFbnVtTGluZVR5cGUsXG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0lHTk9SRSA9IFtcblx0Ly8nY2hhcionLFxuXHQnKiovc2tpcCcsXG5cdCcqKi9qaWViYScsXG5cdCcqKi9sYXp5Jyxcblx0JyoqL3N5bm9ueW0nLFxuXHQnKiovbmFtZXMnLFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdsb2JEaWN0KGN3ZDogc3RyaW5nLCBwYXR0ZXJuPzogc3RyaW5nW10sIGlnbm9yZSA9IERFRkFVTFRfSUdOT1JFKVxue1xuXHRyZXR1cm4gQmx1ZWJpcmRQcm9taXNlXG5cdFx0LnJlc29sdmU8c3RyaW5nW10+KEZhc3RHbG9iKHBhdHRlcm4sIHtcblx0XHRcdGN3ZCxcblx0XHRcdGFic29sdXRlOiB0cnVlLFxuXHRcdFx0aWdub3JlLFxuXHRcdFx0bWFya0RpcmVjdG9yaWVzOiB0cnVlLFxuXHRcdH0pKVxuXHRcdDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTG9hZERpY3RGaWxlUm93PEQgPSBbc3RyaW5nLCBudW1iZXIsIG51bWJlciwgLi4uYW55W11dPlxue1xuXHRkYXRhOiBELFxuXHRsaW5lOiBzdHJpbmcsXG5cdGluZGV4OiBudW1iZXIsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRGljdEZpbGU8VCA9IElMb2FkRGljdEZpbGVSb3c+KGZpbGU6IHN0cmluZyxcblx0Zm4/OiAobGlzdDogVFtdLCBjdXI6IFQpID0+IGJvb2xlYW4sXG5cdG9wdGlvbnM/OiB7XG5cdFx0cGFyc2VGbj86IChsaW5lOiBzdHJpbmcpID0+IGFueSxcblx0fSxcbik6IEJsdWViaXJkUHJvbWlzZTxUW10+XG57XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRjb25zdCBwYXJzZUZuID0gb3B0aW9ucy5wYXJzZUZuID0gb3B0aW9ucy5wYXJzZUZuIHx8IHBhcnNlTGluZVNlZ21lbnQ7XG5cblx0cmV0dXJuIGxvYWQoZmlsZSlcblx0XHQudGhlbihmdW5jdGlvbiAoYilcblx0XHR7XG5cdFx0XHRpZiAoIWIpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBbXVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYi5yZWR1Y2UoZnVuY3Rpb24gKGEsIGxpbmUsIGluZGV4LCBhcnIpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHRcdGxldCBkYXRhID0gcGFyc2VGbihsaW5lKTtcblxuXHRcdFx0XHRsZXQgY3VyID0ge1xuXHRcdFx0XHRcdGRhdGEsXG5cdFx0XHRcdFx0bGluZSxcblx0XHRcdFx0XHRpbmRleCxcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAoZm4pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0Ym9vbCA9IGZuKGEsIGN1cilcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YS5wdXNoKGN1cik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdH0sIFtdKTtcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGVudW0gRW51bUxpbmVUeXBlXG57XG5cdEJBU0UgPSAwLFxuXHRDT01NRU5UID0gMSxcblx0Q09NTUVOVF9UQUcgPSAyLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hrTGluZVR5cGUobGluZTogc3RyaW5nKTogRW51bUxpbmVUeXBlXG57XG5cdGxldCByZXQgPSBFbnVtTGluZVR5cGUuQkFTRTtcblxuXHRpZiAobGluZS5pbmRleE9mKCcvLycpID09IDApXG5cdHtcblx0XHRyZXQgPSBFbnVtTGluZVR5cGUuQ09NTUVOVDtcblxuXHRcdGlmICgvIEB0b2RvL2kudGVzdChsaW5lKSlcblx0XHR7XG5cdFx0XHRyZXQgPSBFbnVtTGluZVR5cGUuQ09NTUVOVF9UQUc7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHJldDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VTb3J0TGlzdDxUID0gSUxvYWREaWN0RmlsZVJvdzI+KGxzOiBUW10sIGJvb2w/OiBib29sZWFuKVxue1xuXHRyZXR1cm4gbHMuc29ydChmdW5jdGlvbiAoYSwgYilcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmF0dXJhbENvbXBhcmUuY2FzZUluc2Vuc2l0aXZlKGEuY2prX2lkLCBiLmNqa19pZClcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHx8IG5hdHVyYWxDb21wYXJlLmNhc2VJbnNlbnNpdGl2ZShhLmRhdGFbMV0sIGIuZGF0YVsxXSlcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHx8IG5hdHVyYWxDb21wYXJlLmNhc2VJbnNlbnNpdGl2ZShhLmRhdGFbMF0sIGIuZGF0YVswXSlcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHx8IG5hdHVyYWxDb21wYXJlLmNhc2VJbnNlbnNpdGl2ZShhLmRhdGFbMl0sIGIuZGF0YVsyXSlcblx0XHRcdDtcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGxfZGVmYXVsdF9sb2FkX2RpY3QoKVxue1xuXHRyZXR1cm4gW1xuXHRcdCdkaWN0X3N5bm9ueW0vKi50eHQnLFxuXHRcdCduYW1lcy8qLnR4dCcsXG5cdFx0J2xhenkvKi50eHQnLFxuXHRcdCdkaWN0Ki50eHQnLFxuXHRcdCdwaHJhc2VzLyoudHh0Jyxcblx0XHQncGFuZ3UvKi50eHQnLFxuXHRcdCdjaGFyLnR4dCcsXG5cdF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGxfZXh0cmFfZGljdCgpXG57XG5cdHJldHVybiBbXG5cdFx0J2luZnJlcXVlbnQvKiovKi50eHQnLFxuXHRdO1xufVxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGdldENqa05hbWUodzogc3RyaW5nLCBVU0VfQ0pLX01PREU6IG51bWJlcilcbntcblx0bGV0IGNqa19pZCA9IHc7XG5cblx0aWYgKDEpXG5cdHtcblx0XHRjamtfaWQgPSBzbHVnaWZ5KHcsIHRydWUpO1xuXHR9XG5cdGVsc2UgaWYgKFVTRV9DSktfTU9ERSA+IDEpXG5cdHtcblx0XHRsZXQgY2prX2xpc3QgPSB0ZXh0TGlzdCh3KTtcblx0XHRjamtfbGlzdC5zb3J0KCk7XG5cdFx0Y2prX2lkID0gY2prX2xpc3RbMF07XG5cdH1cblx0ZWxzZSBpZiAoVVNFX0NKS19NT0RFKVxuXHR7XG5cdFx0bGV0IGNqa19saXN0ID0gbGliVGFibGUuYXV0byh3KTtcblx0XHRjamtfbGlzdC5zb3J0KCk7XG5cdFx0Y2prX2lkID0gY2prX2xpc3RbMF07XG5cdH1cblxuXHRyZXR1cm4gU3RyVXRpbC50b0hhbGZXaWR0aChjamtfaWQpO1xufVxuKi9cblxuLy9jb25zb2xlLmxvZyhbJ+esrCcsICfkuIAnLCAn77y0JywgJ+e9keW8gOS4gOmdoicsICfkuInooZflha3luIInXS5zb3J0KHpoRGljdENvbXBhcmUpKTtcbiJdfQ==