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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hzTmFtZU9wdGltaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNoc05hbWVPcHRpbWl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFFSCxZQUFZLENBQUM7O0FBRWIsZ0NBQTZGO0FBQzdGLGdEQUFzSDtBQUl0SCxNQUFhLGdCQUFpQixTQUFRLHlCQUFtQjtJQUF6RDs7UUFJQyxTQUFJLEdBQUcsa0JBQWtCLENBQUM7SUF3TjNCLENBQUM7SUF0TkEsTUFBTTtRQUVMLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVmLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsVUFBVSxDQUFDLEtBQWM7UUFFeEIsZUFBZTtRQUNmLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVYsV0FBVztRQUNYLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQ3ZCO1lBQ0MsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxRQUFRLEVBQ1o7Z0JBQ0Msa0JBQWtCO2dCQUNsQixpQkFBaUI7Z0JBQ2pCLElBQUksUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7b0JBQy9DLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxtQkFBUyxDQUFDLGFBQWEsSUFBSSxRQUFRLENBQUMsQ0FBQyxJQUFJLG1CQUFTLENBQUMsYUFBYSxDQUFDLEVBQ2pGO29CQUNDOzs7Ozs7c0JBTUU7b0JBRUYsSUFBSSxD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Q0FBQyxnQkFBZ0IsQ0FBaUMsQ0FBQztBQUVqRyxrQkFBZSxnQkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICog5Lq65ZCN5LyY5YyW5qih5Z2XXG4gKlxuICogQGF1dGhvciDogIHpm7c8bGVpem9uZ21pbkBnbWFpbC5jb20+XG4gKiBAdmVyc2lvbiAwLjFcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IFN1YlNNb2R1bGUsIFN1YlNNb2R1bGVPcHRpbWl6ZXIsIElTdWJPcHRpbWl6ZXIsIFN1YlNNb2R1bGVUb2tlbml6ZXIgfSBmcm9tICcuLi9tb2QnO1xuaW1wb3J0IENIU19OQU1FUywgeyBGQU1JTFlfTkFNRV8xLCBGQU1JTFlfTkFNRV8yLCBTSU5HTEVfTkFNRSwgRE9VQkxFX05BTUVfMSwgRE9VQkxFX05BTUVfMiB9IGZyb20gJy4uL21vZC9DSFNfTkFNRVMnO1xuaW1wb3J0IFNlZ21lbnQsIHsgSURJQ1QsIElXb3JkIH0gZnJvbSAnLi4vU2VnbWVudCc7XG5pbXBvcnQgeyBkZWJ1ZyB9IGZyb20gJy4uL3V0aWwnO1xuXG5leHBvcnQgY2xhc3MgQ2hzTmFtZU9wdGltaXplciBleHRlbmRzIFN1YlNNb2R1bGVPcHRpbWl6ZXJcbntcblx0cHJvdGVjdGVkIF9UQUJMRTogSURJQ1Q8SVdvcmQ+O1xuXG5cdG5hbWUgPSAnQ2hzTmFtZU9wdGltaXplcic7XG5cblx0X2NhY2hlKClcblx0e1xuXHRcdHN1cGVyLl9jYWNoZSgpO1xuXG5cdFx0dGhpcy5fVEFCTEUgPSB0aGlzLnNlZ21lbnQuZ2V0RGljdCgnVEFCTEUnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiDlr7nlj6/og73mmK/kurrlkI3nmoTljZXor43ov5vooYzkvJjljJZcblx0ICpcblx0ICogQHBhcmFtIHthcnJheX0gd29yZHMg5Y2V6K+N5pWw57uEXG5cdCAqIEByZXR1cm4ge2FycmF5fVxuXHQgKi9cblx0ZG9PcHRpbWl6ZSh3b3JkczogSVdvcmRbXSk6IElXb3JkW11cblx0e1xuXHRcdC8vZGVidWcod29yZHMpO1xuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuX1BPU1RBRztcblx0XHRsZXQgaSA9IDA7XG5cblx0XHQvKiDnrKzkuIDpgY3miavmj48gKi9cblx0XHR3aGlsZSAoaSA8IHdvcmRzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRsZXQgd29yZCA9IHdvcmRzW2ldO1xuXHRcdFx0bGV0IG5leHR3b3JkID0gd29yZHNbaSArIDFdO1xuXHRcdFx0aWYgKG5leHR3b3JkKVxuXHRcdFx0e1xuXHRcdFx0XHQvL2RlYnVnKG5leHR3b3JkKTtcblx0XHRcdFx0Ly8g5aaC5p6c5Li6ICBcIuWwj3zogIFcIiArIOWnk1xuXHRcdFx0XHRpZiAobmV4dHdvcmQgJiYgKHdvcmQudyA9PSAn5bCPJyB8fCB3b3JkLncgPT0gJ+iAgScpICYmXG5cdFx0XHRcdFx0KG5leHR3b3JkLncgaW4gQ0hTX05BTUVTLkZBTUlMWV9OQU1FXzEgfHwgbmV4dHdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdHdvcmRzLnNwbGljZShpLCAyLCB7XG5cdFx0XHRcdFx0XHR3OiB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHR0aGlzLnNsaWNlVG9rZW4od29yZHMsIGksIDIsIHtcblx0XHRcdFx0XHRcdHc6IHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdG06IFt3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0fSwgdW5kZWZpbmVkLCB7XG5cdFx0XHRcdFx0XHRbdGhpcy5uYW1lXTogMSxcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGkrKztcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIOWmguaenOaYryDlp5MgKyDlkI3vvIgy5a2X5Lul5YaF77yJXG5cdFx0XHRcdGlmICgod29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8xIHx8IHdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMikgJiZcblx0XHRcdFx0XHQoKG5leHR3b3JkLnAgJiBQT1NUQUcuQV9OUikgPiAwICYmIG5leHR3b3JkLncubGVuZ3RoIDw9IDIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Lypcblx0XHRcdFx0XHR3b3Jkcy5zcGxpY2UoaSwgMiwge1xuXHRcdFx0XHRcdFx0dzogd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0bTogW3dvcmQsIG5leHR3b3JkXSxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0dGhpcy5zbGljZVRva2VuKHdvcmRzLCBpLCAyLCB7XG5cdFx0XHRcdFx0XHR3OiB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdH0sIHVuZGVmaW5lZCwge1xuXHRcdFx0XHRcdFx0W3RoaXMubmFtZV06IDIsXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyDlpoLmnpznm7jpgrvkuKTkuKrlnYfkuLrljZXlrZfkuJToh7PlsJHmnInkuIDkuKrlrZfmmK/mnKror4bliKvnmoTvvIzliJnlsJ3or5XliKTmlq3lhbbmmK/lkKbkuLrkurrlkI1cblx0XHRcdFx0aWYgKCF3b3JkLnAgfHwgIW5leHR3b3JkLnApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoKHdvcmQudyBpbiBDSFNfTkFNRVMuU0lOR0xFX05BTUUgJiYgd29yZC53ID09IG5leHR3b3JkLncpIHx8XG5cdFx0XHRcdFx0XHQod29yZC53IGluIENIU19OQU1FUy5ET1VCTEVfTkFNRV8xICYmIG5leHR3b3JkLncgaW4gQ0hTX05BTUVTLkRPVUJMRV9OQU1FXzIpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHR3b3Jkcy5zcGxpY2UoaSwgMiwge1xuXHRcdFx0XHRcdFx0XHR3OiB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdFx0bTogW3dvcmQsIG5leHR3b3JkXSxcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0dGhpcy5zbGljZVRva2VuKHdvcmRzLCBpLCAyLCB7XG5cdFx0XHRcdFx0XHRcdHc6IHdvcmQudyArIG5leHR3b3JkLncsXG5cdFx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdFx0fSwgdW5kZWZpbmVkLCB7XG5cdFx0XHRcdFx0XHRcdFt0aGlzLm5hbWVdOiAzLFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdC8vIOWmguaenOS4iuS4gOS4quWNleivjeWPr+iDveaYr+S4gOS4quWnk++8jOWImeWQiOW5tlxuXHRcdFx0XHRcdFx0bGV0IHByZXdvcmQgPSB3b3Jkc1tpIC0gMV07XG5cdFx0XHRcdFx0XHRpZiAocHJld29yZCAmJlxuXHRcdFx0XHRcdFx0XHQocHJld29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8xIHx8IHByZXdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMikpXG5cdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0d29yZHMuc3BsaWNlKGkgLSAxLCAyLCB7XG5cdFx0XHRcdFx0XHRcdFx0dzogcHJld29yZC53ICsgd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdFx0XHRtOiBbcHJld29yZCwgd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0XHR0aGlzLnNsaWNlVG9rZW4od29yZHMsIGkgLSAxLCAyLCB7XG5cdFx0XHRcdFx0XHRcdFx0dzogcHJld29yZC53ICsgd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdFx0XHRwOiBQT1NUQUcuQV9OUixcblx0XHRcdFx0XHRcdFx0XHRtOiBbcHJld29yZCwgd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdFx0XHR9LCB1bmRlZmluZWQsIHtcblx0XHRcdFx0XHRcdFx0XHRbdGhpcy5uYW1lXTogNCxcblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aSsrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8g5aaC5p6c5Li6IOaXoOatp+S5ieeahOWnkyArIOWQje+8iDLlrZfku6XlhoXvvIkg5LiU5YW25Lit5LiA5Liq5pyq5pyq6K+G5Yir6K+NXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHQod29yZC53IGluIENIU19OQU1FUy5GQU1JTFlfTkFNRV8xIHx8IHdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMilcblx0XHRcdFx0XHQmJiAoIXdvcmQucCB8fCAhbmV4dHdvcmQucClcblxuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIOmYsuatouWwh+aomem7nuespuiZn+eVtuS9nOWQjeWtl+eahEJVR1xuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdCYmICEod29yZC5wICYgUE9TVEFHLkRfVyB8fCBuZXh0d29yZC5wICYgUE9TVEFHLkRfVylcblx0XHRcdFx0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly9kZWJ1Zyh3b3JkLCBuZXh0d29yZCk7XG5cdFx0XHRcdFx0Lypcblx0XHRcdFx0XHR3b3Jkcy5zcGxpY2UoaSwgMiwge1xuXHRcdFx0XHRcdFx0dzogd29yZC53ICsgbmV4dHdvcmQudyxcblx0XHRcdFx0XHRcdHA6IFBPU1RBRy5BX05SLFxuXHRcdFx0XHRcdFx0bTogW3dvcmQsIG5leHR3b3JkXSxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0dGhpcy5zbGljZVRva2VuKHdvcmRzLCBpLCAyLCB7XG5cdFx0XHRcdFx0XHR3OiB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdH0sIHVuZGVmaW5lZCwge1xuXHRcdFx0XHRcdFx0W3RoaXMubmFtZV06IDUsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8g56e75Yiw5LiL5LiA5Liq5Y2V6K+NXG5cdFx0XHRpKys7XG5cdFx0fVxuXG5cdFx0Lyog56ys5LqM6YGN5omr5o+PICovXG5cdFx0aSA9IDA7XG5cdFx0d2hpbGUgKGkgPCB3b3Jkcy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0bGV0IHdvcmQgPSB3b3Jkc1tpXTtcblx0XHRcdGxldCBuZXh0d29yZCA9IHdvcmRzW2kgKyAxXTtcblx0XHRcdGlmIChuZXh0d29yZClcblx0XHRcdHtcblx0XHRcdFx0Ly8g5aaC5p6c5Li6IOWnkyArIOWNleWtl+WQjVxuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0KHdvcmQudyBpbiBDSFNfTkFNRVMuRkFNSUxZX05BTUVfMSB8fCB3b3JkLncgaW4gQ0hTX05BTUVTLkZBTUlMWV9OQU1FXzIpXG5cdFx0XHRcdFx0JiZcblx0XHRcdFx0XHRuZXh0d29yZC53IGluIENIU19OQU1FUy5TSU5HTEVfTkFNRVxuXHRcdFx0XHQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdHdvcmRzLnNwbGljZShpLCAyLCB7XG5cdFx0XHRcdFx0XHR3OiB3b3JkLncgKyBuZXh0d29yZC53LFxuXHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRtOiBbd29yZCwgbmV4dHdvcmRdLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHRsZXQgbncgPSB3b3JkLncgKyBuZXh0d29yZC53O1xuXHRcdFx0XHRcdGxldCBldyA9IHRoaXMuX1RBQkxFW253XTtcblxuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIOabtOaUueeCuuWPquacieaWsOipnuWxrOaWvOS6uuWQjeaIluacquefpeipnuaZguaJjeacg+WQiOS9tVxuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdGlmICghZXcgfHwgIWV3LnAgfHwgZXcucCAmIFBPU1RBRy5BX05SKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRoaXMuc2xpY2VUb2tlbih3b3JkcywgaSwgMiwge1xuXHRcdFx0XHRcdFx0XHR3OiBudyxcblx0XHRcdFx0XHRcdFx0cDogUE9TVEFHLkFfTlIsXG5cdFx0XHRcdFx0XHRcdG06IFt3b3JkLCBuZXh0d29yZF0sXG5cdFx0XHRcdFx0XHR9LCB1bmRlZmluZWQsIHtcblx0XHRcdFx0XHRcdFx0W3RoaXMubmFtZV06IDYsXG5cdFx0XHRcdFx0XHRcdGV4aXN0c193b3JkOiBldyxcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8g56e75Yiw5LiL5LiA5Liq5Y2V6K+NXG5cdFx0XHRpKys7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdvcmRzO1xuXHR9XG59XG5cbmV4cG9ydCBjb25zdCBpbml0ID0gQ2hzTmFtZU9wdGltaXplci5pbml0LmJpbmQoQ2hzTmFtZU9wdGltaXplcikgYXMgdHlwZW9mIENoc05hbWVPcHRpbWl6ZXIuaW5pdDtcblxuZXhwb3J0IGRlZmF1bHQgQ2hzTmFtZU9wdGltaXplcjtcblxuIl19