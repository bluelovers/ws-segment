"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexOf = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhPZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluZGV4T2YudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUE7Ozs7Ozs7R0FPRztBQUNILFNBQWdCLE9BQU8sQ0FBQyxLQUFjLEVBQUUsQ0FBa0IsRUFBRSxHQUFZLEVBQUUsR0FBRyxJQUFJO0lBRWhGLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQzNCLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFFMUMsT0FBTyxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFDekI7UUFDQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTyxHQUFHLENBQUM7UUFDbkMsR0FBRyxFQUFFLENBQUM7S0FDTjtJQUVELE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDWCxDQUFDO0FBWkQsMEJBWUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJV29yZCB9IGZyb20gJy4uL3R5cGVzJztcblxuLyoqXG4gKiDlnKjljZXor43mlbDnu4TkuK3mn6Xmib7mn5DkuIDkuKrljZXor43miJbor43mgKfmiYDlnKjnmoTkvY3nva5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSB3b3JkcyDljZXor43mlbDnu4RcbiAqIEBwYXJhbSB7TnVtYmVyfFN0cmluZ30gcyDopoHmn6Xmib7nmoTljZXor43miJbor43mgKdcbiAqIEBwYXJhbSB7TnVtYmVyfSBjdXIg5byA5aeL5L2N572uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IOaJvuS4jeWIsO+8jOi/lOWbni0xXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmRleE9mKHdvcmRzOiBJV29yZFtdLCBzOiBzdHJpbmcgfCBudW1iZXIsIGN1cj86IG51bWJlciwgLi4uYXJndilcbntcblx0Y3VyID0gaXNOYU4oY3VyKSA/IDAgOiBjdXI7XG5cdGxldCBmID0gdHlwZW9mIHMgPT09ICdzdHJpbmcnID8gJ3cnIDogJ3AnO1xuXG5cdHdoaWxlIChjdXIgPCB3b3Jkcy5sZW5ndGgpXG5cdHtcblx0XHRpZiAod29yZHNbY3VyXVtmXSA9PSBzKSByZXR1cm4gY3VyO1xuXHRcdGN1cisrO1xuXHR9XG5cblx0cmV0dXJuIC0xO1xufVxuIl19