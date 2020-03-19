"use strict";
/**
 * Created by user on 2018/4/16/016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefault = exports.SUBMODS_OTHER_LIST = exports.SUBMODS_LIST = exports.LIST_SUBMODS_NOT_DEF = exports.ENUM_SUBMODS_OTHER = exports.ENUM_SUBMODS = exports.SubSModule = exports.SubSModuleTokenizer = exports.Tokenizer = exports.SubSModuleOptimizer = exports.Optimizer = void 0;
const ts_enum_util_1 = require("ts-enum-util");
const Optimizer_1 = require("./Optimizer");
Object.defineProperty(exports, "Optimizer", { enumerable: true, get: function () { return Optimizer_1.Optimizer; } });
Object.defineProperty(exports, "SubSModuleOptimizer", { enumerable: true, get: function () { return Optimizer_1.SubSModuleOptimizer; } });
const Tokenizer_1 = require("./Tokenizer");
Object.defineProperty(exports, "Tokenizer", { enumerable: true, get: function () { return Tokenizer_1.Tokenizer; } });
Object.defineProperty(exports, "SubSModuleTokenizer", { enumerable: true, get: function () { return Tokenizer_1.SubSModuleTokenizer; } });
const mod_1 = require("./mod");
Object.defineProperty(exports, "SubSModule", { enumerable: true, get: function () { return mod_1.SubSModule; } });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUlILCtDQUFtRDtBQUluRCwyQ0FBaUc7QUFJeEYsMEZBSkEscUJBQVMsT0FJQTtBQUFFLG9HQUpBLCtCQUFtQixPQUlBO0FBSHZDLDJDQUFpRztBQUl4RiwwRkFKQSxxQkFBUyxPQUlBO0FBQUUsb0dBSkEsK0JBQW1CLE9BSUE7QUFIdkMsK0JBQXNGO0FBSTdFLDJGQUpBLGdCQUFVLE9BSUE7QUFFbkI7OztHQUdHO0FBQ0gsSUFBWSxZQXlFWDtBQXpFRCxXQUFZLFlBQVk7SUFFdkI7O09BRUc7SUFDSCw2Q0FBNkIsQ0FBQTtJQUM3Qjs7T0FFRztJQUNILHVEQUF1QyxDQUFBO0lBQ3ZDOztPQUVHO0lBQ0gsNkRBQTZDLENBQUE7SUFDN0M7O09BRUc7SUFDSCxxREFBcUMsQ0FBQTtJQUVyQyxTQUFTO0lBRVQ7O09BRUc7SUFDSCwrQ0FBK0IsQ0FBQTtJQUMvQjs7T0FFRztJQUNILHFEQUFxQyxDQUFBO0lBRXJDLHVEQUF1QyxDQUFBO0lBRXZDOztPQUVHO0lBQ0gsbURBQW1DLENBQUE7SUFFbkM7O09BRUc7SUFDSCw0Q0FBNEM7SUFFNUMsYUFBYTtJQUViOztPQUVHO0lBQ0gsaURBQWlDLENBQUE7SUFDakM7O09BRUc7SUFDSCxxREFBcUMsQ0FBQTtJQUNyQzs7T0FFRztJQUNILCtDQUErQixDQUFBO0lBQy9COztPQUVHO0lBQ0gsdURBQXVDLENBQUE7SUFFdkM7OztPQUdHO0lBQ0gscURBQXFDLENBQUE7SUFFckM7O09BRUc7SUFDSCwyREFBMkMsQ0FBQTtJQUUzQyx5REFBeUMsQ0FBQTtBQUMxQyxDQUFDLEVBekVXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBeUV2QjtBQUVEOztHQUVHO0FBQ0gsSUFBWSxrQkFNWDtBQU5ELFdBQVksa0JBQWtCO0lBRTdCOztPQUVHO0lBQ0gseURBQW1DLENBQUE7QUFDcEMsQ0FBQyxFQU5XLGtCQUFrQixHQUFsQiwwQkFBa0IsS0FBbEIsMEJBQWtCLFFBTTdCO0FBSVksUUFBQSxvQkFBb0IsR0FBRztJQUNuQyxZQUFZLENBQUMsbUJBQW1CO0NBQ2hDLENBQUM7QUFFVyxRQUFBLFlBQVksR0FBRyxvQkFBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ25DLFFBQUEsa0JBQWtCLEdBQUcsb0JBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRTVEOzs7O0dBSUc7QUFDSCxTQUFnQixVQUFVLENBQUMsR0FBYTtJQUV2QyxJQUFJLElBQUksR0FBRyxvQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRWxDLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7U0FDOUIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFFckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFRLENBQUMsRUFDN0M7WUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDLDRCQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFRLENBQUMsRUFDbkQ7Z0JBQ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNWO1NBQ0Q7UUFFRCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDTDtBQUNILENBQUM7QUFsQkQsZ0NBa0JDO0FBRUQsZ0NBQWdDO0FBRWhDLGtCQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNC8xNi8wMTYuXG4gKi9cblxuaW1wb3J0IHsgSVdvcmQsIFNlZ21lbnQgfSBmcm9tICcuLi9TZWdtZW50JztcblxuaW1wb3J0IHsgJGVudW0sIEVudW1XcmFwcGVyLCB9IGZyb20gXCJ0cy1lbnVtLXV0aWxcIjtcbmltcG9ydCBGb3JlaWduT3B0aW1pemVyIGZyb20gJy4uL3N1Ym1vZC9Gb3JlaWduT3B0aW1pemVyJztcbmltcG9ydCBKcFNpbXBsZVRva2VuaXplciBmcm9tICcuLi9zdWJtb2QvSnBTaW1wbGVUb2tlbml6ZXInO1xuaW1wb3J0IFNpbmdsZVRva2VuaXplciBmcm9tICcuLi9zdWJtb2QvU2luZ2xlVG9rZW5pemVyJztcbmltcG9ydCB7IE9wdGltaXplciwgU3ViU01vZHVsZU9wdGltaXplciwgSVN1Yk9wdGltaXplciwgSVN1Yk9wdGltaXplckNyZWF0ZSB9IGZyb20gJy4vT3B0aW1pemVyJztcbmltcG9ydCB7IFRva2VuaXplciwgU3ViU01vZHVsZVRva2VuaXplciwgSVN1YlRva2VuaXplciwgSVN1YlRva2VuaXplckNyZWF0ZSB9IGZyb20gJy4vVG9rZW5pemVyJztcbmltcG9ydCB7IFN1YlNNb2R1bGUsIElTdWJTTW9kdWxlLCBJU3ViU01vZHVsZUNyZWF0ZSwgSVN1YlNNb2R1bGVNZXRob2QgfSBmcm9tICcuL21vZCc7XG5cbmV4cG9ydCB7IE9wdGltaXplciwgU3ViU01vZHVsZU9wdGltaXplciwgSVN1Yk9wdGltaXplciwgSVN1Yk9wdGltaXplckNyZWF0ZSB9XG5leHBvcnQgeyBUb2tlbml6ZXIsIFN1YlNNb2R1bGVUb2tlbml6ZXIsIElTdWJUb2tlbml6ZXIsIElTdWJUb2tlbml6ZXJDcmVhdGUgfVxuZXhwb3J0IHsgU3ViU01vZHVsZSwgSVN1YlNNb2R1bGUsIElTdWJTTW9kdWxlQ3JlYXRlLCBJU3ViU01vZHVsZU1ldGhvZCB9XG5cbi8qKlxuICog6K+G5Yir5qih5Z2XXG4gKiDlvLrliLbliIblibLnsbvljZXor43or4bliKtcbiAqL1xuZXhwb3J0IGVudW0gRU5VTV9TVUJNT0RTXG57XG5cdC8qKlxuXHQgKiBVUkzor4bliKtcblx0ICovXG5cdFVSTFRva2VuaXplciA9ICdVUkxUb2tlbml6ZXInLFxuXHQvKipcblx0ICog6YCa6YWN56ym77yM5b+F6aG75Zyo5qCH54K556ym5Y+36K+G5Yir5LmL5YmNXG5cdCAqL1xuXHRXaWxkY2FyZFRva2VuaXplciA9ICdXaWxkY2FyZFRva2VuaXplcicsXG5cdC8qKlxuXHQgKiDmoIfngrnnrKblj7for4bliKtcblx0ICovXG5cdFB1bmN0dWF0aW9uVG9rZW5pemVyID0gJ1B1bmN0dWF0aW9uVG9rZW5pemVyJyxcblx0LyoqXG5cdCAqIOWkluaWh+Wtl+espuOAgeaVsOWtl+ivhuWIq++8jOW/hemhu+WcqOagh+eCueespuWPt+ivhuWIq+S5i+WQjlxuXHQgKi9cblx0Rm9yZWlnblRva2VuaXplciA9ICdGb3JlaWduVG9rZW5pemVyJyxcblxuXHQvLyDkuK3mlofljZXor43or4bliKtcblxuXHQvKipcblx0ICog6K+N5YW46K+G5YirXG5cdCAqL1xuXHREaWN0VG9rZW5pemVyID0gJ0RpY3RUb2tlbml6ZXInLFxuXHQvKipcblx0ICog5Lq65ZCN6K+G5Yir77yM5bu66K6u5Zyo6K+N5YW46K+G5Yir5LmL5ZCOXG5cdCAqL1xuXHRDaHNOYW1lVG9rZW5pemVyID0gJ0Noc05hbWVUb2tlbml6ZXInLFxuXG5cdEpwU2ltcGxlVG9rZW5pemVyID0gJ0pwU2ltcGxlVG9rZW5pemVyJyxcblxuXHQvKipcblx0ICog5rOo6Z+zXG5cdCAqL1xuXHRaaHV5aW5Ub2tlbml6ZXIgPSAnWmh1eWluVG9rZW5pemVyJyxcblxuXHQvKipcblx0ICog6YOo6aaWXG5cdCAqL1xuXHQvL1poUmFkaWNhbFRva2VuaXplciA9ICdaaFJhZGljYWxUb2tlbml6ZXInLFxuXG5cdC8vIEB0b2RvIOS8mOWMluaooeWdl1xuXG5cdC8qKlxuXHQgKiDpgq7nrrHlnLDlnYDor4bliKtcblx0ICovXG5cdEVtYWlsT3B0aW1pemVyID0gJ0VtYWlsT3B0aW1pemVyJyxcblx0LyoqXG5cdCAqIOS6uuWQjeivhuWIq+S8mOWMllxuXHQgKi9cblx0Q2hzTmFtZU9wdGltaXplciA9ICdDaHNOYW1lT3B0aW1pemVyJyxcblx0LyoqXG5cdCAqIOivjeWFuOivhuWIq+S8mOWMllxuXHQgKi9cblx0RGljdE9wdGltaXplciA9ICdEaWN0T3B0aW1pemVyJyxcblx0LyoqXG5cdCAqIOaXpeacn+aXtumXtOivhuWIq+S8mOWMllxuXHQgKi9cblx0RGF0ZXRpbWVPcHRpbWl6ZXIgPSAnRGF0ZXRpbWVPcHRpbWl6ZXInLFxuXG5cdC8qKlxuXHQgKiDlkIjkvbXlpJbmlofoiIfkuK3mlofnmoToqZ5cblx0ICog5L6L5aaCIO+8tOaBpFxuXHQgKi9cblx0Rm9yZWlnbk9wdGltaXplciA9ICdGb3JlaWduT3B0aW1pemVyJyxcblxuXHQvKipcblx0ICog6Ieq5YuV6JmV55CGIGDph4x86KOPfOWQjmBcblx0ICovXG5cdFpodFN5bm9ueW1PcHRpbWl6ZXIgPSAnWmh0U3lub255bU9wdGltaXplcicsXG5cblx0QWRqZWN0aXZlT3B0aW1pemVyID0gJ0FkamVjdGl2ZU9wdGltaXplcicsXG59XG5cbi8qKlxuICog5LiN5YyF5ZCr5Zyo6aCQ6Kit5qih57WE5YiX6KGo5YWnIOmcgOimgeaJi+WLleaMh+WumlxuICovXG5leHBvcnQgZW51bSBFTlVNX1NVQk1PRFNfT1RIRVJcbntcblx0LyoqXG5cdCAqIOWNleWtl+WIh+WIhuaooeWdl1xuXHQgKi9cblx0U2luZ2xlVG9rZW5pemVyID0gJ1NpbmdsZVRva2VuaXplcicsXG59XG5cbmV4cG9ydCB0eXBlIEVOVU1fU1VCTU9EU19OQU1FID0gRU5VTV9TVUJNT0RTIHwgRU5VTV9TVUJNT0RTX09USEVSO1xuXG5leHBvcnQgY29uc3QgTElTVF9TVUJNT0RTX05PVF9ERUYgPSBbXG5cdEVOVU1fU1VCTU9EUy5aaHRTeW5vbnltT3B0aW1pemVyLFxuXTtcblxuZXhwb3J0IGNvbnN0IFNVQk1PRFNfTElTVCA9ICRlbnVtKEVOVU1fU1VCTU9EUyk7XG5leHBvcnQgY29uc3QgU1VCTU9EU19PVEhFUl9MSVNUID0gJGVudW0oRU5VTV9TVUJNT0RTX09USEVSKTtcblxuLyoqXG4gKiDlj5blvpfliJfooajkuKbkuJTkv53mjIEgRU5VTSDpoIbluo9cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYWxsXG4gKiBAcmV0dXJucyB7RU5VTV9TVUJNT0RTW119XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0KGFsbD86IGJvb2xlYW4pOiBFTlVNX1NVQk1PRFNbXVxue1xuXHRsZXQgbGlzdCA9IFNVQk1PRFNfTElTVC5nZXRLZXlzKCk7XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKEVOVU1fU1VCTU9EUylcblx0XHQucmVkdWNlKGZ1bmN0aW9uIChhLCBtKVxuXHRcdHtcblx0XHRcdGlmICghYS5pbmNsdWRlcyhtKSAmJiBsaXN0LmluY2x1ZGVzKG0gYXMgYW55KSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKGFsbCB8fCAhTElTVF9TVUJNT0RTX05PVF9ERUYuaW5jbHVkZXMobSBhcyBhbnkpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YS5wdXNoKG0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBhO1xuXHRcdH0sIFtdKVxuXHRcdDtcbn1cblxuLy9jb25zb2xlLmxvZyhnZXREZWZhdWx0KHRydWUpKTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0RGVmYXVsdDtcbiJdfQ==