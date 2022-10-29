'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tableLine = require('@novel-segment/table-line');

class TableDictStopword extends tableLine.TableDictLine {
  static type = "STOPWORD";
  constructor(type = TableDictStopword.type, options, ...argv) {
    super(type, options, ...argv);
  }
}

exports.TableDictStopword = TableDictStopword;
exports.default = TableDictStopword;
//# sourceMappingURL=index.cjs.development.cjs.map
