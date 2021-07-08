"use strict";
/**
 * Created by user on 2018/4/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadableSync = exports.createReadStreamSync = exports.createStreamLineSync = exports.createLoadStreamSync = void 0;
const stream_1 = require("stream");
const fs_1 = require("fs");
const path_1 = require("path");
const line_1 = require("./line");
function createLoadStreamSync(file, options = {}) {
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
    let stream = createStreamLineSync(file, options.mapper, {
        onready: options.onready,
        ondata: options.ondata,
        onclose() {
            if (options.callback) {
                options.callback.call(this, null, stream.value, stream);
            }
        }
    });
    // @ts-ignore
    stream.pipeFrom.run();
    return stream;
}
exports.createLoadStreamSync = createLoadStreamSync;
function createStreamLineSync(file, fn, options) {
    return createReadStreamSync(file)
        .pipe((0, line_1.byLine)(fn, options));
}
exports.createStreamLineSync = createStreamLineSync;
function createReadStreamSync(file) {
    return new ReadableSync(file);
}
exports.createReadStreamSync = createReadStreamSync;
class ReadableSync extends stream_1.Readable {
    constructor(file) {
        super();
        this.fd = null;
        this.flags = 'r';
        this.bytesRead = 0;
        this.options = {
            readChunk: 1024,
        };
        this.path = file;
        if (typeof file === 'number') {
            this.fd = file;
        }
        else {
            if (typeof file == 'string') {
                this.path = (0, path_1.resolve)(file);
            }
            this.fd = (0, fs_1.openSync)(this.path, this.flags);
        }
        this.pause();
    }
    _read(size) {
        let buffers = [];
        let bytesRead;
        do {
            bytesRead = this.__read(size);
            if (bytesRead !== null) {
                buffers.push(bytesRead);
            }
        } while (bytesRead !== null);
        let bufferData = Buffer.concat(buffers);
        this.push(bufferData);
        //this._destroy(null, () => undefined);
        return bufferData;
    }
    __read(size) {
        //let readBuffer = new Buffer(this.options.readChunk);
        let readBuffer = Buffer.alloc(this.options.readChunk);
        let bytesRead = (0, fs_1.readSync)(this.fd, readBuffer, 0, this.options.readChunk, this.bytesRead);
        if (bytesRead === 0) {
            this.fdEnd = true;
            return null;
        }
        this.bytesRead += bytesRead;
        if (bytesRead < this.options.readChunk) {
            this.fdEnd = true;
            readBuffer = readBuffer.slice(0, bytesRead);
        }
        return readBuffer;
    }
    run() {
        this.resume();
        this.emit('ready', this);
        let i = 0;
        while (!this.fdEnd) {
            let k = this.read();
        }
        //let bufferData = this.__read(this.options.readChunk);
        //this.emit('data', bufferData);
        return this;
    }
}
exports.ReadableSync = ReadableSync;
exports.default = createLoadStreamSync;
//# sourceMappingURL=sync.js.map