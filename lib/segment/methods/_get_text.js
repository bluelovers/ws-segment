"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._get_text = void 0;
const crlf_normalize_1 = require("crlf-normalize");
function _get_text(text) {
    try {
        if (Buffer.isBuffer(text)) {
            text = text.toString();
        }
    }
    catch (e) { }
    finally {
        if (typeof text != 'string') {
            throw new TypeError(`text must is string or Buffer`);
        }
        text = crlf_normalize_1.crlf(text);
    }
    return text;
}
exports._get_text = _get_text;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2dldF90ZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiX2dldF90ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1EQUFzQztBQUV0QyxTQUFnQixTQUFTLENBQUMsSUFBcUI7SUFFOUMsSUFDQTtRQUNDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFDekI7WUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3ZCO0tBQ0Q7SUFDRCxPQUFPLENBQUMsRUFDUixHQUFFO1lBRUY7UUFDQyxJQUFJLE9BQU8sSUFBSSxJQUFJLFFBQVEsRUFDM0I7WUFDQyxNQUFNLElBQUksU0FBUyxDQUFDLCtCQUErQixDQUFDLENBQUE7U0FDcEQ7UUFFRCxJQUFJLEdBQUcscUJBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNsQjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2IsQ0FBQztBQXRCRCw4QkFzQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmxmIH0gZnJvbSAnY3JsZi1ub3JtYWxpemUnO1xuXG5leHBvcnQgZnVuY3Rpb24gX2dldF90ZXh0KHRleHQ6IHN0cmluZyB8IEJ1ZmZlcik6IHN0cmluZ1xue1xuXHR0cnlcblx0e1xuXHRcdGlmIChCdWZmZXIuaXNCdWZmZXIodGV4dCkpXG5cdFx0e1xuXHRcdFx0dGV4dCA9IHRleHQudG9TdHJpbmcoKTtcblx0XHR9XG5cdH1cblx0Y2F0Y2ggKGUpXG5cdHt9XG5cdGZpbmFsbHlcblx0e1xuXHRcdGlmICh0eXBlb2YgdGV4dCAhPSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGB0ZXh0IG11c3QgaXMgc3RyaW5nIG9yIEJ1ZmZlcmApXG5cdFx0fVxuXG5cdFx0dGV4dCA9IGNybGYodGV4dCk7XG5cdH1cblxuXHRyZXR1cm4gdGV4dDtcbn1cbiJdfQ==