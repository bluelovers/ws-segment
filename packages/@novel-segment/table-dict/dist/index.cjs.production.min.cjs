"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var t = require("@novel-segment/loaders/segment/index"), e = require("@lazy-cjk/zh-table-list/list"), s = require("@novel-segment/table-core-abstract");

function notNum(t) {
  return "number" != typeof t || Number.isNaN(t);
}

class TableDict extends s.AbstractTableDictCore {
  exists(t) {
    return super.exists(t);
  }
  __handleInput(t) {
    let e, s, r, i;
    if ("string" == typeof t ? e = t : Array.isArray(t) ? [e, s, r, ...i] = t : ({w: e, p: s, f: r} = t), 
    "string" != typeof e || "" === e) throw new TypeError(JSON.stringify(t));
    return s = notNum(s) ? 0 : s, r = notNum(r) ? 0 : r, {
      data: {
        w: e,
        p: s,
        f: r
      },
      plus: i
    };
  }
  add(t, s) {
    let r, i, n;
    {
      let e = this.__handleInput(t);
      ({w: r, p: i, f: n} = e.data);
    }
    if (s && this.exists(r)) return this;
    this._add({
      w: r,
      p: i,
      f: n,
      s: !0
    });
    let a = this;
    return this.options.autoCjk && e.textList(r).forEach((function(t) {
      t === r || a.exists(t) || a._add({
        w: t,
        p: i,
        f: n
      });
    })), this;
  }
  _add({w: t, p: e, f: s, s: r}) {
    let i = t.length;
    this.TABLE[t] = {
      p: e,
      f: s,
      s: r
    }, this.TABLE2[i] || (this.TABLE2[i] = {}), this.TABLE2[i][t] = this.TABLE[t];
  }
  remove(t) {
    let {data: e} = this.__handleInput(t);
    return this._remove(e), this;
  }
  _remove({w: t}) {
    let e = t.length;
    return delete this.TABLE[t], this.TABLE2[e] && delete this.TABLE2[e][t], this;
  }
  stringify(e = "\n") {
    return Object.entries(this.TABLE).reduce((function(e, [s, {p: r, f: i}]) {
      let n = t.stringifyLine([ s, r, i ]);
      return e.push(n), e;
    }), []).join("string" == typeof e ? e : "\n");
  }
}

exports.TableDict = TableDict, exports.default = TableDict, exports.notNum = notNum;
//# sourceMappingURL=index.cjs.production.min.cjs.map
