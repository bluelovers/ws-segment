import { inspect } from 'util';
import { fail } from 'assert';

function _handleLazyMatchOptions(options = {}) {
  var _options, _options$inspectFn;

  (_options = options) !== null && _options !== void 0 ? _options : options = {};
  return { ...options,
    inspectFn: (_options$inspectFn = options.inspectFn) !== null && _options$inspectFn !== void 0 ? _options$inspectFn : inspect
  };
}
function lazyMatch(a, b, options = {}) {
  let i = null;

  const {
    inspectFn,
    firstOne
  } = _handleLazyMatchOptions(options);

  let bool = b.every(function (value, index, array) {
    let j = -1;
    let ii = i;

    if (i == null) {
      i = -1;
    }

    if (Array.isArray(value)) {
      if (firstOne) {
        value.some(function (bb) {
          let jj = a.indexOf(bb, ii);

          if (jj > -1 && jj > i) {
            j = jj;
            return true;
          }
        });
      } else {
        j = value.reduce(function (aa, bb) {
          let jj = a.indexOf(bb, ii);

          if (jj > -1 && jj > i) {
            if (aa == -1) {
              return jj;
            }

            return Math.min(jj, aa);
          }

          return aa;
        }, -1);
      }
    } else {
      j = a.indexOf(value, ii);
    }

    if (j > -1 && j > i) {
      i = j;
      return true;
    }
  });

  if (i === -1) {
    bool = false;
  }

  !bool && fail(`expected ${inspectFn(a)} to have includes ordered members ${inspectFn(b)}`);
  return bool;
}
function lazyMatch002(a, b_arr, options = {}) {
  let bool;
  options = _handleLazyMatchOptions(options);

  for (let b of b_arr) {
    try {
      bool = lazyMatch(a, b, options);

      if (bool) {
        break;
      }
    } catch (e) {}
  }

  !bool && fail(`expected ${options.inspectFn(a)} to have includes one of ordered members in ${options.inspectFn(b_arr)}`);
}
function lazyMatchSynonym001(a, b_arr, options = {}) {
  let bool;
  let i = undefined;

  const {
    inspectFn,
    firstOne
  } = _handleLazyMatchOptions(options);

  bool = b_arr.every(function (bb) {
    let ii = i;

    if (i == null) {
      i = -1;
    }

    let j = -1;

    if (Array.isArray(bb)) {
      bb.some(v => {
        let jj = a.indexOf(v, ii);

        if (jj > -1) {
          j = jj;
          bb = v;
          return true;
        }
      });
    } else {
      j = a.indexOf(bb, ii);
    }

    if (j > -1 && j >= i) {
      i = j + bb.length;
      return true;
    } else if (i > -1) {
      fail(`expected ${inspectFn(a)} to have have ${inspectFn(bb)} on index > ${i}, but got ${j}`);
    }
  });

  if (i === -1) {
    bool = false;
  }

  !bool && fail(`expected ${inspectFn(a)} to have index of ordered members in ${inspectFn(b_arr)}`);
}
function lazyMatchSynonym001Not(a, b_arr, options = {}) {
  let i = undefined;

  const {
    inspectFn,
    firstOne
  } = _handleLazyMatchOptions(options);

  b_arr.every(function (bb) {
    let ii = i;

    if (i == null) {
      i = -1;
    }

    let j = -1;

    if (Array.isArray(bb)) {
      bb.some(v => {
        let jj = a.indexOf(v, ii);

        if (jj > -1) {
          j = jj;
          bb = v;
          return true;
        }
      });
    } else {
      j = a.indexOf(bb, ii);
    }

    if (j > -1 && j > i) {
      fail(`expected ${inspectFn(a)} to not have ${inspectFn(bb)} on index > ${i}, but got ${j}`);
      return true;
    } else {
      i++;
    }
  });
}
function lazyMatchNot(a, b, options = {}) {
  let i = null;

  const {
    inspectFn,
    firstOne
  } = _handleLazyMatchOptions(options);

  let bool = b.every(function (value, index, array) {
    let j = -1;
    let ii = i;

    if (i == null) {
      i = -1;
    }

    if (Array.isArray(value)) {
      if (options.firstOne) {
        value.some(function (bb) {
          let jj = a.indexOf(bb, ii);

          if (jj > -1 && jj > i) {
            j = jj;
            return true;
          }
        });
      } else {
        j = value.reduce(function (aa, bb) {
          let jj = a.indexOf(bb, ii);

          if (jj > -1 && jj > i) {
            if (aa == -1) {
              return jj;
            }

            return Math.min(jj, aa);
          }

          return aa;
        }, -1);
      }
    } else {
      j = a.indexOf(value, ii);
    }

    if (j > -1) {
      i = j;
      return false;
    } else {
      return true;
    }
  });

  if (i === -1) {
    bool = true;
  }

  !bool && fail(`expected ${inspectFn(a)} should not have includes ordered members ${inspectFn(b)}`);
  return bool;
}

export { _handleLazyMatchOptions, lazyMatch, lazyMatch002, lazyMatchNot, lazyMatchSynonym001, lazyMatchSynonym001Not };
//# sourceMappingURL=index.esm.mjs.map
