/**
 * 分词模块管理器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = exports.SubSModuleTokenizer = void 0;
const tslib_1 = require("tslib");
const core_decorators_1 = require("core-decorators");
const mod_1 = require("./mod");
const isUnset_1 = tslib_1.__importDefault(require("../util/isUnset"));
let SubSModuleTokenizer = class SubSModuleTokenizer extends mod_1.SubSModule {
    constructor() {
        super(...arguments);
        this.type = 'tokenizer';
    }
    init(segment, ...argv) {
        super.init(segment, ...argv);
        return this;
    }
    static init(segment, ...argv) {
        // @ts-ignore
        return super.init(segment, ...argv);
    }
    /**
     * 仅对未识别的词进行匹配
     * 不包含 p 為 0
     */
    _splitUnset(words, fn) {
        //const POSTAG = this.segment.POSTAG;
        fn = fn.bind(this);
        let ret = [];
        for (let i = 0, word; word = words[i]; i++) {
            if (typeof word.p === 'number') {
                ret.push(word);
            }
            else {
                let words_new = fn(word.w);
                if ((0, isUnset_1.default)(words_new)) {
                    ret.push(word);
                }
                else {
                    ret = ret.concat(words_new);
                }
            }
        }
        return ret;
    }
    /**
     * 仅对未识别的词进行匹配
     * 包含已存在 但 p 為 0
     */
    _splitUnknow(words, fn) {
        //const POSTAG = this.segment.POSTAG;
        fn = fn.bind(this);
        let ret = [];
        for (let i = 0, word; word = words[i]; i++) {
            if (word.p) {
                ret.push(word);
            }
            else {
                //let words_new = fn.call(this, word.w);
                let words_new = fn(word.w);
                if ((0, isUnset_1.default)(words_new)) {
                    ret.push(word);
                }
                else {
                    ret = ret.concat(words_new);
                }
            }
        }
        return ret;
    }
};
SubSModuleTokenizer.type = 'tokenizer';
SubSModuleTokenizer = tslib_1.__decorate([
    core_decorators_1.autobind
    // @ts-ignore
], SubSModuleTokenizer);
exports.SubSModuleTokenizer = SubSModuleTokenizer;
/**
 * 分词模块管理器
 */
class Tokenizer extends mod_1.SModule {
    constructor() {
        super(...arguments);
        this.type = 'tokenizer';
    }
    /**
     * 对一段文本进行分词
     *
     * @param {string} text 文本
     * @param {array} modules 分词模块数组
     * @return {array}
     */
    split(text, mods, ...argv) {
        if (mods.length < 1) {
            throw Error('No tokenizer module!');
        }
        else {
            let ret = [{ w: text }];
            return this._doMethod('split', ret, mods, ...argv);
            /*
            // 按顺序分别调用各个module来进行分词 ： 各个module仅对没有识别类型的单词进行分词
            mods.forEach(function (mod)
            {
                // @ts-ignore
                if (typeof mod._cache == 'function')
                {
                    // @ts-ignore
                    mod._cache();
                }

                ret = mod.split(ret, ...argv);
            });
            return ret;
            */
        }
    }
}
exports.Tokenizer = Tokenizer;
exports.default = Tokenizer;
//# sourceMappingURL=Tokenizer.js.map