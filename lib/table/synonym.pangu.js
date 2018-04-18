"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("./core");
/**
 * 原版 node-segment 的格式
 */
class TableDictSynonymPanGu extends core_1.default {
    add(data, skipExists) {
        if (!Array.isArray(data) || data.length != 2) {
            throw new TypeError(JSON.stringify(data));
        }
        if (skipExists && this.exists(data[0])) {
            return this;
        }
        this._add(data[0], data[1]);
        return this;
    }
    _add(n1, n2) {
        if (n1 !== n2) {
            this.TABLE[n1] = n2;
            if (this.TABLE[n2] === n1) {
                delete this.TABLE[n2];
            }
        }
    }
}
exports.TableDictSynonymPanGu = TableDictSynonymPanGu;
exports.default = TableDictSynonymPanGu;
