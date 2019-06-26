"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 根据某个单词或词性来分割单词数组
 *
 * @param {Array} words 单词数组
 * @param {Number|String} s 用于分割的单词或词性
 * @return {Array}
 */
function split(words, s, ...argv) {
    let ret = [];
    let lasti = 0;
    let i = 0;
    let f = typeof s === 'string' ? 'w' : 'p';
    while (i < words.length) {
        if (words[i][f] == s) {
            if (lasti < i)
                ret.push(words.slice(lasti, i));
            ret.push(words.slice(i, i + 1));
            i++;
            lasti = i;
        }
        else {
            i++;
        }
    }
    if (lasti < words.length - 1) {
        ret.push(words.slice(lasti, words.length));
    }
    return ret;
}
exports.split = split;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BsaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcGxpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBOzs7Ozs7R0FNRztBQUNILFNBQWdCLEtBQUssQ0FBQyxLQUFjLEVBQUUsQ0FBa0IsRUFBRSxHQUFHLElBQUk7SUFFaEUsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUUxQyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUN2QjtRQUNDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDcEI7WUFDQyxJQUFJLEtBQUssR0FBRyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLENBQUMsRUFBRSxDQUFDO1lBQ0osS0FBSyxHQUFHLENBQUMsQ0FBQztTQUNWO2FBRUQ7WUFDQyxDQUFDLEVBQUUsQ0FBQztTQUNKO0tBQ0Q7SUFDRCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDNUI7UUFDQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQzNDO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBM0JELHNCQTJCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElXb3JkIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vKipcbiAqIOagueaNruafkOS4quWNleivjeaIluivjeaAp+adpeWIhuWJsuWNleivjeaVsOe7hFxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuICogQHBhcmFtIHtOdW1iZXJ8U3RyaW5nfSBzIOeUqOS6juWIhuWJsueahOWNleivjeaIluivjeaAp1xuICogQHJldHVybiB7QXJyYXl9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdCh3b3JkczogSVdvcmRbXSwgczogc3RyaW5nIHwgbnVtYmVyLCAuLi5hcmd2KTogSVdvcmRbXVxue1xuXHRsZXQgcmV0ID0gW107XG5cdGxldCBsYXN0aSA9IDA7XG5cdGxldCBpID0gMDtcblx0bGV0IGYgPSB0eXBlb2YgcyA9PT0gJ3N0cmluZycgPyAndycgOiAncCc7XG5cblx0d2hpbGUgKGkgPCB3b3Jkcy5sZW5ndGgpXG5cdHtcblx0XHRpZiAod29yZHNbaV1bZl0gPT0gcylcblx0XHR7XG5cdFx0XHRpZiAobGFzdGkgPCBpKSByZXQucHVzaCh3b3Jkcy5zbGljZShsYXN0aSwgaSkpO1xuXHRcdFx0cmV0LnB1c2god29yZHMuc2xpY2UoaSwgaSArIDEpKTtcblx0XHRcdGkrKztcblx0XHRcdGxhc3RpID0gaTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGkrKztcblx0XHR9XG5cdH1cblx0aWYgKGxhc3RpIDwgd29yZHMubGVuZ3RoIC0gMSlcblx0e1xuXHRcdHJldC5wdXNoKHdvcmRzLnNsaWNlKGxhc3RpLCB3b3Jkcy5sZW5ndGgpKTtcblx0fVxuXG5cdHJldHVybiByZXQ7XG59XG4iXX0=