"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_1 = require("./line");
function createLoadStream(file, options = {}) {
    options.mapper = options.mapper || function (data) {
        return data;
    };
    options.ondata = options.ondata || function (data) {
        this.value = this.value || [];
        this.value.push(data);
    };
    let stream = line_1.createStreamLine(file, options.mapper, {
        ondata: options.ondata,
        onclose() {
            if (options.callback) {
                options.callback.call(this, null, stream.value, stream);
            }
        }
    });
    return stream;
}
exports.createLoadStream = createLoadStream;
exports.default = createLoadStream;
