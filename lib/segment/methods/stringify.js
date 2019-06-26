"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 将单词数组连接成字符串
 *
 * @param {Array} words 单词数组
 * @return {String}
 */
function stringify(words, ...argv) {
    return words.map(function (item) {
        if (typeof item === 'string') {
            return item;
        }
        else if ('w' in item) {
            return item.w;
        }
        else {
            throw new TypeError(`not a valid segment result list`);
        }
    }).join('');
}
exports.stringify = stringify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5naWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3RyaW5naWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUE7Ozs7O0dBS0c7QUFDSCxTQUFnQixTQUFTLENBQUMsS0FBNEIsRUFBRSxHQUFHLElBQUk7SUFFOUQsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSTtRQUU5QixJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFDNUI7WUFDQyxPQUFPLElBQUksQ0FBQztTQUNaO2FBQ0ksSUFBSSxHQUFHLElBQUksSUFBSSxFQUNwQjtZQUNDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztTQUNkO2FBRUQ7WUFDQyxNQUFNLElBQUksU0FBUyxDQUFDLGlDQUFpQyxDQUFDLENBQUE7U0FDdEQ7SUFDRixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDYixDQUFDO0FBakJELDhCQWlCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElXb3JkIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vKipcbiAqIOWwhuWNleivjeaVsOe7hOi/nuaOpeaIkOWtl+espuS4slxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5KHdvcmRzOiBBcnJheTxJV29yZCB8IHN0cmluZz4sIC4uLmFyZ3YpOiBzdHJpbmdcbntcblx0cmV0dXJuIHdvcmRzLm1hcChmdW5jdGlvbiAoaXRlbSlcblx0e1xuXHRcdGlmICh0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZycpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCd3JyBpbiBpdGVtKVxuXHRcdHtcblx0XHRcdHJldHVybiBpdGVtLnc7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBub3QgYSB2YWxpZCBzZWdtZW50IHJlc3VsdCBsaXN0YClcblx0XHR9XG5cdH0pLmpvaW4oJycpO1xufVxuIl19