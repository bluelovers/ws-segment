"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.AdjectiveOptimizer = void 0;
const mod_1 = require("../mod");
const COLORS_1 = require("../mod/COLORS");
/**
 * 把一些错认为名词的词标注为形容词，或者对名词作定语的情况
 */
class AdjectiveOptimizer extends mod_1.SubSModuleOptimizer {
    constructor() {
        super(...arguments);
        this.name = 'AdjectiveOptimizer';
    }
    doOptimize(words) {
        const POSTAG = this._POSTAG;
        let index = 0;
        while (index < words.length) {
            const word = words[index];
            const nextword = words[index + 1];
            if (nextword) {
                // 对于<颜色>+<的>，直接判断颜色是形容词（字典里颜色都是名词）
                if (nextword.p & POSTAG.D_U && COLORS_1.COLOR_ALL[word.w]) {
                    word.op = word.op || word.p;
                    word.p |= POSTAG.D_A;
                    this.debugToken(word, {
                        [this.name]: true,
                    });
                }
                // 如果是连续的两个名词，前一个是颜色，那这个颜色也是形容词
                if (word.p & POSTAG.D_N && this.isNominal(nextword.p) && COLORS_1.COLOR_ALL[word.w]) {
                    word.op = word.op || word.p;
                    word.p |= POSTAG.D_A;
                    word.p |= POSTAG.D_N;
                    this.debugToken(word, {
                        [this.name]: true,
                    });
                }
            }
            // 移到下一个单词
            index += 1;
        }
        return words;
    }
    isNominal(pos) {
        /*
        if (Array.isArray(pos))
        {
            return this.isNominal(pos[0]);
        }
        */
        const POSTAG = this._POSTAG;
        return (pos === POSTAG.D_N ||
            pos === POSTAG.A_NT ||
            pos === POSTAG.A_NX ||
            pos === POSTAG.A_NZ ||
            pos === POSTAG.A_NR ||
            pos === POSTAG.A_NS ||
            pos === POSTAG.URL);
    }
}
exports.AdjectiveOptimizer = AdjectiveOptimizer;
exports.init = AdjectiveOptimizer.init.bind(AdjectiveOptimizer);
exports.default = AdjectiveOptimizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRqZWN0aXZlT3B0aW1pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQWRqZWN0aXZlT3B0aW1pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGdDQUF5RDtBQUd6RCwwQ0FBMEM7QUFHMUM7O0dBRUc7QUFDSCxNQUFhLGtCQUFtQixTQUFRLHlCQUFtQjtJQUEzRDs7UUFFQyxTQUFJLEdBQUcsb0JBQW9CLENBQUM7SUE2RDdCLENBQUM7SUEzREEsVUFBVSxDQUFDLEtBQW1CO1FBRTdCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDNUIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsT0FBTyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFDM0I7WUFDQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUIsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNsQyxJQUFJLFFBQVEsRUFDWjtnQkFDQyxtQ0FBbUM7Z0JBQ25DLElBQUksUUFBUSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxJQUFJLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUNoRDtvQkFDQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDNUIsSUFBSSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDO29CQUVyQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRTt3QkFDckIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSTtxQkFDakIsQ0FBQyxDQUFDO2lCQUNIO2dCQUVELCtCQUErQjtnQkFDL0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQzFFO29CQUNDLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUM1QixJQUFJLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUM7b0JBQ3JCLElBQUksQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQztvQkFFckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUU7d0JBQ3JCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUk7cUJBQ2pCLENBQUMsQ0FBQztpQkFDSDthQUNEO1lBQ0QsVUFBVTtZQUNWLEtBQUssSUFBSSxDQUFDLENBQUM7U0FDWDtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELFNBQVMsQ0FBQyxHQUFzQjtRQUUvQjs7Ozs7VUFLRTtRQUVGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDNUIsT0FBTyxDQUNOLEdBQUcsS0FBSyxNQUFNLENBQUMsR0FBRztZQUNsQixHQUFHLEtBQUssTUFBTSxDQUFDLElBQUk7WUFDbkIsR0FBRyxLQUFLLE1BQU0sQ0FBQyxJQUFJO1lBQ25CLEdBQUcsS0FBSyxNQUFNLENBQUMsSUFBSTtZQUNuQixHQUFHLEtBQUssTUFBTSxDQUFDLElBQUk7WUFDbkIsR0FBRyxLQUFLLE1BQU0sQ0FBQyxJQUFJO1lBQ25CLEdBQUcsS0FBSyxNQUFNLENBQUMsR0FBRyxDQUNsQixDQUFDO0lBQ0gsQ0FBQztDQUNEO0FBL0RELGdEQStEQztBQUVZLFFBQUEsSUFBSSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQW1DLENBQUM7QUFFdkcsa0JBQWUsa0JBQWtCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdWJTTW9kdWxlLCBTdWJTTW9kdWxlT3B0aW1pemVyIH0gZnJvbSAnLi4vbW9kJztcbmltcG9ydCBTZWdtZW50LCB7IElXb3JkIH0gZnJvbSAnLi4vU2VnbWVudCc7XG5cbmltcG9ydCB7IENPTE9SX0FMTCB9IGZyb20gJy4uL21vZC9DT0xPUlMnO1xuaW1wb3J0IHsgSVdvcmREZWJ1ZyB9IGZyb20gJy4uL3V0aWwnO1xuXG4vKipcbiAqIOaKiuS4gOS6m+mUmeiupOS4uuWQjeivjeeahOivjeagh+azqOS4uuW9ouWuueivje+8jOaIluiAheWvueWQjeivjeS9nOWumuivreeahOaDheWGtVxuICovXG5leHBvcnQgY2xhc3MgQWRqZWN0aXZlT3B0aW1pemVyIGV4dGVuZHMgU3ViU01vZHVsZU9wdGltaXplclxue1xuXHRuYW1lID0gJ0FkamVjdGl2ZU9wdGltaXplcic7XG5cblx0ZG9PcHRpbWl6ZSh3b3JkczogSVdvcmREZWJ1Z1tdKTogSVdvcmREZWJ1Z1tdXG5cdHtcblx0XHRjb25zdCBQT1NUQUcgPSB0aGlzLl9QT1NUQUc7XG5cdFx0bGV0IGluZGV4ID0gMDtcblx0XHR3aGlsZSAoaW5kZXggPCB3b3Jkcy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Y29uc3Qgd29yZCA9IHdvcmRzW2luZGV4XTtcblx0XHRcdGNvbnN0IG5leHR3b3JkID0gd29yZHNbaW5kZXggKyAxXTtcblx0XHRcdGlmIChuZXh0d29yZClcblx0XHRcdHtcblx0XHRcdFx0Ly8g5a+55LqOPOminOiJsj4rPOeahD7vvIznm7TmjqXliKTmlq3popzoibLmmK/lvaLlrrnor43vvIjlrZflhbjph4zpopzoibLpg73mmK/lkI3or43vvIlcblx0XHRcdFx0aWYgKG5leHR3b3JkLnAgJiBQT1NUQUcuRF9VICYmIENPTE9SX0FMTFt3b3JkLnddKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0d29yZC5vcCA9IHdvcmQub3AgfHwgd29yZC5wO1xuXHRcdFx0XHRcdHdvcmQucCB8PSBQT1NUQUcuRF9BO1xuXG5cdFx0XHRcdFx0dGhpcy5kZWJ1Z1Rva2VuKHdvcmQsIHtcblx0XHRcdFx0XHRcdFt0aGlzLm5hbWVdOiB0cnVlLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8g5aaC5p6c5piv6L+e57ut55qE5Lik5Liq5ZCN6K+N77yM5YmN5LiA5Liq5piv6aKc6Imy77yM6YKj6L+Z5Liq6aKc6Imy5Lmf5piv5b2i5a656K+NXG5cdFx0XHRcdGlmICh3b3JkLnAgJiBQT1NUQUcuRF9OICYmIHRoaXMuaXNOb21pbmFsKG5leHR3b3JkLnApICYmIENPTE9SX0FMTFt3b3JkLnddKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0d29yZC5vcCA9IHdvcmQub3AgfHwgd29yZC5wO1xuXHRcdFx0XHRcdHdvcmQucCB8PSBQT1NUQUcuRF9BO1xuXHRcdFx0XHRcdHdvcmQucCB8PSBQT1NUQUcuRF9OO1xuXG5cdFx0XHRcdFx0dGhpcy5kZWJ1Z1Rva2VuKHdvcmQsIHtcblx0XHRcdFx0XHRcdFt0aGlzLm5hbWVdOiB0cnVlLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyDnp7vliLDkuIvkuIDkuKrljZXor41cblx0XHRcdGluZGV4ICs9IDE7XG5cdFx0fVxuXHRcdHJldHVybiB3b3Jkcztcblx0fVxuXG5cdGlzTm9taW5hbChwb3M6IG51bWJlciB8IG51bWJlcltdKTogYm9vbGVhblxuXHR7XG5cdFx0Lypcblx0XHRpZiAoQXJyYXkuaXNBcnJheShwb3MpKVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLmlzTm9taW5hbChwb3NbMF0pO1xuXHRcdH1cblx0XHQqL1xuXG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5fUE9TVEFHO1xuXHRcdHJldHVybiAoXG5cdFx0XHRwb3MgPT09IFBPU1RBRy5EX04gfHxcblx0XHRcdHBvcyA9PT0gUE9TVEFHLkFfTlQgfHxcblx0XHRcdHBvcyA9PT0gUE9TVEFHLkFfTlggfHxcblx0XHRcdHBvcyA9PT0gUE9TVEFHLkFfTlogfHxcblx0XHRcdHBvcyA9PT0gUE9TVEFHLkFfTlIgfHxcblx0XHRcdHBvcyA9PT0gUE9TVEFHLkFfTlMgfHxcblx0XHRcdHBvcyA9PT0gUE9TVEFHLlVSTFxuXHRcdCk7XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGluaXQgPSBBZGplY3RpdmVPcHRpbWl6ZXIuaW5pdC5iaW5kKEFkamVjdGl2ZU9wdGltaXplcikgYXMgdHlwZW9mIEFkamVjdGl2ZU9wdGltaXplci5pbml0O1xuXG5leHBvcnQgZGVmYXVsdCBBZGplY3RpdmVPcHRpbWl6ZXJcbiJdfQ==