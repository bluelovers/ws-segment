"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._get_text = _get_text;
const crlf_normalize_1 = require("crlf-normalize");
function _get_text(text) {
    try {
        if (Buffer.isBuffer(text)) {
            text = text.toString();
        }
    }
    catch (e) { }
    finally {
        if (typeof text !== 'string') {
            throw new TypeError(`text must is string or Buffer`);
        }
        text = (0, crlf_normalize_1.crlf)(text);
    }
    return text;
}
//# sourceMappingURL=_get_text.js.map