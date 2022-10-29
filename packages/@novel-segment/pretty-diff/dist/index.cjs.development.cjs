'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var crlfNormalize = require('crlf-normalize');
var debugColor2 = require('debug-color2');
var diff = require('diff');
var min = require('@lazy-cjk/zh-convert/min');
var stringify = require('@novel-segment/stringify');

function printPrettyDiff(text_old, text_new) {
  text_old = crlfNormalize.crlf(stringify.stringify([text_old].flat()));
  text_new = crlfNormalize.crlf(stringify.stringify([text_new].flat()));
  const changed = text_old !== text_new;
  if (changed) {
    debugColor2.console.red(`changed: ${changed}`);
  }
  debugColor2.console.gray("------------------");
  if (changed) {
    debugColor2.console.success(diff_log(text_old, text_new));
  } else {
    debugColor2.console.log(text_new);
  }
  debugColor2.console.gray("------------------");
  const text_new2 = min.cn2tw_min(text_new);
  if (text_new !== text_new2) {
    debugColor2.console.log(diff_log(text_new, text_new2));
    debugColor2.console.gray("------------------");
  }
  return {
    text_old,
    text_new,
    changed,
    text_new2
  };
}
function diff_log(src_text, new_text) {
  let diff$1 = diff.diffChars(src_text, new_text);
  return debugColor2.chalkByConsole(function (chalk, _console) {
    let diff_arr = diff$1.reduce(function (a, part) {
      let color = part.added ? 'green' : part.removed ? 'red' : 'grey';
      let t = chalk[color](part.value);
      a.push(t);
      return a;
    }, []);
    return diff_arr.join('');
  });
}

exports.default = printPrettyDiff;
exports.diff_log = diff_log;
exports.printPrettyDiff = printPrettyDiff;
//# sourceMappingURL=index.cjs.development.cjs.map
