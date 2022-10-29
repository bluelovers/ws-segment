"use strict";

function stringifyList(t, ...i) {
  return t.map((function(t) {
    if ("string" == typeof t) return t;
    if ("w" in t) return t.w;
    throw new TypeError("not a valid segment result list");
  }));
}

function stringify(t, ...i) {
  return stringifyList(t, ...i).join("");
}

Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.default = stringify, exports.stringify = stringify, exports.stringifyList = stringifyList;
//# sourceMappingURL=index.cjs.production.min.cjs.map
