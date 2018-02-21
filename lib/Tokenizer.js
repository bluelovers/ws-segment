/**
 * 分词模块管理器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = require("./module");
/**
 * 分词模块管理器
 */
class Tokenizer extends module_1.SModule {
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
    split(text, modules) {
        if (modules.length < 1) {
            throw Error('No tokenizer module!');
        }
        else {
            // 按顺序分别调用各个module来进行分词 ： 各个module仅对没有识别类型的单词进行分词
            let ret = [{ w: text }];
            modules.forEach(function (module) {
                ret = module.split(ret);
            });
            return ret;
        }
    }
}
exports.Tokenizer = Tokenizer;
exports.default = Tokenizer;
