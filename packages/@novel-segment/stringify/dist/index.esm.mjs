function stringifyList(i, ...t) {
  return i.map((function(i) {
    if ("string" == typeof i) return i;
    if ("w" in i) return i.w;
    throw new TypeError("not a valid segment result list");
  }));
}

function stringify(i, ...t) {
  return stringifyList(i, ...t).join("");
}

export { stringify as default, stringify, stringifyList };
//# sourceMappingURL=index.esm.mjs.map
