import { handleDictLines, chkLineType, USE_CJK_MODE } from '@novel-segment/util-compare';
import { array_unique } from 'array-hyper-unique';
import { load } from '@novel-segment/loader-line';
import { getCjkName, zhDictCompare } from '@novel-segment/util';

function sortLines(lines, file) {
  const list = handleDictLines(lines, function (list, cur) {
    cur.file = file;
    let [w] = cur.data;
    cur.line_type = chkLineType(cur.line);

    if (cur.line_type == 1) {
      w = w.replace(/^\/\//, '');
    } else if (cur.line_type == 0) {
      let ls = cur.data.slice(1);
      ls = array_unique(ls).filter(v => v != w);
      ls.sort(function (a, b) {
        let ca = getCjkName(a, USE_CJK_MODE);
        let cb = getCjkName(b, USE_CJK_MODE);
        return zhDictCompare(ca, cb) || zhDictCompare(a, b);
      });
      cur.line = [w].concat(ls).join(',');

      if (!ls.length) {
        return false;
      }
    }

    const cjk_id = getCjkName(w, USE_CJK_MODE);
    cur.cjk_id = cjk_id;
    return true;
  }, {
    parseFn(line) {
      return line.split(',');
    }

  });
  return SortList(list);
}
function loadFile(file) {
  return load(file).then(lines => sortLines(lines, file));
}
function SortList(ls) {
  return ls.sort(function (a, b) {
    if (a.line_type == 2 || b.line_type == 2) {
      return a.index - b.index;
    } else if (a.line_type == 1 || b.line_type == 1) {
      return a.index - b.index;
    }

    let ret = zhDictCompare(a.cjk_id, b.cjk_id) || zhDictCompare(b.data[0], a.data[0]) || a.index - b.index || 0;
    return ret;
  });
}

export { SortList, sortLines as default, loadFile, sortLines };
//# sourceMappingURL=index.esm.mjs.map
