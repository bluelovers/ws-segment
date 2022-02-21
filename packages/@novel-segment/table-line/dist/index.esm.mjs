import { stringifyLine } from '@novel-segment/loader-line';
import { AbstractTableDictCore } from '@novel-segment/table-core-abstract';

class TableDictLine extends AbstractTableDictCore {
  exists(data, ...argv) {
    let w = this._exists(data);

    let bool = this.TABLE[w];
    return typeof bool === 'boolean' ? bool : null;
  }

  add(word) {
    let self = this;

    if (Array.isArray(word)) {
      word.forEach(v => self._add(v));
    } else {
      self._add(word);
    }

    return this;
  }

  _add(word) {
    word = word.trim();

    if (word) {
      this.TABLE[word] = true;
    }
  }

  remove(word) {
    let self = this;

    self._remove(word);

    return this;
  }

  _remove(word) {
    delete this.TABLE[word];
  }

  stringify(LF = "\n") {
    let self = this;
    return Object.entries(self.TABLE).reduce(function (a, [w, bool]) {
      if (bool) {
        let line = stringifyLine(w);
        a.push(line);
      }

      return a;
    }, []).join(typeof LF === 'string' ? LF : "\n");
  }

}

export { TableDictLine, TableDictLine as default };
//# sourceMappingURL=index.esm.mjs.map
