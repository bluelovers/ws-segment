"use strict";
/**
 * Created by user on 2018/4/11/011.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const split2 = require("split2");
const path = require("path");
const Promise = require("bluebird");
const stream_pipe_1 = require("stream-pipe");
function byLine(fn, options = {}) {
    if (typeof fn == 'object') {
        [options, fn] = [fn, undefined];
    }
    fn = fn || options.mapper;
    let wts = split2(fn);
    wts.on('pipe', function (src) {
        const self = this;
        this.pipeFrom = src;
        let pipeStat = null;
        if (typeof src.bytesTotal == 'number') {
            self.bytesSize = src.bytesTotal;
        }
        else if (src.fd) {
            pipeStat = fs.fstatSync(src.fd);
            self.bytesSize = pipeStat.size;
        }
        else if (src.path) {
            let p = src.path;
            if (src.cwd && !path.isAbsolute(src.path)) {
                p = path.resolve(src.cwd, src.path);
            }
            pipeStat = fs.statSync(p);
            self.bytesSize = pipeStat.size;
        }
        else {
            self.bytesSize = null;
        }
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
    return stream_pipe_1.createReadStream(file)
        .pipe(byLine(fn, options));
}
exports.createStreamLine = createStreamLine;
function readFileLine(file, fn, options) {
    return wrapStreamToPromise(createStreamLine(file, fn, options));
}
exports.readFileLine = readFileLine;
function wrapStreamToPromise(stream) {
    let resolve, reject;
    let promise = new Promise(function () {
        resolve = arguments[0];
        reject = arguments[1];
    });
    stream
        .on('close', function (...argv) {
        resolve(this);
        //console.log('d.close', ...argv);
    })
        .on('finish', function (...argv) {
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
const self = require("./line");
exports.default = self;