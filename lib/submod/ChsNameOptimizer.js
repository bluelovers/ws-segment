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
        this._BLACKLIST = this.segment.getDict("BLACKLIST_FOR_OPTIMIZER" /* BLACKLIST_FOR_OPTIMIZER */) || {};
    }
    isMergeable2(...words) {
        let nw = words.join('');
        if (!this._BLACKLIST[nw]) {
            return true;
        }
        return null;
    }
    isMergeable(word, nextword) {
        if (word && nextword) {
            let nw = word.w + nextword.w;
            /**
             * 不合併存在於 BLACKLIST 內的字詞
             */
            if (!this._BLACKLIST[nw]) {
                return true;
                /*
                return {
                    word,
                    nextword,
                    nw,
                    bool: true,
                }
                */
            }
        }
        return null;
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
            if (this.isMergeable(word, nextword)) {
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
                        if (preword
                            && (preword.w in CHS_NAMES_1.default.FAMILY_NAME_1 || preword.w in CHS_NAMES_1.default.FAMILY_NAME_2)
                            && this.isMergeable2(preword.w, word.w, nextword.w)) {
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
            if (this.isMergeable(word, nextword)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hzTmFtZU9wdGltaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNoc05hbWVPcHRpbWl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFFSCxZQUFZLENBQUM7O0FBRWIsZ0NBQTZGO0FBQzdGLGdEQUFzSDtBQUt0SDs7R0FFRztBQUNILE1BQWEsZ0JBQWlCLFNBQVEseUJBQW1CO0lBQXpEOztRQUlDLFNBQUksR0FBRyxrQkFBa0IsQ0FBQztJQXFRM0IsQ0FBQztJQW5RQSxNQUFNO1FBRUwsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWYsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU1QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyx5REFBMEMsSUFBSSxFQUFFLENBQUM7SUFDeEYsQ0FBQztJQUVELFlBQVksQ0FBQyxHQUFHLEtBQWU7UUFFOUIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFFeEI7WUFDQyxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsV0FBVyxDQUFDLElBQVcsRUFBRSxRQUFlO1FBRXZDLElBQUksSUFBSSxJQUFJLFFBQVEsRUFDcEI7WUFDQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFFN0I7O2VBRUc7WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFDeEI7Z0JBQ0MsT0FBTyxJQUFJLENBQUM7Z0JBRVo7Ozs7Ozs7a0JBT0U7YUFDRjtTQUNEO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixD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QUksbUJBQVMsQ0FBQyxXQUFXLEVBRXBDO29CQUNDOzs7Ozs7c0JBTUU7b0JBRUYsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUM3QixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUV6Qjs7dUJBRUc7b0JBQ0gsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUN0Qzt3QkFDQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFOzRCQUM1QixDQUFDLEVBQUUsRUFBRTs0QkFDTCxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUk7NEJBQ2QsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQzt5QkFDbkIsRUFBRSxTQUFTLEVBQUU7NEJBQ2IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs0QkFDZCxXQUFXLEVBQUUsRUFBRTt5QkFDZixDQUFDLENBQUM7d0JBRUgsQ0FBQyxFQUFFLENBQUM7d0JBQ0osU0FBUztxQkFDVDtpQkFDRDthQUNEO1lBRUQsVUFBVTtZQUNWLENBQUMsRUFBRSxDQUFDO1NBQ0o7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7Q0FDRDtBQXpRRCw0Q0F5UUM7QUFFWSxRQUFBLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFpQyxDQUFDO0FBRWpHLGtCQUFlLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiDkurrlkI3kvJjljJbmqKHlnZdcbiAqXG4gKiBAYXV0aG9yIOiAgembtzxsZWl6b25nbWluQGdtYWlsLmNvbT5cbiAqIEB2ZXJzaW9uIDAuMVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgU3ViU01vZHVsZSwgU3ViU01vZHVsZU9wdGltaXplciwgSVN1Yk9wdGltaXplciwgU3ViU01vZHVsZVRva2VuaXplciB9IGZyb20gJy4uL21vZCc7XG5pbXBvcnQgQ0hTX05BTUVTLCB7IEZBTUlMWV9OQU1FXzEsIEZBTUlMWV9OQU1FXzIsIFNJTkdMRV9OQU1FLCBET1VCTEVfTkFNRV8xLCBET1VCTEVfTkFNRV8yIH0gZnJvbSAnLi4vbW9kL0NIU19OQU1FUyc7XG5pbXBvcnQgU2VnbWVudCwgeyBJRElDVCwgSVdvcmQgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCB7IGRlYnVnIH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgeyBFbnVtRGljdERhdGFiYXNlIH0gZnJvbSAnLi4vY29uc3QnO1xuXG4vKipcbiAqIEB0b2RvIOaUr+aPtCBYWOawj1xuICovXG5leHBvcnQgY2xhc3MgQ2hzTmFtZU9wdGltaXplciBleHRlbmRzIFN1YlNNb2R1bGVPcHRpbWl6ZXJcbntcblx0cHJvdGVjdGVkIF9UQUJMRTogSURJQ1Q8SVdvcmQ+O1xuXG5cdG5hbWUgPSAnQ2hzTmFtZU9wdGltaXplcic7XG5cblx0X2NhY2hlKClcblx0e1xuXHRcdHN1cGVyLl9jYWNoZSgpO1xuXG5cdFx0dGhpcy5fVEFCTEUgPSB0aGlzLnNlZ21lbnQuZ2V0RGljdCgnVEFCTEUnKTtcblxuXHRcdHRoaXMuX0JMQUNLTElTVCA9IHRoaXMuc2VnbWVudC5nZXREaWN0KEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNUX0ZPUl9PUFRJTUlaRVIpIHx8IHt9O1xuXHR9XG5cblx0aXNNZXJnZWFibGUyKC4uLndvcmRzOiBzdHJpbmdbXSlcblx0e1xuXHRcdGxldCBudyA9IHdvcmRzLmpvaW4oJycpO1xuXG5cdFx0aWYgKCF0aGlzLl9CTEFDS0xJU1RbbnddKVxuXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRpc01lcmdlYWJsZSh3b3JkOiBJV29yZCwgbmV4dHdvcmQ6IElXb3JkKVxuXHR7XG5cdFx0aWYgKHdvcmQgJiYgbmV4dHdvcmQpXG5cdFx0e1xuXHRcdFx0bGV0IG53ID0gd29yZC53ICsgbmV4dHdvcmQudztcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiDkuI3lkIjkvbXlrZjlnKjmlrwgQkxBQ0tMSVNUIOWFp+eahOWtl+ipnlxuXHRcdFx0ICovXG5cdFx0XHRpZiAoIXRoaXMuX0JMQUNLTElTVFtud10pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXG5cdFx0XHRcdC8qXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0d29yZCxcblx0XHRcdFx0XHRuZXh0d29yZCxcblx0XHRcdFx0XHRudyxcblx0XHRcdFx0XHRib29sOiB0cnVlLFxuXHRcdFx0XHR9XG5cdFx0XHRcdCovXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICog5a+55Y+v6IO95piv5Lq65ZCN55qE5Y2V6K+N6L+b6KGM5LyY5YyWXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuXHQgKiBAcmV0dXJuIHthcnJheX1cblx0ICovXG5cdGRvT3B0aW1pemUod29yZHM6IElXb3JkW10pOiBJV29yZFtdXG5cdHtcblx0XHQvL2RlYnVnKHdvcmRzKTtcblx0XHRjb25zdCBQT1NUQUcgPSB0aGlzLl9QT1NUQUc7XG5cdFx0bGV0IGkgPSAwO1xuXG5cdFx0Lyog56ys5LiA6YGN5omr5o+PICovXG5cdFx0d2hpbGUgKGkgPCB3b3Jkcy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0bGV0IHdvcmQgPSB3b3Jkc1tpXTtcblx0XHRcdGxldCBuZXh0d29yZCA9IHdvcmRzW2kgKyAxXTtcblxuXHRcdFx0aWYgKHRoaXMuaXNNZXJnZWFibGUod29yZCwgbmV4dHdvcmQpKVxuXHRcdFx0e1xuXHRcdFx0XHQvL2RlYnVnKG5leHR3b3JkKTtcblx0XHRcdFx0Ly8g5aaC5p6c5Li6ICBcIuWwj3zogIFcIiArIOWnk1xuXHRcdFx0XHRpZiAobmV4dHdvcmQgJiYgKHdvcmQudyA9PSAn5bCPJyB8fCB3b3JkLncgPT0gJ+iAgScpICYmXG5cdFx0XHRcdFx0KG5leHR3b3JkLncgaW4gQ0hTX05BTUVTLkZBTUlMWV9OQU1FXzEgfHwgbmV4dHdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdHdvcmRzLnNwbGljZShpLCAyLCB7XG5cdFx0XHRcdFx0XHR3OiB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHR0aGlzLnNsaWNlVG9rZW4od29yZHMsIGksIDIsIHtcblx0XHRcdFx0XHRcdHc6IHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdG06IFt3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0fSwgdW5kZWZpbmVkLCB7XG5cdFx0XHRcdFx0XHRbdGhpcy5uYW1lXTogMSxcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGkrKztcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIOWmguaenOaYryDlp5MgKyDlkI3vvIgy5a2X5Lul5YaF77yJXG5cdFx0XHRcdGlmICgod29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8xIHx8IHdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMikgJiZcblx0XHRcdFx0XHQoKG5leHR3b3JkLnAgJiBQT1NUQUcuQV9OUikgPiAwICYmIG5leHR3b3JkLncubGVuZ3RoIDw9IDIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Lypcblx0XHRcdFx0XHR3b3Jkcy5zcGxpY2UoaSwgMiwge1xuXHRcdFx0XHRcdFx0dzogd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0bTogW3dvcmQsIG5leHR3b3JkXSxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0dGhpcy5zbGljZVRva2VuKHdvcmRzLCBpLCAyLCB7XG5cdFx0XHRcdFx0XHR3OiB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdH0sIHVuZGVmaW5lZCwge1xuXHRcdFx0XHRcdFx0W3RoaXMubmFtZV06IDIsXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyDlpoLmnpznm7jpgrvkuKTkuKrlnYfkuLrljZXlrZfkuJToh7PlsJHmnInkuIDkuKrlrZfmmK/mnKror4bliKvnmoTvvIzliJnlsJ3or5XliKTmlq3lhbbmmK/lkKbkuLrkurrlkI1cblx0XHRcdFx0aWYgKCF3b3JkLnAgfHwgIW5leHR3b3JkLnApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoKHdvcmQudyBpbiBDSFNfTkFNRVMuU0lOR0xFX05BTUUgJiYgd29yZC53ID09IG5leHR3b3JkLncpIHx8XG5cdFx0XHRcdFx0XHQod29yZC53IGluIENIU19OQU1FUy5ET1VCTEVfTkFNRV8xICYmIG5leHR3b3JkLncgaW4gQ0hTX05BTUVTLkRPVUJMRV9OQU1FXzIpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHR3b3Jkcy5zcGxpY2UoaSwgMiwge1xuXHRcdFx0XHRcdFx0XHR3OiB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdFx0bTogW3dvcmQsIG5leHR3b3JkXSxcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0dGhpcy5zbGljZVRva2VuKHdvcmRzLCBpLCAyLCB7XG5cdFx0XHRcdFx0XHRcdHc6IHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdFx0fSwgdW5kZWZpbmVkLCB7XG5cdFx0XHRcdFx0XHRcdFt0aGlzLm5hbWVdOiAzLFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdC8vIOWmguaenOS4iuS4gOS4quWNleivjeWPr+iDveaYr+S4gOS4quWnk++8jOWImeWQiOW5tlxuXHRcdFx0XHRcdFx0bGV0IHByZXdvcmQgPSB3b3Jkc1tpIC0gMV07XG5cdFx0XHRcdFx0XHRpZiAocHJld29yZFxuXHRcdFx0XHRcdFx0XHQmJiAocHJld29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8xIHx8IHByZXdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMilcblx0XHRcdFx0XHRcdFx0JiYgdGhpcy5pc01lcmdlYWJsZTIocHJld29yZC53LCB3b3JkLncsICBuZXh0d29yZC53KVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdHdvcmRzLnNwbGljZShpIC0gMSwgMiwge1xuXHRcdFx0XHRcdFx0XHRcdHc6IHByZXdvcmQudyArIHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRcdFx0bTogW3ByZXdvcmQsIHdvcmQsIG5leHR3b3JkXSxcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHRcdFx0dGhpcy5zbGljZVRva2VuKHdvcmRzLCBpIC0gMSwgMiwge1xuXHRcdFx0XHRcdFx0XHRcdHc6IHByZXdvcmQudyArIHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRcdFx0bTogW3ByZXdvcmQsIHdvcmQsIG5leHR3b3JkXSxcblx0XHRcdFx0XHRcdFx0fSwgdW5kZWZpbmVkLCB7XG5cdFx0XHRcdFx0XHRcdFx0W3RoaXMubmFtZV06IDQsXG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGkrKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIOWmguaenOS4uiDml6DmrafkuYnnmoTlp5MgKyDlkI3vvIgy5a2X5Lul5YaF77yJIOS4lOWFtuS4reS4gOS4quacquacquivhuWIq+ivjVxuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0KHdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMSB8fCB3b3JkLncgaW4gQ0hTX05BTUVTLkZBTUlMWV9OQU1FXzIpXG5cdFx0XHRcdFx0JiYgKCF3b3JkLnAgfHwgIW5leHR3b3JkLnApXG5cblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiDpmLLmraLlsIfmqJnpu57nrKbomZ/nlbbkvZzlkI3lrZfnmoRCVUdcblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHQmJiAhKHdvcmQucCAmIFBPU1RBRy5EX1cgfHwgbmV4dHdvcmQucCAmIFBPU1RBRy5EX1cpXG5cdFx0XHRcdClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vZGVidWcod29yZCwgbmV4dHdvcmQpO1xuXHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0d29yZHMuc3BsaWNlKGksIDIsIHtcblx0XHRcdFx0XHRcdHc6IHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdG06IFt3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdHRoaXMuc2xpY2VUb2tlbih3b3JkcywgaSwgMiwge1xuXHRcdFx0XHRcdFx0dzogd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0bTogW3dvcmQsIG5leHR3b3JkXSxcblx0XHRcdFx0XHR9LCB1bmRlZmluZWQsIHtcblx0XHRcdFx0XHRcdFt0aGlzLm5hbWVdOiA1LFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIOenu+WIsOS4i+S4gOS4quWNleivjVxuXHRcdFx0aSsrO1xuXHRcdH1cblxuXHRcdC8qIOesrOS6jOmBjeaJq+aPjyAqL1xuXHRcdGkgPSAwO1xuXHRcdHdoaWxlIChpIDwgd29yZHMubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGxldCB3b3JkID0gd29yZHNbaV07XG5cdFx0XHRsZXQgbmV4dHdvcmQgPSB3b3Jkc1tpICsgMV07XG5cdFx0XHRpZiAodGhpcy5pc01lcmdlYWJsZSh3b3JkLCBuZXh0d29yZCkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIOWmguaenOS4uiDlp5MgKyDljZXlrZflkI1cblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdCh3b3JkLncgaW4gQ0hTX05BTUVTLkZBTUlMWV9OQU1FXzEgfHwgd29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8yKVxuXHRcdFx0XHRcdCYmXG5cdFx0XHRcdFx0bmV4dHdvcmQudyBpbiBDSFNfTkFNRVMuU0lOR0xFX05BTUVcblx0XHRcdFx0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Lypcblx0XHRcdFx0XHR3b3Jkcy5zcGxpY2UoaSwgMiwge1xuXHRcdFx0XHRcdFx0dzogd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0bTogW3dvcmQsIG5leHR3b3JkXSxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0bGV0IG53ID0gd29yZC53ICsgbmV4dHdvcmQudztcblx0XHRcdFx0XHRsZXQgZXcgPSB0aGlzLl9UQUJMRVtud107XG5cblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiDmm7TmlLnngrrlj6rmnInmlrDoqZ7lsazmlrzkurrlkI3miJbmnKrnn6XoqZ7mmYLmiY3mnIPlkIjkvbVcblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRpZiAoIWV3IHx8ICFldy5wIHx8IGV3LnAgJiBQT1NUQUcuQV9OUilcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0aGlzLnNsaWNlVG9rZW4od29yZHMsIGksIDIsIHtcblx0XHRcdFx0XHRcdFx0dzogbncsXG5cdFx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdFx0fSwgdW5kZWZpbmVkLCB7XG5cdFx0XHRcdFx0XHRcdFt0aGlzLm5hbWVdOiA2LFxuXHRcdFx0XHRcdFx0XHRleGlzdHNfd29yZDogZXcsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0aSsrO1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIOenu+WIsOS4i+S4gOS4quWNleivjVxuXHRcdFx0aSsrO1xuXHRcdH1cblxuXHRcdHJldHVybiB3b3Jkcztcblx0fVxufVxuXG5leHBvcnQgY29uc3QgaW5pdCA9IENoc05hbWVPcHRpbWl6ZXIuaW5pdC5iaW5kKENoc05hbWVPcHRpbWl6ZXIpIGFzIHR5cGVvZiBDaHNOYW1lT3B0aW1pemVyLmluaXQ7XG5cbmV4cG9ydCBkZWZhdWx0IENoc05hbWVPcHRpbWl6ZXI7XG5cbiJdfQ==