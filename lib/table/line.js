"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_1 = require("segment-dict/lib/loader/line");
const util_1 = require("../util");
const core_1 = require("./core");
/**
 * 原版 node-segment 的格式
 */
class TableDictLine extends core_1.default {
    exists(data, ...argv) {
        let w = this._exists(data);
        let bool = this.TABLE[w];
        return typeof bool === 'boolean' ? bool : null;
    }
    add(word) {
        let self = this;
        if (Array.isArray(word)) {
            word.forEach(v => self._add(v));
        }
        else {
            self._add(word);
        }
        return this;
    }
    _add(word) {
        word = word.trim();
        if (word) {
            this.TABLE[word] = true;
        }
    }
    remove(word) {
        let self = this;
        self._remove(word);
        return this;
    }
    _remove(word) {
        delete this.TABLE[word];
    }
    json() {
        return util_1.cloneDeep(this.TABLE);
    }
    stringify(LF = "\n") {
        let self = this;
        return Object.entries(self.TABLE)
            .reduce(function (a, [w, bool]) {
            if (bool) {
                let line = line_1.stringifyLine(w);
                a.push(line);
            }
            return a;
        }, [])
            .join(typeof LF === 'string' ? LF : "\n");
    }
}
exports.TableDictLine = TableDictLine;
exports.default = TableDictLine;
