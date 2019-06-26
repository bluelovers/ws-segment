"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2dldF90ZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiX2dldF90ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQXNDO0FBRXRDLFNBQWdCLFNBQVMsQ0FBQyxJQUFxQjtJQUU5QyxJQUNBO1FBQ0MsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUN6QjtZQUNDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDdkI7S0FDRDtJQUNELE9BQU8sQ0FBQyxFQUNSLEdBQUU7WUFFRjtRQUNDLElBQUksT0FBTyxJQUFJLElBQUksUUFBUSxFQUMzQjtZQUNDLE1BQU0sSUFBSSxTQUFTLENBQUMsK0JBQStCLENBQUMsQ0FBQTtTQUNwRDtRQUVELElBQUksR0FBRyxxQkFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2xCO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBdEJELDhCQXNCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNybGYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBfZ2V0X3RleHQodGV4dDogc3RyaW5nIHwgQnVmZmVyKTogc3RyaW5nXG57XG5cdHRyeVxuXHR7XG5cdFx0aWYgKEJ1ZmZlci5pc0J1ZmZlcih0ZXh0KSlcblx0XHR7XG5cdFx0XHR0ZXh0ID0gdGV4dC50b1N0cmluZygpO1xuXHRcdH1cblx0fVxuXHRjYXRjaCAoZSlcblx0e31cblx0ZmluYWxseVxuXHR7XG5cdFx0aWYgKHR5cGVvZiB0ZXh0ICE9ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYHRleHQgbXVzdCBpcyBzdHJpbmcgb3IgQnVmZmVyYClcblx0XHR9XG5cblx0XHR0ZXh0ID0gY3JsZih0ZXh0KTtcblx0fVxuXG5cdHJldHVybiB0ZXh0O1xufVxuIl19