'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function stringifyList(words, ...argv) {
  return words.map(function (item) {
    if (typeof item === 'string') {
      return item;
    } else if ('w' in item) {
      return item.w;
    } else {
      throw new TypeError(`not a valid segment result list`);
    }
  });
}
function stringify(words, ...argv) {
  return stringifyList(words, ...argv).join('');
}

exports.default = stringify;
exports.stringify = stringify;
exports.stringifyList = stringifyList;
//# sourceMappingURL=index.cjs.development.cjs.map
