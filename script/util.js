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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxzQ0FBdUM7QUFDdkMsNENBQTZDO0FBQzdDLDZDQUErRTtBQUMvRSx1REFBcUg7QUFFckgseURBQTBEO0FBSTFELDhDQUFnRTtBQUV2RCx3QkFGQSxvQkFBYSxDQUVBO0FBQUUscUJBRkEsaUJBQVUsQ0FFQTtBQVNyQixRQUFBLGNBQWMsR0FBRztJQUM3QixVQUFVO0lBQ1YsU0FBUztJQUNULFVBQVU7SUFDVixTQUFTO0lBQ1QsWUFBWTtJQUNaLFVBQVU7Q0FDVixDQUFDO0FBRUYsU0FBZ0IsUUFBUSxDQUFDLEdBQVcsRUFBRSxPQUFrQixFQUFFLE1BQU0sR0FBRyxzQkFBYztJQUVoRixPQUFPLGVBQWU7U0FDcEIsT0FBTyxDQUFXLFFBQVEsQ0FBQyxPQUFPLEVBQUU7UUFDcEMsR0FBRztRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTTtRQUNOLGVBQWUsRUFBRSxJQUFJO0tBQ3JCLENBQUMsQ0FBQyxDQUNGO0FBQ0gsQ0FBQztBQVZELDRCQVVDO0FBU0QsU0FBZ0IsWUFBWSxDQUF1QixJQUFZLEVBQzlELEVBQW1DLEVBQ25DLE9BRUM7SUFHRCxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUN4QixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksaUJBQWdCLENBQUM7SUFFdEUsT0FBTyxjQUFJLENBQUMsSUFBSSxDQUFDO1NBQ2YsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUVoQixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHO1lBRTVDLElBQUksSUFBYSxDQUFDO1lBRWxCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV6QixJQUFJLEdBQUcsR0FBRztnQkFDVCxJQUFJO2dCQUNKLElBQUk7Z0JBQ0osS0FBSzthQUNMLENBQUM7WUFFRixJQUFJLEVBQUUsRUFDTjtnQkFDQyxhQUFhO2dCQUNiLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO2FBQ2pCO2lCQUVEO2dCQUNDLElBQUksR0FBRyxJQUFJLENBQUM7YUFDWjtZQUVELElBQUksSUFBSSxFQUNSO2dCQUNDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDWjtZQUVELE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ1IsQ0FBQyxDQUFDLENBQ0Q7QUFDSCxDQUFDO0FBNUNELG9DQTRDQztBQUVELElBQVksWUFLWDtBQUxELFdBQVksWUFBWTtJQUV2QiwrQ0FBUSxDQUFBO0lBQ1IscURBQVcsQ0FBQTtJQUNYLDZEQUFlLENBQUE7QUFDaEIsQ0FBQyxFQUxXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBS3ZCO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLElBQVk7SUFFdkMsSUFBSSxHQUFHLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQztJQUU1QixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUMzQjtRQUNDLEdBQUcsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDO1FBRTNCLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDeEI7WUFDQyxHQUFHLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztTQUMvQjtLQUNEO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBZkQsa0NBZUM7QUFFRCxTQUFnQixZQUFZLENBQXdCLEVBQU8sRUFBRSxJQUFjO0lBRTFFLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBRTVCLGFBQWE7UUFDYixPQUFPLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ3hELGFBQWE7ZUFDVixjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2RCxhQUFhO2VBQ1YsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsYUFBYTtlQUNWLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3REO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBZEQsb0NBY0M7QUFFRCxTQUFnQixxQkFBcUI7SUFFcEMsT0FBTztRQUNOLG9CQUFvQjtRQUNwQixhQUFhO1FBQ2IsWUFBWTtRQUNaLFdBQVc7UUFDWCxlQUFlO1FBQ2YsYUFBYTtRQUNiLFVBQVU7S0FDVixDQUFDO0FBQ0gsQ0FBQztBQVhELHNEQVdDO0FBRUQsU0FBZ0IsY0FBYztJQUU3QixPQUFPO1FBQ04scUJBQXFCO0tBQ3JCLENBQUM7QUFDSCxDQUFDO0FBTEQsd0NBS0M7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBd0JFO0FBRUYsbUVBQW1FIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGxpYlRhYmxlIGZyb20gJ2Nqay1jb252L2xpYi96aC90YWJsZSc7XG5pbXBvcnQgeyB0ZXh0TGlzdCwgc2x1Z2lmeSB9IGZyb20gJ2Nqay1jb252L2xpYi96aC90YWJsZS9saXN0JztcbmltcG9ydCBGYXN0R2xvYiA9IHJlcXVpcmUoJ2Zhc3QtZ2xvYicpO1xuaW1wb3J0IEJsdWViaXJkUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5pbXBvcnQgbG9hZCwgeyBwYXJzZUxpbmUsIHN0cmluZ2lmeUxpbmUsIHNlcmlhbGl6ZSB9IGZyb20gJy4uL2xpYi9sb2FkZXIvbGluZSc7XG5pbXBvcnQgeyBJRGljdFJvdywgcGFyc2VMaW5lIGFzIHBhcnNlTGluZVNlZ21lbnQsIHNlcmlhbGl6ZSBhcyBzZXJpYWxpemVTZWdtZW50IH0gZnJvbSAnLi4vbGliL2xvYWRlci9zZWdtZW50L2luZGV4JztcbmltcG9ydCB7IElDVVJfV09SRCB9IGZyb20gJy4uL3Rlc3Qvc29ydCc7XG5pbXBvcnQgbmF0dXJhbENvbXBhcmUgPSByZXF1aXJlKCdzdHJpbmctbmF0dXJhbC1jb21wYXJlJyk7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuaW1wb3J0IFN0clV0aWwgPSByZXF1aXJlKCdzdHItdXRpbCcpO1xuXG5pbXBvcnQgeyB6aERpY3RDb21wYXJlLCBnZXRDamtOYW1lIH0gZnJvbSAnQG5vdmVsLXNlZ21lbnQvdXRpbCc7XG5cbmV4cG9ydCB7IHpoRGljdENvbXBhcmUsIGdldENqa05hbWUgfVxuXG5leHBvcnQgdHlwZSBJTG9hZERpY3RGaWxlUm93MjxEIGV4dGVuZHMgYW55ID0gW3N0cmluZywgbnVtYmVyLCBudW1iZXIsIC4uLmFueVtdXT4gPSBJTG9hZERpY3RGaWxlUm93PEQ+ICYge1xuXHRmaWxlOiBzdHJpbmcsXG5cdGNqa19pZDogc3RyaW5nLFxuXG5cdGxpbmVfdHlwZTogRW51bUxpbmVUeXBlLFxufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9JR05PUkUgPSBbXG5cdC8vJ2NoYXIqJyxcblx0JyoqL3NraXAnLFxuXHQnKiovamllYmEnLFxuXHQnKiovbGF6eScsXG5cdCcqKi9zeW5vbnltJyxcblx0JyoqL25hbWVzJyxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBnbG9iRGljdChjd2Q6IHN0cmluZywgcGF0dGVybj86IHN0cmluZ1tdLCBpZ25vcmUgPSBERUZBVUxUX0lHTk9SRSlcbntcblx0cmV0dXJuIEJsdWViaXJkUHJvbWlzZVxuXHRcdC5yZXNvbHZlPHN0cmluZ1tdPihGYXN0R2xvYihwYXR0ZXJuLCB7XG5cdFx0XHRjd2QsXG5cdFx0XHRhYnNvbHV0ZTogdHJ1ZSxcblx0XHRcdGlnbm9yZSxcblx0XHRcdG1hcmtEaXJlY3RvcmllczogdHJ1ZSxcblx0XHR9KSlcblx0XHQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUxvYWREaWN0RmlsZVJvdzxEID0gW3N0cmluZywgbnVtYmVyLCBudW1iZXIsIC4uLmFueVtdXT5cbntcblx0ZGF0YTogRCxcblx0bGluZTogc3RyaW5nLFxuXHRpbmRleDogbnVtYmVyLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZERpY3RGaWxlPFQgPSBJTG9hZERpY3RGaWxlUm93PihmaWxlOiBzdHJpbmcsXG5cdGZuPzogKGxpc3Q6IFRbXSwgY3VyOiBUKSA9PiBib29sZWFuLFxuXHRvcHRpb25zPzoge1xuXHRcdHBhcnNlRm4/OiAobGluZTogc3RyaW5nKSA9PiBhbnksXG5cdH0sXG4pOiBCbHVlYmlyZFByb21pc2U8VFtdPlxue1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0Y29uc3QgcGFyc2VGbiA9IG9wdGlvbnMucGFyc2VGbiA9IG9wdGlvbnMucGFyc2VGbiB8fCBwYXJzZUxpbmVTZWdtZW50O1xuXG5cdHJldHVybiBsb2FkKGZpbGUpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKGIpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGIucmVkdWNlKGZ1bmN0aW9uIChhLCBsaW5lLCBpbmRleCwgYXJyKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblxuXHRcdFx0XHRsZXQgZGF0YSA9IHBhcnNlRm4obGluZSk7XG5cblx0XHRcdFx0bGV0IGN1ciA9IHtcblx0XHRcdFx0XHRkYXRhLFxuXHRcdFx0XHRcdGxpbmUsXG5cdFx0XHRcdFx0aW5kZXgsXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0aWYgKGZuKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdGJvb2wgPSBmbihhLCBjdXIpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGEucHVzaChjdXIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHR9LCBbXSk7XG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBlbnVtIEVudW1MaW5lVHlwZVxue1xuXHRCQVNFID0gMCxcblx0Q09NTUVOVCA9IDEsXG5cdENPTU1FTlRfVEFHID0gMixcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoa0xpbmVUeXBlKGxpbmU6IHN0cmluZyk6IEVudW1MaW5lVHlwZVxue1xuXHRsZXQgcmV0ID0gRW51bUxpbmVUeXBlLkJBU0U7XG5cblx0aWYgKGxpbmUuaW5kZXhPZignLy8nKSA9PSAwKVxuXHR7XG5cdFx0cmV0ID0gRW51bUxpbmVUeXBlLkNPTU1FTlQ7XG5cblx0XHRpZiAoLyBAdG9kby9pLnRlc3QobGluZSkpXG5cdFx0e1xuXHRcdFx0cmV0ID0gRW51bUxpbmVUeXBlLkNPTU1FTlRfVEFHO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlU29ydExpc3Q8VCA9IElMb2FkRGljdEZpbGVSb3cyPihsczogVFtdLCBib29sPzogYm9vbGVhbilcbntcblx0cmV0dXJuIGxzLnNvcnQoZnVuY3Rpb24gKGEsIGIpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5hdHVyYWxDb21wYXJlLmNhc2VJbnNlbnNpdGl2ZShhLmNqa19pZCwgYi5jamtfaWQpXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR8fCBuYXR1cmFsQ29tcGFyZS5jYXNlSW5zZW5zaXRpdmUoYS5kYXRhWzFdLCBiLmRhdGFbMV0pXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR8fCBuYXR1cmFsQ29tcGFyZS5jYXNlSW5zZW5zaXRpdmUoYS5kYXRhWzBdLCBiLmRhdGFbMF0pXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR8fCBuYXR1cmFsQ29tcGFyZS5jYXNlSW5zZW5zaXRpdmUoYS5kYXRhWzJdLCBiLmRhdGFbMl0pXG5cdFx0XHQ7XG5cdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWxsX2RlZmF1bHRfbG9hZF9kaWN0KClcbntcblx0cmV0dXJuIFtcblx0XHQnZGljdF9zeW5vbnltLyoudHh0Jyxcblx0XHQnbmFtZXMvKi50eHQnLFxuXHRcdCdsYXp5LyoudHh0Jyxcblx0XHQnZGljdCoudHh0Jyxcblx0XHQncGhyYXNlcy8qLnR4dCcsXG5cdFx0J3Bhbmd1LyoudHh0Jyxcblx0XHQnY2hhci50eHQnLFxuXHRdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWxsX2V4dHJhX2RpY3QoKVxue1xuXHRyZXR1cm4gW1xuXHRcdCdpbmZyZXF1ZW50LyoqLyoudHh0Jyxcblx0XTtcbn1cblxuLypcbmV4cG9ydCBmdW5jdGlvbiBnZXRDamtOYW1lKHc6IHN0cmluZywgVVNFX0NKS19NT0RFOiBudW1iZXIpXG57XG5cdGxldCBjamtfaWQgPSB3O1xuXG5cdGlmICgxKVxuXHR7XG5cdFx0Y2prX2lkID0gc2x1Z2lmeSh3LCB0cnVlKTtcblx0fVxuXHRlbHNlIGlmIChVU0VfQ0pLX01PREUgPiAxKVxuXHR7XG5cdFx0bGV0IGNqa19saXN0ID0gdGV4dExpc3Qodyk7XG5cdFx0Y2prX2xpc3Quc29ydCgpO1xuXHRcdGNqa19pZCA9IGNqa19saXN0WzBdO1xuXHR9XG5cdGVsc2UgaWYgKFVTRV9DSktfTU9ERSlcblx0e1xuXHRcdGxldCBjamtfbGlzdCA9IGxpYlRhYmxlLmF1dG8odyk7XG5cdFx0Y2prX2xpc3Quc29ydCgpO1xuXHRcdGNqa19pZCA9IGNqa19saXN0WzBdO1xuXHR9XG5cblx0cmV0dXJuIFN0clV0aWwudG9IYWxmV2lkdGgoY2prX2lkKTtcbn1cbiovXG5cbi8vY29uc29sZS5sb2coWyfnrKwnLCAn5LiAJywgJ++8tCcsICfnvZHlvIDkuIDpnaInLCAn5LiJ6KGX5YWt5biCJ10uc29ydCh6aERpY3RDb21wYXJlKSk7XG4iXX0=