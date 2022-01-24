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

export { stringify as default, stringify, stringifyList };
//# sourceMappingURL=index.esm.mjs.map
