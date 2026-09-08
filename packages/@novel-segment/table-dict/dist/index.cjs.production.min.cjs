"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("@novel-segment/loaders/segment/index"), t = require("@lazy-cjk/zh-table-list/list"), r = require("@novel-segment/table-core-abstract");

function notNum(e) {
  return "number" != typeof e || Number.isNaN(e);
}

class TableDict extends r.AbstractTableDictCore {
  exists(e) {
    return super.exists(e);
  }
  __handleInput(e, t) {
    let r, n, s, i;
    if ("string" == typeof e ? r = e : Array.isArray(e) ? [r, n, s, ...i] = e : ({w: r, p: n, f: s} = e), 
    "string" != typeof r || "" === r) throw new TypeError(JSON.stringify(e));
    if (!t && (null === n || null === s)) {
      let e = this.exists(r);
      e && (null === n && (n = e.p), null === s && (s = e.f));
    }
    return n = notNum(n) ? 0 : n, s = notNum(s) ? 0 : s, {
      data: {
        w: r,
        p: n,
        f: s
      },
      plus: i
    };
  }
  add(e, r) {
    let n, s, i;
    {
      let t = this.__handleInput(e, r);
      ({w: n, p: s, f: i} = t.data);
    }
    if (r && this.exists(n)) return this;
    this._add({
      w: n,
      p: s,
      f: i,
      s: !0
    });
    let u = this;
    return this.options.autoCjk && t.textList(n).forEach(function(e) {
      e === n || u.exists(e) || u._add({
        w: e,
        p: s,
        f: i
      });
    }), this;
  }
  _add({w: e, p: t, f: r, s: n}) {
    let s = e.length;
    this.TABLE[e] = {
      p: t,
      f: r,
      s: n
    }, this.TABLE2[s] || (this.TABLE2[s] = {}), this.TABLE2[s][e] = this.TABLE[e];
  }
  remove(e) {
    let {data: t} = this.__handleInput(e);
    return this._remove(t), this;
  }
  _remove({w: e}) {
    let t = e.length;
    return delete this.TABLE[e], this.TABLE2[t] && delete this.TABLE2[t][e], this;
  }
  stringify(t = "\n") {
    return Object.entries(this.TABLE).reduce(function(t, [r, {p: n, f: s}]) {
      let i = e.stringifyLine([ r, n, s ]);
      return t.push(i), t;
    }, []).join("string" == typeof t ? t : "\n");
  }
}

Object.defineProperty(exports, "IDICT", {
  enumerable: !0,
  get: function() {
    return r.IDICT;
  }
}), Object.defineProperty(exports, "IDICT2", {
  enumerable: !0,
  get: function() {
    return r.IDICT2;
  }
}), Object.defineProperty(exports, "IOptions", {
  enumerable: !0,
  get: function() {
    return r.IOptions;
  }
}), exports.TableDict = TableDict, exports.default = TableDict, exports.notNum = notNum;
//# sourceMappingURL=index.cjs.production.min.cjs.map
