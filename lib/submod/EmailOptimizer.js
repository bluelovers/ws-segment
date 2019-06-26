'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
/**
 * 邮箱地址中允许出现的字符
 * 参考：http://www.cs.tut.fi/~jkorpela/rfc/822addr.html
 */
exports._EMAILCHAR = '!"#$%&\'*+-/0123456789=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`abcdefghijklmnopqrstuvwxyz{|}~.'.split('');
exports.EMAILCHAR = {};
for (let i in exports._EMAILCHAR)
    exports.EMAILCHAR[exports._EMAILCHAR[i]] = 1;
/**
 * 邮箱地址识别优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
class EmailOptimizer extends mod_1.SubSModuleOptimizer {
    /**
     * 对可能是邮箱地址的单词进行优化
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    doOptimize(words) {
        const POSTAG = this.segment.POSTAG;
        //debug(words);
        let i = 0;
        let ie = words.length - 1;
        let addr_start = false;
        let has_at = false;
        while (i < ie) {
            let word = words[i];
            let is_ascii = ((word.p == POSTAG.A_NX) ||
                (word.p == POSTAG.A_M && word.w.charCodeAt(0) < 128))
                ? true : false;
            // 如果是外文字符或者数字，符合电子邮件地址开头的条件
            // @ts-ignore
            if (addr_start === false && is_ascii) {
                addr_start = i;
                i++;
                continue;
            }
            else {
                // 如果遇到@符号，符合第二个条件
                if (has_at === false && word.w == '@') {
                    has_at = true;
                    i++;
                    continue;
                }
                // 如果已经遇到过@符号，且出现了其他字符，则截取邮箱地址
                if (has_at !== false && words[i - 1].w != '@' && is_ascii === false && !(word.w in exports.EMAILCHAR)) {
                    let mailws = words.slice(addr_start, i);
                    //debug(toEmailAddress(mailws));
                    words.splice(addr_start, mailws.length, {
                        w: this.toEmailAddress(mailws),
                        p: POSTAG.URL
                    });
                    i = addr_start + 1;
                    ie -= mailws.length - 1;
                    addr_start = false;
                    has_at = false;
                    continue;
                }
                // 如果已经开头
                if (addr_start !== false && (is_ascii || word.w in exports.EMAILCHAR)) {
                    i++;
                    continue;
                }
            }
            // 移到下一个词
            addr_start = false;
            has_at = false;
            i++;
        }
        // 检查剩余部分
        if (addr_start && has_at && words[ie]) {
            let word = words[ie];
            let is_ascii = ((word.p == POSTAG.A_NX) ||
                (word.p == POSTAG.A_M && word.w in exports.EMAILCHAR))
                ? true : false;
            if (is_ascii) {
                let mailws = words.slice(addr_start, words.length);
                //debug(toEmailAddress(mailws));
                words.splice(addr_start, mailws.length, {
                    w: this.toEmailAddress(mailws),
                    p: POSTAG.URL
                });
            }
        }
        return words;
    }
    /**
     * 根据一组单词生成邮箱地址
     *
     * @param {array} words 单词数组
     * @return {string}
     */
    toEmailAddress(words) {
        let ret = words[0].w;
        for (let i = 1, word; word = words[i]; i++) {
            ret += word.w;
        }
        return ret;
    }
}
exports.EmailOptimizer = EmailOptimizer;
exports.init = EmailOptimizer.init.bind(EmailOptimizer);
exports.default = EmailOptimizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW1haWxPcHRpbWl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJFbWFpbE9wdGltaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsZ0NBQThFO0FBSTlFOzs7R0FHRztBQUNVLFFBQUEsVUFBVSxHQUFHLHVGQUF1RixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMvRyxRQUFBLFNBQVMsR0FBa0IsRUFBRSxDQUFDO0FBQzNDLEtBQUssSUFBSSxDQUFDLElBQUksa0JBQVU7SUFBRSxpQkFBUyxDQUFDLGtCQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFdkQ7Ozs7R0FJRztBQUNILE1BQWEsY0FBZSxTQUFRLHlCQUFtQjtJQUd0RDs7Ozs7T0FLRztJQUNILFVBQVUsQ0FBQyxLQUFLO1FBRWYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDbkMsZUFBZTtRQUVmLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLElBQUksVUFBVSxHQUFxQixLQUFLLENBQUM7UUFDekMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBRW5CLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFDYjtZQUNDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUN0QyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDckQsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFD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RyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQzFDO1lBQ0MsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDZDtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUVEO0FBN0dELHdDQTZHQztBQUVZLFFBQUEsSUFBSSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBd0MsQ0FBQztBQUVwRyxrQkFBZSxjQUFjLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IFN1YlNNb2R1bGUsIFN1YlNNb2R1bGVPcHRpbWl6ZXIsIElTdWJPcHRpbWl6ZXJDcmVhdGUgfSBmcm9tICcuLi9tb2QnO1xuaW1wb3J0IHsgU2VnbWVudCwgSVdvcmQsIElESUNUIH0gZnJvbSAnLi4vU2VnbWVudCc7XG5pbXBvcnQgVVN0cmluZyBmcm9tICd1bmktc3RyaW5nJztcblxuLyoqXG4gKiDpgq7nrrHlnLDlnYDkuK3lhYHorrjlh7rnjrDnmoTlrZfnrKZcbiAqIOWPguiAg++8mmh0dHA6Ly93d3cuY3MudHV0LmZpL35qa29ycGVsYS9yZmMvODIyYWRkci5odG1sXG4gKi9cbmV4cG9ydCBjb25zdCBfRU1BSUxDSEFSID0gJyFcIiMkJSZcXCcqKy0vMDEyMzQ1Njc4OT0/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+Licuc3BsaXQoJycpO1xuZXhwb3J0IGNvbnN0IEVNQUlMQ0hBUjogSURJQ1Q8bnVtYmVyPiA9IHt9O1xuZm9yIChsZXQgaSBpbiBfRU1BSUxDSEFSKSBFTUFJTENIQVJbX0VNQUlMQ0hBUltpXV0gPSAxO1xuXG4vKipcbiAqIOmCrueuseWcsOWdgOivhuWIq+S8mOWMluaooeWdl1xuICpcbiAqIEBhdXRob3Ig6ICB6Zu3PGxlaXpvbmdtaW5AZ21haWwuY29tPlxuICovXG5leHBvcnQgY2xhc3MgRW1haWxPcHRpbWl6ZXIgZXh0ZW5kcyBTdWJTTW9kdWxlT3B0aW1pemVyXG57XG5cblx0LyoqXG5cdCAqIOWvueWPr+iDveaYr+mCrueuseWcsOWdgOeahOWNleivjei/m+ihjOS8mOWMllxuXHQgKlxuXHQgKiBAcGFyYW0ge2FycmF5fSB3b3JkcyDljZXor43mlbDnu4Rcblx0ICogQHJldHVybiB7YXJyYXl9XG5cdCAqL1xuXHRkb09wdGltaXplKHdvcmRzKVxuXHR7XG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5zZWdtZW50LlBPU1RBRztcblx0XHQvL2RlYnVnKHdvcmRzKTtcblxuXHRcdGxldCBpID0gMDtcblx0XHRsZXQgaWUgPSB3b3Jkcy5sZW5ndGggLSAxO1xuXHRcdGxldCBhZGRyX3N0YXJ0OiBib29sZWFuIHwgbnVtYmVyID0gZmFsc2U7XG5cdFx0bGV0IGhhc19hdCA9IGZhbHNlO1xuXG5cdFx0d2hpbGUgKGkgPCBpZSlcblx0XHR7XG5cdFx0XHRsZXQgd29yZCA9IHdvcmRzW2ldO1xuXHRcdFx0bGV0IGlzX2FzY2lpID0gKCh3b3JkLnAgPT0gUE9TVEFHLkFfTlgpIHx8XG5cdFx0XHRcdCh3b3JkLnAgPT0gUE9TVEFHLkFfTSAmJiB3b3JkLncuY2hhckNvZGVBdCgwKSA8IDEyOCkpXG5cdFx0XHRcdD8gdHJ1ZSA6IGZhbHNlO1xuXG5cdFx0XHQvLyDlpoLmnpzmmK/lpJbmloflrZfnrKbmiJbogIXmlbDlrZfvvIznrKblkIjnlLXlrZDpgq7ku7blnLDlnYDlvIDlpLTnmoTmnaHku7Zcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGlmIChhZGRyX3N0YXJ0ID09PSBmYWxzZSAmJiBpc19hc2NpaSlcblx0XHRcdHtcblx0XHRcdFx0YWRkcl9zdGFydCA9IGk7XG5cdFx0XHRcdGkrKztcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIOWmguaenOmBh+WIsEDnrKblj7fvvIznrKblkIjnrKzkuozkuKrmnaHku7Zcblx0XHRcdFx0aWYgKGhhc19hdCA9PT0gZmFsc2UgJiYgd29yZC53ID09ICdAJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGhhc19hdCA9IHRydWU7XG5cdFx0XHRcdFx0aSsrO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIOWmguaenOW3sue7j+mBh+WIsOi/h0DnrKblj7fvvIzkuJTlh7rnjrDkuoblhbbku5blrZfnrKbvvIzliJnmiKrlj5bpgq7nrrHlnLDlnYBcblx0XHRcdFx0aWYgKGhhc19hdCAhPT0gZmFsc2UgJiYgd29yZHNbaSAtIDFdLncgIT0gJ0AnICYmIGlzX2FzY2lpID09PSBmYWxzZSAmJiAhKHdvcmQudyBpbiBFTUFJTENIQVIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IG1haWx3cyA9IHdvcmRzLnNsaWNlKGFkZHJfc3RhcnQsIGkpO1xuXHRcdFx0XHRcdC8vZGVidWcodG9FbWFpbEFkZHJlc3MobWFpbHdzKSk7XG5cdFx0XHRcdFx0d29yZHMuc3BsaWNlKGFkZHJfc3RhcnQsIG1haWx3cy5sZW5ndGgsIHtcblx0XHRcdFx0XHRcdHc6IHRoaXMudG9FbWFpbEFkZHJlc3MobWFpbHdzKSxcblx0XHRcdFx0XHRcdHA6IFBPU1RBRy5VUkxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRpID0gPG51bWJlcj5hZGRyX3N0YXJ0ICsgMTtcblx0XHRcdFx0XHRpZSAtPSBtYWlsd3MubGVuZ3RoIC0gMTtcblx0XHRcdFx0XHRhZGRyX3N0YXJ0ID0gZmFsc2U7XG5cdFx0XHRcdFx0aGFzX2F0ID0gZmFsc2U7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8g5aaC5p6c5bey57uP5byA5aS0XG5cdFx0XHRcdGlmIChhZGRyX3N0YXJ0ICE9PSBmYWxzZSAmJiAoaXNfYXNjaWkgfHwgd29yZC53IGluIEVNQUlMQ0hBUikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8g56e75Yiw5LiL5LiA5Liq6K+NXG5cdFx0XHRhZGRyX3N0YXJ0ID0gZmFsc2U7XG5cdFx0XHRoYXNfYXQgPSBmYWxzZTtcblx0XHRcdGkrKztcblx0XHR9XG5cblx0XHQvLyDmo4Dmn6XliankvZnpg6jliIZcblx0XHRpZiAoYWRkcl9zdGFydCAmJiBoYXNfYXQgJiYgd29yZHNbaWVdKVxuXHRcdHtcblx0XHRcdGxldCB3b3JkID0gd29yZHNbaWVdO1xuXHRcdFx0bGV0IGlzX2FzY2lpID0gKCh3b3JkLnAgPT0gUE9TVEFHLkFfTlgpIHx8XG5cdFx0XHRcdCh3b3JkLnAgPT0gUE9TVEFHLkFfTSAmJiB3b3JkLncgaW4gRU1BSUxDSEFSKSlcblx0XHRcdFx0PyB0cnVlIDogZmFsc2U7XG5cdFx0XHRpZiAoaXNfYXNjaWkpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBtYWlsd3MgPSB3b3Jkcy5zbGljZShhZGRyX3N0YXJ0LCB3b3Jkcy5sZW5ndGgpO1xuXHRcdFx0XHQvL2RlYnVnKHRvRW1haWxBZGRyZXNzKG1haWx3cykpO1xuXHRcdFx0XHR3b3Jkcy5zcGxpY2UoYWRkcl9zdGFydCwgbWFpbHdzLmxlbmd0aCwge1xuXHRcdFx0XHRcdHc6IHRoaXMudG9FbWFpbEFkZHJlc3MobWFpbHdzKSxcblx0XHRcdFx0XHRwOiBQT1NUQUcuVVJMXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB3b3Jkcztcblx0fVxuXG5cdC8qKlxuXHQgKiDmoLnmja7kuIDnu4TljZXor43nlJ/miJDpgq7nrrHlnLDlnYBcblx0ICpcblx0ICogQHBhcmFtIHthcnJheX0gd29yZHMg5Y2V6K+N5pWw57uEXG5cdCAqIEByZXR1cm4ge3N0cmluZ31cblx0ICovXG5cdHRvRW1haWxBZGRyZXNzKHdvcmRzOiBJV29yZFtdKVxuXHR7XG5cdFx0bGV0IHJldCA9IHdvcmRzWzBdLnc7XG5cdFx0Zm9yIChsZXQgaSA9IDEsIHdvcmQ7IHdvcmQgPSB3b3Jkc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdHJldCArPSB3b3JkLnc7XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxufVxuXG5leHBvcnQgY29uc3QgaW5pdCA9IEVtYWlsT3B0aW1pemVyLmluaXQuYmluZChFbWFpbE9wdGltaXplcikgYXMgSVN1Yk9wdGltaXplckNyZWF0ZTxFbWFpbE9wdGltaXplcj47XG5cbmV4cG9ydCBkZWZhdWx0IEVtYWlsT3B0aW1pemVyO1xuIl19