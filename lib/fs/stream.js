"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_1 = require("./line");
function createLoadStream(file, options = {}) {
    options.onready = options.onready || function (src, ...argv) {
        this.value = this.value || [];
    };
    options.mapper = options.mapper || function (data) {
        return data;
    };
    options.ondata = options.ondata || function (data) {
        this.value.push(data);
    };
    let stream = line_1.createStreamLine(file, options.mapper, {
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
