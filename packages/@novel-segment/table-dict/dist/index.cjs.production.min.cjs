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
  __handleInput(t, e) {
    let s, i, r, n;
    if ("string" == typeof t ? s = t : Array.isArray(t) ? [s, i, r, ...n] = t : ({w: s, p: i, f: r} = t), 
    "string" != typeof s || "" === s) throw new TypeError(JSON.stringify(t));
    if (!e && (null === i || null === r)) {
      let t = this.exists(s);
      t && (null === i && (i = t.p), null === r && (r = t.f));
    }
    return i = notNum(i) ? 0 : i, r = notNum(r) ? 0 : r, {
      data: {
        w: s,
        p: i,
        f: r
      },
      plus: n
    };
  }
  add(t, s) {
    let i, r, n;
    {
      let e = this.__handleInput(t, s);
      ({w: i, p: r, f: n} = e.data);
    }
    if (s && this.exists(i)) return this;
    this._add({
      w: i,
      p: r,
      f: n,
      s: !0
    });
    let l = this;
    return this.options.autoCjk && e.textList(i).forEach(function(t) {
      t === i || l.exists(t) || l._add({
        w: t,
        p: r,
        f: n
      });
    }), this;
  }
  _add({w: t, p: e, f: s, s: i}) {
    let r = t.length;
    this.TABLE[t] = {
      p: e,
      f: s,
      s: i
    }, this.TABLE2[r] || (this.TABLE2[r] = {}), this.TABLE2[r][t] = this.TABLE[t];
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
    return Object.entries(this.TABLE).reduce(function(e, [s, {p: i, f: r}]) {
      let n = t.stringifyLine([ s, i, r ]);
      return e.push(n), e;
    }, []).join("string" == typeof e ? e : "\n");
  }
}

exports.TableDict = TableDict, exports.default = TableDict, exports.notNum = notNum;
//# sourceMappingURL=index.cjs.production.min.cjs.map
