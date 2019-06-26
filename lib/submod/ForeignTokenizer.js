'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 外文字符、数字识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
const mod_1 = require("../mod");
const debug_1 = require("../util/debug");
class ForeignTokenizer extends mod_1.SubSModuleTokenizer {
    constructor() {
        super(...arguments);
        this.name = 'ForeignTokenizer';
    }
    _cache() {
        super._cache();
        this._TABLE = this.segment.getDict('TABLE');
        let arr = [
            /[\w０-９Ａ-Ｚａ-ｚ\u0100-\u017F\u00A1-\u00FF]+/,
            /[\u0600-\u06FF\u0750-\u077F]+/,
            /[\u0400-\u04FF]+/,
            // https://unicode-table.com/cn/blocks/greek-coptic/
            /[\u0370-\u03FF]+/,
        ];
        this._REGEXP_SPLIT_1 = new RegExp('(' + _join([
            /[\u4E00-\u9FFF]+/,
        ].concat(arr)) + ')', 'iu');
        this._REGEXP_SPLIT_2 = new RegExp('(' + _join(arr) + ')', 'iu');
        function _join(arr) {
            return arr.reduce(function (a, b) {
                if (b instanceof RegExp) {
                    a.push(b.source);
                }
                else {
                    a.push(b);
                }
                return a;
            }, []).join('|');
        }
    }
    /**
     * 对未识别的单词进行分词
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    split(words) {
        //return this._splitUnknow(words, this.splitForeign);
        return this._splitUnknow(words, this.splitForeign2);
        /*
        const POSTAG = this.segment.POSTAG;

        let ret = [];
        for (let i = 0, word; word = words[i]; i++)
        {
            if (word.p)
            {
                ret.push(word);
            }
            else
            {
                // 仅对未识别的词进行匹配
                ret = ret.concat(this.splitForeign(word.w));
            }
        }
        return ret;
        */
    }
    /**
     * 支援更多外文判定(但可能會降低效率)
     *
     * 並且避免誤切割 例如 latīna Русский
     */
    splitForeign2(text, cur) {
        const POSTAG = this.segment.POSTAG;
        const TABLE = this._TABLE;
        //console.time('splitForeign2');
        let ret = [];
        let self = this;
        let ls = text
            .split(this._REGEXP_SPLIT_1);
        for (let w of ls) {
            if (w !== '') {
                if (this._REGEXP_SPLIT_2.test(w)) {
                    let cw = TABLE[w];
                    if (cw) {
                        let nw = this.createRawToken({
                            w,
                        }, cw, {
                            [this.name]: 1,
                        });
                        ret.push(nw);
                        continue;
                    }
                    /**
                     * 當分詞不存在於字典中時
                     * 則再度分詞一次
                     */
                    let ls2 = w
                        .split(/([\d+０-９]+)/);
                    for (let w of ls2) {
                        if (w === '') {
                            continue;
                        }
                        let lasttype = 0;
                        let c = w.charCodeAt(0);
                        if (c >= 65296 && c <= 65370)
                            c -= 65248;
                        if (c >= 48 && c <= 57) {
                            lasttype = POSTAG.A_M;
                        } // 字母 lasttype = POSTAG.A_NX
                        else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) {
                            lasttype = POSTAG.A_NX;
                        }
                        else {
                            lasttype = POSTAG.UNK;
                        }
                        if (lasttype === POSTAG.A_NX) {
                            let cw = TABLE[w];
                            if (cw) {
                                let nw = this.createRawToken({
                                    w,
                                }, cw, {
                                    [this.name]: 2,
                                });
                                ret.push(nw);
                                continue;
                            }
                        }
                        ret.push(self.debugToken({
                            w: w,
                            p: lasttype || undefined,
                        }, {
                            [self.name]: 3,
                        }, true));
                    }
                }
                else {
                    ret.push({
                        w,
                    });
                }
            }
        }
        //console.timeEnd('splitForeign2');
        //console.log(ret);
        return ret.length ? ret : undefined;
    }
    /**
     * 匹配包含的英文字符和数字，并分割
     *
     * @param {string} text 文本
     * @param {int} cur 开始位置
     * @return {array}  返回格式   {w: '单词', c: 开始位置}
     */
    splitForeign(text, cur) {
        const POSTAG = this.segment.POSTAG;
        const TABLE = this._TABLE;
        //console.time('splitForeign');
        if (isNaN(cur))
            cur = 0;
        let ret = [];
        // 取第一个字符的ASCII码
        let lastcur = 0;
        let lasttype = 0;
        let c = text.charCodeAt(0);
        // 全角数字或字母
        if (c >= 65296 && c <= 65370)
            c -= 65248;
        // 数字  lasttype = POSTAG.A_M
        if (c >= 48 && c <= 57) {
            lasttype = POSTAG.A_M;
        } // 字母 lasttype = POSTAG.A_NX
        else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) {
            lasttype = POSTAG.A_NX;
        }
        else {
            lasttype = POSTAG.UNK;
        }
        let i;
        for (i = 1; i < text.length; i++) {
            let c = text.charCodeAt(i);
            // 全角数字或字母
            if (c >= 65296 && c <= 65370)
                c -= 65248;
            // 数字  lasttype = POSTAG.A_M
            if (c >= 48 && c <= 57) {
                if (lasttype !== POSTAG.A_M) {
                    let nw = this.createForeignToken({
                        w: text.substr(lastcur, i - lastcur),
                    }, lasttype, {
                        [this.name]: 1,
                    });
                    //let nw = { w: text.substr(lastcur, i - lastcur) } as IWord;
                    //if (lasttype !== POSTAG.UNK) nw.p = lasttype;
                    ret.push(nw);
                    lastcur = i;
                }
                lasttype = POSTAG.A_M;
            }
            else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) {
                // 字母 lasttype = POSTAG.A_NX
                if (lasttype !== POSTAG.A_NX) {
                    //let nw = { w: text.substr(lastcur, i - lastcur) } as IWord;
                    let nw = this.createRawToken({
                        w: text.substr(lastcur, i - lastcur),
                    }, {
                        p: lasttype
                    }, {
                        [this.name]: 2,
                    });
                    //if (lasttype !== POSTAG.UNK) nw.p = lasttype;
                    ret.push(nw);
                    lastcur = i;
                }
                lasttype = POSTAG.A_NX;
            }
            else {
                // 其他
                if (lasttype !== POSTAG.UNK) {
                    let nw = this.createForeignToken({
                        w: text.substr(lastcur, i - lastcur),
                        p: lasttype
                    }, undefined, {
                        [this.name]: 3,
                    });
                    ret.push(nw);
                    lastcur = i;
                }
                lasttype = POSTAG.UNK;
            }
        }
        // 剩余部分
        //let nw = { w: text.substr(lastcur, i - lastcur) } as IWord;
        let nw = this.createRawToken({
            w: text.substr(lastcur, i - lastcur),
        });
        if (lasttype !== POSTAG.UNK)
            nw.p = lasttype;
        ret.push(nw);
        //console.timeEnd('splitForeign');
        //debug(ret);
        return ret;
    }
    createForeignToken(word, lasttype, attr) {
        let nw = this.createToken(word, true, attr);
        let ow = this._TABLE[nw.w];
        if (ow) {
            debug_1.debugToken(nw, {
                _source: ow,
            });
            nw.p = nw.p | ow.p;
        }
        if (lasttype && lasttype !== this._POSTAG.UNK) {
            nw.p = lasttype | nw.p;
        }
        return nw;
    }
}
exports.ForeignTokenizer = ForeignTokenizer;
exports.init = ForeignTokenizer.init.bind(ForeignTokenizer);
exports.default = ForeignTokenizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9yZWlnblRva2VuaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkZvcmVpZ25Ub2tlbml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViOzs7O0dBSUc7QUFDSCxnQ0FBOEU7QUFFOUUseUNBQTJDO0FBSzNDLE1BQWEsZ0JBQWlCLFNBQVEseUJBQW1CO0lBQXpEOztRQUdDLFNBQUksR0FBRyxrQkFBa0IsQ0FBQztJQTJVM0IsQ0FBQztJQWhVQSxNQUFNO1FBRUwsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU1QyxJQUFJLEdBQUcsR0FBRztZQUNULDBDQUEwQztZQUMxQywrQkFBK0I7WUFDL0Isa0JBQWtCO1lBQ2xCLG9EQUFvRDtZQUNwRCxrQkFBa0I7U0FDbEIsQ0FBQztRQUVGLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxNQUFNLENBQUMsR0FBRyxHQUFFLEtBQUssQ0FBQztZQUM1QyxrQkFBa0I7U0FDbEIsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFNUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEdBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUvRCxTQUFTLEtBQUssQ0FBQyxHQUEyQjtZQUV6QyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztnQkFFL0IsSUFBSSxDQUFDLFlBQVksTUFBTSxFQUN2QjtvQkFDQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDakI7cUJBRUQ7b0JBQ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENB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WSxRQUFBLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUEwQyxDQUFDO0FBRTFHLGtCQUFlLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIOWkluaWh+Wtl+espuOAgeaVsOWtl+ivhuWIq+aooeWdl1xuICpcbiAqIEBhdXRob3Ig6ICB6Zu3PGxlaXpvbmdtaW5AZ21haWwuY29tPlxuICovXG5pbXBvcnQgeyBTdWJTTW9kdWxlLCBTdWJTTW9kdWxlVG9rZW5pemVyLCBJU3ViVG9rZW5pemVyQ3JlYXRlIH0gZnJvbSAnLi4vbW9kJztcbmltcG9ydCB7IFNlZ21lbnQsIElXb3JkIH0gZnJvbSAnLi4vU2VnbWVudCc7XG5pbXBvcnQgeyBkZWJ1Z1Rva2VuIH0gZnJvbSAnLi4vdXRpbC9kZWJ1Zyc7XG5pbXBvcnQgVVN0cmluZyBmcm9tICd1bmktc3RyaW5nJztcbmltcG9ydCB7IGRlYnVnIH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgeyBJV29yZERlYnVnSW5mbyB9IGZyb20gJy4uL3V0aWwvaW5kZXgnO1xuXG5leHBvcnQgY2xhc3MgRm9yZWlnblRva2VuaXplciBleHRlbmRzIFN1YlNNb2R1bGVUb2tlbml6ZXJcbntcblxuXHRuYW1lID0gJ0ZvcmVpZ25Ub2tlbml6ZXInO1xuXG5cdC8qKlxuXHQgKiDliIboqZ7nlKgo5YyF5ZCr5Lit5paHKVxuXHQgKi9cblx0X1JFR0VYUF9TUExJVF8xOiBSZWdFeHA7XG5cdC8qKlxuXHQgKiDliIboqZ7nlKgo5LiN5YyF5ZCr5Lit5paH55qE5YWo6Kme56ym5ZCIKVxuXHQgKi9cblx0X1JFR0VYUF9TUExJVF8yOiBSZWdFeHA7XG5cblx0X2NhY2hlKClcblx0e1xuXHRcdHN1cGVyLl9jYWNoZSgpO1xuXHRcdHRoaXMuX1RBQkxFID0gdGhpcy5zZWdtZW50LmdldERpY3QoJ1RBQkxFJyk7XG5cblx0XHRsZXQgYXJyID0gW1xuXHRcdFx0L1tcXHfvvJAt77yZ77yhLe+8uu+9gS3vvZpcXHUwMTAwLVxcdTAxN0ZcXHUwMEExLVxcdTAwRkZdKy8sXG5cdFx0XHQvW1xcdTA2MDAtXFx1MDZGRlxcdTA3NTAtXFx1MDc3Rl0rLyxcblx0XHRcdC9bXFx1MDQwMC1cXHUwNEZGXSsvLFxuXHRcdFx0Ly8gaHR0cHM6Ly91bmljb2RlLXRhYmxlLmNvbS9jbi9ibG9ja3MvZ3JlZWstY29wdGljL1xuXHRcdFx0L1tcXHUwMzcwLVxcdTAzRkZdKy8sXG5cdFx0XTtcblxuXHRcdHRoaXMuX1JFR0VYUF9TUExJVF8xID0gbmV3IFJlZ0V4cCgnKCcgK19qb2luKFtcblx0XHRcdC9bXFx1NEUwMC1cXHU5RkZGXSsvLFxuXHRcdF0uY29uY2F0KGFycikpICsgJyknLCAnaXUnKTtcblxuXHRcdHRoaXMuX1JFR0VYUF9TUExJVF8yID0gbmV3IFJlZ0V4cCgnKCcgK19qb2luKGFycikgKyAnKScsICdpdScpO1xuXG5cdFx0ZnVuY3Rpb24gX2pvaW4oYXJyOiBBcnJheTxzdHJpbmcgfCBSZWdFeHA+KVxuXHRcdHtcblx0XHRcdHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoYiBpbnN0YW5jZW9mIFJlZ0V4cClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGEucHVzaChiLnNvdXJjZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YS5wdXNoKGIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHR9LCBbXSkuam9pbignfCcpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIOWvueacquivhuWIq+eahOWNleivjei/m+ihjOWIhuivjVxuXHQgKlxuXHQgKiBAcGFyYW0ge2FycmF5fSB3b3JkcyDljZXor43mlbDnu4Rcblx0ICogQHJldHVybiB7YXJyYXl9XG5cdCAqL1xuXHRzcGxpdCh3b3JkczogSVdvcmRbXSk6IElXb3JkW11cblx0e1xuXHRcdC8vcmV0dXJuIHRoaXMuX3NwbGl0VW5rbm93KHdvcmRzLCB0aGlzLnNwbGl0Rm9yZWlnbik7XG5cdFx0cmV0dXJuIHRoaXMuX3NwbGl0VW5rbm93KHdvcmRzLCB0aGlzLnNwbGl0Rm9yZWlnbjIpO1xuXG5cdFx0Lypcblx0XHRjb25zdCBQT1NUQUcgPSB0aGlzLnNlZ21lbnQuUE9TVEFHO1xuXG5cdFx0bGV0IHJldCA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOyB3b3JkID0gd29yZHNbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAod29yZC5wKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8g5LuF5a+55pyq6K+G5Yir55qE6K+N6L+b6KGM5Yy56YWNXG5cdFx0XHRcdHJldCA9IHJldC5jb25jYXQodGhpcy5zcGxpdEZvcmVpZ24od29yZC53KSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdFx0Ki9cblx0fVxuXG5cdC8qKlxuXHQgKiDmlK/mj7Tmm7TlpJrlpJbmlofliKTlrpoo5L2G5Y+v6IO95pyD6ZmN5L2O5pWI546HKVxuXHQgKlxuXHQgKiDkuKbkuJTpgb/lhY3oqqTliIflibIg5L6L5aaCIGxhdMSrbmEg0KDRg9GB0YHQutC40Llcblx0ICovXG5cdHNwbGl0Rm9yZWlnbjIodGV4dDogc3RyaW5nLCBjdXI/OiBudW1iZXIpOiBJV29yZFtdXG5cdHtcblx0XHRjb25zdCBQT1NUQUcgPSB0aGlzLnNlZ21lbnQuUE9TVEFHO1xuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5fVEFCTEU7XG5cblx0XHQvL2NvbnNvbGUudGltZSgnc3BsaXRGb3JlaWduMicpO1xuXG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xuXHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdGxldCBscyA9IHRleHRcblx0XHRcdC5zcGxpdCh0aGlzLl9SRUdFWFBfU1BMSVRfMSlcblx0XHQ7XG5cblx0XHRmb3IgKGxldCB3IG9mIGxzKVxuXHRcdHtcblx0XHRcdGlmICh3ICE9PSAnJylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHRoaXMuX1JFR0VYUF9TUExJVF8yLnRlc3QodykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgY3cgPSBUQUJMRVt3XTtcblxuXHRcdFx0XHRcdGlmIChjdylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbncgPSB0aGlzLmNyZWF0ZVJhd1Rva2VuKHtcblx0XHRcdFx0XHRcdFx0dyxcblx0XHRcdFx0XHRcdH0sIGN3LCB7XG5cdFx0XHRcdFx0XHRcdFt0aGlzLm5hbWVdOiAxLFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHJldC5wdXNoKG53KTtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIOeVtuWIhuipnuS4jeWtmOWcqOaWvOWtl+WFuOS4reaZglxuXHRcdFx0XHRcdCAqIOWJh+WGjeW6puWIhuipnuS4gOasoVxuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdGxldCBsczIgPSB3XG5cdFx0XHRcdFx0XHQuc3BsaXQoLyhbXFxkK++8kC3vvJldKykvKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdGZvciAobGV0IHcgb2YgbHMyKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmICh3ID09PSAnJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxldCBsYXN0dHlwZSA9IDA7XG5cblx0XHRcdFx0XHRcdGxldCBjID0gdy5jaGFyQ29kZUF0KDApO1xuXHRcdFx0XHRcdFx0aWYgKGMgPj0gNjUyOTYgJiYgYyA8PSA2NTM3MCkgYyAtPSA2NTI0ODtcblxuXHRcdFx0XHRcdFx0aWYgKGMgPj0gNDggJiYgYyA8PSA1Nylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGFzdHR5cGUgPSBQT1NUQUcuQV9NO1xuXHRcdFx0XHRcdFx0fS8vIOWtl+avjSBsYXN0dHlwZSA9IFBPU1RBRy5BX05YXG5cdFx0XHRcdFx0XHRlbHNlIGlmICgoYyA+PSA2NSAmJiBjIDw9IDkwKSB8fCAoYyA+PSA5NyAmJiBjIDw9IDEyMikpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxhc3R0eXBlID0gUE9TVEFHLkFfTlg7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxhc3R0eXBlID0gUE9TVEFHLlVOSztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKGxhc3R0eXBlID09PSBQT1NUQUcuQV9OWClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IGN3ID0gVEFCTEVbd107XG5cblx0XHRcdFx0XHRcdFx0aWYgKGN3KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IG53ID0gdGhpcy5jcmVhdGVSYXdUb2tlbih7XG5cdFx0XHRcdFx0XHRcdFx0XHR3LFxuXHRcdFx0XHRcdFx0XHRcdH0sIGN3LCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRbdGhpcy5uYW1lXTogMixcblx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldC5wdXNoKG53KTtcblx0XHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXQucHVzaChzZWxmLmRlYnVnVG9rZW4oe1xuXHRcdFx0XHRcdFx0XHR3OiB3LFxuXHRcdFx0XHRcdFx0XHRwOiBsYXN0dHlwZSB8fCB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0XHRcdFtzZWxmLm5hbWVdOiAzLFxuXHRcdFx0XHRcdFx0fSwgdHJ1ZSkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaCh7XG5cdFx0XHRcdFx0XHR3LFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly9jb25zb2xlLnRpbWVFbmQoJ3NwbGl0Rm9yZWlnbjInKTtcblxuXHRcdC8vY29uc29sZS5sb2cocmV0KTtcblxuXHRcdHJldHVybiByZXQubGVuZ3RoID8gcmV0IDogdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWMuemFjeWMheWQq+eahOiLseaWh+Wtl+espuWSjOaVsOWtl++8jOW5tuWIhuWJslxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmlofmnKxcblx0ICogQHBhcmFtIHtpbnR9IGN1ciDlvIDlp4vkvY3nva5cblx0ICogQHJldHVybiB7YXJyYXl9ICDov5Tlm57moLzlvI8gICB7dzogJ+WNleivjScsIGM6IOW8gOWni+S9jee9rn1cblx0ICovXG5cdHNwbGl0Rm9yZWlnbih0ZXh0OiBzdHJpbmcsIGN1cj86IG51bWJlcik6IElXb3JkW11cblx0e1xuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuc2VnbWVudC5QT1NUQUc7XG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLl9UQUJMRTtcblxuXHRcdC8vY29uc29sZS50aW1lKCdzcGxpdEZvcmVpZ24nKTtcblxuXHRcdGlmIChpc05hTihjdXIpKSBjdXIgPSAwO1xuXHRcdGxldCByZXQgPSBbXTtcblxuXHRcdC8vIOWPluesrOS4gOS4quWtl+espueahEFTQ0lJ56CBXG5cdFx0bGV0IGxhc3RjdXIgPSAwO1xuXHRcdGxldCBsYXN0dHlwZSA9IDA7XG5cdFx0bGV0IGMgPSB0ZXh0LmNoYXJDb2RlQXQoMCk7XG5cdFx0Ly8g5YWo6KeS5pWw5a2X5oiW5a2X5q+NXG5cdFx0aWYgKGMgPj0gNjUyOTYgJiYgYyA8PSA2NTM3MCkgYyAtPSA2NTI0ODtcblx0XHQvLyDmlbDlrZcgIGxhc3R0eXBlID0gUE9TVEFHLkFfTVxuXHRcdGlmIChjID49IDQ4ICYmIGMgPD0gNTcpXG5cdFx0e1xuXHRcdFx0bGFzdHR5cGUgPSBQT1NUQUcuQV9NO1xuXHRcdH0vLyDlrZfmr40gbGFzdHR5cGUgPSBQT1NUQUcuQV9OWFxuXHRcdGVsc2UgaWYgKChjID49IDY1ICYmIGMgPD0gOTApIHx8IChjID49IDk3ICYmIGMgPD0gMTIyKSlcblx0XHR7XG5cdFx0XHRsYXN0dHlwZSA9IFBPU1RBRy5BX05YO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bGFzdHR5cGUgPSBQT1NUQUcuVU5LO1xuXHRcdH1cblxuXHRcdGxldCBpOiBudW1iZXI7XG5cblx0XHRmb3IgKGkgPSAxOyBpIDwgdGV4dC5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRsZXQgYyA9IHRleHQuY2hhckNvZGVBdChpKTtcblx0XHRcdC8vIOWFqOinkuaVsOWtl+aIluWtl+avjVxuXHRcdFx0aWYgKGMgPj0gNjUyOTYgJiYgYyA8PSA2NTM3MCkgYyAtPSA2NTI0ODtcblx0XHRcdC8vIOaVsOWtlyAgbGFzdHR5cGUgPSBQT1NUQUcuQV9NXG5cdFx0XHRpZiAoYyA+PSA0OCAmJiBjIDw9IDU3KVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAobGFzdHR5cGUgIT09IFBPU1RBRy5BX00pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgbncgPSB0aGlzLmNyZWF0ZUZvcmVpZ25Ub2tlbih7XG5cdFx0XHRcdFx0XHR3OiB0ZXh0LnN1YnN0cihsYXN0Y3VyLCBpIC0gbGFzdGN1ciksXG5cdFx0XHRcdFx0fSwgbGFzdHR5cGUsIHtcblx0XHRcdFx0XHRcdFt0aGlzLm5hbWVdOiAxLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdC8vbGV0IG53ID0geyB3OiB0ZXh0LnN1YnN0cihsYXN0Y3VyLCBpIC0gbGFzdGN1cikgfSBhcyBJV29yZDtcblxuXHRcdFx0XHRcdC8vaWYgKGxhc3R0eXBlICE9PSBQT1NUQUcuVU5LKSBudy5wID0gbGFzdHR5cGU7XG5cdFx0XHRcdFx0cmV0LnB1c2gobncpO1xuXHRcdFx0XHRcdGxhc3RjdXIgPSBpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxhc3R0eXBlID0gUE9TVEFHLkFfTTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKChjID49IDY1ICYmIGMgPD0gOTApIHx8IChjID49IDk3ICYmIGMgPD0gMTIyKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8g5a2X5q+NIGxhc3R0eXBlID0gUE9TVEFHLkFfTlhcblx0XHRcdFx0aWYgKGxhc3R0eXBlICE9PSBQT1NUQUcuQV9OWClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vbGV0IG53ID0geyB3OiB0ZXh0LnN1YnN0cihsYXN0Y3VyLCBpIC0gbGFzdGN1cikgfSBhcyBJV29yZDtcblxuXHRcdFx0XHRcdGxldCBudyA9IHRoaXMuY3JlYXRlUmF3VG9rZW4oe1xuXHRcdFx0XHRcdFx0dzogdGV4dC5zdWJzdHIobGFzdGN1ciwgaSAtIGxhc3RjdXIpLFxuXHRcdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRcdHA6IGxhc3R0eXBlXG5cdFx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdFx0W3RoaXMubmFtZV06IDIsXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHQvL2lmIChsYXN0dHlwZSAhPT0gUE9TVEFHLlVOSykgbncucCA9IGxhc3R0eXBlO1xuXHRcdFx0XHRcdHJldC5wdXNoKG53KTtcblx0XHRcdFx0XHRsYXN0Y3VyID0gaTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsYXN0dHlwZSA9IFBPU1RBRy5BX05YO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyDlhbbku5Zcblx0XHRcdFx0aWYgKGxhc3R0eXBlICE9PSBQT1NUQUcuVU5LKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IG53ID0gdGhpcy5jcmVhdGVGb3JlaWduVG9rZW4oe1xuXHRcdFx0XHRcdFx0dzogdGV4dC5zdWJzdHIobGFzdGN1ciwgaSAtIGxhc3RjdXIpLFxuXHRcdFx0XHRcdFx0cDogbGFzdHR5cGVcblx0XHRcdFx0XHR9LCB1bmRlZmluZWQsIHtcblx0XHRcdFx0XHRcdFt0aGlzLm5hbWVdOiAzLFxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0cmV0LnB1c2gobncpO1xuXHRcdFx0XHRcdGxhc3RjdXIgPSBpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxhc3R0eXBlID0gUE9TVEFHLlVOSztcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8g5Ymp5L2Z6YOo5YiGXG5cdFx0Ly9sZXQgbncgPSB7IHc6IHRleHQuc3Vic3RyKGxhc3RjdXIsIGkgLSBsYXN0Y3VyKSB9IGFzIElXb3JkO1xuXG5cdFx0bGV0IG53ID0gdGhpcy5jcmVhdGVSYXdUb2tlbjxJV29yZD4oe1xuXHRcdFx0dzogdGV4dC5zdWJzdHIobGFzdGN1ciwgaSAtIGxhc3RjdXIpLFxuXHRcdH0pO1xuXG5cdFx0aWYgKGxhc3R0eXBlICE9PSBQT1NUQUcuVU5LKSBudy5wID0gbGFzdHR5cGU7XG5cdFx0cmV0LnB1c2gobncpO1xuXG5cdFx0Ly9jb25zb2xlLnRpbWVFbmQoJ3NwbGl0Rm9yZWlnbicpO1xuXG5cdFx0Ly9kZWJ1ZyhyZXQpO1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRjcmVhdGVGb3JlaWduVG9rZW4od29yZDogSVdvcmQsIGxhc3R0eXBlPzogbnVtYmVyLCBhdHRyPzogSVdvcmREZWJ1Z0luZm8pXG5cdHtcblx0XHRsZXQgbncgPSB0aGlzLmNyZWF0ZVRva2VuPElXb3JkPih3b3JkLCB0cnVlLCBhdHRyKTtcblxuXHRcdGxldCBvdyA9IHRoaXMuX1RBQkxFW253LnddO1xuXG5cdFx0aWYgKG93KVxuXHRcdHtcblx0XHRcdGRlYnVnVG9rZW4obncsIHtcblx0XHRcdFx0X3NvdXJjZTogb3csXG5cdFx0XHR9KTtcblxuXHRcdFx0bncucCA9IG53LnAgfCBvdy5wO1xuXHRcdH1cblxuXHRcdGlmIChsYXN0dHlwZSAmJiBsYXN0dHlwZSAhPT0gdGhpcy5fUE9TVEFHLlVOSylcblx0XHR7XG5cdFx0XHRudy5wID0gbGFzdHR5cGUgfCBudy5wO1xuXHRcdH1cblxuXHRcdHJldHVybiBudztcblx0fVxufVxuXG5leHBvcnQgY29uc3QgaW5pdCA9IEZvcmVpZ25Ub2tlbml6ZXIuaW5pdC5iaW5kKEZvcmVpZ25Ub2tlbml6ZXIpIGFzIElTdWJUb2tlbml6ZXJDcmVhdGU8Rm9yZWlnblRva2VuaXplcj47XG5cbmV4cG9ydCBkZWZhdWx0IEZvcmVpZ25Ub2tlbml6ZXI7XG5cbi8vZGVidWcoc3BsaXRGb3JlaWduKCdhZDIyMue7j+a1juaguOeulzEyM+mdnicpKTtcbiJdfQ==