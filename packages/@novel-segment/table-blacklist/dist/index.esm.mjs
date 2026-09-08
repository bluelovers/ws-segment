import { TableDictLine as t } from "@novel-segment/table-line";

import { EnumDictDatabase as e } from "@novel-segment/types";

class TableDictBlacklist extends t {
  static type=e.BLACKLIST;
  constructor(t = TableDictBlacklist.type, e, ...l) {
    super(t, e, ...l);
  }
}

export { TableDictBlacklist, TableDictBlacklist as default };
//# sourceMappingURL=index.esm.mjs.map
