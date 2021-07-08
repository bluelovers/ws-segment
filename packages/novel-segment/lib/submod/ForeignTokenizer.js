'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = exports.init = exports.ForeignTokenizer = void 0;
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
            (0, debug_1.debugToken)(nw, {
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
exports.type = ForeignTokenizer.type;
exports.default = ForeignTokenizer;
//# sourceMappingURL=ForeignTokenizer.js.map