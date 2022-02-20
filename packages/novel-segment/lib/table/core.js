"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractTableDictCore = void 0;
class AbstractTableDictCore {
    constructor(type, options = {}, existsTable, ...argv) {
        this.TABLE = Object.create(null);
        this.TABLE2 = Object.create(null);
        this.type = type;
        this.options = Object.assign({}, this.options, options);
        if (existsTable) {
            if (existsTable.TABLE) {
                this.TABLE = existsTable.TABLE;
            }
            if (existsTable.TABLE2) {
                this.TABLE2 = existsTable.TABLE2;
            }
        }
        Object.setPrototypeOf(this.TABLE, null);
        Object.setPrototypeOf(this.TABLE2, null);
    }
    _exists(data, ...argv) {
        let w, p, f;
        if (typeof data === 'string') {
            w = data;
        }
        else if (Array.isArray(data)) {
            [w, p, f] = data;
        }
        else {
            ({ w, p, f } = data);
        }
        return w;
    }
    exists(data, ...argv) {
        let w = this._exists(data);
        return this.TABLE[w] || null;
    }
    size() {
        return Object.keys(this.TABLE).length;
    }
}
exports.AbstractTableDictCore = AbstractTableDictCore;
exports.default = AbstractTableDictCore;
//# sourceMappingURL=core.js.map