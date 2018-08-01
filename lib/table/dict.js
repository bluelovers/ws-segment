"use strict";
/**
 * Created by user on 2018/4/15/015.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cjk_1 = require("../util/cjk");
const core_1 = require("./core");
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
    add(data, skipExists) {
        let w, p, f;
        let plus;
        if (typeof data == 'string') {
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
        if (skipExists && this.exists(w)) {
            return this;
        }
        p = (typeof p != 'number' || Number.isNaN(p)) ? 0 : p;
        f = (typeof f != 'number' || Number.isNaN(f)) ? 0 : f;
        if (plus && plus.length) {
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
                if (w2 != w && !self.exists(w2)) {
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
}
exports.TableDict = TableDict;
exports.default = TableDict;
