import { TableDictLine } from '@novel-segment/table-line';

class TableDictStopword extends TableDictLine {
  static type = "STOPWORD";

  constructor(type = TableDictStopword.type, options, ...argv) {
    super(type, options, ...argv);
  }

}

export { TableDictStopword, TableDictStopword as default };
//# sourceMappingURL=index.esm.mjs.map
