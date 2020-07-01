'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = exports.init = exports.ZhuyinTokenizer = void 0;
const mod_1 = require("../mod");
/**
 * 注音
 */
class ZhuyinTokenizer extends mod_1.SubSModuleTokenizer {
    constructor() {
        super(...arguments);
        this.name = 'ZhuyinTokenizer';
    }
    _cache(...argv) {
        super._cache(...argv);
    }
    split(words) {
        return this._splitUnset(words, this.splitZhuyin);
    }
    splitZhuyin(text, cur) {
        let ret = [];
        let self = this;
        let _r = /[\u31A0-\u31BA\u3105-\u312E]/u;
        if (!_r.test(text)) {
            return null;
        }
        text
            .split(/([\u31A0-\u31BA\u3105-\u312E]+)/u)
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
exports.ZhuyinTokenizer = ZhuyinTokenizer;
exports.init = ZhuyinTokenizer.init.bind(ZhuyinTokenizer);
exports.type = ZhuyinTokenizer.type;
exports.default = ZhuyinTokenizer;
//# sourceMappingURL=ZhuyinTokenizer.js.map