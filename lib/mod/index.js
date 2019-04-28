"use strict";
/**
 * Created by user on 2018/4/16/016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ts_enum_util_1 = require("ts-enum-util");
const Optimizer_1 = require("./Optimizer");
exports.Optimizer = Optimizer_1.Optimizer;
exports.SubSModuleOptimizer = Optimizer_1.SubSModuleOptimizer;
const Tokenizer_1 = require("./Tokenizer");
exports.Tokenizer = Tokenizer_1.Tokenizer;
exports.SubSModuleTokenizer = Tokenizer_1.SubSModuleTokenizer;
const mod_1 = require("./mod");
exports.SubSModule = mod_1.SubSModule;
/**
 * 识别模块
 * 强制分割类单词识别
 */
var ENUM_SUBMODS;
(function (ENUM_SUBMODS) {
    /**
     * URL识别
     */
    ENUM_SUBMODS["URLTokenizer"] = "URLTokenizer";
    /**
     * 通配符，必须在标点符号识别之前
     */
    ENUM_SUBMODS["WildcardTokenizer"] = "WildcardTokenizer";
    /**
     * 标点符号识别
     */
    ENUM_SUBMODS["PunctuationTokenizer"] = "PunctuationTokenizer";
    /**
     * 外文字符、数字识别，必须在标点符号识别之后
     */
    ENUM_SUBMODS["ForeignTokenizer"] = "ForeignTokenizer";
    // 中文单词识别
    /**
     * 词典识别
     */
    ENUM_SUBMODS["DictTokenizer"] = "DictTokenizer";
    /**
     * 人名识别，建议在词典识别之后
     */
    ENUM_SUBMODS["ChsNameTokenizer"] = "ChsNameTokenizer";
    ENUM_SUBMODS["JpSimpleTokenizer"] = "JpSimpleTokenizer";
    /**
     * 注音
     */
    ENUM_SUBMODS["ZhuyinTokenizer"] = "ZhuyinTokenizer";
    /**
     * 部首
     */
    //ZhRadicalTokenizer = 'ZhRadicalTokenizer',
    // @todo 优化模块
    /**
     * 邮箱地址识别
     */
    ENUM_SUBMODS["EmailOptimizer"] = "EmailOptimizer";
    /**
     * 人名识别优化
     */
    ENUM_SUBMODS["ChsNameOptimizer"] = "ChsNameOptimizer";
    /**
     * 词典识别优化
     */
    ENUM_SUBMODS["DictOptimizer"] = "DictOptimizer";
    /**
     * 日期时间识别优化
     */
    ENUM_SUBMODS["DatetimeOptimizer"] = "DatetimeOptimizer";
    /**
     * 合併外文與中文的詞
     * 例如 Ｔ恤
     */
    ENUM_SUBMODS["ForeignOptimizer"] = "ForeignOptimizer";
    /**
     * 自動處理 `里|裏|后`
     */
    ENUM_SUBMODS["ZhtSynonymOptimizer"] = "ZhtSynonymOptimizer";
    ENUM_SUBMODS["AdjectiveOptimizer"] = "AdjectiveOptimizer";
})(ENUM_SUBMODS = exports.ENUM_SUBMODS || (exports.ENUM_SUBMODS = {}));
/**
 * 不包含在預設模組列表內 需要手動指定
 */
var ENUM_SUBMODS_OTHER;
(function (ENUM_SUBMODS_OTHER) {
    /**
     * 单字切分模块
     */
    ENUM_SUBMODS_OTHER["SingleTokenizer"] = "SingleTokenizer";
})(ENUM_SUBMODS_OTHER = exports.ENUM_SUBMODS_OTHER || (exports.ENUM_SUBMODS_OTHER = {}));
exports.LIST_SUBMODS_NOT_DEF = [
    ENUM_SUBMODS.ZhtSynonymOptimizer,
];
exports.SUBMODS_LIST = ts_enum_util_1.$enum(ENUM_SUBMODS);
exports.SUBMODS_OTHER_LIST = ts_enum_util_1.$enum(ENUM_SUBMODS_OTHER);
/**
 * 取得列表並且保持 ENUM 順序
 * @param {boolean} all
 * @returns {ENUM_SUBMODS[]}
 */
