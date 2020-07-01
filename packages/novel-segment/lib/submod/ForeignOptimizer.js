"use strict";
/**
 * Created by user on 2018/8/18/018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = exports.init = exports.ForeignOptimizer = void 0;
const mod_1 = require("../mod");
class ForeignOptimizer extends mod_1.SubSModuleOptimizer {
    constructor() {
        super(...arguments);
        this.name = 'ForeignOptimizer';
    }
    _cache() {
        super._cache();
        this._TABLE = this.segment.getDict('TABLE');
        this._POSTAG = this.segment.POSTAG;
    }
    doOptimize(words) {
        const self = this;
        const POSTAG = this._POSTAG;
        const TABLE = this._TABLE;
        let i = 0;
        let len = words.length - 1;
        while (i < len) {
            let w0 = words[i - 1];
            let w1 = words[i];
            let w2 = words[i + 1];
            if (!(w1.p === POSTAG.A_NX)) {
                i++;
                continue;
            }
            if (w2) {
                let nw = w1.w + w2.w;
                let mw = TABLE[nw];
                if (mw) {
                    let new_w = self.debugToken({
                        ...mw,
                        w: nw,
                        m: [w1, w2],
                    }, {
                        [this.name]: 1,
                    }, true);
                    this.sliceToken(words, i, 2, new_w);
                    len--;
                    continue;
                }
            }
            i++;
        }
        return words;
    }
}
exports.ForeignOptimizer = ForeignOptimizer;
exports.init = ForeignOptimizer.init.bind(ForeignOptimizer);
exports.type = ForeignOptimizer.type;
exports.default = ForeignOptimizer;
//# sourceMappingURL=ForeignOptimizer.js.map