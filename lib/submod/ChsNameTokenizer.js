'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = exports.init = exports.ChsNameTokenizer = void 0;
/**
 * 中文人名识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
const CHS_NAMES_1 = require("../mod/CHS_NAMES");
const mod_1 = require("../mod");
class ChsNameTokenizer extends mod_1.SubSModuleTokenizer {
    constructor() {
        super(...arguments);
        this.name = 'ChsNameTokenizer';
    }
    _cache() {
        super._cache();
        this._TABLE = this.segment.getDict('TABLE');
        this._POSTAG = this.segment.POSTAG;
    }
    /**
     * 对未识别的单词进行分词
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    split(words) {
        const POSTAG = this._POSTAG;
        let ret = [];
        for (let i = 0, word; word = words[i]; i++) {
            if (word.p) {
                // 仅对未识别的词进行匹配
                ret.push(word);
                continue;
            }
            let nameinfo = this.matchName(word.w);
            if (nameinfo.length < 1) {
                ret.push(word);
                continue;
            }
            // 分离出人名
            let lastc = 0;
            for (let ui = 0, url; url = nameinfo[ui]; ui++) {
                if (url.c > lastc) {
                    ret.push(this.debugToken({
                        w: word.w.substr(lastc, url.c - lastc),
                    }, {
                        [this.name]: false,
                    }, true));
                }
                ret.push(this.debugToken({
                    w: url.w,
                    p: POSTAG.A_NR
                }, {
                    [this.name]: true,
                }, true));
                lastc = url.c + url.w.length;
            }
            let lastn = nameinfo[nameinfo.length - 1];
            if (lastn.c + lastn.w.length < word.w.length) {
                ret.push(this.debugToken({
                    w: word.w.substr(lastn.c + lastn.w.length),
                }, {
                    [this.name]: false,
                }, true));
            }
        }
        return ret;
    }
    /**
     * 匹配包含的人名，并返回相关信息
     *
     * @param {string} text 文本
     * @param {int} cur 开始位置
     * @return {array}  返回格式   {w: '人名', c: 开始位置}
     */
    matchName(text, cur = 0) {
        if (isNaN(cur))
            cur = 0;
        let ret = [];
        while (cur < text.length) {
            //debug('cur=' + cur + ', ' + text.charAt(cur));
            let name = null;
            // 复姓
            let f2 = text.substr(cur, 2);
            if (f2 in CHS_NAMES_1.FAMILY_NAME_2) {
                let n1 = text.charAt(cur + 2);
                let n2 = text.charAt(cur + 3);
                if (n1 in CHS_NAMES_1.DOUBLE_NAME_1 && n2 in CHS_NAMES_1.DOUBLE_NAME_2) {
                    name = f2 + n1 + n2;
                }
                else if (n1 in CHS_NAMES_1.SINGLE_NAME) {
                    name = f2 + n1 + (n1 === n2 ? n2 : '');
                }
            }
            // 单姓
            let f1 = text.charAt(cur);
            if (name === null && f1 in CHS_NAMES_1.FAMILY_NAME_1) {
                let n1 = text.charAt(cur + 1);
                let n2 = text.charAt(cur + 2);
                if (n1 in CHS_NAMES_1.DOUBLE_NAME_1 && n2 in CHS_NAMES_1.DOUBLE_NAME_2) {
                    name = f1 + n1 + n2;
                }
                else if (n1 in CHS_NAMES_1.SINGLE_NAME) {
                    name = f1 + n1 + (n1 === n2 ? n2 : '');
                }
            }
            // 检查是否匹配成功
            if (name === null) {
                cur++;
            }
            else {
                ret.push({ w: name, c: cur });
                cur += name.length;
            }
        }
        return ret;
    }
}
exports.ChsNameTokenizer = ChsNameTokenizer;
// ======================================================================
// debug(matchName('刘德华和李娜娜、司马光、上官飞飞'));
// debug(matchName('李克'));
exports.init = ChsNameTokenizer.init.bind(ChsNameTokenizer);
exports.type = ChsNameTokenizer.type;
exports.default = ChsNameTokenizer;
//# sourceMappingURL=ChsNameTokenizer.js.map