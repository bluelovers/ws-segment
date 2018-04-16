/**
 * 优化模块管理器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("./mod");
class SubSModuleOptimizer extends mod_1.SubSModule {
    constructor() {
        super(...arguments);
        this.type = 'optimizer';
    }
    doOptimize(words, ...argv) {
        throw new Error();
    }
}
SubSModuleOptimizer.type = 'optimizer';
exports.SubSModuleOptimizer = SubSModuleOptimizer;
/**
 * 分词模块管理器
 */
class Optimizer extends mod_1.SModule {
    constructor() {
        super(...arguments);
        this.type = 'optimizer';
    }
    /**
     * 对一段文本进行分词
     *
     * @param {array} words 单词数组
     * @param {array} modules 分词模块数组
     * @return {array}
     */
    doOptimize(words, mods, ...argv) {
        // 按顺序分别调用各个mod来进行分词 ： 各个mod仅对没有识别类型的单词进行分词
        mods.forEach(function (mod) {
            words = mod.doOptimize(words, ...argv);
        });
        return words;
    }
}
exports.Optimizer = Optimizer;
exports.default = Optimizer;
