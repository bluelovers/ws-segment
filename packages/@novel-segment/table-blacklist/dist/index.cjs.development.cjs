'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tableLine = require('@novel-segment/table-line');

class TableDictBlacklist extends tableLine.TableDictLine {
  static type = "BLACKLIST";
  constructor(type = TableDictBlacklist.type, options, ...argv) {
    super(type, options, ...argv);
  }
}

exports.TableDictBlacklist = TableDictBlacklist;
exports.default = TableDictBlacklist;
//# sourceMappingURL=index.cjs.development.cjs.map
