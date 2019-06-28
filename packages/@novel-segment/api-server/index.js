"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const core_1 = require("novel-segment/lib/segment/core");
const useModules2_1 = require("novel-segment/lib/segment/methods/useModules2");
const mod_1 = require("novel-segment/lib/mod");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let CACHED_SEGMENT;
app.get('*', fn);
app.post('*', fn);
exports.default = app;
function fn(req, res, next) {
    let rq = Object.assign({}, req.query, req.body);
    res.set({
        'Access-Control-Allow-Origin': '*',
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
                    return CACHED_SEGMENT.doSegment(line);
                });
                if (!rq.nocache) {
                    res.set({
                        'Cache-Control': 'public, max-age=3600000',
                    });
                }
                res.status(200).json({
                    code: 1,
                    count: results.length,
                    timestamp,
                    time: Date.now() - timestamp,
                    results,
                });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFvQztBQUVwQyx5REFBNEU7QUFDNUUsK0VBQTJFO0FBQzNFLCtDQUFzRDtBQUV0RCxNQUFNLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQztBQUV0QixHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFaEQsSUFBSSxjQUF1QixDQUFDO0FBRTVCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ2pCLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRWxCLGtCQUFlLEdBQUcsQ0FBQTtBQUVsQixTQUFTLEVBQUUsQ0FBRSxHQUFZLEVBQUUsR0FBYSxFQUFFLElBQWtCO0lBRTNELElBQUksRUFBRSxHQUlGLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRTNDLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDUCw2QkFBNkIsRUFBRSxHQUFHO1FBQ2xDLGNBQWMsRUFBRSxrQkFBa0I7S0FDbEMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRTdCLElBQUksS0FBWSxDQUFDO0lBRWpCLElBQUksRUFBRSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFDL0I7UUFDQyxJQUFJLE9BQU8sRUFBRSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQ2hDO1lBQ0MsRUFBRSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN0QjtRQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQzNCO1lBQ0MsRUFBRSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztZQUU5QixJQUNBO2dCQUNDLE1BQU0sY0FBYyxHQUFHLFVBQVUsRUFBRSxDQUFDO2dCQUVwQyxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFFbkMsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQzVCO3dCQUNDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO3FCQUNwQztvQkFFRCxPQUFPLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ3RDLENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUNmO29CQUNDLEdBQUcsQ0FBQyxHQUFHLENBQUM7d0JBQ1AsZUFBZSxFQUFFLHlCQUF5QjtxQkFDMUMsQ0FBQyxDQUFDO2lCQUNIO2dCQUVELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNwQixJQUFJLEVBQUUsQ0FBQztvQkFDUCxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU07b0JBQ3JCLFNBQVM7b0JBQ1QsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTO29CQUM1QixPQUFPO2lCQUNQLENBQUMsQ0FBQztnQkFFSCxPQUFPO2FBQ1A7WUFDRCxPQUFPLENBQUMsRUFDUjtnQkFDQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUVWLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNwQixJQUFJLEVBQUUsQ0FBQztvQkFDUCxLQUFLLEVBQUUsSUFBSTtvQkFDWCxTQUFTO29CQUNULE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztvQkFDdEIsT0FBTyxFQUFFLEVBQUU7aUJBQ1gsQ0FBQyxDQUFDO2dCQUVILE9BQU87YUFDUDtTQUNEO0tBQ0Q7SUFFRCxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFDZjtRQUNDLEdBQUcsQ0FBQyxHQUFHLENBQUM7WUFDUCxlQUFlLEVBQUUsdUJBQXVCO1NBQ3hDLENBQUMsQ0FBQztLQUNIO0lBRUQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDcEIsSUFBSSxFQUFFLENBQUM7UUFDUCxLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVM7UUFDVCxPQUFPLEVBQUUsTUFBTTtRQUNmLE9BQU8sRUFBRSxFQUFFO0tBQ1gsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsYUFBYTtJQUVyQixPQUFPLElBQUksY0FBTyxDQUFDO1FBQ2xCLE9BQU8sRUFBRSxJQUFJO1FBQ2IsZ0JBQWdCLEVBQUU7WUFDakIsY0FBYyxFQUFFLElBQUk7U0FDcEI7UUFDRCxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFnQixVQUFVO0lBRXpCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUVyQyxjQUFjLEdBQUcsYUFBYSxFQUFFLENBQUM7SUFFakMsd0JBQVUsQ0FBQyxjQUFxQixFQUFFLGFBQWlCLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBRXJGLGNBQWMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQzNCLGNBQWMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBRTdCLE9BQU8sY0FBYyxDQUFBO0FBQ3RCLENBQUM7QUFaRCxnQ0FZQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xuaW1wb3J0IHsgTmV4dEZ1bmN0aW9uLCBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3Mtc2VydmUtc3RhdGljLWNvcmUnO1xuaW1wb3J0IFNlZ21lbnQsIHsgSU9wdGlvbnNEb1NlZ21lbnQgfSBmcm9tICdub3ZlbC1zZWdtZW50L2xpYi9zZWdtZW50L2NvcmUnO1xuaW1wb3J0IHsgdXNlTW9kdWxlcyB9IGZyb20gJ25vdmVsLXNlZ21lbnQvbGliL3NlZ21lbnQvbWV0aG9kcy91c2VNb2R1bGVzMic7XG5pbXBvcnQgZ2V0RGVmYXVsdE1vZExpc3QgZnJvbSAnbm92ZWwtc2VnbWVudC9saWIvbW9kJztcblxuY29uc3QgYXBwID0gZXhwcmVzcygpO1xuXG5hcHAudXNlKGV4cHJlc3MuanNvbigpKTtcbmFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpO1xuXG5sZXQgQ0FDSEVEX1NFR01FTlQ6IFNlZ21lbnQ7XG5cbmFwcC5nZXQoJyonLCBmbik7XG5hcHAucG9zdCgnKicsIGZuKTtcblxuZXhwb3J0IGRlZmF1bHQgYXBwXG5cbmZ1bmN0aW9uIGZuIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbilcbntcblx0bGV0IHJxOiB7XG5cdFx0aW5wdXQ6IHN0cmluZyB8IChzdHJpbmcgfCBCdWZmZXIpW10sXG5cdFx0b3B0aW9uczogSU9wdGlvbnNEb1NlZ21lbnQsXG5cdFx0bm9jYWNoZTogYm9vbGVhbixcblx0fSA9IE9iamVjdC5hc3NpZ24oe30sIHJlcS5xdWVyeSwgcmVxLmJvZHkpO1xuXG5cdHJlcy5zZXQoe1xuXHRcdCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG5cdFx0J0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcblx0fSk7XG5cblx0Y29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcblxuXHRsZXQgZXJyb3I6IEVycm9yO1xuXG5cdGlmIChycS5pbnB1dCAmJiBycS5pbnB1dC5sZW5ndGgpXG5cdHtcblx0XHRpZiAodHlwZW9mIHJxLmlucHV0ID09PSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHRycS5pbnB1dCA9IFtycS5pbnB1dF07XG5cdFx0fVxuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkocnEuaW5wdXQpKVxuXHRcdHtcblx0XHRcdHJxLm9wdGlvbnMgPSBycS5vcHRpb25zIHx8IHt9O1xuXG5cdFx0XHR0cnlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgQ0FDSEVEX1NFR01FTlQgPSBnZXRTZWdtZW50KCk7XG5cblx0XHRcdFx0Y29uc3QgcmVzdWx0cyA9IHJxLmlucHV0Lm1hcChsaW5lID0+IHtcblxuXHRcdFx0XHRcdGlmICh0eXBlb2YgbGluZSAhPT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGluZSA9IEJ1ZmZlci5mcm9tKGxpbmUpLnRvU3RyaW5nKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIENBQ0hFRF9TRUdNRU5ULmRvU2VnbWVudChsaW5lKVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoIXJxLm5vY2FjaGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXMuc2V0KHtcblx0XHRcdFx0XHRcdCdDYWNoZS1Db250cm9sJzogJ3B1YmxpYywgbWF4LWFnZT0zNjAwMDAwJyxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcblx0XHRcdFx0XHRjb2RlOiAxLFxuXHRcdFx0XHRcdGNvdW50OiByZXN1bHRzLmxlbmd0aCxcblx0XHRcdFx0XHR0aW1lc3RhbXAsXG5cdFx0XHRcdFx0dGltZTogRGF0ZS5ub3coKSAtIHRpbWVzdGFtcCxcblx0XHRcdFx0XHRyZXN1bHRzLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSlcblx0XHRcdHtcblx0XHRcdFx0ZXJyb3IgPSBlO1xuXG5cdFx0XHRcdHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcblx0XHRcdFx0XHRjb2RlOiAwLFxuXHRcdFx0XHRcdGVycm9yOiB0cnVlLFxuXHRcdFx0XHRcdHRpbWVzdGFtcCxcblx0XHRcdFx0XHRtZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuXHRcdFx0XHRcdHJlcXVlc3Q6IHJxLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aWYgKCFycS5ub2NhY2hlKVxuXHR7XG5cdFx0cmVzLnNldCh7XG5cdFx0XHQnQ2FjaGUtQ29udHJvbCc6ICdwdWJsaWMsIG1heC1hZ2U9MTAwMDAnLFxuXHRcdH0pO1xuXHR9XG5cblx0cmVzLnN0YXR1cyg0MDApLmpzb24oe1xuXHRcdGNvZGU6IDAsXG5cdFx0ZXJyb3I6IHRydWUsXG5cdFx0dGltZXN0YW1wLFxuXHRcdG1lc3NhZ2U6ICflj4PmlbjpjK/oqqQnLFxuXHRcdHJlcXVlc3Q6IHJxLFxuXHR9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU2VnbWVudCgpXG57XG5cdHJldHVybiBuZXcgU2VnbWVudCh7XG5cdFx0YXV0b0NqazogdHJ1ZSxcblx0XHRvcHRpb25zRG9TZWdtZW50OiB7XG5cdFx0XHRjb252ZXJ0U3lub255bTogdHJ1ZSxcblx0XHR9LFxuXHRcdGFsbF9tb2Q6IHRydWUsXG5cdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VnbWVudCgpXG57XG5cdGNvbnN0IERJQ1QgPSByZXF1aXJlKCcuL2NhY2hlLmpzb24nKTtcblxuXHRDQUNIRURfU0VHTUVOVCA9IGNyZWF0ZVNlZ21lbnQoKTtcblxuXHR1c2VNb2R1bGVzKENBQ0hFRF9TRUdNRU5UIGFzIGFueSwgZ2V0RGVmYXVsdE1vZExpc3QoQ0FDSEVEX1NFR01FTlQub3B0aW9ucy5hbGxfbW9kKSk7XG5cblx0Q0FDSEVEX1NFR01FTlQuRElDVCA9IERJQ1Q7XG5cdENBQ0hFRF9TRUdNRU5ULmluaXRlZCA9IHRydWU7XG5cblx0cmV0dXJuIENBQ0hFRF9TRUdNRU5UXG59XG4iXX0=