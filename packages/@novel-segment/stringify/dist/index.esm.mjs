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

export { stringify as default, stringify };
//# sourceMappingURL=index.esm.mjs.map
