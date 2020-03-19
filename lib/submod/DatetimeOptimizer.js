'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.doOptimize = exports.init = exports.segment = exports.type = void 0;
const const_1 = require("../mod/const");
/** 模块类型 */
exports.type = 'optimizer';
/**
 * 模块初始化
 *
 * @param {Segment} segment 分词接口
 */
function init(_segment) {
    exports.segment = _segment;
}
exports.init = init;
/**
 * 日期时间优化
 *
 * @param {array} words 单词数组
 * @param {bool} is_not_first 是否为管理器调用的
 * @return {array}
 */
function doOptimize(words, is_not_first) {
    if (typeof is_not_first == 'undefined') {
        is_not_first = false;
    }
    // 合并相邻的能组成一个单词的两个词
    const TABLE = exports.segment.getDict('TABLE');
    const POSTAG = exports.segment.POSTAG;
    let i = 0;
    let ie = words.length - 1;
    while (i < ie) {
        let w1 = words[i];
        let w2 = words[i + 1];
        //debug(w1.w + ', ' + w2.w);
        if ((w1.p & POSTAG.A_M) > 0) {
            // =========================================
            // 日期时间组合   数字 + 日期单位，如 “2005年"
            if (w2.w in const_1.DATETIME) {
                let nw = w1.w + w2.w;
                let len = 2;
                let ma = [w1, w2];
                // 继续搜索后面连续的日期时间描述，必须符合  数字 + 日期单位
                while (true) {
                    let w11 = words[i + len];
                    let w22 = words[i + len + 1];
                    if (w11 && w22 && (w11.p & POSTAG.A_M) > 0 && w22.w in const_1.DATETIME) {
                        len += 2;
                        nw += w11.w + w22.w;
                        ma.push(w11);
                        ma.push(w22);
                    }
                    else {
                        break;
                    }
                }
                words.splice(i, len, {
                    w: nw,
                    p: POSTAG.D_T,
                    m: ma,
                });
                ie -= len - 1;
                continue;
            }
            // =========================================
        }
        // 移到下一个词
        i++;
    }
    return words;
}
exports.doOptimize = doOptimize;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0ZXRpbWVPcHRpbWl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEYXRldGltZU9wdGltaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQVdiLHdDQUF3QztBQUV4QyxXQUFXO0FBQ0UsUUFBQSxJQUFJLEdBQUcsV0FBVyxDQUFDO0FBR2hDOzs7O0dBSUc7QUFDSCxTQUFnQixJQUFJLENBQUMsUUFBUTtJQUU1QixlQUFPLEdBQUcsUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFIRCxvQkFHQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLFVBQVUsQ0FBQyxLQUFjLEVBQUUsWUFBc0I7SUFFaEUsSUFBSSxPQUFPLFlBQVksSUFBSSxXQUFXLEVBQ3RDO1FBQ0MsWUFBWSxHQUFHLEtBQUssQ0FBQztLQUNyQjtJQUNELG1CQUFtQjtJQUNuQixNQUFNLEtBQUssR0FBRyxlQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLE1BQU0sTUFBTSxHQUFHLGVBQU8sQ0FBQyxNQUFNLENBQUM7SUFFOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDMUIsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUNiO1FBQ0MsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEIsNEJBQTRCO1FBRTVCLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQzNCO1lBQ0MsNENBQTRDO1lBQzVDLCtCQUErQjtZQUMvQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksZ0JBQVEsRUFDcEI7Z0JBQ0MsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBRVosSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRWxCLGtDQUFrQztnQkFDbEMsT0FBTyxJQUFJLEVBQ1g7b0JBQ0MsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztvQkFDekIsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLGdCQUFRLEVBQy9EO3dCQUNDLEdBQUcsSUFBSSxDQUFDLENBQUM7d0JBQ1QsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFFcEIsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDYixFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNiO3lCQUVEO3dCQUNDLE1BQU07cUJBQ047aUJBQ0Q7Z0JBQ0QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFO29CQUNwQixDQUFDLEVBQUUsRUFBRTtvQkFDTCxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUc7b0JBQ2IsQ0FBQyxFQUFFLEVBQUU7aUJBQ0wsQ0FBQyxDQUFDO2dCQUNILEVBQUUsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUNkLFNBQVM7YUFDVDtZQUNELDRDQUE0QztTQUM1QztRQUVELFNBQVM7UUFDVCxDQUFDLEVBQUUsQ0FBQztLQUNKO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZCxDQUFDO0FBL0RELGdDQStEQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiDml6XmnJ/ml7bpl7TkvJjljJbmqKHlnZdcbiAqXG4gKiBAYXV0aG9yIOiAgembtzxsZWl6b25nbWluQGdtYWlsLmNvbT5cbiAqL1xuXG5pbXBvcnQgU2VnbWVudCwgeyBJV29yZCB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0IHsgZGVidWcgfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7IGFycl9jamsgfSBmcm9tICcuLi91dGlsL2Nqayc7XG5pbXBvcnQgeyBEQVRFVElNRSB9IGZyb20gJy4uL21vZC9jb25zdCc7XG5cbi8qKiDmqKHlnZfnsbvlnosgKi9cbmV4cG9ydCBjb25zdCB0eXBlID0gJ29wdGltaXplcic7XG5leHBvcnQgbGV0IHNlZ21lbnQ6IFNlZ21lbnQ7XG5cbi8qKlxuICog5qih5Z2X5Yid5aeL5YyWXG4gKlxuICogQHBhcmFtIHtTZWdtZW50fSBzZWdtZW50IOWIhuivjeaOpeWPo1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5pdChfc2VnbWVudClcbntcblx0c2VnbWVudCA9IF9zZWdtZW50O1xufVxuXG4vKipcbiAqIOaXpeacn+aXtumXtOS8mOWMllxuICpcbiAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuICogQHBhcmFtIHtib29sfSBpc19ub3RfZmlyc3Qg5piv5ZCm5Li6566h55CG5Zmo6LCD55So55qEXG4gKiBAcmV0dXJuIHthcnJheX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvT3B0aW1pemUod29yZHM6IElXb3JkW10sIGlzX25vdF9maXJzdD86IGJvb2xlYW4pXG57XG5cdGlmICh0eXBlb2YgaXNfbm90X2ZpcnN0ID09ICd1bmRlZmluZWQnKVxuXHR7XG5cdFx0aXNfbm90X2ZpcnN0ID0gZmFsc2U7XG5cdH1cblx0Ly8g5ZCI5bm255u46YK755qE6IO957uE5oiQ5LiA5Liq5Y2V6K+N55qE5Lik5Liq6K+NXG5cdGNvbnN0IFRBQkxFID0gc2VnbWVudC5nZXREaWN0KCdUQUJMRScpO1xuXHRjb25zdCBQT1NUQUcgPSBzZWdtZW50LlBPU1RBRztcblxuXHRsZXQgaSA9IDA7XG5cdGxldCBpZSA9IHdvcmRzLmxlbmd0aCAtIDE7XG5cdHdoaWxlIChpIDwgaWUpXG5cdHtcblx0XHRsZXQgdzEgPSB3b3Jkc1tpXTtcblx0XHRsZXQgdzIgPSB3b3Jkc1tpICsgMV07XG5cdFx0Ly9kZWJ1Zyh3MS53ICsgJywgJyArIHcyLncpO1xuXG5cdFx0aWYgKCh3MS5wICYgUE9TVEFHLkFfTSkgPiAwKVxuXHRcdHtcblx0XHRcdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdFx0XHQvLyDml6XmnJ/ml7bpl7Tnu4TlkIggICDmlbDlrZcgKyDml6XmnJ/ljZXkvY3vvIzlpoIg4oCcMjAwNeW5tFwiXG5cdFx0XHRpZiAodzIudyBpbiBEQVRFVElNRSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IG53ID0gdzEudyArIHcyLnc7XG5cdFx0XHRcdGxldCBsZW4gPSAyO1xuXG5cdFx0XHRcdGxldCBtYSA9IFt3MSwgdzJdO1xuXG5cdFx0XHRcdC8vIOe7p+e7reaQnOe0ouWQjumdoui/nue7reeahOaXpeacn+aXtumXtOaPj+i/sO+8jOW/hemhu+espuWQiCAg5pWw5a2XICsg5pel5pyf5Y2V5L2NXG5cdFx0XHRcdHdoaWxlICh0cnVlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHcxMSA9IHdvcmRzW2kgKyBsZW5dO1xuXHRcdFx0XHRcdGxldCB3MjIgPSB3b3Jkc1tpICsgbGVuICsgMV07XG5cdFx0XHRcdFx0aWYgKHcxMSAmJiB3MjIgJiYgKHcxMS5wICYgUE9TVEFHLkFfTSkgPiAwICYmIHcyMi53IGluIERBVEVUSU1FKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxlbiArPSAyO1xuXHRcdFx0XHRcdFx0bncgKz0gdzExLncgKyB3MjIudztcblxuXHRcdFx0XHRcdFx0bWEucHVzaCh3MTEpO1xuXHRcdFx0XHRcdFx0bWEucHVzaCh3MjIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHdvcmRzLnNwbGljZShpLCBsZW4sIHtcblx0XHRcdFx0XHR3OiBudyxcblx0XHRcdFx0XHRwOiBQT1NUQUcuRF9ULFxuXHRcdFx0XHRcdG06IG1hLFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWUgLT0gbGVuIC0gMTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHRcdH1cblxuXHRcdC8vIOenu+WIsOS4i+S4gOS4quivjVxuXHRcdGkrKztcblx0fVxuXG5cdHJldHVybiB3b3Jkcztcbn1cbiJdfQ==