function getDefault(all) {
    let list = exports.SUBMODS_LIST.getKeys();
    return Object.keys(ENUM_SUBMODS)
        .reduce(function (a, m) {
        if (!a.includes(m) && list.includes(m)) {
            if (all || !exports.LIST_SUBMODS_NOT_DEF.includes(m)) {
                a.push(m);
            }
        }
        return a;
    }, []);
}
exports.getDefault = getDefault;
//console.log(getDefault(true));
exports.default = getDefault;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBSUgsK0NBQW1EO0FBSW5ELDJDQUFpRztBQUl4RixvQkFKQSxxQkFBUyxDQUlBO0FBQUUsOEJBSkEsK0JBQW1CLENBSUE7QUFIdkMsMkNBQWlHO0FBSXhGLG9CQUpBLHFCQUFTLENBSUE7QUFBRSw4QkFKQSwrQkFBbUIsQ0FJQTtBQUh2QywrQkFBc0Y7QUFJN0UscUJBSkEsZ0JBQVUsQ0FJQTtBQUVuQjs7O0dBR0c7QUFDSCxJQUFZLFlBeUVYO0FBekVELFdBQVksWUFBWTtJQUV2Qjs7T0FFRztJQUNILDZDQUE2QixDQUFBO0lBQzdCOztPQUVHO0lBQ0gsdURBQXVDLENBQUE7SUFDdkM7O09BRUc7SUFDSCw2REFBNkMsQ0FBQTtJQUM3Qzs7T0FFRztJQUNILHFEQUFxQyxDQUFBO0lBRXJDLFNBQVM7SUFFVDs7T0FFRztJQUNILCtDQUErQixDQUFBO0lBQy9COztPQUVHO0lBQ0gscURBQXFDLENBQUE7SUFFckMsdURBQXVDLENBQUE7SUFFdkM7O09BRUc7SUFDSCxtREFBbUMsQ0FBQTtJQUVuQzs7T0FFRztJQUNILDRDQUE0QztJQUU1QyxhQUFhO0lBRWI7O09BRUc7SUFDSCxpREFBaUMsQ0FBQTtJQUNqQzs7T0FFRztJQUNILHFEQUFxQyxDQUFBO0lBQ3JDOztPQUVHO0lBQ0gsK0NBQStCLENBQUE7SUFDL0I7O09BRUc7SUFDSCx1REFBdUMsQ0FBQTtJQUV2Qzs7O09BR0c7SUFDSCxxREFBcUMsQ0FBQTtJQUVyQzs7T0FFRztJQUNILDJEQUEyQyxDQUFBO0lBRTNDLHlEQUF5QyxDQUFBO0FBQzFDLENBQUMsRUF6RVcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUF5RXZCO0FBRUQ7O0dBRUc7QUFDSCxJQUFZLGtCQU1YO0FBTkQsV0FBWSxrQkFBa0I7SUFFN0I7O09BRUc7SUFDSCx5REFBbUMsQ0FBQTtBQUNwQyxDQUFDLEVBTlcsa0JBQWtCLEdBQWxCLDBCQUFrQixLQUFsQiwwQkFBa0IsUUFNN0I7QUFJWSxRQUFBLG9CQUFvQixHQUFHO0lBQ25DLFlBQVksQ0FBQyxtQkFBbUI7Q0FDaEMsQ0FBQztBQUVXLFFBQUEsWUFBWSxHQUFHLG9CQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDbkMsUUFBQSxrQkFBa0IsR0FBRyxvQkFBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFFNUQ7Ozs7R0FJRztBQUNILFNBQWdCLFVBQVUsQ0FBQyxHQUFhO0lBRXZDLElBQUksSUFBSSxHQUFHLG9CQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7SUFFbEMsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztTQUM5QixNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQVEsQ0FBQyxFQUM3QztZQUNDLElBQUksR0FBRyxJQUFJLENBQUMsNEJBQW9CLENBQUMsUUFBUSxDQUFDLENBQVEsQ0FBQyxFQUNuRDtnQkFDQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ1Y7U0FDRDtRQUVELE9BQU8sQ0FBQyxDQUFDO0lBQ1YsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUNMO0FBQ0gsQ0FBQztBQWxCRCxnQ0FrQkM7QUFFRCxnQ0FBZ0M7QUFFaEMsa0JBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC80LzE2LzAxNi5cbiAqL1xuXG5pbXBvcnQgeyBJV29yZCwgU2VnbWVudCB9IGZyb20gJy4uL1NlZ21lbnQnO1xuXG5pbXBvcnQgeyAkZW51bSwgRW51bVdyYXBwZXIsIH0gZnJvbSBcInRzLWVudW0tdXRpbFwiO1xuaW1wb3J0IEZvcmVpZ25PcHRpbWl6ZXIgZnJvbSAnLi4vc3VibW9kL0ZvcmVpZ25PcHRpbWl6ZXInO1xuaW1wb3J0IEpwU2ltcGxlVG9rZW5pemVyIGZyb20gJy4uL3N1Ym1vZC9KcFNpbXBsZVRva2VuaXplcic7XG5pbXBvcnQgU2luZ2xlVG9rZW5pemVyIGZyb20gJy4uL3N1Ym1vZC9TaW5nbGVUb2tlbml6ZXInO1xuaW1wb3J0IHsgT3B0aW1pemVyLCBTdWJTTW9kdWxlT3B0aW1pemVyLCBJU3ViT3B0aW1pemVyLCBJU3ViT3B0aW1pemVyQ3JlYXRlIH0gZnJvbSAnLi9PcHRpbWl6ZXInO1xuaW1wb3J0IHsgVG9rZW5pemVyLCBTdWJTTW9kdWxlVG9rZW5pemVyLCBJU3ViVG9rZW5pemVyLCBJU3ViVG9rZW5pemVyQ3JlYXRlIH0gZnJvbSAnLi9Ub2tlbml6ZXInO1xuaW1wb3J0IHsgU3ViU01vZHVsZSwgSVN1YlNNb2R1bGUsIElTdWJTTW9kdWxlQ3JlYXRlLCBJU3ViU01vZHVsZU1ldGhvZCB9IGZyb20gJy4vbW9kJztcblxuZXhwb3J0IHsgT3B0aW1pemVyLCBTdWJTTW9kdWxlT3B0aW1pemVyLCBJU3ViT3B0aW1pemVyLCBJU3ViT3B0aW1pemVyQ3JlYXRlIH1cbmV4cG9ydCB7IFRva2VuaXplciwgU3ViU01vZHVsZVRva2VuaXplciwgSVN1YlRva2VuaXplciwgSVN1YlRva2VuaXplckNyZWF0ZSB9XG5leHBvcnQgeyBTdWJTTW9kdWxlLCBJU3ViU01vZHVsZSwgSVN1YlNNb2R1bGVDcmVhdGUsIElTdWJTTW9kdWxlTWV0aG9kIH1cblxuLyoqXG4gKiDor4bliKvmqKHlnZdcbiAqIOW8uuWItuWIhuWJsuexu+WNleivjeivhuWIq1xuICovXG5leHBvcnQgZW51bSBFTlVNX1NVQk1PRFNcbntcblx0LyoqXG5cdCAqIFVSTOivhuWIq1xuXHQgKi9cblx0VVJMVG9rZW5pemVyID0gJ1VSTFRva2VuaXplcicsXG5cdC8qKlxuXHQgKiDpgJrphY3nrKbvvIzlv4XpobvlnKjmoIfngrnnrKblj7for4bliKvkuYvliY1cblx0ICovXG5cdFdpbGRjYXJkVG9rZW5pemVyID0gJ1dpbGRjYXJkVG9rZW5pemVyJyxcblx0LyoqXG5cdCAqIOagh+eCueespuWPt+ivhuWIq1xuXHQgKi9cblx0UHVuY3R1YXRpb25Ub2tlbml6ZXIgPSAnUHVuY3R1YXRpb25Ub2tlbml6ZXInLFxuXHQvKipcblx0ICog5aSW5paH5a2X56ym44CB5pWw5a2X6K+G5Yir77yM5b+F6aG75Zyo5qCH54K556ym5Y+36K+G5Yir5LmL5ZCOXG5cdCAqL1xuXHRGb3JlaWduVG9rZW5pemVyID0gJ0ZvcmVpZ25Ub2tlbml6ZXInLFxuXG5cdC8vIOS4reaWh+WNleivjeivhuWIq1xuXG5cdC8qKlxuXHQgKiDor43lhbjor4bliKtcblx0ICovXG5cdERpY3RUb2tlbml6ZXIgPSAnRGljdFRva2VuaXplcicsXG5cdC8qKlxuXHQgKiDkurrlkI3or4bliKvvvIzlu7rorq7lnKjor43lhbjor4bliKvkuYvlkI5cblx0ICovXG5cdENoc05hbWVUb2tlbml6ZXIgPSAnQ2hzTmFtZVRva2VuaXplcicsXG5cblx0SnBTaW1wbGVUb2tlbml6ZXIgPSAnSnBTaW1wbGVUb2tlbml6ZXInLFxuXG5cdC8qKlxuXHQgKiDms6jpn7Ncblx0ICovXG5cdFpodXlpblRva2VuaXplciA9ICdaaHV5aW5Ub2tlbml6ZXInLFxuXG5cdC8qKlxuXHQgKiDpg6jpppZcblx0ICovXG5cdC8vWmhSYWRpY2FsVG9rZW5pemVyID0gJ1poUmFkaWNhbFRva2VuaXplcicsXG5cblx0Ly8gQHRvZG8g5LyY5YyW5qih5Z2XXG5cblx0LyoqXG5cdCAqIOmCrueuseWcsOWdgOivhuWIq1xuXHQgKi9cblx0RW1haWxPcHRpbWl6ZXIgPSAnRW1haWxPcHRpbWl6ZXInLFxuXHQvKipcblx0ICog5Lq65ZCN6K+G5Yir5LyY5YyWXG5cdCAqL1xuXHRDaHNOYW1lT3B0aW1pemVyID0gJ0Noc05hbWVPcHRpbWl6ZXInLFxuXHQvKipcblx0ICog6K+N5YW46K+G5Yir5LyY5YyWXG5cdCAqL1xuXHREaWN0T3B0aW1pemVyID0gJ0RpY3RPcHRpbWl6ZXInLFxuXHQvKipcblx0ICog5pel5pyf5pe26Ze06K+G5Yir5LyY5YyWXG5cdCAqL1xuXHREYXRldGltZU9wdGltaXplciA9ICdEYXRldGltZU9wdGltaXplcicsXG5cblx0LyoqXG5cdCAqIOWQiOS9teWkluaWh+iIh+S4reaWh+eahOipnlxuXHQgKiDkvovlpoIg77y05oGkXG5cdCAqL1xuXHRGb3JlaWduT3B0aW1pemVyID0gJ0ZvcmVpZ25PcHRpbWl6ZXInLFxuXG5cdC8qKlxuXHQgKiDoh6rli5XomZXnkIYgYOmHjHzoo4985ZCOYFxuXHQgKi9cblx0Wmh0U3lub255bU9wdGltaXplciA9ICdaaHRTeW5vbnltT3B0aW1pemVyJyxcblxuXHRBZGplY3RpdmVPcHRpbWl6ZXIgPSAnQWRqZWN0aXZlT3B0aW1pemVyJyxcbn1cblxuLyoqXG4gKiDkuI3ljIXlkKvlnKjpoJDoqK3mqKHntYTliJfooajlhacg6ZyA6KaB5omL5YuV5oyH5a6aXG4gKi9cbmV4cG9ydCBlbnVtIEVOVU1fU1VCTU9EU19PVEhFUlxue1xuXHQvKipcblx0ICog5Y2V5a2X5YiH5YiG5qih5Z2XXG5cdCAqL1xuXHRTaW5nbGVUb2tlbml6ZXIgPSAnU2luZ2xlVG9rZW5pemVyJyxcbn1cblxuZXhwb3J0IHR5cGUgRU5VTV9TVUJNT0RTX05BTUUgPSBFTlVNX1NVQk1PRFMgfCBFTlVNX1NVQk1PRFNfT1RIRVI7XG5cbmV4cG9ydCBjb25zdCBMSVNUX1NVQk1PRFNfTk9UX0RFRiA9IFtcblx0RU5VTV9TVUJNT0RTLlpodFN5bm9ueW1PcHRpbWl6ZXIsXG5dO1xuXG5leHBvcnQgY29uc3QgU1VCTU9EU19MSVNUID0gJGVudW0oRU5VTV9TVUJNT0RTKTtcbmV4cG9ydCBjb25zdCBTVUJNT0RTX09USEVSX0xJU1QgPSAkZW51bShFTlVNX1NVQk1PRFNfT1RIRVIpO1xuXG4vKipcbiAqIOWPluW+l+WIl+ihqOS4puS4lOS/neaMgSBFTlVNIOmghuW6j1xuICogQHBhcmFtIHtib29sZWFufSBhbGxcbiAqIEByZXR1cm5zIHtFTlVNX1NVQk1PRFNbXX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHQoYWxsPzogYm9vbGVhbik6IEVOVU1fU1VCTU9EU1tdXG57XG5cdGxldCBsaXN0ID0gU1VCTU9EU19MSVNULmdldEtleXMoKTtcblxuXHRyZXR1cm4gT2JqZWN0LmtleXMoRU5VTV9TVUJNT0RTKVxuXHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGEsIG0pXG5cdFx0e1xuXHRcdFx0aWYgKCFhLmluY2x1ZGVzKG0pICYmIGxpc3QuaW5jbHVkZXMobSBhcyBhbnkpKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoYWxsIHx8ICFMSVNUX1NVQk1PRFNfTk9UX0RFRi5pbmNsdWRlcyhtIGFzIGFueSkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhLnB1c2gobSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGE7XG5cdFx0fSwgW10pXG5cdFx0O1xufVxuXG4vL2NvbnNvbGUubG9nKGdldERlZmF1bHQodHJ1ZSkpO1xuXG5leHBvcnQgZGVmYXVsdCBnZXREZWZhdWx0O1xuIl19