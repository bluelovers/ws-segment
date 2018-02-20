/**
 * 优化模块管理器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 分词模块管理器
 */
class Optimizer {
    /**
     * @param {Segment} segment 分词接口
     */
    constructor(segment) {
        this.segment = segment;
    }
    /**
     * 对一段文本进行分词
     *
     * @param {array} words 单词数组
     * @param {array} modules 分词模块数组
     * @return {array}
     */
    doOptimize(words, modules) {
        // 按顺序分别调用各个module来进行分词 ： 各个module仅对没有识别类型的单词进行分词
        modules.forEach(function (module) {
            words = module.doOptimize(words);
        });
        return words;
    }
}
exports.Optimizer = Optimizer;
exports.default = Optimizer;
