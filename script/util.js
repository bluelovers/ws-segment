"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fast_glob_1 = require("fast-glob");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSx5Q0FBaUM7QUFDakMsNENBQTZDO0FBQzdDLDZDQUErRTtBQUMvRSx1REFBcUg7QUFFckgseURBQTBEO0FBSTFELDhDQUFnRTtBQUV2RCx3QkFGQSxvQkFBYSxDQUVBO0FBQUUscUJBRkEsaUJBQVUsQ0FFQTtBQVNyQixRQUFBLGNBQWMsR0FBRztJQUM3QixVQUFVO0lBQ1YsU0FBUztJQUNULFVBQVU7SUFDVixTQUFTO0lBQ1QsWUFBWTtJQUNaLFVBQVU7Q0FDVixDQUFDO0FBRUYsU0FBZ0IsUUFBUSxDQUFDLEdBQVcsRUFBRSxPQUFrQixFQUFFLE1BQU0sR0FBRyxzQkFBYztJQUVoRixPQUFPLGVBQWU7U0FDcEIsT0FBTyxDQUFDLG1CQUFRLENBQVMsT0FBTyxFQUFFO1FBQ2xDLEdBQUc7UUFDSCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU07UUFDTixlQUFlLEVBQUUsSUFBSTtLQUNyQixDQUFDLENBQUMsQ0FDRjtBQUNILENBQUM7QUFWRCw0QkFVQztBQVNELFNBQWdCLFlBQVksQ0FBdUIsSUFBWSxFQUM5RCxFQUFtQyxFQUNuQyxPQUVDO0lBR0QsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7SUFDeEIsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxJQUFJLGlCQUFnQixDQUFDO0lBRXRFLE9BQU8sY0FBSSxDQUFDLElBQUksQ0FBQztTQUNmLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFaEIsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRztZQUU1QyxJQUFJLElBQWEsQ0FBQztZQUVsQixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFekIsSUFBSSxHQUFHLEdBQUc7Z0JBQ1QsSUFBSTtnQkFDSixJQUFJO2dCQUNKLEtBQUs7YUFDTCxDQUFDO1lBRUYsSUFBSSxFQUFFLEVBQ047Z0JBQ0MsYUFBYTtnQkFDYixJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTthQUNqQjtpQkFFRDtnQkFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2FBQ1o7WUFFRCxJQUFJLElBQUksRUFDUjtnQkFDQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ1o7WUFFRCxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNSLENBQUMsQ0FBQyxDQUNEO0FBQ0gsQ0FBQztBQTVDRCxvQ0E0Q0M7QUFFRCxJQUFZLFlBS1g7QUFMRCxXQUFZLFlBQVk7SUFFdkIsK0NBQVEsQ0FBQTtJQUNSLHFEQUFXLENBQUE7SUFDWCw2REFBZSxDQUFBO0FBQ2hCLENBQUMsRUFMVyxZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQUt2QjtBQUVELFNBQWdCLFdBQVcsQ0FBQyxJQUFZO0lBRXZDLElBQUksR0FBRyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7SUFFNUIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDM0I7UUFDQyxHQUFHLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQztRQUUzQixJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ3hCO1lBQ0MsR0FBRyxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUM7U0FDL0I7S0FDRDtJQUVELE9BQU8sR0FBRyxDQUFDO0FBQ1osQ0FBQztBQWZELGtDQWVDO0FBRUQsU0FBZ0IsWUFBWSxDQUF3QixFQUFPLEVBQUUsSUFBYztJQUUxRSxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUU1QixhQUFhO1FBQ2IsT0FBTyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUN4RCxhQUFhO2VBQ1YsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsYUFBYTtlQUNWLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELGFBQWE7ZUFDVixjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUN0RDtJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWRELG9DQWNDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXdCRTtBQUVGLG1FQUFtRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBsaWJUYWJsZSBmcm9tICdjamstY29udi9saWIvemgvdGFibGUnO1xuaW1wb3J0IHsgdGV4dExpc3QsIHNsdWdpZnkgfSBmcm9tICdjamstY29udi9saWIvemgvdGFibGUvbGlzdCc7XG5pbXBvcnQgRmFzdEdsb2IgZnJvbSAnZmFzdC1nbG9iJztcbmltcG9ydCBCbHVlYmlyZFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IGxvYWQsIHsgcGFyc2VMaW5lLCBzdHJpbmdpZnlMaW5lLCBzZXJpYWxpemUgfSBmcm9tICcuLi9saWIvbG9hZGVyL2xpbmUnO1xuaW1wb3J0IHsgSURpY3RSb3csIHBhcnNlTGluZSBhcyBwYXJzZUxpbmVTZWdtZW50LCBzZXJpYWxpemUgYXMgc2VyaWFsaXplU2VnbWVudCB9IGZyb20gJy4uL2xpYi9sb2FkZXIvc2VnbWVudC9pbmRleCc7XG5pbXBvcnQgeyBJQ1VSX1dPUkQgfSBmcm9tICcuLi90ZXN0L3NvcnQnO1xuaW1wb3J0IG5hdHVyYWxDb21wYXJlID0gcmVxdWlyZSgnc3RyaW5nLW5hdHVyYWwtY29tcGFyZScpO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcbmltcG9ydCBTdHJVdGlsID0gcmVxdWlyZSgnc3RyLXV0aWwnKTtcblxuaW1wb3J0IHsgemhEaWN0Q29tcGFyZSwgZ2V0Q2prTmFtZSB9IGZyb20gJ0Bub3ZlbC1zZWdtZW50L3V0aWwnO1xuXG5leHBvcnQgeyB6aERpY3RDb21wYXJlLCBnZXRDamtOYW1lIH1cblxuZXhwb3J0IHR5cGUgSUxvYWREaWN0RmlsZVJvdzI8RCBleHRlbmRzIGFueSA9IFtzdHJpbmcsIG51bWJlciwgbnVtYmVyLCAuLi5hbnlbXV0+ID0gSUxvYWREaWN0RmlsZVJvdzxEPiAmIHtcblx0ZmlsZTogc3RyaW5nLFxuXHRjamtfaWQ6IHN0cmluZyxcblxuXHRsaW5lX3R5cGU6IEVudW1MaW5lVHlwZSxcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfSUdOT1JFID0gW1xuXHQvLydjaGFyKicsXG5cdCcqKi9za2lwJyxcblx0JyoqL2ppZWJhJyxcblx0JyoqL2xhenknLFxuXHQnKiovc3lub255bScsXG5cdCcqKi9uYW1lcycsXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2xvYkRpY3QoY3dkOiBzdHJpbmcsIHBhdHRlcm4/OiBzdHJpbmdbXSwgaWdub3JlID0gREVGQVVMVF9JR05PUkUpXG57XG5cdHJldHVybiBCbHVlYmlyZFByb21pc2Vcblx0XHQucmVzb2x2ZShGYXN0R2xvYjxzdHJpbmc+KHBhdHRlcm4sIHtcblx0XHRcdGN3ZCxcblx0XHRcdGFic29sdXRlOiB0cnVlLFxuXHRcdFx0aWdub3JlLFxuXHRcdFx0bWFya0RpcmVjdG9yaWVzOiB0cnVlLFxuXHRcdH0pKVxuXHRcdDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTG9hZERpY3RGaWxlUm93PEQgPSBbc3RyaW5nLCBudW1iZXIsIG51bWJlciwgLi4uYW55W11dPlxue1xuXHRkYXRhOiBELFxuXHRsaW5lOiBzdHJpbmcsXG5cdGluZGV4OiBudW1iZXIsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRGljdEZpbGU8VCA9IElMb2FkRGljdEZpbGVSb3c+KGZpbGU6IHN0cmluZyxcblx0Zm4/OiAobGlzdDogVFtdLCBjdXI6IFQpID0+IGJvb2xlYW4sXG5cdG9wdGlvbnM/OiB7XG5cdFx0cGFyc2VGbj86IChsaW5lOiBzdHJpbmcpID0+IGFueSxcblx0fSxcbik6IEJsdWViaXJkUHJvbWlzZTxUW10+XG57XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRjb25zdCBwYXJzZUZuID0gb3B0aW9ucy5wYXJzZUZuID0gb3B0aW9ucy5wYXJzZUZuIHx8IHBhcnNlTGluZVNlZ21lbnQ7XG5cblx0cmV0dXJuIGxvYWQoZmlsZSlcblx0XHQudGhlbihmdW5jdGlvbiAoYilcblx0XHR7XG5cdFx0XHRyZXR1cm4gYi5yZWR1Y2UoZnVuY3Rpb24gKGEsIGxpbmUsIGluZGV4LCBhcnIpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHRcdGxldCBkYXRhID0gcGFyc2VGbihsaW5lKTtcblxuXHRcdFx0XHRsZXQgY3VyID0ge1xuXHRcdFx0XHRcdGRhdGEsXG5cdFx0XHRcdFx0bGluZSxcblx0XHRcdFx0XHRpbmRleCxcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAoZm4pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0Ym9vbCA9IGZuKGEsIGN1cilcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YS5wdXNoKGN1cik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdH0sIFtdKTtcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGVudW0gRW51bUxpbmVUeXBlXG57XG5cdEJBU0UgPSAwLFxuXHRDT01NRU5UID0gMSxcblx0Q09NTUVOVF9UQUcgPSAyLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hrTGluZVR5cGUobGluZTogc3RyaW5nKTogRW51bUxpbmVUeXBlXG57XG5cdGxldCByZXQgPSBFbnVtTGluZVR5cGUuQkFTRTtcblxuXHRpZiAobGluZS5pbmRleE9mKCcvLycpID09IDApXG5cdHtcblx0XHRyZXQgPSBFbnVtTGluZVR5cGUuQ09NTUVOVDtcblxuXHRcdGlmICgvIEB0b2RvL2kudGVzdChsaW5lKSlcblx0XHR7XG5cdFx0XHRyZXQgPSBFbnVtTGluZVR5cGUuQ09NTUVOVF9UQUc7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHJldDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VTb3J0TGlzdDxUID0gSUxvYWREaWN0RmlsZVJvdzI+KGxzOiBUW10sIGJvb2w/OiBib29sZWFuKVxue1xuXHRyZXR1cm4gbHMuc29ydChmdW5jdGlvbiAoYSwgYilcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmF0dXJhbENvbXBhcmUuY2FzZUluc2Vuc2l0aXZlKGEuY2prX2lkLCBiLmNqa19pZClcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHx8IG5hdHVyYWxDb21wYXJlLmNhc2VJbnNlbnNpdGl2ZShhLmRhdGFbMV0sIGIuZGF0YVsxXSlcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHx8IG5hdHVyYWxDb21wYXJlLmNhc2VJbnNlbnNpdGl2ZShhLmRhdGFbMF0sIGIuZGF0YVswXSlcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHx8IG5hdHVyYWxDb21wYXJlLmNhc2VJbnNlbnNpdGl2ZShhLmRhdGFbMl0sIGIuZGF0YVsyXSlcblx0XHRcdDtcblx0fSk7XG59XG5cbi8qXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2prTmFtZSh3OiBzdHJpbmcsIFVTRV9DSktfTU9ERTogbnVtYmVyKVxue1xuXHRsZXQgY2prX2lkID0gdztcblxuXHRpZiAoMSlcblx0e1xuXHRcdGNqa19pZCA9IHNsdWdpZnkodywgdHJ1ZSk7XG5cdH1cblx0ZWxzZSBpZiAoVVNFX0NKS19NT0RFID4gMSlcblx0e1xuXHRcdGxldCBjamtfbGlzdCA9IHRleHRMaXN0KHcpO1xuXHRcdGNqa19saXN0LnNvcnQoKTtcblx0XHRjamtfaWQgPSBjamtfbGlzdFswXTtcblx0fVxuXHRlbHNlIGlmIChVU0VfQ0pLX01PREUpXG5cdHtcblx0XHRsZXQgY2prX2xpc3QgPSBsaWJUYWJsZS5hdXRvKHcpO1xuXHRcdGNqa19saXN0LnNvcnQoKTtcblx0XHRjamtfaWQgPSBjamtfbGlzdFswXTtcblx0fVxuXG5cdHJldHVybiBTdHJVdGlsLnRvSGFsZldpZHRoKGNqa19pZCk7XG59XG4qL1xuXG4vL2NvbnNvbGUubG9nKFsn56ysJywgJ+S4gCcsICfvvLQnLCAn572R5byA5LiA6Z2iJywgJ+S4ieihl+WFreW4giddLnNvcnQoemhEaWN0Q29tcGFyZSkpO1xuIl19