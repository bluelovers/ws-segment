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
  __handleInput(t) {
    let e, s, i, r;
    if ("string" == typeof t ? e = t : Array.isArray(t) ? [e, s, i, ...r] = t : ({w: e, p: s, f: i} = t), 
    "string" != typeof e || "" === e) throw new TypeError(JSON.stringify(t));
    return s = notNum(s) ? 0 : s, i = notNum(i) ? 0 : i, {
      data: {
        w: e,
        p: s,
        f: i
      },
      plus: r
    };
  }
  add(t, s) {
    let i, r, n;
    {
      let e = this.__handleInput(t);
      ({w: i, p: r, f: n} = e.data);
    }
    if (s && this.exists(i)) return this;
    this._add({
      w: i,
      p: r,
      f: n,
      s: !0
    });
    let o = this;
    return this.options.autoCjk && e(i).forEach((function(t) {
      t === i || o.exists(t) || o._add({
        w: t,
        p: r,
        f: n
      });
    })), this;
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
    return Object.entries(this.TABLE).reduce((function(e, [s, {p: i, f: r}]) {
      let n = t([ s, i, r ]);
      return e.push(n), e;
    }), []).join("string" == typeof e ? e : "\n");
  }
}

export { TableDict, TableDict as default, notNum };
//# sourceMappingURL=index.esm.mjs.map
