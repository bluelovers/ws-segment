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
            /[\d０-９]+(?:,[\d０-９]+)?(?:\.[\d０-９]+)?/,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9yZWlnblRva2VuaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkZvcmVpZ25Ub2tlbml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViOzs7O0dBSUc7QUFDSCxnQ0FBOEU7QUFFOUUseUNBQTJDO0FBSzNDLE1BQWEsZ0JBQWlCLFNBQVEseUJBQW1CO0lBQXpEOztRQUdDLFNBQUksR0FBRyxrQkFBa0IsQ0FBQztJQTRVM0IsQ0FBQztJQWpVQSxNQUFNO1FBRUwsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU1QyxJQUFJLEdBQUcsR0FBRztZQUNULHVDQUF1QztZQUN2QywwQ0FBMEM7WUFDMUMsK0JBQStCO1lBQy9CLGtCQUFrQjtZQUNsQixvREFBb0Q7WUFDcEQsa0JBQWtCO1NBQ2xCLENBQUM7UUFFRixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsR0FBRSxLQUFLLENBQUM7WUFDNUMsa0JBQWtCO1NBQ2xCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTVCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxNQUFNLENBQUMsR0FBRyxHQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFL0QsU0FBUyxLQUFLLENBQUMsR0FBMkI7WUFFekMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBRS9CLElBQUksQ0FBQyxZQUFZLE1BQU0sRUFDdkI7b0JBQ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ2pCO3FCQUVEO29CQUNDLENBQUMsQ0FBQyxJQUFJ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VUQsNENBK1VDO0FBRVksUUFBQSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBMEMsQ0FBQztBQUUxRyxrQkFBZSxnQkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiDlpJbmloflrZfnrKbjgIHmlbDlrZfor4bliKvmqKHlnZdcbiAqXG4gKiBAYXV0aG9yIOiAgembtzxsZWl6b25nbWluQGdtYWlsLmNvbT5cbiAqL1xuaW1wb3J0IHsgU3ViU01vZHVsZSwgU3ViU01vZHVsZVRva2VuaXplciwgSVN1YlRva2VuaXplckNyZWF0ZSB9IGZyb20gJy4uL21vZCc7XG5pbXBvcnQgeyBTZWdtZW50LCBJV29yZCB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0IHsgZGVidWdUb2tlbiB9IGZyb20gJy4uL3V0aWwvZGVidWcnO1xuaW1wb3J0IFVTdHJpbmcgZnJvbSAndW5pLXN0cmluZyc7XG5pbXBvcnQgeyBkZWJ1ZyB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHsgSVdvcmREZWJ1Z0luZm8gfSBmcm9tICcuLi91dGlsL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIEZvcmVpZ25Ub2tlbml6ZXIgZXh0ZW5kcyBTdWJTTW9kdWxlVG9rZW5pemVyXG57XG5cblx0bmFtZSA9ICdGb3JlaWduVG9rZW5pemVyJztcblxuXHQvKipcblx0ICog5YiG6Kme55SoKOWMheWQq+S4reaWhylcblx0ICovXG5cdF9SRUdFWFBfU1BMSVRfMTogUmVnRXhwO1xuXHQvKipcblx0ICog5YiG6Kme55SoKOS4jeWMheWQq+S4reaWh+eahOWFqOipnuespuWQiClcblx0ICovXG5cdF9SRUdFWFBfU1BMSVRfMjogUmVnRXhwO1xuXG5cdF9jYWNoZSgpXG5cdHtcblx0XHRzdXBlci5fY2FjaGUoKTtcblx0XHR0aGlzLl9UQUJMRSA9IHRoaXMuc2VnbWVudC5nZXREaWN0KCdUQUJMRScpO1xuXG5cdFx0bGV0IGFyciA9IFtcblx0XHRcdC9bXFxk77yQLe+8mV0rKD86LFtcXGTvvJAt77yZXSspPyg/OlxcLltcXGTvvJAt77yZXSspPy8sXG5cdFx0XHQvW1xcd++8kC3vvJnvvKEt77y6772BLe+9mlxcdTAxMDAtXFx1MDE3RlxcdTAwQTEtXFx1MDBGRl0rLyxcblx0XHRcdC9bXFx1MDYwMC1cXHUwNkZGXFx1MDc1MC1cXHUwNzdGXSsvLFxuXHRcdFx0L1tcXHUwNDAwLVxcdTA0RkZdKy8sXG5cdFx0XHQvLyBodHRwczovL3VuaWNvZGUtdGFibGUuY29tL2NuL2Jsb2Nrcy9ncmVlay1jb3B0aWMvXG5cdFx0XHQvW1xcdTAzNzAtXFx1MDNGRl0rLyxcblx0XHRdO1xuXG5cdFx0dGhpcy5fUkVHRVhQX1NQTElUXzEgPSBuZXcgUmVnRXhwKCcoJyArX2pvaW4oW1xuXHRcdFx0L1tcXHU0RTAwLVxcdTlGRkZdKy8sXG5cdFx0XS5jb25jYXQoYXJyKSkgKyAnKScsICdpdScpO1xuXG5cdFx0dGhpcy5fUkVHRVhQX1NQTElUXzIgPSBuZXcgUmVnRXhwKCcoJyArX2pvaW4oYXJyKSArICcpJywgJ2l1Jyk7XG5cblx0XHRmdW5jdGlvbiBfam9pbihhcnI6IEFycmF5PHN0cmluZyB8IFJlZ0V4cD4pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGFyci5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChiIGluc3RhbmNlb2YgUmVnRXhwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YS5wdXNoKGIuc291cmNlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhLnB1c2goYik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdH0sIFtdKS5qb2luKCd8Jylcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICog5a+55pyq6K+G5Yir55qE5Y2V6K+N6L+b6KGM5YiG6K+NXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuXHQgKiBAcmV0dXJuIHthcnJheX1cblx0ICovXG5cdHNwbGl0KHdvcmRzOiBJV29yZFtdKTogSVdvcmRbXVxuXHR7XG5cdFx0Ly9yZXR1cm4gdGhpcy5fc3BsaXRVbmtub3cod29yZHMsIHRoaXMuc3BsaXRGb3JlaWduKTtcblx0XHRyZXR1cm4gdGhpcy5fc3BsaXRVbmtub3cod29yZHMsIHRoaXMuc3BsaXRGb3JlaWduMik7XG5cblx0XHQvKlxuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuc2VnbWVudC5QT1NUQUc7XG5cblx0XHRsZXQgcmV0ID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDAsIHdvcmQ7IHdvcmQgPSB3b3Jkc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICh3b3JkLnApXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKHdvcmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyDku4Xlr7nmnKror4bliKvnmoTor43ov5vooYzljLnphY1cblx0XHRcdFx0cmV0ID0gcmV0LmNvbmNhdCh0aGlzLnNwbGl0Rm9yZWlnbih3b3JkLncpKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJldDtcblx0XHQqL1xuXHR9XG5cblx0LyoqXG5cdCAqIOaUr+aPtOabtOWkmuWkluaWh+WIpOWumijkvYblj6/og73mnIPpmY3kvY7mlYjnjocpXG5cdCAqXG5cdCAqIOS4puS4lOmBv+WFjeiqpOWIh+WJsiDkvovlpoIgbGF0xKtuYSDQoNGD0YHRgdC60LjQuVxuXHQgKi9cblx0c3BsaXRGb3JlaWduMih0ZXh0OiBzdHJpbmcsIGN1cj86IG51bWJlcik6IElXb3JkW11cblx0e1xuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuc2VnbWVudC5QT1NUQUc7XG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLl9UQUJMRTtcblxuXHRcdC8vY29uc29sZS50aW1lKCdzcGxpdEZvcmVpZ24yJyk7XG5cblx0XHRsZXQgcmV0OiBJV29yZFtdID0gW107XG5cdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IGxzID0gdGV4dFxuXHRcdFx0LnNwbGl0KHRoaXMuX1JFR0VYUF9TUExJVF8xKVxuXHRcdDtcblxuXHRcdGZvciAobGV0IHcgb2YgbHMpXG5cdFx0e1xuXHRcdFx0aWYgKHcgIT09ICcnKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodGhpcy5fUkVHRVhQX1NQTElUXzIudGVzdCh3KSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBjdyA9IFRBQkxFW3ddO1xuXG5cdFx0XHRcdFx0aWYgKGN3KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBudyA9IHRoaXMuY3JlYXRlUmF3VG9rZW4oe1xuXHRcdFx0XHRcdFx0XHR3LFxuXHRcdFx0XHRcdFx0fSwgY3csIHtcblx0XHRcdFx0XHRcdFx0W3RoaXMubmFtZV06IDEsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cmV0LnB1c2gobncpO1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0ICog55W25YiG6Kme5LiN5a2Y5Zyo5pa85a2X5YW45Lit5pmCXG5cdFx0XHRcdFx0ICog5YmH5YaN5bqm5YiG6Kme5LiA5qyhXG5cdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0bGV0IGxzMiA9IHdcblx0XHRcdFx0XHRcdC5zcGxpdCgvKFtcXGQr77yQLe+8mV0rKS8pXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0Zm9yIChsZXQgdyBvZiBsczIpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0aWYgKHcgPT09ICcnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IGxhc3R0eXBlID0gMDtcblxuXHRcdFx0XHRcdFx0bGV0IGMgPSB3LmNoYXJDb2RlQXQoMCk7XG5cdFx0XHRcdFx0XHRpZiAoYyA+PSA2NTI5NiAmJiBjIDw9IDY1MzcwKSBjIC09IDY1MjQ4O1xuXG5cdFx0XHRcdFx0XHRpZiAoYyA+PSA0OCAmJiBjIDw9IDU3KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsYXN0dHlwZSA9IFBPU1RBRy5BX007XG5cdFx0XHRcdFx0XHR9Ly8g5a2X5q+NIGxhc3R0eXBlID0gUE9TVEFHLkFfTlhcblx0XHRcdFx0XHRcdGVsc2UgaWYgKChjID49IDY1ICYmIGMgPD0gOTApIHx8IChjID49IDk3ICYmIGMgPD0gMTIyKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGFzdHR5cGUgPSBQT1NUQUcuQV9OWDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGFzdHR5cGUgPSBQT1NUQUcuVU5LO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAobGFzdHR5cGUgPT09IFBPU1RBRy5BX05YKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgY3cgPSBUQUJMRVt3XTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoY3cpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgbncgPSB0aGlzLmNyZWF0ZVJhd1Rva2VuKHtcblx0XHRcdFx0XHRcdFx0XHRcdHcsXG5cdFx0XHRcdFx0XHRcdFx0fSwgY3csIHtcblx0XHRcdFx0XHRcdFx0XHRcdFt0aGlzLm5hbWVdOiAyLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0LnB1c2gobncpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldC5wdXNoKHNlbGYuZGVidWdUb2tlbih7XG5cdFx0XHRcdFx0XHRcdHc6IHcsXG5cdFx0XHRcdFx0XHRcdHA6IGxhc3R0eXBlIHx8IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRcdFx0W3NlbGYubmFtZV06IDMsXG5cdFx0XHRcdFx0XHR9LCB0cnVlKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldC5wdXNoKHtcblx0XHRcdFx0XHRcdHcsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvL2NvbnNvbGUudGltZUVuZCgnc3BsaXRGb3JlaWduMicpO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhyZXQpO1xuXG5cdFx0cmV0dXJuIHJldC5sZW5ndGggPyByZXQgOiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICog5Yy56YWN5YyF5ZCr55qE6Iux5paH5a2X56ym5ZKM5pWw5a2X77yM5bm25YiG5YmyXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IOaWh+acrFxuXHQgKiBAcGFyYW0ge2ludH0gY3VyIOW8gOWni+S9jee9rlxuXHQgKiBAcmV0dXJuIHthcnJheX0gIOi/lOWbnuagvOW8jyAgIHt3OiAn5Y2V6K+NJywgYzog5byA5aeL5L2N572ufVxuXHQgKi9cblx0c3BsaXRGb3JlaWduKHRleHQ6IHN0cmluZywgY3VyPzogbnVtYmVyKTogSVdvcmRbXVxuXHR7XG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5zZWdtZW50LlBPU1RBRztcblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuX1RBQkxFO1xuXG5cdFx0Ly9jb25zb2xlLnRpbWUoJ3NwbGl0Rm9yZWlnbicpO1xuXG5cdFx0aWYgKGlzTmFOKGN1cikpIGN1ciA9IDA7XG5cdFx0bGV0IHJldCA9IFtdO1xuXG5cdFx0Ly8g5Y+W56ys5LiA5Liq5a2X56ym55qEQVNDSUnnoIFcblx0XHRsZXQgbGFzdGN1ciA9IDA7XG5cdFx0bGV0IGxhc3R0eXBlID0gMDtcblx0XHRsZXQgYyA9IHRleHQuY2hhckNvZGVBdCgwKTtcblx0XHQvLyDlhajop5LmlbDlrZfmiJblrZfmr41cblx0XHRpZiAoYyA+PSA2NTI5NiAmJiBjIDw9IDY1MzcwKSBjIC09IDY1MjQ4O1xuXHRcdC8vIOaVsOWtlyAgbGFzdHR5cGUgPSBQT1NUQUcuQV9NXG5cdFx0aWYgKGMgPj0gNDggJiYgYyA8PSA1Nylcblx0XHR7XG5cdFx0XHRsYXN0dHlwZSA9IFBPU1RBRy5BX007XG5cdFx0fS8vIOWtl+avjSBsYXN0dHlwZSA9IFBPU1RBRy5BX05YXG5cdFx0ZWxzZSBpZiAoKGMgPj0gNjUgJiYgYyA8PSA5MCkgfHwgKGMgPj0gOTcgJiYgYyA8PSAxMjIpKVxuXHRcdHtcblx0XHRcdGxhc3R0eXBlID0gUE9TVEFHLkFfTlg7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRsYXN0dHlwZSA9IFBPU1RBRy5VTks7XG5cdFx0fVxuXG5cdFx0bGV0IGk6IG51bWJlcjtcblxuXHRcdGZvciAoaSA9IDE7IGkgPCB0ZXh0Lmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGxldCBjID0gdGV4dC5jaGFyQ29kZUF0KGkpO1xuXHRcdFx0Ly8g5YWo6KeS5pWw5a2X5oiW5a2X5q+NXG5cdFx0XHRpZiAoYyA+PSA2NTI5NiAmJiBjIDw9IDY1MzcwKSBjIC09IDY1MjQ4O1xuXHRcdFx0Ly8g5pWw5a2XICBsYXN0dHlwZSA9IFBPU1RBRy5BX01cblx0XHRcdGlmIChjID49IDQ4ICYmIGMgPD0gNTcpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChsYXN0dHlwZSAhPT0gUE9TVEFHLkFfTSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBudyA9IHRoaXMuY3JlYXRlRm9yZWlnblRva2VuKHtcblx0XHRcdFx0XHRcdHc6IHRleHQuc3Vic3RyKGxhc3RjdXIsIGkgLSBsYXN0Y3VyKSxcblx0XHRcdFx0XHR9LCBsYXN0dHlwZSwge1xuXHRcdFx0XHRcdFx0W3RoaXMubmFtZV06IDEsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Ly9sZXQgbncgPSB7IHc6IHRleHQuc3Vic3RyKGxhc3RjdXIsIGkgLSBsYXN0Y3VyKSB9IGFzIElXb3JkO1xuXG5cdFx0XHRcdFx0Ly9pZiAobGFzdHR5cGUgIT09IFBPU1RBRy5VTkspIG53LnAgPSBsYXN0dHlwZTtcblx0XHRcdFx0XHRyZXQucHVzaChudyk7XG5cdFx0XHRcdFx0bGFzdGN1ciA9IGk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGFzdHR5cGUgPSBQT1NUQUcuQV9NO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoKGMgPj0gNjUgJiYgYyA8PSA5MCkgfHwgKGMgPj0gOTcgJiYgYyA8PSAxMjIpKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyDlrZfmr40gbGFzdHR5cGUgPSBQT1NUQUcuQV9OWFxuXHRcdFx0XHRpZiAobGFzdHR5cGUgIT09IFBPU1RBRy5BX05YKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly9sZXQgbncgPSB7IHc6IHRleHQuc3Vic3RyKGxhc3RjdXIsIGkgLSBsYXN0Y3VyKSB9IGFzIElXb3JkO1xuXG5cdFx0XHRcdFx0bGV0IG53ID0gdGhpcy5jcmVhdGVSYXdUb2tlbih7XG5cdFx0XHRcdFx0XHR3OiB0ZXh0LnN1YnN0cihsYXN0Y3VyLCBpIC0gbGFzdGN1ciksXG5cdFx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdFx0cDogbGFzdHR5cGVcblx0XHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0XHRbdGhpcy5uYW1lXTogMixcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vaWYgKGxhc3R0eXBlICE9PSBQT1NUQUcuVU5LKSBudy5wID0gbGFzdHR5cGU7XG5cdFx0XHRcdFx0cmV0LnB1c2gobncpO1xuXHRcdFx0XHRcdGxhc3RjdXIgPSBpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxhc3R0eXBlID0gUE9TVEFHLkFfTlg7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIOWFtuS7llxuXHRcdFx0XHRpZiAobGFzdHR5cGUgIT09IFBPU1RBRy5VTkspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgbncgPSB0aGlzLmNyZWF0ZUZvcmVpZ25Ub2tlbih7XG5cdFx0XHRcdFx0XHR3OiB0ZXh0LnN1YnN0cihsYXN0Y3VyLCBpIC0gbGFzdGN1ciksXG5cdFx0XHRcdFx0XHRwOiBsYXN0dHlwZVxuXHRcdFx0XHRcdH0sIHVuZGVmaW5lZCwge1xuXHRcdFx0XHRcdFx0W3RoaXMubmFtZV06IDMsXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRyZXQucHVzaChudyk7XG5cdFx0XHRcdFx0bGFzdGN1ciA9IGk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGFzdHR5cGUgPSBQT1NUQUcuVU5LO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyDliankvZnpg6jliIZcblx0XHQvL2xldCBudyA9IHsgdzogdGV4dC5zdWJzdHIobGFzdGN1ciwgaSAtIGxhc3RjdXIpIH0gYXMgSVdvcmQ7XG5cblx0XHRsZXQgbncgPSB0aGlzLmNyZWF0ZVJhd1Rva2VuPElXb3JkPih7XG5cdFx0XHR3OiB0ZXh0LnN1YnN0cihsYXN0Y3VyLCBpIC0gbGFzdGN1ciksXG5cdFx0fSk7XG5cblx0XHRpZiAobGFzdHR5cGUgIT09IFBPU1RBRy5VTkspIG53LnAgPSBsYXN0dHlwZTtcblx0XHRyZXQucHVzaChudyk7XG5cblx0XHQvL2NvbnNvbGUudGltZUVuZCgnc3BsaXRGb3JlaWduJyk7XG5cblx0XHQvL2RlYnVnKHJldCk7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGNyZWF0ZUZvcmVpZ25Ub2tlbih3b3JkOiBJV29yZCwgbGFzdHR5cGU/OiBudW1iZXIsIGF0dHI/OiBJV29yZERlYnVnSW5mbylcblx0e1xuXHRcdGxldCBudyA9IHRoaXMuY3JlYXRlVG9rZW48SVdvcmQ+KHdvcmQsIHRydWUsIGF0dHIpO1xuXG5cdFx0bGV0IG93ID0gdGhpcy5fVEFCTEVbbncud107XG5cblx0XHRpZiAob3cpXG5cdFx0e1xuXHRcdFx0ZGVidWdUb2tlbihudywge1xuXHRcdFx0XHRfc291cmNlOiBvdyxcblx0XHRcdH0pO1xuXG5cdFx0XHRudy5wID0gbncucCB8IG93LnA7XG5cdFx0fVxuXG5cdFx0aWYgKGxhc3R0eXBlICYmIGxhc3R0eXBlICE9PSB0aGlzLl9QT1NUQUcuVU5LKVxuXHRcdHtcblx0XHRcdG53LnAgPSBsYXN0dHlwZSB8IG53LnA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG53O1xuXHR9XG59XG5cbmV4cG9ydCBjb25zdCBpbml0ID0gRm9yZWlnblRva2VuaXplci5pbml0LmJpbmQoRm9yZWlnblRva2VuaXplcikgYXMgSVN1YlRva2VuaXplckNyZWF0ZTxGb3JlaWduVG9rZW5pemVyPjtcblxuZXhwb3J0IGRlZmF1bHQgRm9yZWlnblRva2VuaXplcjtcblxuLy9kZWJ1ZyhzcGxpdEZvcmVpZ24oJ2FkMjIy57uP5rWO5qC4566XMTIz6Z2eJykpO1xuIl19