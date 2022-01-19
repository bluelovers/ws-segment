import { parseLine } from '@novel-segment/loaders/segment/index';
import { load } from '@novel-segment/loader-line';
import { array_unique } from 'array-hyper-unique';

const USE_CJK_MODE = 2;
var EnumLineType;

(function (EnumLineType) {
  EnumLineType[EnumLineType["BASE"] = 0] = "BASE";
  EnumLineType[EnumLineType["COMMENT"] = 1] = "COMMENT";
  EnumLineType[EnumLineType["COMMENT_TAG"] = 2] = "COMMENT_TAG";
})(EnumLineType || (EnumLineType = {}));

function stringifyHandleDictLinesList(list, options) {
  let lines = list.map(v => v.line);

  if (options !== null && options !== void 0 && options.disableUnique) {
    return lines;
  }

  return array_unique(lines);
}
function handleDictLines(lines, fn, options) {
  if (!lines) {
    return [];
  }

  const {
    parseFn
  } = options;
  return lines.reduce(function (a, line, index) {
    let bool;
    let data = parseFn(line);
    let cur = {
      data,
      line,
      index
    };

    if (fn) {
      bool = fn(a, cur);
    } else {
      bool = true;
    }

    if (bool) {
      a.push(cur);
    }

    return a;
  }, []);
}
function loadDictFile(file, fn, options) {
  options = options || {};
  const parseFn = options.parseFn = options.parseFn || parseLine;
  return load(file).then(function (b) {
    return handleDictLines(b, fn, {
      parseFn
    });
  });
}
function chkLineType(line) {
  let ret = 0;

  if (line.indexOf('//') == 0) {
    ret = 1;

    if (/ @todo/i.test(line)) {
      ret = 2;
    }
  }

  return ret;
}

export { EnumLineType, USE_CJK_MODE, chkLineType, handleDictLines, loadDictFile, stringifyHandleDictLinesList };
//# sourceMappingURL=index.esm.mjs.map
