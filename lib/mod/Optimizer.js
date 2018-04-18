/**
 * 优化模块管理器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_decorators_1 = require("core-decorators");
const mod_1 = require("./mod");
let SubSModuleOptimizer = 
// @ts-ignore
class SubSModuleOptimizer extends mod_1.SubSModule {
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
SubSModuleOptimizer = __decorate([
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
        // 按顺序分别调用各个mod来进行分词 ： 各个mod仅对没有识别类型的单词进行分词
        mods.forEach(function (mod) {
            words = mod.doOptimize(words, ...argv);
        });
        return words;
    }
}
exports.Optimizer = Optimizer;
exports.default = Optimizer;
