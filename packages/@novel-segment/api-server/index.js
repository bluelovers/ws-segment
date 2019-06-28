"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const core_1 = require("novel-segment/lib/segment/core");
const useModules2_1 = require("novel-segment/lib/segment/methods/useModules2");
const mod_1 = require("novel-segment/lib/mod");
const url_1 = require("url");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
let CACHED_SEGMENT;
app.get('*', fn);
app.post('*', fn);
exports.default = app;
function fn(req, res, next) {
    let rq = Object.assign({}, req.query, url_1.parse(req.url, true).query, req.body);
    res.set({
        //'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    });
    const timestamp = Date.now();
    let error;
    if (rq.input && rq.input.length) {
        if (typeof rq.input === 'string') {
            rq.input = [rq.input];
        }
        if (Array.isArray(rq.input)) {
            rq.options = rq.options || {};
            try {
                const CACHED_SEGMENT = getSegment();
                const results = rq.input.map(line => {
                    if (typeof line !== 'string') {
                        line = Buffer.from(line).toString();
                    }
                    return CACHED_SEGMENT.doSegment(line, rq.options);
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
    const DICT = require('./cache.json');
    CACHED_SEGMENT = createSegment();
    useModules2_1.useModules(CACHED_SEGMENT, mod_1.default(CACHED_SEGMENT.options.all_mod));
    CACHED_SEGMENT.DICT = DICT;
    CACHED_SEGMENT.inited = true;
    return CACHED_SEGMENT;
}
exports.getSegment = getSegment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFvQztBQUNwQyw2QkFBNkI7QUFFN0IseURBQTRFO0FBQzVFLCtFQUEyRTtBQUMzRSwrQ0FBc0Q7QUFDdEQsNkJBQXlDO0FBRXpDLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBRXRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDeEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNoRCxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFFaEIsSUFBSSxjQUF1QixDQUFDO0FBRTVCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ2pCLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRWxCLGtCQUFlLEdBQUcsQ0FBQTtBQUVsQixTQUFTLEVBQUUsQ0FBRSxHQUFZLEVBQUUsR0FBYSxFQUFFLElBQWtCO0lBRTNELElBQUksRUFBRSxHQUtGLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsV0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUUzRSxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ1AscUNBQXFDO1FBQ3JDLGNBQWMsRUFBRSxrQkFBa0I7S0FDbEMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRTdCLElBQUksS0FBWSxDQUFDO0lBRWpCLElBQUksRUFBRSxD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Q0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLGFBQWE7SUFFckIsT0FBTyxJQUFJLGNBQU8sQ0FBQztRQUNsQixPQUFPLEVBQUUsSUFBSTtRQUNiLGdCQUFnQixFQUFFO1lBQ2pCLGNBQWMsRUFBRSxJQUFJO1NBQ3BCO1FBQ0QsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBZ0IsVUFBVTtJQUV6QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFckMsY0FBYyxHQUFHLGFBQWEsRUFBRSxDQUFDO0lBRWpDLHdCQUFVLENBQUMsY0FBcUIsRUFBRSxhQUFpQixDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUVyRixjQUFjLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUMzQixjQUFjLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUU3QixPQUFPLGNBQWMsQ0FBQTtBQUN0QixDQUFDO0FBWkQsZ0NBWUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmltcG9ydCBjb3JzID0gcmVxdWlyZSgnY29ycycpXG5pbXBvcnQgeyBOZXh0RnVuY3Rpb24sIFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcy1zZXJ2ZS1zdGF0aWMtY29yZSc7XG5pbXBvcnQgU2VnbWVudCwgeyBJT3B0aW9uc0RvU2VnbWVudCB9IGZyb20gJ25vdmVsLXNlZ21lbnQvbGliL3NlZ21lbnQvY29yZSc7XG5pbXBvcnQgeyB1c2VNb2R1bGVzIH0gZnJvbSAnbm92ZWwtc2VnbWVudC9saWIvc2VnbWVudC9tZXRob2RzL3VzZU1vZHVsZXMyJztcbmltcG9ydCBnZXREZWZhdWx0TW9kTGlzdCBmcm9tICdub3ZlbC1zZWdtZW50L2xpYi9tb2QnO1xuaW1wb3J0IHsgcGFyc2UgYXMgdXJsX3BhcnNlIH0gZnJvbSAndXJsJztcblxuY29uc3QgYXBwID0gZXhwcmVzcygpO1xuXG5hcHAudXNlKGV4cHJlc3MuanNvbigpKTtcbmFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpO1xuYXBwLnVzZShjb3JzKCkpO1xuXG5sZXQgQ0FDSEVEX1NFR01FTlQ6IFNlZ21lbnQ7XG5cbmFwcC5nZXQoJyonLCBmbik7XG5hcHAucG9zdCgnKicsIGZuKTtcblxuZXhwb3J0IGRlZmF1bHQgYXBwXG5cbmZ1bmN0aW9uIGZuIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbilcbntcblx0bGV0IHJxOiB7XG5cdFx0aW5wdXQ6IHN0cmluZyB8IChzdHJpbmcgfCBCdWZmZXIpW10sXG5cdFx0b3B0aW9uczogSU9wdGlvbnNEb1NlZ21lbnQsXG5cdFx0bm9jYWNoZTogYm9vbGVhbixcblx0XHRkZWJ1ZzogYm9vbGVhbixcblx0fSA9IE9iamVjdC5hc3NpZ24oe30sIHJlcS5xdWVyeSwgdXJsX3BhcnNlKHJlcS51cmwsIHRydWUpLnF1ZXJ5LCByZXEuYm9keSk7XG5cblx0cmVzLnNldCh7XG5cdFx0Ly8nQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuXHRcdCdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG5cdH0pO1xuXG5cdGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCk7XG5cblx0bGV0IGVycm9yOiBFcnJvcjtcblxuXHRpZiAocnEuaW5wdXQgJiYgcnEuaW5wdXQubGVuZ3RoKVxuXHR7XG5cdFx0aWYgKHR5cGVvZiBycS5pbnB1dCA9PT0gJ3N0cmluZycpXG5cdFx0e1xuXHRcdFx0cnEuaW5wdXQgPSBbcnEuaW5wdXRdO1xuXHRcdH1cblxuXHRcdGlmIChBcnJheS5pc0FycmF5KHJxLmlucHV0KSlcblx0XHR7XG5cdFx0XHRycS5vcHRpb25zID0gcnEub3B0aW9ucyB8fCB7fTtcblxuXHRcdFx0dHJ5XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IENBQ0hFRF9TRUdNRU5UID0gZ2V0U2VnbWVudCgpO1xuXG5cdFx0XHRcdGNvbnN0IHJlc3VsdHMgPSBycS5pbnB1dC5tYXAobGluZSA9PiB7XG5cblx0XHRcdFx0XHRpZiAodHlwZW9mIGxpbmUgIT09ICdzdHJpbmcnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxpbmUgPSBCdWZmZXIuZnJvbShsaW5lKS50b1N0cmluZygpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBDQUNIRURfU0VHTUVOVC5kb1NlZ21lbnQobGluZSwgcnEub3B0aW9ucylcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKCFycS5ub2NhY2hlICYmICFycS5kZWJ1Zylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJlcy5zZXQoe1xuXHRcdFx0XHRcdFx0J0NhY2hlLUNvbnRyb2wnOiAncHVibGljLCBtYXgtYWdlPTM2MDAwMDAnLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QganNvbiA9IHtcblx0XHRcdFx0XHRjb2RlOiAxLFxuXHRcdFx0XHRcdGNvdW50OiByZXN1bHRzLmxlbmd0aCxcblx0XHRcdFx0XHR0aW1lc3RhbXAsXG5cdFx0XHRcdFx0dGltZTogRGF0ZS5ub3coKSAtIHRpbWVzdGFtcCxcblx0XHRcdFx0XHRyZXN1bHRzLFxuXHRcdFx0XHRcdG9wdGlvbnM6IHJxLm9wdGlvbnMsXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0aWYgKHJxLmRlYnVnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdGpzb24ucmVxdWVzdCA9IHtcblx0XHRcdFx0XHRcdHJxLFxuXHRcdFx0XHRcdFx0cGFyYW1zOiByZXEucGFyYW1zLFxuXHRcdFx0XHRcdFx0cXVlcnk6IHJlcS5xdWVyeSxcblx0XHRcdFx0XHRcdGJvZHk6IHJlcS5ib2R5LFxuXHRcdFx0XHRcdFx0YmFzZVVybDogcmVxLmJhc2VVcmwsXG5cdFx0XHRcdFx0XHR1cmw6IHJlcS51cmwsXG5cdFx0XHRcdFx0XHRxdWVyeTI6IHVybF9wYXJzZShyZXEudXJsLCB0cnVlKS5xdWVyeSxcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmVzLnN0YXR1cygyMDApLmpzb24oanNvbik7XG5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHR7XG5cdFx0XHRcdGVycm9yID0gZTtcblxuXHRcdFx0XHRyZXMuc3RhdHVzKDUwMCkuanNvbih7XG5cdFx0XHRcdFx0Y29kZTogMCxcblx0XHRcdFx0XHRlcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHR0aW1lc3RhbXAsXG5cdFx0XHRcdFx0bWVzc2FnZTogZXJyb3IubWVzc2FnZSxcblx0XHRcdFx0XHRyZXF1ZXN0OiBycSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlmICghcnEubm9jYWNoZSlcblx0e1xuXHRcdHJlcy5zZXQoe1xuXHRcdFx0J0NhY2hlLUNvbnRyb2wnOiAncHVibGljLCBtYXgtYWdlPTEwMDAwJyxcblx0XHR9KTtcblx0fVxuXG5cdHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcblx0XHRjb2RlOiAwLFxuXHRcdGVycm9yOiB0cnVlLFxuXHRcdHRpbWVzdGFtcCxcblx0XHRtZXNzYWdlOiAn5Y+D5pW46Yyv6KqkJyxcblx0XHRyZXF1ZXN0OiBycSxcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNlZ21lbnQoKVxue1xuXHRyZXR1cm4gbmV3IFNlZ21lbnQoe1xuXHRcdGF1dG9Dams6IHRydWUsXG5cdFx0b3B0aW9uc0RvU2VnbWVudDoge1xuXHRcdFx0Y29udmVydFN5bm9ueW06IHRydWUsXG5cdFx0fSxcblx0XHRhbGxfbW9kOiB0cnVlLFxuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlZ21lbnQoKVxue1xuXHRjb25zdCBESUNUID0gcmVxdWlyZSgnLi9jYWNoZS5qc29uJyk7XG5cblx0Q0FDSEVEX1NFR01FTlQgPSBjcmVhdGVTZWdtZW50KCk7XG5cblx0dXNlTW9kdWxlcyhDQUNIRURfU0VHTUVOVCBhcyBhbnksIGdldERlZmF1bHRNb2RMaXN0KENBQ0hFRF9TRUdNRU5ULm9wdGlvbnMuYWxsX21vZCkpO1xuXG5cdENBQ0hFRF9TRUdNRU5ULkRJQ1QgPSBESUNUO1xuXHRDQUNIRURfU0VHTUVOVC5pbml0ZWQgPSB0cnVlO1xuXG5cdHJldHVybiBDQUNIRURfU0VHTUVOVFxufVxuIl19