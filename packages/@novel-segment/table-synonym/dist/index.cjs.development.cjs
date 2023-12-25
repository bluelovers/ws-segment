'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tableSynonymPangu = require('@novel-segment/table-synonym-pangu');

/**
 * Created by user on 2018/4/19/019.
 */
/**
 * 請注意 這與原版 node-segment 的格式不同
 *
 * 原版為一對一 => 錯字,正字
 * 這裡為一對多 並且順序與原版相反 => 正字,錯字,...以,分隔更多字
 */
class TableDictSynonym extends tableSynonymPangu.TableDictSynonymPanGu {
  constructor(type = TableDictSynonym.type, options, ...argv) {
    super(type, options, ...argv);
  }
  add(data, skipExists, forceOverwrite) {
    var _self$TABLE, _self$TABLE$w, _forceOverwrite, _skipExists, _this$options$skipExi;
    if (!Array.isArray(data) || data.length < 2) {
      throw new TypeError(JSON.stringify(data));
    }
    const w = this._trim(data.shift());
    if (!w.length) {
      throw new TypeError(JSON.stringify(data));
    }
    const self = this;
    (_self$TABLE$w = (_self$TABLE = self.TABLE2)[w]) !== null && _self$TABLE$w !== void 0 ? _self$TABLE$w : _self$TABLE[w] = [];
    (_forceOverwrite = forceOverwrite) !== null && _forceOverwrite !== void 0 ? _forceOverwrite : forceOverwrite = this.options.forceOverwrite;
    (_skipExists = skipExists) !== null && _skipExists !== void 0 ? _skipExists : skipExists = (_this$options$skipExi = this.options.skipExists) !== null && _this$options$skipExi !== void 0 ? _this$options$skipExi : true;
    data.forEach(function (bw, index) {
      bw = self._trim(bw);
      if (!bw.length) {
        if (index === 0) {
          throw new TypeError();
        }
        return;
      }
      if (!forceOverwrite && (skipExists && self.exists(bw) || bw in self.TABLE2)) {
        return;
      }
      self.TABLE2[w].push(bw);
      self._add(bw, w);
      //skipExists = true;
    });

    return this;
  }
}

exports.TableDictSynonym = TableDictSynonym;
exports.default = TableDictSynonym;
//# sourceMappingURL=index.cjs.development.cjs.map
