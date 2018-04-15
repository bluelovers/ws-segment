"use strict";
/**
 * Created by user on 2018/4/15/015.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cjk_1 = require("../util/cjk");
class TableDict {
    constructor(type, options = {}) {
        this.TABLE = {};
        this.TABLE2 = {};
        this.type = type;
        this.options = Object.assign({}, this.options, options);
        //console.log(this.options);
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
        if (typeof data == 'string') {
            w = data;
        }
        else if (Array.isArray(data)) {
            [w, p, f] = data;
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
        p = (Number.isNaN(p) || typeof p != 'number') ? 0 : p;
        f = (Number.isNaN(f) || typeof f != 'number') ? 0 : f;
        this._add({ w, p, f });
        let self = this;
        /**
         * @todo 需要更聰明的作法 目前的做法實在太蠢
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
    _add({ w, p, f }) {
        let len = w.length;
        this.TABLE[w] = {
            p,
            f,
        };
        if (!this.TABLE2[len])
            this.TABLE2[len] = {};
        this.TABLE2[len][w] = this.TABLE[w];
    }
}
exports.TableDict = TableDict;
exports.default = TableDict;
