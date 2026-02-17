import { stringifyLine as t } from "@novel-segment/loaders/segment/index";

import { textList as e } from "@lazy-cjk/zh-table-list/list";

import { AbstractTableDictCore as s } from "@novel-segment/table-core-abstract";

function notNum(t) {
  return "number" != typeof t || Number.isNaN(t);
}

class TableDict extends s {
  exists(t) {
    return super.exists(t);
  }
  __handleInput(t, e) {
    let s, i, n, r;
    if ("string" == typeof t ? s = t : Array.isArray(t) ? [s, i, n, ...r] = t : ({w: s, p: i, f: n} = t), 
    "string" != typeof s || "" === s) throw new TypeError(JSON.stringify(t));
    if (!e && (null === i || null === n)) {
      let t = this.exists(s);
      t && (null === i && (i = t.p), null === n && (n = t.f));
    }
    return i = notNum(i) ? 0 : i, n = notNum(n) ? 0 : n, {
      data: {
        w: s,
        p: i,
        f: n
      },
      plus: r
    };
  }
  add(t, s) {
    let i, n, r;
    {
      let e = this.__handleInput(t, s);
      ({w: i, p: n, f: r} = e.data);
    }
    if (s && this.exists(i)) return this;
    this._add({
      w: i,
      p: n,
      f: r,
      s: !0
    });
    let l = this;
    return this.options.autoCjk && e(i).forEach(function(t) {
      t === i || l.exists(t) || l._add({
        w: t,
        p: n,
        f: r
      });
    }), this;
  }
  _add({w: t, p: e, f: s, s: i}) {
    let n = t.length;
    this.TABLE[t] = {
      p: e,
      f: s,
      s: i
    }, this.TABLE2[n] || (this.TABLE2[n] = {}), this.TABLE2[n][t] = this.TABLE[t];
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
    return Object.entries(this.TABLE).reduce(function(e, [s, {p: i, f: n}]) {
      let r = t([ s, i, n ]);
      return e.push(r), e;
    }, []).join("string" == typeof e ? e : "\n");
  }
}

export { TableDict, TableDict as default, notNum };
//# sourceMappingURL=index.esm.mjs.map
