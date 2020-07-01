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
    add(data, skipExists) {
        var _a;
        if (!Array.isArray(data) || data.length < 2) {
            throw new TypeError(JSON.stringify(data));
        }
        let w = this._trim(data.shift());
        if (!w.length) {
            throw new TypeError(JSON.stringify(data));
        }
        let self = this;
        self.TABLE2[w] = (_a = self.TABLE2[w]) !== null && _a !== void 0 ? _a : [];
        skipExists = skipExists !== null && skipExists !== void 0 ? skipExists : true;
        data.forEach(function (bw, index) {
            bw = self._trim(bw);
            if (!bw.length) {
                if (index === 0) {
                    throw new TypeError();
                }
                return;
            }
            if (skipExists && self.exists(bw) || bw in self.TABLE2) {
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