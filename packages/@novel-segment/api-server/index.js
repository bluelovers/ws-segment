"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const core_1 = tslib_1.__importDefault(require("novel-segment/lib/segment/core"));
const useModules2_1 = require("novel-segment/lib/segment/methods/useModules2");
const mod_1 = tslib_1.__importDefault(require("novel-segment/lib/mod"));
const url_1 = require("url");
const min_1 = require("cjk-conv/lib/zh/convert/min");
const app = express_1.default();
let CACHED_SEGMENT;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(cors_1.default());
all_method(app, '/conv', app_conv);
all_method(app, '*', app_segment);
exports.default = app;
async function app_segment(req, res, next) {
    let rq = get_query(req);
    res.set({
        //'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    });
    const timestamp = Date.now();
    let error;
    if (rq.input && rq.input.length) {
        rq.input = handle_input(rq.input).input;
        if (Array.isArray(rq.input)) {
            rq.options = rq.options || {};
            try {
                const results = rq.input.map(line => {
                    if (typeof line !== 'string') {
                        line = Buffer.from(line).toString();
                    }
                    return doSegment(line, rq.options);
                });
                if (!rq.nocache && !rq.debug) {
                    res.set({
                        'Cache-Control': 'public, max-age=3600000',
                    });
                }
                const json = {
                    code: 1,
                    count: results.length,
                    timestamp,
                    time: Date.now() - timestamp,
                    results,
                    options: rq.options,
                };
                if (rq.debug) {
                    // @ts-ignore
                    json.request = {
                        rq,
                        params: req.params,
                        query: req.query,
                        body: req.body,
                        baseUrl: req.baseUrl,
                        url: req.url,
                        query2: url_1.parse(req.url, true).query,
                    };
                }
                res.status(200).json(json);
                return;
            }
            catch (e) {
                error = e;
                res.status(500).json({
                    code: 0,
                    error: true,
                    timestamp,
                    message: error.message,
                    request: rq,
                });
                return;
            }
        }
    }
    if (!rq.nocache) {
        res.set({
            'Cache-Control': 'public, max-age=10000',
        });
    }
    res.status(400).json({
        code: 0,
        error: true,
        timestamp,
        message: '參數錯誤',
        request: rq,
    });
}
async function app_conv(req, res, next) {
    let rq = get_query(req, {
        options: {},
    });
    const timestamp = Date.now();
    let error;
    try {
        const { input, empty } = handle_input(rq.input);
        delete rq.input;
        const { tw2cn } = rq.options;
        const results = input_map(input, (input) => {
            let text = doSegment(input, {
                simple: true,
            }).join('');
            return tw2cn ? min_1.tw2cn_min(text) : min_1.cn2tw_min(text);
        });
        if (!rq.nocache && !rq.debug) {
            res.set({
                'Cache-Control': 'public, max-age=3600000',
            });
        }
        const json = {
            code: 1,
            count: results.length,
            timestamp,
            time: Date.now() - timestamp,
            results,
        };
        res.status(200).json(json);
        return;
    }
    catch (e) {
        if (!rq.nocache) {
            res.set({
                'Cache-Control': 'public, max-age=10000',
            });
        }
        res.status(500).json({
            code: 0,
            error: true,
            timestamp,
            message: e.message,
            request: rq,
        });
    }
}
function handle_input(input) {
    if (typeof input === 'string') {
        input = [input];
    }
    let empty = (input.length === 0 || input.length === 1 && input[0].length === 0);
    return {
        input,
        empty,
    };
}
function input_map(input, fn) {
    return input.map(input => {
        if (typeof input !== 'string') {
            input = Buffer.from(input).toString();
        }
        return fn(input);
    });
}
function createSegment() {
    return new core_1.default({
        autoCjk: true,
        optionsDoSegment: {
            convertSynonym: true,
        },
        all_mod: true,
    });
}
function getSegment() {
    if (CACHED_SEGMENT) {
        return CACHED_SEGMENT;
    }
    const DICT = require('./cache/cache.json');
    CACHED_SEGMENT = createSegment();
    useModules2_1.useModules(CACHED_SEGMENT, mod_1.default(CACHED_SEGMENT.options.all_mod));
    CACHED_SEGMENT.DICT = DICT;
    CACHED_SEGMENT.inited = true;
    return CACHED_SEGMENT;
}
function doSegment(text, options) {
    return getSegment().doSegment(text, options);
}
function all_method(app, routerPath, ...cb) {
    app.get(routerPath, ...cb);
    app.post(routerPath, ...cb);
    return app;
}
function get_query(req, init = {}) {
    return Object.assign(init, url_1.parse(req.url, true).query, req.body);
}
//# sourceMappingURL=index.js.map