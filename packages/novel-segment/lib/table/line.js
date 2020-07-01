"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDictLine = void 0;
const loader_line_1 = require("@novel-segment/loader-line");
const lodash_1 = require("lodash");
const core_1 = __importDefault(require("./core"));
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
        return lodash_1.cloneDeep(this.TABLE);
    }
    stringify(LF = "\n") {
        let self = this;
        return Object.entries(self.TABLE)
            .reduce(function (a, [w, bool]) {
            if (bool) {
                let line = loader_line_1.stringifyLine(w);
                a.push(line);
            }
            return a;
        }, [])
            .join(typeof LF === 'string' ? LF : "\n");
    }
}
exports.TableDictLine = TableDictLine;
exports.default = TableDictLine;
//# sourceMappingURL=line.js.map