'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('@novel-segment/loaders/segment/index');
var list = require('@lazy-cjk/zh-table-list/list');
var tableCoreAbstract = require('@novel-segment/table-core-abstract');

function notNum(val) {
  return typeof val !== 'number' || Number.isNaN(val);
}
class TableDict extends tableCoreAbstract.AbstractTableDictCore {
  exists(data) {
    return super.exists(data);
  }
  __handleInput(data) {
    let w, p, f;
    let plus;
    if (typeof data === 'string') {
      w = data;
    } else if (Array.isArray(data)) {
      [w, p, f, ...plus] = data;
    } else {
      ({
        w,
        p,
        f
      } = data);
    }
    if (typeof w !== 'string' || w === '') {
      throw new TypeError(JSON.stringify(data));
    }
    p = notNum(p) ? 0 : p;
    f = notNum(f) ? 0 : f;
    return {
      data: {
        w,
        p,
        f
      },
      plus
    };
  }
  add(data, skipExists) {
    let w, p, f;
    {
      let ret = this.__handleInput(data);
      ({
        w,
        p,
        f
      } = ret.data);
    }
    if (skipExists && this.exists(w)) {
      return this;
    }
    this._add({
      w,
      p,
      f,
      s: true
    });
    let self = this;
    if (this.options.autoCjk) {
      let wa = list.textList(w);
      wa.forEach(function (w2) {
        if (w2 !== w && !self.exists(w2)) {
          self._add({
            w: w2,
            p,
            f
          });
        }
      });
    }
    return this;
  }
  _add({
    w,
    p,
    f,
    s
  }) {
    let len = w.length;
    this.TABLE[w] = {
      p,
      f,
      s
    };
    if (!this.TABLE2[len]) this.TABLE2[len] = {};
    this.TABLE2[len][w] = this.TABLE[w];
  }
  remove(target) {
    let {
      data,
      plus
    } = this.__handleInput(target);
    this._remove(data);
    return this;
  }
  _remove({
    w,
    p,
    f,
    s
  }) {
    let len = w.length;
    delete this.TABLE[w];
    if (this.TABLE2[len]) {
      delete this.TABLE2[len][w];
    }
    return this;
  }
  stringify(LF = "\n") {
    let self = this;
    return Object.entries(self.TABLE).reduce(function (a, [w, {
      p,
      f
    }]) {
      let line = index.stringifyLine([w, p, f]);
      a.push(line);
      return a;
    }, []).join(typeof LF === 'string' ? LF : "\n");
  }
}

exports.TableDict = TableDict;
exports.default = TableDict;
exports.notNum = notNum;
//# sourceMappingURL=index.cjs.development.cjs.map
