import { TableDictLine as t } from "@novel-segment/table-line";

import { EnumDictDatabase as e } from "@novel-segment/types";

class TableDictStopword extends t {
  static type=e.STOPWORD;
  constructor(t = TableDictStopword.type, e, ...o) {
    super(t, e, ...o);
  }
}

export { TableDictStopword, TableDictStopword as default };
//# sourceMappingURL=index.esm.mjs.map
