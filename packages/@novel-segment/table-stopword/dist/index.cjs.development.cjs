'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tableLine = require('@novel-segment/table-line');

/**
 * 原版 node-segment 的格式
 */
class TableDictStopword extends tableLine.TableDictLine {
  static type = "STOPWORD" /* EnumDictDatabase.STOPWORD */;
  constructor(type = TableDictStopword.type, options, ...argv) {
    super(type, options, ...argv);
  }
}

exports.TableDictStopword = TableDictStopword;
exports.default = TableDictStopword;
//# sourceMappingURL=index.cjs.development.cjs.map
