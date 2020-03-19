"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.all_extra_dict = exports.all_default_load_dict = exports.baseSortList = exports.chkLineType = exports.EnumLineType = exports.loadDictFile = exports.globDict = exports.DEFAULT_IGNORE = exports.getCjkName = exports.zhDictCompare = void 0;
const fast_glob_1 = require("@bluelovers/fast-glob");
const BluebirdPromise = require("bluebird");
const line_1 = require("../lib/loader/line");
const index_1 = require("../lib/loader/segment/index");
const naturalCompare = require("string-natural-compare");
const util_1 = require("@novel-segment/util");
Object.defineProperty(exports, "zhDictCompare", { enumerable: true, get: function () { return util_1.zhDictCompare; } });
Object.defineProperty(exports, "getCjkName", { enumerable: true, get: function () { return util_1.getCjkName; } });
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
        .resolve(fast_glob_1.default(pattern, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEscURBQTZDO0FBQzdDLDRDQUE2QztBQUM3Qyw2Q0FBK0U7QUFDL0UsdURBQXFIO0FBRXJILHlEQUEwRDtBQUkxRCw4Q0FBZ0U7QUFFdkQsOEZBRkEsb0JBQWEsT0FFQTtBQUFFLDJGQUZBLGlCQUFVLE9BRUE7QUFTckIsUUFBQSxjQUFjLEdBQUc7SUFDN0IsVUFBVTtJQUNWLFNBQVM7SUFDVCxVQUFVO0lBQ1YsU0FBUztJQUNULFlBQVk7SUFDWixVQUFVO0NBQ1YsQ0FBQztBQUVGLFNBQWdCLFFBQVEsQ0FBQyxHQUFXLEVBQUUsT0FBa0IsRUFBRSxNQUFNLEdBQUcsc0JBQWM7SUFFaEYsT0FBTyxlQUFlO1NBQ3BCLE9BQU8sQ0FBVyxtQkFBUSxDQUFDLE9BQU8sRUFBRTtRQUNwQyxHQUFHO1FBQ0gsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNO1FBQ04sZUFBZSxFQUFFLElBQUk7S0FDckIsQ0FBQyxDQUFDLENBQ0Y7QUFDSCxDQUFDO0FBVkQsNEJBVUM7QUFTRCxTQUFnQixZQUFZLENBQXVCLElBQVksRUFDOUQsRUFBbUMsRUFDbkMsT0FFQztJQUdELE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO0lBQ3hCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxpQkFBZ0IsQ0FBQztJQUV0RSxPQUFPLGNBQUksQ0FBQyxJQUFJLENBQUM7U0FDZixJQUFJLENBQUMsVUFBVSxDQUFDO1FBRWhCLElBQUksQ0FBQyxDQUFDLEVBQ047WUFDQyxPQUFPLEVBQUUsQ0FBQTtTQUNUO1FBRUQsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRztZQUU1QyxJQUFJLElBQWEsQ0FBQztZQUVsQixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFekIsSUFBSSxHQUFHLEdBQUc7Z0JBQ1QsSUFBSTtnQkFDSixJQUFJO2dCQUNKLEtBQUs7YUFDTCxDQUFDO1lBRUYsSUFBSSxFQUFFLEVBQ047Z0JBQ0MsYUFBYTtnQkFDYixJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTthQUNqQjtpQkFFRDtnQkFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2FBQ1o7WUFFRCxJQUFJLElBQUksRUFDUjtnQkFDQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ1o7WUFFRCxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNSLENBQUMsQ0FBQyxDQUNEO0FBQ0gsQ0FBQztBQWpERCxvQ0FpREM7QUFFRCxJQUFZLFlBS1g7QUFMRCxXQUFZLFlBQVk7SUFFdkIsK0NBQVEsQ0FBQTtJQUNSLHFEQUFXLENBQUE7SUFDWCw2REFBZSxDQUFBO0FBQ2hCLENBQUMsRUFMVyxZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQUt2QjtBQUVELFNBQWdCLFdBQVcsQ0FBQyxJQUFZO0lBRXZDLElBQUksR0FBRyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7SUFFNUIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDM0I7UUFDQyxHQUFHLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQztRQUUzQixJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ3hCO1lBQ0MsR0FBRyxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUM7U0FDL0I7S0FDRDtJQUVELE9BQU8sR0FBRyxDQUFDO0FBQ1osQ0FBQztBQWZELGtDQWVDO0FBRUQsU0FBZ0IsWUFBWSxDQUF3QixFQUFPLEVBQUUsSUFBYztJQUUxRSxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUU1QixhQUFhO1FBQ2IsT0FBTyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUN4RCxhQUFhO2VBQ1YsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsYUFBYTtlQUNWLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELGFBQWE7ZUFDVixjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUN0RDtJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWRELG9DQWNDO0FBRUQsU0FBZ0IscUJBQXFCO0lBRXBDLE9BQU87UUFDTixvQkFBb0I7UUFDcEIsYUFBYTtRQUNiLFlBQVk7UUFDWixXQUFXO1FBQ1gsZUFBZTtRQUNmLGFBQWE7UUFDYixVQUFVO0tBQ1YsQ0FBQztBQUNILENBQUM7QUFYRCxzREFXQztBQUVELFNBQWdCLGNBQWM7SUFFN0IsT0FBTztRQUNOLHFCQUFxQjtLQUNyQixDQUFDO0FBQ0gsQ0FBQztBQUxELHdDQUtDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXdCRTtBQUVGLG1FQUFtRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBsaWJUYWJsZSBmcm9tICdjamstY29udi9saWIvemgvdGFibGUnO1xuaW1wb3J0IHsgdGV4dExpc3QsIHNsdWdpZnkgfSBmcm9tICdjamstY29udi9saWIvemgvdGFibGUvbGlzdCc7XG5pbXBvcnQgRmFzdEdsb2IgZnJvbSAnQGJsdWVsb3ZlcnMvZmFzdC1nbG9iJztcbmltcG9ydCBCbHVlYmlyZFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IGxvYWQsIHsgcGFyc2VMaW5lLCBzdHJpbmdpZnlMaW5lLCBzZXJpYWxpemUgfSBmcm9tICcuLi9saWIvbG9hZGVyL2xpbmUnO1xuaW1wb3J0IHsgSURpY3RSb3csIHBhcnNlTGluZSBhcyBwYXJzZUxpbmVTZWdtZW50LCBzZXJpYWxpemUgYXMgc2VyaWFsaXplU2VnbWVudCB9IGZyb20gJy4uL2xpYi9sb2FkZXIvc2VnbWVudC9pbmRleCc7XG5pbXBvcnQgeyBJQ1VSX1dPUkQgfSBmcm9tICcuLi90ZXN0L3NvcnQnO1xuaW1wb3J0IG5hdHVyYWxDb21wYXJlID0gcmVxdWlyZSgnc3RyaW5nLW5hdHVyYWwtY29tcGFyZScpO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcbmltcG9ydCBTdHJVdGlsID0gcmVxdWlyZSgnc3RyLXV0aWwnKTtcblxuaW1wb3J0IHsgemhEaWN0Q29tcGFyZSwgZ2V0Q2prTmFtZSB9IGZyb20gJ0Bub3ZlbC1zZWdtZW50L3V0aWwnO1xuXG5leHBvcnQgeyB6aERpY3RDb21wYXJlLCBnZXRDamtOYW1lIH1cblxuZXhwb3J0IHR5cGUgSUxvYWREaWN0RmlsZVJvdzI8RCBleHRlbmRzIGFueSA9IFtzdHJpbmcsIG51bWJlciwgbnVtYmVyLCAuLi5hbnlbXV0+ID0gSUxvYWREaWN0RmlsZVJvdzxEPiAmIHtcblx0ZmlsZTogc3RyaW5nLFxuXHRjamtfaWQ6IHN0cmluZyxcblxuXHRsaW5lX3R5cGU6IEVudW1MaW5lVHlwZSxcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfSUdOT1JFID0gW1xuXHQvLydjaGFyKicsXG5cdCcqKi9za2lwJyxcblx0JyoqL2ppZWJhJyxcblx0JyoqL2xhenknLFxuXHQnKiovc3lub255bScsXG5cdCcqKi9uYW1lcycsXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2xvYkRpY3QoY3dkOiBzdHJpbmcsIHBhdHRlcm4/OiBzdHJpbmdbXSwgaWdub3JlID0gREVGQVVMVF9JR05PUkUpXG57XG5cdHJldHVybiBCbHVlYmlyZFByb21pc2Vcblx0XHQucmVzb2x2ZTxzdHJpbmdbXT4oRmFzdEdsb2IocGF0dGVybiwge1xuXHRcdFx0Y3dkLFxuXHRcdFx0YWJzb2x1dGU6IHRydWUsXG5cdFx0XHRpZ25vcmUsXG5cdFx0XHRtYXJrRGlyZWN0b3JpZXM6IHRydWUsXG5cdFx0fSkpXG5cdFx0O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElMb2FkRGljdEZpbGVSb3c8RCA9IFtzdHJpbmcsIG51bWJlciwgbnVtYmVyLCAuLi5hbnlbXV0+XG57XG5cdGRhdGE6IEQsXG5cdGxpbmU6IHN0cmluZyxcblx0aW5kZXg6IG51bWJlcixcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWREaWN0RmlsZTxUID0gSUxvYWREaWN0RmlsZVJvdz4oZmlsZTogc3RyaW5nLFxuXHRmbj86IChsaXN0OiBUW10sIGN1cjogVCkgPT4gYm9vbGVhbixcblx0b3B0aW9ucz86IHtcblx0XHRwYXJzZUZuPzogKGxpbmU6IHN0cmluZykgPT4gYW55LFxuXHR9LFxuKTogQmx1ZWJpcmRQcm9taXNlPFRbXT5cbntcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdGNvbnN0IHBhcnNlRm4gPSBvcHRpb25zLnBhcnNlRm4gPSBvcHRpb25zLnBhcnNlRm4gfHwgcGFyc2VMaW5lU2VnbWVudDtcblxuXHRyZXR1cm4gbG9hZChmaWxlKVxuXHRcdC50aGVuKGZ1bmN0aW9uIChiKVxuXHRcdHtcblx0XHRcdGlmICghYilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIFtdXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBiLnJlZHVjZShmdW5jdGlvbiAoYSwgbGluZSwgaW5kZXgsIGFycilcblx0XHRcdHtcblx0XHRcdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHRcdFx0bGV0IGRhdGEgPSBwYXJzZUZuKGxpbmUpO1xuXG5cdFx0XHRcdGxldCBjdXIgPSB7XG5cdFx0XHRcdFx0ZGF0YSxcblx0XHRcdFx0XHRsaW5lLFxuXHRcdFx0XHRcdGluZGV4LFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGlmIChmbilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRib29sID0gZm4oYSwgY3VyKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGJvb2wpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhLnB1c2goY3VyKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0fSwgW10pO1xuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZW51bSBFbnVtTGluZVR5cGVcbntcblx0QkFTRSA9IDAsXG5cdENPTU1FTlQgPSAxLFxuXHRDT01NRU5UX1RBRyA9IDIsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGtMaW5lVHlwZShsaW5lOiBzdHJpbmcpOiBFbnVtTGluZVR5cGVcbntcblx0bGV0IHJldCA9IEVudW1MaW5lVHlwZS5CQVNFO1xuXG5cdGlmIChsaW5lLmluZGV4T2YoJy8vJykgPT0gMClcblx0e1xuXHRcdHJldCA9IEVudW1MaW5lVHlwZS5DT01NRU5UO1xuXG5cdFx0aWYgKC8gQHRvZG8vaS50ZXN0KGxpbmUpKVxuXHRcdHtcblx0XHRcdHJldCA9IEVudW1MaW5lVHlwZS5DT01NRU5UX1RBRztcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZVNvcnRMaXN0PFQgPSBJTG9hZERpY3RGaWxlUm93Mj4obHM6IFRbXSwgYm9vbD86IGJvb2xlYW4pXG57XG5cdHJldHVybiBscy5zb3J0KGZ1bmN0aW9uIChhLCBiKVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuYXR1cmFsQ29tcGFyZS5jYXNlSW5zZW5zaXRpdmUoYS5jamtfaWQsIGIuY2prX2lkKVxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0fHwgbmF0dXJhbENvbXBhcmUuY2FzZUluc2Vuc2l0aXZlKGEuZGF0YVsxXSwgYi5kYXRhWzFdKVxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0fHwgbmF0dXJhbENvbXBhcmUuY2FzZUluc2Vuc2l0aXZlKGEuZGF0YVswXSwgYi5kYXRhWzBdKVxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0fHwgbmF0dXJhbENvbXBhcmUuY2FzZUluc2Vuc2l0aXZlKGEuZGF0YVsyXSwgYi5kYXRhWzJdKVxuXHRcdFx0O1xuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFsbF9kZWZhdWx0X2xvYWRfZGljdCgpXG57XG5cdHJldHVybiBbXG5cdFx0J2RpY3Rfc3lub255bS8qLnR4dCcsXG5cdFx0J25hbWVzLyoudHh0Jyxcblx0XHQnbGF6eS8qLnR4dCcsXG5cdFx0J2RpY3QqLnR4dCcsXG5cdFx0J3BocmFzZXMvKi50eHQnLFxuXHRcdCdwYW5ndS8qLnR4dCcsXG5cdFx0J2NoYXIudHh0Jyxcblx0XTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFsbF9leHRyYV9kaWN0KClcbntcblx0cmV0dXJuIFtcblx0XHQnaW5mcmVxdWVudC8qKi8qLnR4dCcsXG5cdF07XG59XG5cbi8qXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2prTmFtZSh3OiBzdHJpbmcsIFVTRV9DSktfTU9ERTogbnVtYmVyKVxue1xuXHRsZXQgY2prX2lkID0gdztcblxuXHRpZiAoMSlcblx0e1xuXHRcdGNqa19pZCA9IHNsdWdpZnkodywgdHJ1ZSk7XG5cdH1cblx0ZWxzZSBpZiAoVVNFX0NKS19NT0RFID4gMSlcblx0e1xuXHRcdGxldCBjamtfbGlzdCA9IHRleHRMaXN0KHcpO1xuXHRcdGNqa19saXN0LnNvcnQoKTtcblx0XHRjamtfaWQgPSBjamtfbGlzdFswXTtcblx0fVxuXHRlbHNlIGlmIChVU0VfQ0pLX01PREUpXG5cdHtcblx0XHRsZXQgY2prX2xpc3QgPSBsaWJUYWJsZS5hdXRvKHcpO1xuXHRcdGNqa19saXN0LnNvcnQoKTtcblx0XHRjamtfaWQgPSBjamtfbGlzdFswXTtcblx0fVxuXG5cdHJldHVybiBTdHJVdGlsLnRvSGFsZldpZHRoKGNqa19pZCk7XG59XG4qL1xuXG4vL2NvbnNvbGUubG9nKFsn56ysJywgJ+S4gCcsICfvvLQnLCAn572R5byA5LiA6Z2iJywgJ+S4ieihl+WFreW4giddLnNvcnQoemhEaWN0Q29tcGFyZSkpO1xuIl19