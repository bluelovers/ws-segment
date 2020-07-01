"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDict = void 0;
const segment_1 = require("segment-dict/lib/loader/segment");
const cjk_1 = require("../util/cjk");
const core_1 = __importDefault(require("./core"));
const lodash_1 = require("lodash");
const isNum_1 = require("../util/isNum");
/**
 * @todo 掛接其他 dict
 */
class TableDict extends core_1.default {
    constructor() {
        super(...arguments);
        this.TABLE = {};
        this.TABLE2 = {};
    }
    exists(data) {
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
        return this.TABLE[w] || null;
    }
    __handleInput(data) {
        let w, p, f;
        let plus;
        if (typeof data === 'string') {
            w = data;
        }
        else if (Array.isArray(data)) {
            [w, p, f, ...plus] = data;
        }
        else {
            ({ w, p, f } = data);
        }
        if (typeof w !== 'string' || w === '') {
            throw new TypeError(JSON.stringify(data));
        }
        p = isNum_1.notNum(p) ? 0 : p;
        f = isNum_1.notNum(f) ? 0 : f;
        return {
            data: {
                w, p, f,
            },
            plus,
        };
    }
    add(data, skipExists) {
        let w, p, f;
        let plus;
        {
            let ret = this.__handleInput(data);
            ({ w, p, f } = ret.data);
            plus = ret.plus;
        }
        if (skipExists && this.exists(w)) {
            return this;
        }
        if (plus === null || plus === void 0 ? void 0 : plus.length) {
            // @todo do something
        }
        this._add({ w, p, f, s: true });
        let self = this;
        /**
         * @todo 需要更聰明的作法 目前的做法實在太蠢
         * @BUG 在不明原因下 似乎不會正確的添加每個項目 如果遇到這種情形請手動添加簡繁項目
         */
        if (1 && this.options.autoCjk) {
            let wa = cjk_1.text_list(w);
            wa.forEach(function (w2) {
                if (w2 !== w && !self.exists(w2)) {
                    self._add({ w: w2, p, f });
                }
            });
            /*
            let w2: string;
            w2 = CjkConv.zh2jp(w);

            if (w2 != w && !this.exists(w2))
            {
                this._add({w: w2, p, f});
                //console.log(w2);
            }

            w2 = CjkConv.cjk2zht(w);

            if (w2 !== w && !this.exists(w2))
            {
                this._add({w: w2, p, f});
                //console.log(w2);
            }

            w2 = CjkConv.cjk2zhs(w);

            if (w2 !== w && !this.exists(w2))
            {
                this._add({w: w2, p, f});
                //console.log(w2);
            }
            */
        }
        return this;
    }
    _add({ w, p, f, s }) {
        let len = w.length;
        this.TABLE[w] = {
            p,
            f,
            s,
        };
        if (!this.TABLE2[len])
            this.TABLE2[len] = {};
        this.TABLE2[len][w] = this.TABLE[w];
    }
    remove(target) {
        let { data, plus } = this.__handleInput(target);
        this._remove(data);
        return this;
    }
    _remove({ w, p, f, s }) {
        let len = w.length;
        delete this.TABLE[w];
        if (this.TABLE2[len]) {
            delete this.TABLE2[len][w];
        }
        return this;
    }
    json() {
        return lodash_1.cloneDeep(this.TABLE);
    }
    /**
     * 將目前的 表格 匯出
     */
    stringify(LF = "\n") {
        let self = this;
        return Object.entries(self.TABLE)
            .reduce(function (a, [w, { p, f }]) {
            let line = segment_1.stringifyLine([w, p, f]);
            a.push(line);
            return a;
        }, [])
            .join(typeof LF === 'string' ? LF : "\n");
    }
}
exports.TableDict = TableDict;
exports.default = TableDict;
//# sourceMappingURL=dict.js.map