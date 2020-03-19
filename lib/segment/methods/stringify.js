"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5naWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3RyaW5naWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBOzs7OztHQUtHO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLEtBQTRCLEVBQUUsR0FBRyxJQUFJO0lBRTlELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUk7UUFFOUIsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQzVCO1lBQ0MsT0FBTyxJQUFJLENBQUM7U0FDWjthQUNJLElBQUksR0FBRyxJQUFJLElBQUksRUFDcEI7WUFDQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDZDthQUVEO1lBQ0MsTUFBTSxJQUFJLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFBO1NBQ3REO0lBQ0YsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2IsQ0FBQztBQWpCRCw4QkFpQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJV29yZCB9IGZyb20gJy4uL3R5cGVzJztcblxuLyoqXG4gKiDlsIbljZXor43mlbDnu4Tov57mjqXmiJDlrZfnrKbkuLJcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSB3b3JkcyDljZXor43mlbDnu4RcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeSh3b3JkczogQXJyYXk8SVdvcmQgfCBzdHJpbmc+LCAuLi5hcmd2KTogc3RyaW5nXG57XG5cdHJldHVybiB3b3Jkcy5tYXAoZnVuY3Rpb24gKGl0ZW0pXG5cdHtcblx0XHRpZiAodHlwZW9mIGl0ZW0gPT09ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdHJldHVybiBpdGVtO1xuXHRcdH1cblx0XHRlbHNlIGlmICgndycgaW4gaXRlbSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gaXRlbS53O1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgbm90IGEgdmFsaWQgc2VnbWVudCByZXN1bHQgbGlzdGApXG5cdFx0fVxuXHR9KS5qb2luKCcnKTtcbn1cbiJdfQ==