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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBSUgsK0NBQW1EO0FBSW5ELDJDQUFpRztBQUl4RixvQkFKQSxxQkFBUyxDQUlBO0FBQUUsOEJBSkEsK0JBQW1CLENBSUE7QUFIdkMsMkNBQWlHO0FBSXhGLG9CQUpBLHFCQUFTLENBSUE7QUFBRSw4QkFKQSwrQkFBbUIsQ0FJQTtBQUh2QywrQkFBc0Y7QUFJN0UscUJBSkEsZ0JBQVUsQ0FJQTtBQUVuQjs7O0dBR0c7QUFDSCxJQUFZLFlBK0RYO0FBL0RELFdBQVksWUFBWTtJQUV2Qjs7T0FFRztJQUNILDZDQUE2QixDQUFBO0lBQzdCOztPQUVHO0lBQ0gsdURBQXVDLENBQUE7SUFDdkM7O09BRUc7SUFDSCw2REFBNkMsQ0FBQTtJQUM3Qzs7T0FFRztJQUNILHFEQUFxQyxDQUFBO0lBRXJDLFNBQVM7SUFFVDs7T0FFRztJQUNILCtDQUErQixDQUFBO0lBQy9COztPQUVHO0lBQ0gscURBQXFDLENBQUE7SUFFckMsdURBQXVDLENBQUE7SUFFdkMsYUFBYTtJQUViOztPQUVHO0lBQ0gsaURBQWlDLENBQUE7SUFDakM7O09BRUc7SUFDSCxxREFBcUMsQ0FBQTtJQUNyQzs7T0FFRztJQUNILCtDQUErQixDQUFBO0lBQy9COztPQUVHO0lBQ0gsdURBQXVDLENBQUE7SUFFdkM7OztPQUdHO0lBQ0gscURBQXFDLENBQUE7SUFFckM7O09BRUc7SUFDSCwyREFBMkMsQ0FBQTtJQUUzQyx5REFBeUMsQ0FBQTtBQUMxQyxDQUFDLEVBL0RXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBK0R2QjtBQUVEOztHQUVHO0FBQ0gsSUFBWSxrQkFNWDtBQU5ELFdBQVksa0JBQWtCO0lBRTdCOztPQUVHO0lBQ0gseURBQW1DLENBQUE7QUFDcEMsQ0FBQyxFQU5XLGtCQUFrQixHQUFsQiwwQkFBa0IsS0FBbEIsMEJBQWtCLFFBTTdCO0FBRVksUUFBQSxvQkFBb0IsR0FBRztJQUNuQyxZQUFZLENBQUMsbUJBQW1CO0NBQ2hDLENBQUM7QUFFVyxRQUFBLFlBQVksR0FBRyxvQkFBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ25DLFFBQUEsa0JBQWtCLEdBQUcsb0JBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRTVEOzs7O0dBSUc7QUFDSCxTQUFnQixVQUFVLENBQUMsR0FBYTtJQUV2QyxJQUFJLElBQUksR0FBRyxvQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRWxDLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7U0FDOUIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFFckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFRLENBQUMsRUFDN0M7WUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDLDRCQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFRLENBQUMsRUFDbkQ7Z0JBQ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNWO1NBQ0Q7UUFFRCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDTDtBQUNILENBQUM7QUFsQkQsZ0NBa0JDO0FBRUQsZ0NBQWdDO0FBRWhDLGtCQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNC8xNi8wMTYuXG4gKi9cblxuaW1wb3J0IHsgSVdvcmQsIFNlZ21lbnQgfSBmcm9tICcuLi9TZWdtZW50JztcblxuaW1wb3J0IHsgJGVudW0sIEVudW1XcmFwcGVyLCB9IGZyb20gXCJ0cy1lbnVtLXV0aWxcIjtcbmltcG9ydCBGb3JlaWduT3B0aW1pemVyIGZyb20gJy4uL3N1Ym1vZC9Gb3JlaWduT3B0aW1pemVyJztcbmltcG9ydCBKcFNpbXBsZVRva2VuaXplciBmcm9tICcuLi9zdWJtb2QvSnBTaW1wbGVUb2tlbml6ZXInO1xuaW1wb3J0IFNpbmdsZVRva2VuaXplciBmcm9tICcuLi9zdWJtb2QvU2luZ2xlVG9rZW5pemVyJztcbmltcG9ydCB7IE9wdGltaXplciwgU3ViU01vZHVsZU9wdGltaXplciwgSVN1Yk9wdGltaXplciwgSVN1Yk9wdGltaXplckNyZWF0ZSB9IGZyb20gJy4vT3B0aW1pemVyJztcbmltcG9ydCB7IFRva2VuaXplciwgU3ViU01vZHVsZVRva2VuaXplciwgSVN1YlRva2VuaXplciwgSVN1YlRva2VuaXplckNyZWF0ZSB9IGZyb20gJy4vVG9rZW5pemVyJztcbmltcG9ydCB7IFN1YlNNb2R1bGUsIElTdWJTTW9kdWxlLCBJU3ViU01vZHVsZUNyZWF0ZSwgSVN1YlNNb2R1bGVNZXRob2QgfSBmcm9tICcuL21vZCc7XG5cbmV4cG9ydCB7IE9wdGltaXplciwgU3ViU01vZHVsZU9wdGltaXplciwgSVN1Yk9wdGltaXplciwgSVN1Yk9wdGltaXplckNyZWF0ZSB9XG5leHBvcnQgeyBUb2tlbml6ZXIsIFN1YlNNb2R1bGVUb2tlbml6ZXIsIElTdWJUb2tlbml6ZXIsIElTdWJUb2tlbml6ZXJDcmVhdGUgfVxuZXhwb3J0IHsgU3ViU01vZHVsZSwgSVN1YlNNb2R1bGUsIElTdWJTTW9kdWxlQ3JlYXRlLCBJU3ViU01vZHVsZU1ldGhvZCB9XG5cbi8qKlxuICog6K+G5Yir5qih5Z2XXG4gKiDlvLrliLbliIblibLnsbvljZXor43or4bliKtcbiAqL1xuZXhwb3J0IGVudW0gRU5VTV9TVUJNT0RTXG57XG5cdC8qKlxuXHQgKiBVUkzor4bliKtcblx0ICovXG5cdFVSTFRva2VuaXplciA9ICdVUkxUb2tlbml6ZXInLFxuXHQvKipcblx0ICog6YCa6YWN56ym77yM5b+F6aG75Zyo5qCH54K556ym5Y+36K+G5Yir5LmL5YmNXG5cdCAqL1xuXHRXaWxkY2FyZFRva2VuaXplciA9ICdXaWxkY2FyZFRva2VuaXplcicsXG5cdC8qKlxuXHQgKiDmoIfngrnnrKblj7for4bliKtcblx0ICovXG5cdFB1bmN0dWF0aW9uVG9rZW5pemVyID0gJ1B1bmN0dWF0aW9uVG9rZW5pemVyJyxcblx0LyoqXG5cdCAqIOWkluaWh+Wtl+espuOAgeaVsOWtl+ivhuWIq++8jOW/hemhu+WcqOagh+eCueespuWPt+ivhuWIq+S5i+WQjlxuXHQgKi9cblx0Rm9yZWlnblRva2VuaXplciA9ICdGb3JlaWduVG9rZW5pemVyJyxcblxuXHQvLyDkuK3mlofljZXor43or4bliKtcblxuXHQvKipcblx0ICog6K+N5YW46K+G5YirXG5cdCAqL1xuXHREaWN0VG9rZW5pemVyID0gJ0RpY3RUb2tlbml6ZXInLFxuXHQvKipcblx0ICog5Lq65ZCN6K+G5Yir77yM5bu66K6u5Zyo6K+N5YW46K+G5Yir5LmL5ZCOXG5cdCAqL1xuXHRDaHNOYW1lVG9rZW5pemVyID0gJ0Noc05hbWVUb2tlbml6ZXInLFxuXG5cdEpwU2ltcGxlVG9rZW5pemVyID0gJ0pwU2ltcGxlVG9rZW5pemVyJyxcblxuXHQvLyBAdG9kbyDkvJjljJbmqKHlnZdcblxuXHQvKipcblx0ICog6YKu566x5Zyw5Z2A6K+G5YirXG5cdCAqL1xuXHRFbWFpbE9wdGltaXplciA9ICdFbWFpbE9wdGltaXplcicsXG5cdC8qKlxuXHQgKiDkurrlkI3or4bliKvkvJjljJZcblx0ICovXG5cdENoc05hbWVPcHRpbWl6ZXIgPSAnQ2hzTmFtZU9wdGltaXplcicsXG5cdC8qKlxuXHQgKiDor43lhbjor4bliKvkvJjljJZcblx0ICovXG5cdERpY3RPcHRpbWl6ZXIgPSAnRGljdE9wdGltaXplcicsXG5cdC8qKlxuXHQgKiDml6XmnJ/ml7bpl7Tor4bliKvkvJjljJZcblx0ICovXG5cdERhdGV0aW1lT3B0aW1pemVyID0gJ0RhdGV0aW1lT3B0aW1pemVyJyxcblxuXHQvKipcblx0ICog5ZCI5L215aSW5paH6IiH5Lit5paH55qE6KmeXG5cdCAqIOS+i+WmgiDvvLTmgaRcblx0ICovXG5cdEZvcmVpZ25PcHRpbWl6ZXIgPSAnRm9yZWlnbk9wdGltaXplcicsXG5cblx0LyoqXG5cdCAqIOiHquWLleiZleeQhiBg6YeMfOijj3zlkI5gXG5cdCAqL1xuXHRaaHRTeW5vbnltT3B0aW1pemVyID0gJ1podFN5bm9ueW1PcHRpbWl6ZXInLFxuXG5cdEFkamVjdGl2ZU9wdGltaXplciA9ICdBZGplY3RpdmVPcHRpbWl6ZXInLFxufVxuXG4vKipcbiAqIOS4jeWMheWQq+WcqOmgkOioreaooee1hOWIl+ihqOWFpyDpnIDopoHmiYvli5XmjIflrppcbiAqL1xuZXhwb3J0IGVudW0gRU5VTV9TVUJNT0RTX09USEVSXG57XG5cdC8qKlxuXHQgKiDljZXlrZfliIfliIbmqKHlnZdcblx0ICovXG5cdFNpbmdsZVRva2VuaXplciA9ICdTaW5nbGVUb2tlbml6ZXInLFxufVxuXG5leHBvcnQgY29uc3QgTElTVF9TVUJNT0RTX05PVF9ERUYgPSBbXG5cdEVOVU1fU1VCTU9EUy5aaHRTeW5vbnltT3B0aW1pemVyLFxuXTtcblxuZXhwb3J0IGNvbnN0IFNVQk1PRFNfTElTVCA9ICRlbnVtKEVOVU1fU1VCTU9EUyk7XG5leHBvcnQgY29uc3QgU1VCTU9EU19PVEhFUl9MSVNUID0gJGVudW0oRU5VTV9TVUJNT0RTX09USEVSKTtcblxuLyoqXG4gKiDlj5blvpfliJfooajkuKbkuJTkv53mjIEgRU5VTSDpoIbluo9cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYWxsXG4gKiBAcmV0dXJucyB7RU5VTV9TVUJNT0RTW119XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0KGFsbD86IGJvb2xlYW4pOiBFTlVNX1NVQk1PRFNbXVxue1xuXHRsZXQgbGlzdCA9IFNVQk1PRFNfTElTVC5nZXRLZXlzKCk7XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKEVOVU1fU1VCTU9EUylcblx0XHQucmVkdWNlKGZ1bmN0aW9uIChhLCBtKVxuXHRcdHtcblx0XHRcdGlmICghYS5pbmNsdWRlcyhtKSAmJiBsaXN0LmluY2x1ZGVzKG0gYXMgYW55KSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKGFsbCB8fCAhTElTVF9TVUJNT0RTX05PVF9ERUYuaW5jbHVkZXMobSBhcyBhbnkpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YS5wdXNoKG0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBhO1xuXHRcdH0sIFtdKVxuXHRcdDtcbn1cblxuLy9jb25zb2xlLmxvZyhnZXREZWZhdWx0KHRydWUpKTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0RGVmYXVsdDtcbiJdfQ==