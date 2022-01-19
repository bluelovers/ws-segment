'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('@novel-segment/loaders/segment/index');
var loaderLine = require('@novel-segment/loader-line');
var arrayHyperUnique = require('array-hyper-unique');

const USE_CJK_MODE = 2;
exports.EnumLineType = void 0;

(function (EnumLineType) {
  EnumLineType[EnumLineType["BASE"] = 0] = "BASE";
  EnumLineType[EnumLineType["COMMENT"] = 1] = "COMMENT";
  EnumLineType[EnumLineType["COMMENT_TAG"] = 2] = "COMMENT_TAG";
})(exports.EnumLineType || (exports.EnumLineType = {}));

function stringifyHandleDictLinesList(list, options) {
  let lines = list.map(v => v.line);

  if (options !== null && options !== void 0 && options.disableUnique) {
    return lines;
  }

  return arrayHyperUnique.array_unique(lines);
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
  const parseFn = options.parseFn = options.parseFn || index.parseLine;
  return loaderLine.load(file).then(function (b) {
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

exports.USE_CJK_MODE = USE_CJK_MODE;
exports.chkLineType = chkLineType;
exports.handleDictLines = handleDictLines;
exports.loadDictFile = loadDictFile;
exports.stringifyHandleDictLinesList = stringifyHandleDictLinesList;
//# sourceMappingURL=index.cjs.development.cjs.map
