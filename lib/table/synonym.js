"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const synonym_pangu_1 = require("./synonym.pangu");
/**
 * 請注意 這與原版 node-segment 的格式不同
 *
 * 原版為一對一 => 錯字,正字
 * 這裡為一對多 並且順序與原版相反 => 正字,錯字,...以,分隔更多字
 */
class TableDictSynonym extends synonym_pangu_1.TableDictSynonymPanGu {
    add(data, skipExists) {
        if (!Array.isArray(data) || data.length < 2) {
            throw new TypeError(JSON.stringify(data));
        }
        if (skipExists && this.exists(data[0])) {
            return this;
        }
        let w = data.shift();
        let self = this;
        data.forEach(function (bw) {
            self._add(bw, w);
        });
        return this;
    }
}
exports.TableDictSynonym = TableDictSynonym;
exports.default = TableDictSynonym;
