"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDictSynonym = void 0;
const synonym_pangu_1 = require("./synonym.pangu");
/**
 * 請注意 這與原版 node-segment 的格式不同
 *
 * 原版為一對一 => 錯字,正字
 * 這裡為一對多 並且順序與原版相反 => 正字,錯字,...以,分隔更多字
 */
class TableDictSynonym extends synonym_pangu_1.TableDictSynonymPanGu {
    constructor(type = TableDictSynonym.type, options = {}, ...argv) {
        super(type, options, ...argv);
        /**
         * 緩存主KEY
         */
        this.TABLE2 = {};
    }
    add(data, skipExists, forceOverwrite) {
        var _a, _b;
        var _c;
        if (!Array.isArray(data) || data.length < 2) {
            throw new TypeError(JSON.stringify(data));
        }
        const w = this._trim(data.shift());
        if (!w.length) {
            throw new TypeError(JSON.stringify(data));
        }
        const self = this;
        (_a = (_c = self.TABLE2)[w]) !== null && _a !== void 0 ? _a : (_c[w] = []);
        forceOverwrite !== null && forceOverwrite !== void 0 ? forceOverwrite : (forceOverwrite = this.options.forceOverwrite);
        skipExists !== null && skipExists !== void 0 ? skipExists : (skipExists = (_b = this.options.skipExists) !== null && _b !== void 0 ? _b : true);
        data.forEach(function (bw, index) {
            bw = self._trim(bw);
            if (!bw.length) {
                if (index === 0) {
                    throw new TypeError();
                }
                return;
            }
            if ((!forceOverwrite) && (skipExists && self.exists(bw) || bw in self.TABLE2)) {
                return;
            }
            self.TABLE2[w].push(bw);
            self._add(bw, w);
            //skipExists = true;
        });
        return this;
    }
}
exports.TableDictSynonym = TableDictSynonym;
exports.default = TableDictSynonym;
//# sourceMappingURL=synonym.js.map