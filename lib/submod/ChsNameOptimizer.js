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
const const_1 = require("../const");
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
        this._BLACKLIST = this.segment.getDict(const_1.EnumDictDatabase.BLACKLIST_FOR_OPTIMIZER) || {};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hzTmFtZU9wdGltaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNoc05hbWVPcHRpbWl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFFSCxZQUFZLENBQUM7O0FBRWIsZ0NBQTZGO0FBQzdGLGdEQUFzSDtBQUd0SCxvQ0FBNEM7QUFFNUM7O0dBRUc7QUFDSCxNQUFhLGdCQUFpQixTQUFRLHlCQUFtQjtJQUF6RDs7UUFJQyxTQUFJLEdBQUcsa0JBQWtCLENBQUM7SUFxUTNCLENBQUM7SUFuUUEsTUFBTTtRQUVMLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVmLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFNUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyx3QkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN4RixDQUFDO0lBRUQsWUFBWSxDQUFDLEdBQUcsS0FBZTtRQUU5QixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXhCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUV4QjtZQUNDLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxXQUFXLENBQUMsSUFBVyxFQUFFLFFBQWU7UUFFdkMsSUFBSSxJQUFJLElBQUksUUFBUSxFQUNwQjtZQUNDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUU3Qjs7ZUFFRztZQUNILElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUN4QjtnQkFDQyxPQUFPLElBQUksQ0FBQztnQkFFWjs7Ozs7OztrQkFPRTth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YUFBYSxDQUFDOzt3QkFFeEUsUUFBUSxDQUFDLENBQUMsSUFBSSxtQkFBUyxDQUFDLFdBQVcsRUFFcEM7b0JBQ0M7Ozs7OztzQkFNRTtvQkFFRixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBRXpCOzt1QkFFRztvQkFDSCxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQ3RDO3dCQUNDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7NEJBQzVCLENBQUMsRUFBRSxFQUFFOzRCQUNMLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSTs0QkFDZCxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO3lCQUNuQixFQUFFLFNBQVMsRUFBRTs0QkFDYixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDOzRCQUNkLFdBQVcsRUFBRSxFQUFFO3lCQUNmLENBQUMsQ0FBQzt3QkFFSCxDQUFDLEVBQUUsQ0FBQzt3QkFDSixTQUFTO3FCQUNUO2lCQUNEO2FBQ0Q7WUFFRCxVQUFVO1lBQ1YsQ0FBQyxFQUFFLENBQUM7U0FDSjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztDQUNEO0FBelFELDRDQXlRQztBQUVZLFFBQUEsSUFBSSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQWlDLENBQUM7QUFFakcsa0JBQWUsZ0JBQWdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIOS6uuWQjeS8mOWMluaooeWdl1xuICpcbiAqIEBhdXRob3Ig6ICB6Zu3PGxlaXpvbmdtaW5AZ21haWwuY29tPlxuICogQHZlcnNpb24gMC4xXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBTdWJTTW9kdWxlLCBTdWJTTW9kdWxlT3B0aW1pemVyLCBJU3ViT3B0aW1pemVyLCBTdWJTTW9kdWxlVG9rZW5pemVyIH0gZnJvbSAnLi4vbW9kJztcbmltcG9ydCBDSFNfTkFNRVMsIHsgRkFNSUxZX05BTUVfMSwgRkFNSUxZX05BTUVfMiwgU0lOR0xFX05BTUUsIERPVUJMRV9OQU1FXzEsIERPVUJMRV9OQU1FXzIgfSBmcm9tICcuLi9tb2QvQ0hTX05BTUVTJztcbmltcG9ydCBTZWdtZW50LCB7IElESUNULCBJV29yZCB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0IHsgZGVidWcgfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7IEVudW1EaWN0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25zdCc7XG5cbi8qKlxuICogQHRvZG8g5pSv5o+0IFhY5rCPXG4gKi9cbmV4cG9ydCBjbGFzcyBDaHNOYW1lT3B0aW1pemVyIGV4dGVuZHMgU3ViU01vZHVsZU9wdGltaXplclxue1xuXHRwcm90ZWN0ZWQgX1RBQkxFOiBJRElDVDxJV29yZD47XG5cblx0bmFtZSA9ICdDaHNOYW1lT3B0aW1pemVyJztcblxuXHRfY2FjaGUoKVxuXHR7XG5cdFx0c3VwZXIuX2NhY2hlKCk7XG5cblx0XHR0aGlzLl9UQUJMRSA9IHRoaXMuc2VnbWVudC5nZXREaWN0KCdUQUJMRScpO1xuXG5cdFx0dGhpcy5fQkxBQ0tMSVNUID0gdGhpcy5zZWdtZW50LmdldERpY3QoRW51bURpY3REYXRhYmFzZS5CTEFDS0xJU1RfRk9SX09QVElNSVpFUikgfHwge307XG5cdH1cblxuXHRpc01lcmdlYWJsZTIoLi4ud29yZHM6IHN0cmluZ1tdKVxuXHR7XG5cdFx0bGV0IG53ID0gd29yZHMuam9pbignJyk7XG5cblx0XHRpZiAoIXRoaXMuX0JMQUNLTElTVFtud10pXG5cblx0XHR7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGlzTWVyZ2VhYmxlKHdvcmQ6IElXb3JkLCBuZXh0d29yZDogSVdvcmQpXG5cdHtcblx0XHRpZiAod29yZCAmJiBuZXh0d29yZClcblx0XHR7XG5cdFx0XHRsZXQgbncgPSB3b3JkLncgKyBuZXh0d29yZC53O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIOS4jeWQiOS9teWtmOWcqOaWvCBCTEFDS0xJU1Qg5YWn55qE5a2X6KmeXG5cdFx0XHQgKi9cblx0XHRcdGlmICghdGhpcy5fQkxBQ0tMSVNUW253XSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHRcdFx0Lypcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR3b3JkLFxuXHRcdFx0XHRcdG5leHR3b3JkLFxuXHRcdFx0XHRcdG53LFxuXHRcdFx0XHRcdGJvb2w6IHRydWUsXG5cdFx0XHRcdH1cblx0XHRcdFx0Ki9cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiDlr7nlj6/og73mmK/kurrlkI3nmoTljZXor43ov5vooYzkvJjljJZcblx0ICpcblx0ICogQHBhcmFtIHthcnJheX0gd29yZHMg5Y2V6K+N5pWw57uEXG5cdCAqIEByZXR1cm4ge2FycmF5fVxuXHQgKi9cblx0ZG9PcHRpbWl6ZSh3b3JkczogSVdvcmRbXSk6IElXb3JkW11cblx0e1xuXHRcdC8vZGVidWcod29yZHMpO1xuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuX1BPU1RBRztcblx0XHRsZXQgaSA9IDA7XG5cblx0XHQvKiDnrKzkuIDpgY3miavmj48gKi9cblx0XHR3aGlsZSAoaSA8IHdvcmRzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRsZXQgd29yZCA9IHdvcmRzW2ldO1xuXHRcdFx0bGV0IG5leHR3b3JkID0gd29yZHNbaSArIDFdO1xuXG5cdFx0XHRpZiAodGhpcy5pc01lcmdlYWJsZSh3b3JkLCBuZXh0d29yZCkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vZGVidWcobmV4dHdvcmQpO1xuXHRcdFx0XHQvLyDlpoLmnpzkuLogIFwi5bCPfOiAgVwiICsg5aeTXG5cdFx0XHRcdGlmIChuZXh0d29yZCAmJiAod29yZC53ID09ICflsI8nIHx8IHdvcmQudyA9PSAn6ICBJykgJiZcblx0XHRcdFx0XHQobmV4dHdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMSB8fCBuZXh0d29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8yKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0d29yZHMuc3BsaWNlKGksIDIsIHtcblx0XHRcdFx0XHRcdHc6IHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdG06IFt3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdHRoaXMuc2xpY2VUb2tlbih3b3JkcywgaSwgMiwge1xuXHRcdFx0XHRcdFx0dzogd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0bTogW3dvcmQsIG5leHR3b3JkXSxcblx0XHRcdFx0XHR9LCB1bmRlZmluZWQsIHtcblx0XHRcdFx0XHRcdFt0aGlzLm5hbWVdOiAxLFxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0aSsrO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8g5aaC5p6c5pivIOWnkyArIOWQje+8iDLlrZfku6XlhoXvvIlcblx0XHRcdFx0aWYgKCh3b3JkLncgaW4gQ0hTX05BTUVTLkZBTUlMWV9OQU1FXzEgfHwgd29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8yKSAmJlxuXHRcdFx0XHRcdCgobmV4dHdvcmQucCAmIFBPU1RBRy5BX05SKSA+IDAgJiYgbmV4dHdvcmQudy5sZW5ndGggPD0gMikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdHdvcmRzLnNwbGljZShpLCAyLCB7XG5cdFx0XHRcdFx0XHR3OiB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHR0aGlzLnNsaWNlVG9rZW4od29yZHMsIGksIDIsIHtcblx0XHRcdFx0XHRcdHc6IHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdG06IFt3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0fSwgdW5kZWZpbmVkLCB7XG5cdFx0XHRcdFx0XHRbdGhpcy5uYW1lXTogMixcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGkrKztcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIOWmguaenOebuOmCu+S4pOS4quWdh+S4uuWNleWtl+S4lOiHs+WwkeacieS4gOS4quWtl+aYr+acquivhuWIq+eahO+8jOWImeWwneivleWIpOaWreWFtuaYr+WQpuS4uuS6uuWQjVxuXHRcdFx0XHRpZiAoIXdvcmQucCB8fCAhbmV4dHdvcmQucClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICgod29yZC53IGluIENIU19OQU1FUy5TSU5HTEVfTkFNRSAmJiB3b3JkLncgPT0gbmV4dHdvcmQudykgfHxcblx0XHRcdFx0XHRcdCh3b3JkLncgaW4gQ0hTX05BTUVTLkRPVUJMRV9OQU1FXzEgJiYgbmV4dHdvcmQudyBpbiBDSFNfTkFNRVMuRE9VQkxFX05BTUVfMikpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdHdvcmRzLnNwbGljZShpLCAyLCB7XG5cdFx0XHRcdFx0XHRcdHc6IHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHR0aGlzLnNsaWNlVG9rZW4od29yZHMsIGksIDIsIHtcblx0XHRcdFx0XHRcdFx0dzogd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRcdG06IFt3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0XHR9LCB1bmRlZmluZWQsIHtcblx0XHRcdFx0XHRcdFx0W3RoaXMubmFtZV06IDMsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5LiK5LiA5Liq5Y2V6K+N5Y+v6IO95piv5LiA5Liq5aeT77yM5YiZ5ZCI5bm2XG5cdFx0XHRcdFx0XHRsZXQgcHJld29yZCA9IHdvcmRzW2kgLSAxXTtcblx0XHRcdFx0XHRcdGlmIChwcmV3b3JkXG5cdFx0XHRcdFx0XHRcdCYmIChwcmV3b3JkLncgaW4gQ0hTX05BTUVTLkZBTUlMWV9OQU1FXzEgfHwgcHJld29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8yKVxuXHRcdFx0XHRcdFx0XHQmJiB0aGlzLmlzTWVyZ2VhYmxlMihwcmV3b3JkLncsIHdvcmQudywgIG5leHR3b3JkLncpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0d29yZHMuc3BsaWNlKGkgLSAxLCAyLCB7XG5cdFx0XHRcdFx0XHRcdFx0dzogcHJld29yZC53ICsgd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdFx0XHRtOiBbcHJld29yZCwgd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0XHR0aGlzLnNsaWNlVG9rZW4od29yZHMsIGkgLSAxLCAyLCB7XG5cdFx0XHRcdFx0XHRcdFx0dzogcHJld29yZC53ICsgd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdFx0XHRtOiBbcHJld29yZCwgd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdFx0XHR9LCB1bmRlZmluZWQsIHtcblx0XHRcdFx0XHRcdFx0XHRbdGhpcy5uYW1lXTogNCxcblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aSsrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8g5aaC5p6c5Li6IOaXoOatp+S5ieeahOWnkyArIOWQje+8iDLlrZfku6XlhoXvvIkg5LiU5YW25Lit5LiA5Liq5pyq5pyq6K+G5Yir6K+NXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHQod29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8xIHx8IHdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMilcblx0XHRcdFx0XHQmJiAoIXdvcmQucCB8fCAhbmV4dHdvcmQucClcblxuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIOmYsuatouWwh+aomem7nuespuiZn+eVtuS9nOWQjeWtl+eahEJVR1xuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdCYmICEod29yZC5wICYgUE9TVEFHLkRfVyB8fCBuZXh0d29yZC5wICYgUE9TVEFHLkRfVylcblx0XHRcdFx0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly9kZWJ1Zyh3b3JkLCBuZXh0d29yZCk7XG5cdFx0XHRcdFx0Lypcblx0XHRcdFx0XHR3b3Jkcy5zcGxpY2UoaSwgMiwge1xuXHRcdFx0XHRcdFx0dzogd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0bTogW3dvcmQsIG5leHR3b3JkXSxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0dGhpcy5zbGljZVRva2VuKHdvcmRzLCBpLCAyLCB7XG5cdFx0XHRcdFx0XHR3OiB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdH0sIHVuZGVmaW5lZCwge1xuXHRcdFx0XHRcdFx0W3RoaXMubmFtZV06IDUsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8g56e75Yiw5LiL5LiA5Liq5Y2V6K+NXG5cdFx0XHRpKys7XG5cdFx0fVxuXG5cdFx0Lyog56ys5LqM6YGN5omr5o+PICovXG5cdFx0aSA9IDA7XG5cdFx0d2hpbGUgKGkgPCB3b3Jkcy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0bGV0IHdvcmQgPSB3b3Jkc1tpXTtcblx0XHRcdGxldCBuZXh0d29yZCA9IHdvcmRzW2kgKyAxXTtcblx0XHRcdGlmICh0aGlzLmlzTWVyZ2VhYmxlKHdvcmQsIG5leHR3b3JkKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8g5aaC5p6c5Li6IOWnkyArIOWNleWtl+WQjVxuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0KHdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMSB8fCB3b3JkLncgaW4gQ0hTX05BTUVTLkZBTUlMWV9OQU1FXzIpXG5cdFx0XHRcdFx0JiZcblx0XHRcdFx0XHRuZXh0d29yZC53IGluIENIU19OQU1FUy5TSU5HTEVfTkFNRVxuXHRcdFx0XHQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdHdvcmRzLnNwbGljZShpLCAyLCB7XG5cdFx0XHRcdFx0XHR3OiB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHRsZXQgbncgPSB3b3JkLncgKyBuZXh0d29yZC53O1xuXHRcdFx0XHRcdGxldCBldyA9IHRoaXMuX1RBQkxFW253XTtcblxuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIOabtOaUueeCuuWPquacieaWsOipnuWxrOaWvOS6uuWQjeaIluacquefpeipnuaZguaJjeacg+WQiOS9tVxuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdGlmICghZXcgfHwgIWV3LnAgfHwgZXcucCAmIFBPU1RBRy5BX05SKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRoaXMuc2xpY2VUb2tlbih3b3JkcywgaSwgMiwge1xuXHRcdFx0XHRcdFx0XHR3OiBudyxcblx0XHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRcdG06IFt3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0XHR9LCB1bmRlZmluZWQsIHtcblx0XHRcdFx0XHRcdFx0W3RoaXMubmFtZV06IDYsXG5cdFx0XHRcdFx0XHRcdGV4aXN0c193b3JkOiBldyxcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8g56e75Yiw5LiL5LiA5Liq5Y2V6K+NXG5cdFx0XHRpKys7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdvcmRzO1xuXHR9XG59XG5cbmV4cG9ydCBjb25zdCBpbml0ID0gQ2hzTmFtZU9wdGltaXplci5pbml0LmJpbmQoQ2hzTmFtZU9wdGltaXplcikgYXMgdHlwZW9mIENoc05hbWVPcHRpbWl6ZXIuaW5pdDtcblxuZXhwb3J0IGRlZmF1bHQgQ2hzTmFtZU9wdGltaXplcjtcblxuIl19