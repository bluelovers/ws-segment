import { handleDictLines, USE_CJK_MODE, chkLineType } from '@novel-segment/util-compare';
import { load } from '@novel-segment/loader-line';
import { getCjkName, zhDictCompare } from '@novel-segment/util';
import { parseLine } from '@novel-segment/loaders/segment/index';

function sortLines(lines, file, options) {
  var _options$cbIgnore;

  const cbIgnore = (_options$cbIgnore = options === null || options === void 0 ? void 0 : options.cbIgnore) !== null && _options$cbIgnore !== void 0 ? _options$cbIgnore : () => {};
  const list = handleDictLines(lines, function (list, cur) {
    cur.file = file;
    let [w, p, f] = cur.data;
    let cjk_id = getCjkName(w, USE_CJK_MODE);
    cur.cjk_id = cjk_id;
    cur.line_type = chkLineType(cur.line);

    if (cur.line_type == 1) {
      cbIgnore(cur);
      return false;
    }

    return true;
  }, {
    parseFn: parseLine
  });
  return SortList(list);
}
function loadFile(file, options) {
  return load(file).then(lines => sortLines(lines, file, options));
}
function SortList(ls) {
  return ls.sort(function (a, b) {
    if (a.line_type == 2 || b.line_type == 2) {
      return a.index - b.index;
    } else if (a.line_type == 1 || b.line_type == 1) {
      return a.index - b.index;
    }

    let ret = zhDictCompare(a.cjk_id, b.cjk_id) || a.index - b.index || 0;
    return ret;
  });
}

export { SortList, sortLines as default, loadFile, sortLines };
//# sourceMappingURL=index.esm.mjs.map
