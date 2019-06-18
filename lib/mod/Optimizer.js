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
        return this._doMethod('doOptimize', words, mods, ...argv);
    }
}
exports.Optimizer = Optimizer;
exports.default = Optimizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW1pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiT3B0aW1pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFDSCxZQUFZLENBQUM7Ozs7Ozs7O0FBRWIscURBQTJDO0FBRTNDLCtCQUF5RDtBQWF6RCxJQUFhLG1CQUFtQjtBQURoQyxhQUFhO0FBQ2IsTUFBYSxtQkFBb0IsU0FBUSxnQkFBVTtJQUFuRDs7UUFHaUIsU0FBSSxHQUFHLFdBQVcsQ0FBQztJQW1CcEMsQ0FBQztJQWpCTyxVQUFVLENBQUMsS0FBYyxFQUFFLEdBQUcsSUFBSTtRQUV4QyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVNLElBQUksQ0FBQyxPQUFnQixFQUFFLEdBQUcsSUFBSTtRQUVwQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRTdCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVNLE1BQU0sQ0FBQyxJQUFJLENBQXNELE9BQWdCLEVBQUUsR0FBRyxJQUFJO1FBRWhHLGFBQWE7UUFDYixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUksT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDeEMsQ0FBQztDQUNELENBQUE7QUFwQnVCLHdCQUFJLEdBQUcsV0FBVyxDQUFDO0FBRjlCLG1CQUFtQjtJQUYvQiwwQkFBUTtJQUNULGFBQWE7R0FDQSxtQkFBbUIsQ0FzQi9CO0FBdEJZLGtEQUFtQjtBQXdCaEM7O0dBRUc7QUFDSCxNQUFhLFNBQVUsU0FBUSxhQUFPO0lBQXRDOztRQUVDLFNBQUksR0FBRyxXQUFXLENBQUM7SUFhcEIsQ0FBQztJQVhBOzs7Ozs7T0FNRztJQUNILFVBQVUsQ0FBQyxLQUFjLEVBQUUsSUFBcUIsRUFBRSxHQUFHLElBQUk7UUFFeEQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDM0QsQ0FBQztDQUNEO0FBZkQsOEJBZUM7QUFFRCxrQkFBZSxTQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIOS8mOWMluaooeWdl+euoeeQhuWZqFxuICpcbiAqIEBhdXRob3Ig6ICB6Zu3PGxlaXpvbmdtaW5AZ21haWwuY29tPlxuICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IGF1dG9iaW5kIH0gZnJvbSAnY29yZS1kZWNvcmF0b3JzJztcbmltcG9ydCB7IFNlZ21lbnQsIElXb3JkIH0gZnJvbSAnLi4vU2VnbWVudCc7XG5pbXBvcnQgeyBJU3ViU01vZHVsZSwgU01vZHVsZSwgU3ViU01vZHVsZSB9IGZyb20gJy4vbW9kJztcblxuZXhwb3J0IHR5cGUgSVN1Yk9wdGltaXplciA9IElTdWJTTW9kdWxlICYge1xuXHR0eXBlOiAnb3B0aW1pemVyJyxcblx0ZG9PcHRpbWl6ZSh3b3JkczogSVdvcmRbXSwgLi4uYXJndik6IElXb3JkW10sXG59XG5cbmV4cG9ydCB0eXBlIElTdWJPcHRpbWl6ZXJDcmVhdGU8VCBleHRlbmRzIFN1YlNNb2R1bGVPcHRpbWl6ZXIsIFIgZXh0ZW5kcyBTdWJTTW9kdWxlT3B0aW1pemVyID0gU3ViU01vZHVsZU9wdGltaXplcj4gPSB7XG5cdChzZWdtZW50OiBTZWdtZW50LCAuLi5hcmd2KTogVCAmIFIsXG59O1xuXG5AYXV0b2JpbmRcbi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBjbGFzcyBTdWJTTW9kdWxlT3B0aW1pemVyIGV4dGVuZHMgU3ViU01vZHVsZSBpbXBsZW1lbnRzIElTdWJPcHRpbWl6ZXJcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSB0eXBlID0gJ29wdGltaXplcic7XG5cdHB1YmxpYyByZWFkb25seSB0eXBlID0gJ29wdGltaXplcic7XG5cblx0cHVibGljIGRvT3B0aW1pemUod29yZHM6IElXb3JkW10sIC4uLmFyZ3YpOiBJV29yZFtdXG5cdHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcblx0fVxuXG5cdHB1YmxpYyBpbml0KHNlZ21lbnQ6IFNlZ21lbnQsIC4uLmFyZ3YpXG5cdHtcblx0XHRzdXBlci5pbml0KHNlZ21lbnQsIC4uLmFyZ3YpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRwdWJsaWMgc3RhdGljIGluaXQ8VCBleHRlbmRzIFN1YlNNb2R1bGVPcHRpbWl6ZXIgPSBTdWJTTW9kdWxlT3B0aW1pemVyPihzZWdtZW50OiBTZWdtZW50LCAuLi5hcmd2KTogVFxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBzdXBlci5pbml0PFQ+KHNlZ21lbnQsIC4uLmFyZ3YpO1xuXHR9XG59XG5cbi8qKlxuICog5YiG6K+N5qih5Z2X566h55CG5ZmoXG4gKi9cbmV4cG9ydCBjbGFzcyBPcHRpbWl6ZXIgZXh0ZW5kcyBTTW9kdWxlXG57XG5cdHR5cGUgPSAnb3B0aW1pemVyJztcblxuXHQvKipcblx0ICog5a+55LiA5q615paH5pys6L+b6KGM5YiG6K+NXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuXHQgKiBAcGFyYW0ge2FycmF5fSBtb2R1bGVzIOWIhuivjeaooeWdl+aVsOe7hFxuXHQgKiBAcmV0dXJuIHthcnJheX1cblx0ICovXG5cdGRvT3B0aW1pemUod29yZHM6IElXb3JkW10sIG1vZHM6IElTdWJPcHRpbWl6ZXJbXSwgLi4uYXJndik6IElXb3JkW11cblx0e1xuXHRcdHJldHVybiB0aGlzLl9kb01ldGhvZCgnZG9PcHRpbWl6ZScsIHdvcmRzLCBtb2RzLCAuLi5hcmd2KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBPcHRpbWl6ZXI7XG4iXX0=