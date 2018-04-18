"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractTableDictCore {
    constructor(type, options = {}, ...argv) {
        this.TABLE = {};
        this.TABLE2 = {};
        this.type = type;
        this.options = Object.assign({}, this.options, options);
    }
    exists(data, ...argv) {
        let w, p, f;
        if (typeof data == 'string') {
            w = data;
        }
        else if (Array.isArray(data)) {
            [w, p, f] = data;
        }
        else {
            ({ w, p, f } = data);
        }
        return this.TABLE[w] || null;
    }
    size() {
        return Object.keys(this.TABLE).length;
    }
}
exports.AbstractTableDictCore = AbstractTableDictCore;
exports.default = AbstractTableDictCore;
