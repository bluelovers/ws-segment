'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function stringify(words, ...argv) {
  return words.map(function (item) {
    if (typeof item === 'string') {
      return item;
    } else if ('w' in item) {
      return item.w;
    } else {
      throw new TypeError(`not a valid segment result list`);
    }
  }).join('');
}

exports["default"] = stringify;
exports.stringify = stringify;
//# sourceMappingURL=index.cjs.development.cjs.map
