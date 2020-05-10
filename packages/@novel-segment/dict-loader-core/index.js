"use strict";
/**
 * Created by user on 2018/4/13/013.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoaderClass = void 0;
const crlf_normalize_1 = require("crlf-normalize");
const line_1 = require("@novel-segment/stream-loader-core/line");
const stream_1 = require("@novel-segment/stream-loader-core/stream");
const sync_1 = require("@novel-segment/stream-loader-core/sync");
const core_decorators_1 = require("core-decorators");
let LoaderClass = /** @class */ (() => {
    let LoaderClass = class LoaderClass {
        constructor(options = {}, ...argv) {
            this.default = this.load;
            if (options.parseLine) {
                this.parseLine = options.parseLine.bind(this);
            }
            if (options.stringifyLine) {
                this.stringifyLine = options.stringifyLine.bind(this);
            }
            if (options.filter) {
                this.filter = options.filter.bind(this);
            }
            if (options.mapper) {
                this.defaultOptions.mapper = options.mapper.bind(this);
            }
        }
        static create(options = {}, ...argv) {
            return new this(options, ...argv);
        }
        parseLine(input) {
            return input;
        }
        stringifyLine(data) {
            return data.toString();
        }
        serialize(data) {
            let self = this;
            return data.map(function (d) {
                return self.stringifyLine(d);
            }).join(crlf_normalize_1.LF);
        }
        filter(input) {
            return input;
        }
        load(file, options = {}) {
            return line_1.wrapStreamToPromise(this.loadStream(file, options))
                .then(function (stream) {
                return stream.value;
            });
        }
        loadSync(file, options = {}) {
            let r = this.loadStreamSync(file, options);
            let value = r.value;
            // 試圖手動清除記憶體占用
            r = undefined;
            return value;
        }
        loadStream(file, options = {}, callback) {
            return this._createStream(stream_1.default, file, options, callback);
        }
        loadStreamSync(file, options = {}, callback) {
            return this._createStream(sync_1.default, file, options, callback);
        }
        _createStream(fnStream, file, options = {}, callback) {
            let self = this;
            let opts = Object.assign({}, this.defaultOptions, options);
            let parseLine = opts.parseLine || self.parseLine;
            let filter = opts.filter || self.filter;
            opts.parseLine = parseLine;
            let stream = fnStream(file, {
                callback,
                mapper: opts.mapper || function mapper(line) {
                    if (filter) {
                        line = filter(line);
                    }
                    if (line) {
                        // @ts-ignore
                        return parseLine(line, self.parseLine);
                    }
                },
            });
            // @ts-ignore
            stream.pipeLoader = self;
            // @ts-ignore
            stream.pipeRuntimeOptions = opts;
            return stream;
        }
    };
    LoaderClass = __decorate([
        core_decorators_1.autobind,
        __metadata("design:paramtypes", [Object, Object])
    ], LoaderClass);
    return LoaderClass;
})();
exports.LoaderClass = LoaderClass;
exports.default = LoaderClass;
//# sourceMappingURL=index.js.map