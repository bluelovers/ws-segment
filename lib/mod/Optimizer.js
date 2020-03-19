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
exports.Optimizer = exports.SubSModuleOptimizer = void 0;
const core_decorators_1 = require("core-decorators");
const mod_1 = require("./mod");
let SubSModuleOptimizer = /** @class */ (() => {
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
    return SubSModuleOptimizer;
})();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW1pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiT3B0aW1pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFDSCxZQUFZLENBQUM7Ozs7Ozs7OztBQUViLHFEQUEyQztBQUUzQywrQkFBeUQ7QUFhekQ7SUFBQSxJQUFhLG1CQUFtQjtJQURoQyxhQUFhO0lBQ2IsTUFBYSxtQkFBb0IsU0FBUSxnQkFBVTtRQUFuRDs7WUFHaUIsU0FBSSxHQUFHLFdBQVcsQ0FBQztRQW1CcEMsQ0FBQztRQWpCTyxVQUFVLENBQUMsS0FBYyxFQUFFLEdBQUcsSUFBSTtZQUV4QyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7UUFDbkIsQ0FBQztRQUVNLElBQUksQ0FBQyxPQUFnQixFQUFFLEdBQUcsSUFBSTtZQUVwQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBRTdCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLE1BQU0sQ0FBQyxJQUFJLENBQXNELE9BQWdCLEVBQUUsR0FBRyxJQUFJO1lBRWhHLGFBQWE7WUFDYixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUksT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDeEMsQ0FBQztLQUNELENBQUE7SUFwQnVCLHdCQUFJLEdBQUcsV0FBVyxDQUFDO0lBRjlCLG1CQUFtQjtRQUYvQiwwQkFBUTtRQUNULGFBQWE7T0FDQSxtQkFBbUIsQ0FzQi9CO0lBQUQsMEJBQUM7S0FBQTtBQXRCWSxrREFBbUI7QUF3QmhDOztHQUVHO0FBQ0gsTUFBYSxTQUFVLFNBQVEsYUFBTztJQUF0Qzs7UUFFQyxTQUFJLEdBQUcsV0FBVyxDQUFDO0lBYXBCLENBQUM7SUFYQTs7Ozs7O09BTUc7SUFDSCxVQUFVLENBQUMsS0FBYyxFQUFFLElBQXFCLEVBQUUsR0FBRyxJQUFJO1FBRXhELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzNELENBQUM7Q0FDRDtBQWZELDhCQWVDO0FBRUQsa0JBQWUsU0FBUyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiDkvJjljJbmqKHlnZfnrqHnkIblmahcbiAqXG4gKiBAYXV0aG9yIOiAgembtzxsZWl6b25nbWluQGdtYWlsLmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBhdXRvYmluZCB9IGZyb20gJ2NvcmUtZGVjb3JhdG9ycyc7XG5pbXBvcnQgeyBTZWdtZW50LCBJV29yZCB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0IHsgSVN1YlNNb2R1bGUsIFNNb2R1bGUsIFN1YlNNb2R1bGUgfSBmcm9tICcuL21vZCc7XG5cbmV4cG9ydCB0eXBlIElTdWJPcHRpbWl6ZXIgPSBJU3ViU01vZHVsZSAmIHtcblx0dHlwZTogJ29wdGltaXplcicsXG5cdGRvT3B0aW1pemUod29yZHM6IElXb3JkW10sIC4uLmFyZ3YpOiBJV29yZFtdLFxufVxuXG5leHBvcnQgdHlwZSBJU3ViT3B0aW1pemVyQ3JlYXRlPFQgZXh0ZW5kcyBTdWJTTW9kdWxlT3B0aW1pemVyLCBSIGV4dGVuZHMgU3ViU01vZHVsZU9wdGltaXplciA9IFN1YlNNb2R1bGVPcHRpbWl6ZXI+ID0ge1xuXHQoc2VnbWVudDogU2VnbWVudCwgLi4uYXJndik6IFQgJiBSLFxufTtcblxuQGF1dG9iaW5kXG4vLyBAdHMtaWdub3JlXG5leHBvcnQgY2xhc3MgU3ViU01vZHVsZU9wdGltaXplciBleHRlbmRzIFN1YlNNb2R1bGUgaW1wbGVtZW50cyBJU3ViT3B0aW1pemVyXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgdHlwZSA9ICdvcHRpbWl6ZXInO1xuXHRwdWJsaWMgcmVhZG9ubHkgdHlwZSA9ICdvcHRpbWl6ZXInO1xuXG5cdHB1YmxpYyBkb09wdGltaXplKHdvcmRzOiBJV29yZFtdLCAuLi5hcmd2KTogSVdvcmRbXVxuXHR7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCk7XG5cdH1cblxuXHRwdWJsaWMgaW5pdChzZWdtZW50OiBTZWdtZW50LCAuLi5hcmd2KVxuXHR7XG5cdFx0c3VwZXIuaW5pdChzZWdtZW50LCAuLi5hcmd2KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0cHVibGljIHN0YXRpYyBpbml0PFQgZXh0ZW5kcyBTdWJTTW9kdWxlT3B0aW1pemVyID0gU3ViU01vZHVsZU9wdGltaXplcj4oc2VnbWVudDogU2VnbWVudCwgLi4uYXJndik6IFRcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gc3VwZXIuaW5pdDxUPihzZWdtZW50LCAuLi5hcmd2KTtcblx0fVxufVxuXG4vKipcbiAqIOWIhuivjeaooeWdl+euoeeQhuWZqFxuICovXG5leHBvcnQgY2xhc3MgT3B0aW1pemVyIGV4dGVuZHMgU01vZHVsZVxue1xuXHR0eXBlID0gJ29wdGltaXplcic7XG5cblx0LyoqXG5cdCAqIOWvueS4gOauteaWh+acrOi/m+ihjOWIhuivjVxuXHQgKlxuXHQgKiBAcGFyYW0ge2FycmF5fSB3b3JkcyDljZXor43mlbDnu4Rcblx0ICogQHBhcmFtIHthcnJheX0gbW9kdWxlcyDliIbor43mqKHlnZfmlbDnu4Rcblx0ICogQHJldHVybiB7YXJyYXl9XG5cdCAqL1xuXHRkb09wdGltaXplKHdvcmRzOiBJV29yZFtdLCBtb2RzOiBJU3ViT3B0aW1pemVyW10sIC4uLmFyZ3YpOiBJV29yZFtdXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fZG9NZXRob2QoJ2RvT3B0aW1pemUnLCB3b3JkcywgbW9kcywgLi4uYXJndik7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT3B0aW1pemVyO1xuIl19