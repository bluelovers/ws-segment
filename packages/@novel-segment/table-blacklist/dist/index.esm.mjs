import { TableDictLine } from '@novel-segment/table-line';

class TableDictBlacklist extends TableDictLine {
  static type = "BLACKLIST";

  constructor(type = TableDictBlacklist.type, options, ...argv) {
    super(type, options, ...argv);
  }

}

export { TableDictBlacklist, TableDictBlacklist as default };
//# sourceMappingURL=index.esm.mjs.map
