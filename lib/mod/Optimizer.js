/**
 * 优化模块管理器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optimizer = exports.SubSModuleOptimizer = void 0;
const tslib_1 = require("tslib");
const core_decorators_1 = require("core-decorators");
const mod_1 = require("./mod");
let SubSModuleOptimizer = class SubSModuleOptimizer extends mod_1.SubSModule {
    constructor() {
        super(...arguments);
        this.type = 'optimizer';
    }
    doOptimize(words, ...argv) {
        throw new Error();
    }
    init(segment, ...argv) {
        super.init(segment, ...argv);
        return this;
    }
    static init(segment, ...argv) {
        // @ts-ignore
        return super.init(segment, ...argv);
    }
};
SubSModuleOptimizer.type = 'optimizer';
SubSModuleOptimizer = tslib_1.__decorate([
    core_decorators_1.autobind
    // @ts-ignore
], SubSModuleOptimizer);
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
        return this._doMethod('doOptimize', words, mods, ...argv);
    }
}
exports.Optimizer = Optimizer;
exports.default = Optimizer;
//# sourceMappingURL=Optimizer.js.map