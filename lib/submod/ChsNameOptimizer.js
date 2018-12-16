/**
 * 人名优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.1
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
const CHS_NAMES_1 = require("../mod/CHS_NAMES");
/**
 * @todo 支援 XX氏
 */
class ChsNameOptimizer extends mod_1.SubSModuleOptimizer {
    constructor() {
        super(...arguments);
        this.name = 'ChsNameOptimizer';
    }
    _cache() {
        super._cache();
        this._TABLE = this.segment.getDict('TABLE');
    }
    /**
     * 对可能是人名的单词进行优化
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    doOptimize(words) {
        //debug(words);
        const POSTAG = this._POSTAG;
        let i = 0;
        /* 第一遍扫描 */
        while (i < words.length) {
            let word = words[i];
            let nextword = words[i + 1];
            if (nextword) {
                //debug(nextword);
                // 如果为  "小|老" + 姓
                if (nextword && (word.w == '小' || word.w == '老') &&
                    (nextword.w in CHS_NAMES_1.default.FAMILY_NAME_1 || nextword.w in CHS_NAMES_1.default.FAMILY_NAME_2)) {
                    /*
                    words.splice(i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    });
                    */
                    this.sliceToken(words, i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    }, undefined, {
                        [this.name]: 1,
                    });
                    i++;
                    continue;
                }
                // 如果是 姓 + 名（2字以内）
                if ((word.w in CHS_NAMES_1.default.FAMILY_NAME_1 || word.w in CHS_NAMES_1.default.FAMILY_NAME_2) &&
                    ((nextword.p & POSTAG.A_NR) > 0 && nextword.w.length <= 2)) {
                    /*
                    words.splice(i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    });
                    */
                    this.sliceToken(words, i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    }, undefined, {
                        [this.name]: 2,
                    });
                    i++;
                    continue;
                }
                // 如果相邻两个均为单字且至少有一个字是未识别的，则尝试判断其是否为人名
                if (!word.p || !nextword.p) {
                    if ((word.w in CHS_NAMES_1.default.SINGLE_NAME && word.w == nextword.w) ||
                        (word.w in CHS_NAMES_1.default.DOUBLE_NAME_1 && nextword.w in CHS_NAMES_1.default.DOUBLE_NAME_2)) {
                        /*
                        words.splice(i, 2, {
                            w: word.w + nextword.w,
                            p: POSTAG.A_NR,
                            m: [word, nextword],
                        });
                        */
                        this.sliceToken(words, i, 2, {
                            w: word.w + nextword.w,
                            p: POSTAG.A_NR,
                            m: [word, nextword],
                        }, undefined, {
                            [this.name]: 3,
                        });
                        // 如果上一个单词可能是一个姓，则合并
                        let preword = words[i - 1];
                        if (preword &&
                            (preword.w in CHS_NAMES_1.default.FAMILY_NAME_1 || preword.w in CHS_NAMES_1.default.FAMILY_NAME_2)) {
                            /*
                            words.splice(i - 1, 2, {
                                w: preword.w + word.w + nextword.w,
                                p: POSTAG.A_NR,
                                m: [preword, word, nextword],
                            });
                            */
                            this.sliceToken(words, i - 1, 2, {
                                w: preword.w + word.w + nextword.w,
                                p: POSTAG.A_NR,
                                m: [preword, word, nextword],
                            }, undefined, {
                                [this.name]: 4,
                            });
                        }
                        else {
                            i++;
                        }
                        continue;
                    }
                }
                // 如果为 无歧义的姓 + 名（2字以内） 且其中一个未未识别词
                if ((word.w in CHS_NAMES_1.default.FAMILY_NAME_1 || word.w in CHS_NAMES_1.default.FAMILY_NAME_2)
                    && (!word.p || !nextword.p)
                    /**
                     * 防止將標點符號當作名字的BUG
                     */
                    && !(word.p & POSTAG.D_W || nextword.p & POSTAG.D_W)) {
                    //debug(word, nextword);
                    /*
                    words.splice(i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    });
                    */
                    this.sliceToken(words, i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    }, undefined, {
                        [this.name]: 5,
                    });
                }
            }
            // 移到下一个单词
            i++;
        }
        /* 第二遍扫描 */
        i = 0;
        while (i < words.length) {
            let word = words[i];
            let nextword = words[i + 1];
            if (nextword) {
                // 如果为 姓 + 单字名
                if ((word.w in CHS_NAMES_1.default.FAMILY_NAME_1 || word.w in CHS_NAMES_1.default.FAMILY_NAME_2)
                    &&
                        nextword.w in CHS_NAMES_1.default.SINGLE_NAME) {
                    /*
                    words.splice(i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    });
                    */
                    let nw = word.w + nextword.w;
                    let ew = this._TABLE[nw];
                    /**
                     * 更改為只有新詞屬於人名或未知詞時才會合併
                     */
                    if (!ew || !ew.p || ew.p & POSTAG.A_NR) {
                        this.sliceToken(words, i, 2, {
                            w: nw,
                            p: POSTAG.A_NR,
                            m: [word, nextword],
                        }, undefined, {
                            [this.name]: 6,
                            exists_word: ew,
                        });
                        i++;
                        continue;
                    }
                }
            }
            // 移到下一个单词
            i++;
        }
        return words;
    }
}
exports.ChsNameOptimizer = ChsNameOptimizer;
exports.init = ChsNameOptimizer.init.bind(ChsNameOptimizer);
exports.default = ChsNameOptimizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hzTmFtZU9wdGltaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNoc05hbWVPcHRpbWl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFFSCxZQUFZLENBQUM7O0FBRWIsZ0NBQTZGO0FBQzdGLGdEQUFzSDtBQUl0SDs7R0FFRztBQUNILE1BQWEsZ0JBQWlCLFNBQVEseUJBQW1CO0lBQXpEOztRQUlDLFNBQUksR0FBRyxrQkFBa0IsQ0FBQztJQXdOM0IsQ0FBQztJQXROQSxNQUFNO1FBRUwsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWYsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxVQUFVLENBQUMsS0FBYztRQUV4QixlQUFlO1FBQ2YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVixXQUFXO1FBQ1gsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFDdkI7WUFDQyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLFFBQVEsRUFDWjtnQkFDQyxrQkFBa0I7Z0JBQ2xCLGlCQUFpQjtnQkFDakIsSUFBSSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztvQkFDL0MsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLG1CQUFTLENBQUMsYUFBYSxJQUFJLFFBQVEsQ0FBQyxDQUFDLElBQUksbUJBQVMsQ0FBQyxhQUFhLENBQUMsRUFDakY7b0JBQ0M7Ozs7OztzQkFNRTtv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LENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFpQyxDQUFDO0FBRWpHLGtCQUFlLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiDkurrlkI3kvJjljJbmqKHlnZdcbiAqXG4gKiBAYXV0aG9yIOiAgembtzxsZWl6b25nbWluQGdtYWlsLmNvbT5cbiAqIEB2ZXJzaW9uIDAuMVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgU3ViU01vZHVsZSwgU3ViU01vZHVsZU9wdGltaXplciwgSVN1Yk9wdGltaXplciwgU3ViU01vZHVsZVRva2VuaXplciB9IGZyb20gJy4uL21vZCc7XG5pbXBvcnQgQ0hTX05BTUVTLCB7IEZBTUlMWV9OQU1FXzEsIEZBTUlMWV9OQU1FXzIsIFNJTkdMRV9OQU1FLCBET1VCTEVfTkFNRV8xLCBET1VCTEVfTkFNRV8yIH0gZnJvbSAnLi4vbW9kL0NIU19OQU1FUyc7XG5pbXBvcnQgU2VnbWVudCwgeyBJRElDVCwgSVdvcmQgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCB7IGRlYnVnIH0gZnJvbSAnLi4vdXRpbCc7XG5cbi8qKlxuICogQHRvZG8g5pSv5o+0IFhY5rCPXG4gKi9cbmV4cG9ydCBjbGFzcyBDaHNOYW1lT3B0aW1pemVyIGV4dGVuZHMgU3ViU01vZHVsZU9wdGltaXplclxue1xuXHRwcm90ZWN0ZWQgX1RBQkxFOiBJRElDVDxJV29yZD47XG5cblx0bmFtZSA9ICdDaHNOYW1lT3B0aW1pemVyJztcblxuXHRfY2FjaGUoKVxuXHR7XG5cdFx0c3VwZXIuX2NhY2hlKCk7XG5cblx0XHR0aGlzLl9UQUJMRSA9IHRoaXMuc2VnbWVudC5nZXREaWN0KCdUQUJMRScpO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWvueWPr+iDveaYr+S6uuWQjeeahOWNleivjei/m+ihjOS8mOWMllxuXHQgKlxuXHQgKiBAcGFyYW0ge2FycmF5fSB3b3JkcyDljZXor43mlbDnu4Rcblx0ICogQHJldHVybiB7YXJyYXl9XG5cdCAqL1xuXHRkb09wdGltaXplKHdvcmRzOiBJV29yZFtdKTogSVdvcmRbXVxuXHR7XG5cdFx0Ly9kZWJ1Zyh3b3Jkcyk7XG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5fUE9TVEFHO1xuXHRcdGxldCBpID0gMDtcblxuXHRcdC8qIOesrOS4gOmBjeaJq+aPjyAqL1xuXHRcdHdoaWxlIChpIDwgd29yZHMubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGxldCB3b3JkID0gd29yZHNbaV07XG5cdFx0XHRsZXQgbmV4dHdvcmQgPSB3b3Jkc1tpICsgMV07XG5cdFx0XHRpZiAobmV4dHdvcmQpXG5cdFx0XHR7XG5cdFx0XHRcdC8vZGVidWcobmV4dHdvcmQpO1xuXHRcdFx0XHQvLyDlpoLmnpzkuLogIFwi5bCPfOiAgVwiICsg5aeTXG5cdFx0XHRcdGlmIChuZXh0d29yZCAmJiAod29yZC53ID09ICflsI8nIHx8IHdvcmQudyA9PSAn6ICBJykgJiZcblx0XHRcdFx0XHQobmV4dHdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMSB8fCBuZXh0d29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8yKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0d29yZHMuc3BsaWNlKGksIDIsIHtcblx0XHRcdFx0XHRcdHc6IHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdG06IFt3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdHRoaXMuc2xpY2VUb2tlbih3b3JkcywgaSwgMiwge1xuXHRcdFx0XHRcdFx0dzogd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0bTogW3dvcmQsIG5leHR3b3JkXSxcblx0XHRcdFx0XHR9LCB1bmRlZmluZWQsIHtcblx0XHRcdFx0XHRcdFt0aGlzLm5hbWVdOiAxLFxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0aSsrO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8g5aaC5p6c5pivIOWnkyArIOWQje+8iDLlrZfku6XlhoXvvIlcblx0XHRcdFx0aWYgKCh3b3JkLncgaW4gQ0hTX05BTUVTLkZBTUlMWV9OQU1FXzEgfHwgd29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8yKSAmJlxuXHRcdFx0XHRcdCgobmV4dHdvcmQucCAmIFBPU1RBRy5BX05SKSA+IDAgJiYgbmV4dHdvcmQudy5sZW5ndGggPD0gMikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdHdvcmRzLnNwbGljZShpLCAyLCB7XG5cdFx0XHRcdFx0XHR3OiB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHR0aGlzLnNsaWNlVG9rZW4od29yZHMsIGksIDIsIHtcblx0XHRcdFx0XHRcdHc6IHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdG06IFt3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0fSwgdW5kZWZpbmVkLCB7XG5cdFx0XHRcdFx0XHRbdGhpcy5uYW1lXTogMixcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGkrKztcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIOWmguaenOebuOmCu+S4pOS4quWdh+S4uuWNleWtl+S4lOiHs+WwkeacieS4gOS4quWtl+aYr+acquivhuWIq+eahO+8jOWImeWwneivleWIpOaWreWFtuaYr+WQpuS4uuS6uuWQjVxuXHRcdFx0XHRpZiAoIXdvcmQucCB8fCAhbmV4dHdvcmQucClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICgod29yZC53IGluIENIU19OQU1FUy5TSU5HTEVfTkFNRSAmJiB3b3JkLncgPT0gbmV4dHdvcmQudykgfHxcblx0XHRcdFx0XHRcdCh3b3JkLncgaW4gQ0hTX05BTUVTLkRPVUJMRV9OQU1FXzEgJiYgbmV4dHdvcmQudyBpbiBDSFNfTkFNRVMuRE9VQkxFX05BTUVfMikpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdHdvcmRzLnNwbGljZShpLCAyLCB7XG5cdFx0XHRcdFx0XHRcdHc6IHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHR0aGlzLnNsaWNlVG9rZW4od29yZHMsIGksIDIsIHtcblx0XHRcdFx0XHRcdFx0dzogd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRcdG06IFt3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0XHR9LCB1bmRlZmluZWQsIHtcblx0XHRcdFx0XHRcdFx0W3RoaXMubmFtZV06IDMsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5LiK5LiA5Liq5Y2V6K+N5Y+v6IO95piv5LiA5Liq5aeT77yM5YiZ5ZCI5bm2XG5cdFx0XHRcdFx0XHRsZXQgcHJld29yZCA9IHdvcmRzW2kgLSAxXTtcblx0XHRcdFx0XHRcdGlmIChwcmV3b3JkICYmXG5cdFx0XHRcdFx0XHRcdChwcmV3b3JkLncgaW4gQ0hTX05BTUVTLkZBTUlMWV9OQU1FXzEgfHwgcHJld29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8yKSlcblx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdFx0XHR3b3Jkcy5zcGxpY2UoaSAtIDEsIDIsIHtcblx0XHRcdFx0XHRcdFx0XHR3OiBwcmV3b3JkLncgKyB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0XHRcdG06IFtwcmV3b3JkLCB3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHRcdHRoaXMuc2xpY2VUb2tlbih3b3JkcywgaSAtIDEsIDIsIHtcblx0XHRcdFx0XHRcdFx0XHR3OiBwcmV3b3JkLncgKyB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0XHRcdG06IFtwcmV3b3JkLCB3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0XHRcdH0sIHVuZGVmaW5lZCwge1xuXHRcdFx0XHRcdFx0XHRcdFt0aGlzLm5hbWVdOiA0LFxuXHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyDlpoLmnpzkuLog5peg5q2n5LmJ55qE5aeTICsg5ZCN77yIMuWtl+S7peWGhe+8iSDkuJTlhbbkuK3kuIDkuKrmnKrmnKror4bliKvor41cblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdCh3b3JkLncgaW4gQ0hTX05BTUVTLkZBTUlMWV9OQU1FXzEgfHwgd29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8yKVxuXHRcdFx0XHRcdCYmICghd29yZC5wIHx8ICFuZXh0d29yZC5wKVxuXG5cdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0ICog6Ziy5q2i5bCH5qiZ6bue56ym6Jmf55W25L2c5ZCN5a2X55qEQlVHXG5cdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0JiYgISh3b3JkLnAgJiBQT1NUQUcuRF9XIHx8IG5leHR3b3JkLnAgJiBQT1NUQUcuRF9XKVxuXHRcdFx0XHQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvL2RlYnVnKHdvcmQsIG5leHR3b3JkKTtcblx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdHdvcmRzLnNwbGljZShpLCAyLCB7XG5cdFx0XHRcdFx0XHR3OiB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHR0aGlzLnNsaWNlVG9rZW4od29yZHMsIGksIDIsIHtcblx0XHRcdFx0XHRcdHc6IHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdG06IFt3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0fSwgdW5kZWZpbmVkLCB7XG5cdFx0XHRcdFx0XHRbdGhpcy5uYW1lXTogNSxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyDnp7vliLDkuIvkuIDkuKrljZXor41cblx0XHRcdGkrKztcblx0XHR9XG5cblx0XHQvKiDnrKzkuozpgY3miavmj48gKi9cblx0XHRpID0gMDtcblx0XHR3aGlsZSAoaSA8IHdvcmRzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRsZXQgd29yZCA9IHdvcmRzW2ldO1xuXHRcdFx0bGV0IG5leHR3b3JkID0gd29yZHNbaSArIDFdO1xuXHRcdFx0aWYgKG5leHR3b3JkKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyDlpoLmnpzkuLog5aeTICsg5Y2V5a2X5ZCNXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHQod29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8xIHx8IHdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMilcblx0XHRcdFx0XHQmJlxuXHRcdFx0XHRcdG5leHR3b3JkLncgaW4gQ0hTX05BTUVTLlNJTkdMRV9OQU1FXG5cdFx0XHRcdClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0d29yZHMuc3BsaWNlKGksIDIsIHtcblx0XHRcdFx0XHRcdHc6IHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdG06IFt3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdGxldCBudyA9IHdvcmQudyArIG5leHR3b3JkLnc7XG5cdFx0XHRcdFx0bGV0IGV3ID0gdGhpcy5fVEFCTEVbbnddO1xuXG5cdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0ICog5pu05pS554K65Y+q5pyJ5paw6Kme5bGs5pa85Lq65ZCN5oiW5pyq55+l6Kme5pmC5omN5pyD5ZCI5L21XG5cdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0aWYgKCFldyB8fCAhZXcucCB8fCBldy5wICYgUE9TVEFHLkFfTlIpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGhpcy5zbGljZVRva2VuKHdvcmRzLCBpLCAyLCB7XG5cdFx0XHRcdFx0XHRcdHc6IG53LFxuXHRcdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdFx0bTogW3dvcmQsIG5leHR3b3JkXSxcblx0XHRcdFx0XHRcdH0sIHVuZGVmaW5lZCwge1xuXHRcdFx0XHRcdFx0XHRbdGhpcy5uYW1lXTogNixcblx0XHRcdFx0XHRcdFx0ZXhpc3RzX3dvcmQ6IGV3LFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdGkrKztcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyDnp7vliLDkuIvkuIDkuKrljZXor41cblx0XHRcdGkrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gd29yZHM7XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGluaXQgPSBDaHNOYW1lT3B0aW1pemVyLmluaXQuYmluZChDaHNOYW1lT3B0aW1pemVyKSBhcyB0eXBlb2YgQ2hzTmFtZU9wdGltaXplci5pbml0O1xuXG5leHBvcnQgZGVmYXVsdCBDaHNOYW1lT3B0aW1pemVyO1xuXG4iXX0=