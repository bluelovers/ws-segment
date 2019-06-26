"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 在单词数组中查找某一个单词或词性所在的位置
 *
 * @param {Array} words 单词数组
 * @param {Number|String} s 要查找的单词或词性
 * @param {Number} cur 开始位置
 * @return {Number} 找不到，返回-1
 */
function indexOf(words, s, cur, ...argv) {
    cur = isNaN(cur) ? 0 : cur;
    let f = typeof s === 'string' ? 'w' : 'p';
    while (cur < words.length) {
        if (words[cur][f] == s)
            return cur;
        cur++;
    }
    return -1;
}
exports.indexOf = indexOf;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhPZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluZGV4T2YudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7Ozs7OztHQU9HO0FBQ0gsU0FBZ0IsT0FBTyxDQUFDLEtBQWMsRUFBRSxDQUFrQixFQUFFLEdBQVksRUFBRSxHQUFHLElBQUk7SUFFaEYsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDM0IsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUUxQyxPQUFPLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUN6QjtRQUNDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBRSxPQUFPLEdBQUcsQ0FBQztRQUNuQyxHQUFHLEVBQUUsQ0FBQztLQUNOO0lBRUQsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNYLENBQUM7QUFaRCwwQkFZQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElXb3JkIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vKipcbiAqIOWcqOWNleivjeaVsOe7hOS4reafpeaJvuafkOS4gOS4quWNleivjeaIluivjeaAp+aJgOWcqOeahOS9jee9rlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuICogQHBhcmFtIHtOdW1iZXJ8U3RyaW5nfSBzIOimgeafpeaJvueahOWNleivjeaIluivjeaAp1xuICogQHBhcmFtIHtOdW1iZXJ9IGN1ciDlvIDlp4vkvY3nva5cbiAqIEByZXR1cm4ge051bWJlcn0g5om+5LiN5Yiw77yM6L+U5ZueLTFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluZGV4T2Yod29yZHM6IElXb3JkW10sIHM6IHN0cmluZyB8IG51bWJlciwgY3VyPzogbnVtYmVyLCAuLi5hcmd2KVxue1xuXHRjdXIgPSBpc05hTihjdXIpID8gMCA6IGN1cjtcblx0bGV0IGYgPSB0eXBlb2YgcyA9PT0gJ3N0cmluZycgPyAndycgOiAncCc7XG5cblx0d2hpbGUgKGN1ciA8IHdvcmRzLmxlbmd0aClcblx0e1xuXHRcdGlmICh3b3Jkc1tjdXJdW2ZdID09IHMpIHJldHVybiBjdXI7XG5cdFx0Y3VyKys7XG5cdH1cblxuXHRyZXR1cm4gLTE7XG59XG4iXX0=