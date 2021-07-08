"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoadStream = void 0;
const line_1 = require("./line");
function createLoadStream(file, options = {}) {
    options.onready = options.onready || function (src, ...argv) {
        // @ts-ignore
        this.value = this.value || [];
    };
    options.mapper = options.mapper || function (data) {
        return data;
    };
    options.ondata = options.ondata || function (data) {
        // @ts-ignore
        this.value = this.value || [];
        // @ts-ignore
        this.value.push(data);
    };
    let stream = (0, line_1.createStreamLine)(file, options.mapper, {
        onready: options.onready,
        ondata: options.ondata,
        onclose() {
            if (options.callback) {
                options.callback.call(this, null, stream.value, stream);
            }
        },
    });
    return stream;
}
exports.createLoadStream = createLoadStream;
exports.default = createLoadStream;
//# sourceMappingURL=stream.js.map