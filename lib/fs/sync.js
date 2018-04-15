"use strict";
/**
 * Created by user on 2018/4/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const stream = require("stream");
const fs = require("fs");
const path = require("path");
const line_1 = require("./line");
function createLoadStreamSync(file, options = {}) {
    options.onready = options.onready || function (src, ...argv) {
        this.value = this.value || [];
    };
    options.mapper = options.mapper || function (data) {
        return data;
    };
    options.ondata = options.ondata || function (data) {
        this.value = this.value || [];
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
        .pipe(line_1.byLine(fn, options));
}
exports.createStreamLineSync = createStreamLineSync;
function createReadStreamSync(file) {
    return new ReadableSync(file);
}
exports.createReadStreamSync = createReadStreamSync;
class ReadableSync extends stream.Readable {
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
                this.path = path.resolve(file);
            }
            this.fd = fs.openSync(this.path, this.flags);
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
        let readBuffer = new Buffer(this.options.readChunk);
        let bytesRead = fs.readSync(this.fd, readBuffer, 0, this.options.readChunk, this.bytesRead);
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
