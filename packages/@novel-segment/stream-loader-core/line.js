"use strict";
/**
 * Created by user on 2018/4/11/011.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapStreamToPromise = exports.readFileLine = exports.createStreamLine = exports.byLine = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const split2_1 = tslib_1.__importDefault(require("split2"));
const path_1 = require("path");
const bluebird_1 = tslib_1.__importDefault(require("bluebird"));
const stream_pipe_1 = require("stream-pipe");
function byLine(fn, options = {}) {
    if (typeof fn == 'object') {
        [options, fn] = [fn, undefined];
    }
    fn = fn || options.mapper;
    // @ts-ignore
    let wts = (0, split2_1.default)(fn);
    wts.on('pipe', function (src) {
        // @ts-ignore
        const self = this;
        // @ts-ignore
        this.pipeFrom = src;
        let pipeStat = null;
        if (typeof src.bytesTotal == 'number') {
            self.bytesSize = src.bytesTotal;
        }
        else if (src.fd) {
            pipeStat = (0, fs_1.fstatSync)(src.fd);
            self.bytesSize = pipeStat.size;
        }
        else if (src.path) {
            let p = src.path;
            if (src.cwd && !(0, path_1.isAbsolute)(src.path)) {
                p = (0, path_1.resolve)(src.cwd, src.path);
            }
            pipeStat = (0, fs_1.statSync)(p);
            self.bytesSize = pipeStat.size;
        }
        else {
            self.bytesSize = null;
        }
        // @ts-ignore
        this.pipeStat = pipeStat;
        src
            .on('close', function (...argv) {
            self.emit('close', ...argv);
        })
            .on('ready', function (...argv) {
            self.emit('ready', ...argv);
        });
    });
    Object.keys(options)
        .forEach(function (key) {
        if (key.indexOf('on') == 0 && options[key]) {
            wts.on(key.slice(2), options[key]);
        }
    });
    return wts;
}
exports.byLine = byLine;
function createStreamLine(file, fn, options) {
    return (0, stream_pipe_1.createReadStream)(file)
        .pipe(byLine(fn, options));
}
exports.createStreamLine = createStreamLine;
function readFileLine(file, fn, options) {
    return wrapStreamToPromise(createStreamLine(file, fn, options));
}
exports.readFileLine = readFileLine;
function wrapStreamToPromise(stream) {
    let resolve, reject;
    let promise = new bluebird_1.default(function () {
        resolve = arguments[0];
        reject = arguments[1];
    });
    stream
        .on('close', function (...argv) {
        // @ts-ignore
        resolve(this);
        //console.log('d.close', ...argv);
    })
        .on('finish', function (...argv) {
        // @ts-ignore
        resolve(this);
        //console.log('d.close', ...argv);
    })
        .on('error', function (...argv) {
        reject(...argv);
    });
    promise.stream = stream;
    // @ts-ignore
    promise = promise.bind(stream);
    promise.stream = stream;
    return promise;
}
exports.wrapStreamToPromise = wrapStreamToPromise;
/*
let p = readFileLine('../.gitignore', {

    mapper(data: string)
    {
        return data;
    },

});

p.stream.on('data', function (data)
{
    console.log(data);
});

p.then(function (d: IPipe<ReadStream, NodeJS.WritableStream>)
{
    console.log(this === p.stream, d === this);
});
*/
exports.default = exports;
//# sourceMappingURL=line.js.map