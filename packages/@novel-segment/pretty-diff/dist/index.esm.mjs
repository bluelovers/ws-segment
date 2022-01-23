import { crlf } from 'crlf-normalize';
import { console, chalkByConsole } from 'debug-color2';
import { diffChars } from 'diff';
import { cn2tw_min } from '@lazy-cjk/zh-convert/min';
import { stringify } from '@novel-segment/stringify';

function printPrettyDiff(text_old, text_new) {
  text_old = crlf(stringify([text_old].flat()));
  text_new = crlf(stringify([text_new].flat()));
  const changed = text_old !== text_new;

  if (changed) {
    console.red(`changed: ${changed}`);
  }

  console.gray("------------------");

  if (changed) {
    console.success(diff_log(text_old, text_new));
  } else {
    console.log(text_new);
  }

  console.gray("------------------");
  const text_new2 = cn2tw_min(text_new);

  if (text_new !== text_new2) {
    console.log(diff_log(text_new, text_new2));
    console.gray("------------------");
  }

  return {
    text_old,
    text_new,
    changed,
    text_new2
  };
}
function diff_log(src_text, new_text) {
  let diff = diffChars(src_text, new_text);
  return chalkByConsole(function (chalk, _console) {
    let diff_arr = diff.reduce(function (a, part) {
      let color = part.added ? 'green' : part.removed ? 'red' : 'grey';
      let t = chalk[color](part.value);
      a.push(t);
      return a;
    }, []);
    return diff_arr.join('');
  });
}

export { printPrettyDiff as default, diff_log, printPrettyDiff };
//# sourceMappingURL=index.esm.mjs.map
