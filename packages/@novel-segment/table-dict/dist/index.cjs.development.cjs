'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('@novel-segment/loaders/segment/index');
var list = require('@lazy-cjk/zh-table-list/list');
var tableCoreAbstract = require('@novel-segment/table-core-abstract');

/**
 * Created by user on 2018/4/15/015.
 */
function notNum(val) {
  return typeof val !== 'number' || Number.isNaN(val);
}
/**
 * @todo 掛接其他 dict
 */
class TableDict extends tableCoreAbstract.AbstractTableDictCore {
  //override options: IOptions;
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
    /**
     * @todo 需要更聰明的作法 目前的做法實在太蠢
     * @BUG 在不明原因下 似乎不會正確的添加每個項目 如果遇到這種情形請手動添加簡繁項目
     */
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
  /**
   * 將目前的 表格 匯出
   */
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
