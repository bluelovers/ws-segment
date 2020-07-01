'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = exports.init = exports.ZhRadicalTokenizer = void 0;
const mod_1 = require("../mod");
/**
 * 此模組目前無任何用處與效果
 *
 * @todo 部首
 */
class ZhRadicalTokenizer extends mod_1.SubSModuleTokenizer {
    constructor() {
        super(...arguments);
        this.name = 'ZhRadicalTokenizer';
    }
    _cache(...argv) {
        super._cache(...argv);
    }
    split(words) {
        return this._splitUnset(words, this.splitZhRadical);
    }
    splitZhRadical(text, cur) {
        let ret = [];
        let self = this;
        let _r = /[\u4136\u4137]/u;
        if (!_r.test(text)) {
            return null;
        }
        text
            .split(/([\u4136\u4137]+)/u)
            .forEach(function (w, i) {
            if (w !== '') {
                if (_r.test(w)) {
                    ret.push(self.debugToken({
                        w,
                    }, {
                        [self.name]: true,
                    }, true));
                }
                else {
                    ret.push({
                        w,
                    });
                }
            }
        });
        return ret.length ? ret : null;
    }
}
exports.ZhRadicalTokenizer = ZhRadicalTokenizer;
exports.init = ZhRadicalTokenizer.init.bind(ZhRadicalTokenizer);
exports.type = ZhRadicalTokenizer.type;
exports.default = ZhRadicalTokenizer;
//# sourceMappingURL=ZhRadicalTokenizer.js.map