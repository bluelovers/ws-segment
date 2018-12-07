"use strict";
/**
 * Created by user on 2018/4/17/017.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
__export(require("./core"));
const debug_1 = require("./debug");
exports.debug_token = debug_1.debug_token;
exports.toHex = debug_1.toHex;
exports.token_add_info = debug_1.token_add_info;
function debug_inspect(argv, options = {}) {
    options = Object.assign({
        colors: true,
    }, options);
    return argv.map(function (b) {
        return util.inspect(b, options);
    }, []);
}
exports.debug_inspect = debug_inspect;
function debug(...argv) {
    return console.log(...debug_inspect(argv));
}
exports.debug = debug;
function debug_options(argv, options) {
    return console.log(...debug_inspect(argv, options));
}
exports.debug_options = debug_options;
function hexAndAny(n, ...argv) {
    if (!argv.length) {
        return n;
    }
    for (let v of argv) {
        let r = (n & v);
        if (r) {
            return r;
        }
    }
    return 0;
}
exports.hexAndAny = hexAndAny;
function hexAnd(n, ...argv) {
    if (argv.length) {
        let r = 0;
        for (let v of argv) {
            let p = n & v;
            if (!p) {
                return 0;
            }
            r |= v;
        }
        return r;
    }
    return n;
}
exports.hexAnd = hexAnd;
function hexOr(n, ...argv) {
    for (let v of argv) {
        n |= v;
    }
    return n;
}
exports.hexOr = hexOr;
// @ts-ignore
exports.cloneDeep = require('lodash.clonedeep');
//let p = hexAnd(0x6000 | 0x8000, 0x2000, 0x4000)
//debug(p, toHex(p));
const self = require("./index");
exports.default = self;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7O0FBS0gsNkJBQTZCO0FBQzdCLDRCQUF1QjtBQUV2QixtQ0FBeUY7QUFDcEQsc0JBREEsbUJBQVcsQ0FDQTtBQUFFLGdCQURBLGFBQUssQ0FDQTtBQUFFLHlCQURBLHNCQUFjLENBQ0E7QUFFdkUsU0FBZ0IsYUFBYSxDQUFDLElBQVcsRUFBRSxVQUErQixFQUFFO0lBRTNFLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLE1BQU0sRUFBRSxJQUFJO0tBQ1osRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVaLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7UUFFMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDUixDQUFDO0FBVkQsc0NBVUM7QUFFRCxTQUFnQixLQUFLLENBQUMsR0FBRyxJQUFJO0lBRTVCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFIRCxzQkFHQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUFXLEVBQUUsT0FBNkI7SUFFdkUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFIRCxzQ0FHQztBQUdELFNBQWdCLFNBQVMsQ0FBQyxDQUFTLEVBQUUsR0FBRyxJQUFjO0lBRXJELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUNoQjtRQUNDLE9BQU8sQ0FBQyxDQUFDO0tBQ1Q7SUFFRCxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFDbEI7UUFDQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVoQixJQUFJLENBQUMsRUFDTDtZQUNDLE9BQU8sQ0FBQyxDQUFDO1NBQ1Q7S0FDRDtJQUVELE9BQU8sQ0FBQyxDQUFDO0FBQ1YsQ0FBQztBQWxCRCw4QkFrQkM7QUFHRCxTQUFnQixNQUFNLENBQUMsQ0FBUyxFQUFFLEdBQUcsSUFBYztJQUVsRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQ2Y7UUFDQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVixLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFDbEI7WUFDQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWQsSUFBSSxDQUFDLENBQUMsRUFDTjtnQkFDQyxPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNQO1FBRUQsT0FBTyxDQUFDLENBQUM7S0FDVDtJQUVELE9BQU8sQ0FBQyxDQUFDO0FBQ1YsQ0FBQztBQXRCRCx3QkFzQkM7QUFHRCxTQUFnQixLQUFLLENBQUMsQ0FBUyxFQUFFLEdBQUcsSUFBYztJQUVqRCxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFDbEI7UUFDQyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ1A7SUFFRCxPQUFPLENBQUMsQ0FBQztBQUNWLENBQUM7QUFSRCxzQkFRQztBQUlELGFBQWE7QUFDYixPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRWhELGlEQUFpRDtBQUNqRCxxQkFBcUI7QUFFckIsZ0NBQWdDO0FBQ2hDLGtCQUFlLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNC8xNy8wMTcuXG4gKi9cblxuaW1wb3J0IHsgJGVudW0sIEVudW1XcmFwcGVyLCB9IGZyb20gXCJ0cy1lbnVtLXV0aWxcIjtcbmltcG9ydCB7IFBPU1RBRyB9IGZyb20gJy4uL1BPU1RBRyc7XG5pbXBvcnQgeyBJV29yZCB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmV4cG9ydCAqIGZyb20gJy4vY29yZSc7XG5cbmltcG9ydCB7IElXb3JkRGVidWcsIElXb3JkRGVidWdJbmZvLCBkZWJ1Z190b2tlbiwgdG9IZXgsIHRva2VuX2FkZF9pbmZvIH0gZnJvbSAnLi9kZWJ1Zyc7XG5leHBvcnQgeyBJV29yZERlYnVnLCBJV29yZERlYnVnSW5mbywgZGVidWdfdG9rZW4sIHRvSGV4LCB0b2tlbl9hZGRfaW5mbyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWJ1Z19pbnNwZWN0KGFyZ3Y6IGFueVtdLCBvcHRpb25zOiB1dGlsLkluc3BlY3RPcHRpb25zID0ge30pXG57XG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRjb2xvcnM6IHRydWUsXG5cdH0sIG9wdGlvbnMpO1xuXG5cdHJldHVybiBhcmd2Lm1hcChmdW5jdGlvbiAoYilcblx0e1xuXHRcdHJldHVybiB1dGlsLmluc3BlY3QoYiwgb3B0aW9ucyk7XG5cdH0sIFtdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnKC4uLmFyZ3YpXG57XG5cdHJldHVybiBjb25zb2xlLmxvZyguLi5kZWJ1Z19pbnNwZWN0KGFyZ3YpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnX29wdGlvbnMoYXJndjogYW55W10sIG9wdGlvbnM/OiB1dGlsLkluc3BlY3RPcHRpb25zKVxue1xuXHRyZXR1cm4gY29uc29sZS5sb2coLi4uZGVidWdfaW5zcGVjdChhcmd2LCBvcHRpb25zKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZXhBbmRBbnkobjogbnVtYmVyLCBwPzogbnVtYmVyLCAuLi5hcmd2OiBudW1iZXJbXSk6IG51bWJlclxuZXhwb3J0IGZ1bmN0aW9uIGhleEFuZEFueShuOiBudW1iZXIsIC4uLmFyZ3Y6IG51bWJlcltdKVxue1xuXHRpZiAoIWFyZ3YubGVuZ3RoKVxuXHR7XG5cdFx0cmV0dXJuIG47XG5cdH1cblxuXHRmb3IgKGxldCB2IG9mIGFyZ3YpXG5cdHtcblx0XHRsZXQgciA9IChuICYgdik7XG5cblx0XHRpZiAocilcblx0XHR7XG5cdFx0XHRyZXR1cm4gcjtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhleEFuZChuOiBudW1iZXIsIHA/OiBudW1iZXIsIC4uLmFyZ3Y6IG51bWJlcltdKTogbnVtYmVyXG5leHBvcnQgZnVuY3Rpb24gaGV4QW5kKG46IG51bWJlciwgLi4uYXJndjogbnVtYmVyW10pXG57XG5cdGlmIChhcmd2Lmxlbmd0aClcblx0e1xuXHRcdGxldCByID0gMDtcblxuXHRcdGZvciAobGV0IHYgb2YgYXJndilcblx0XHR7XG5cdFx0XHRsZXQgcCA9IG4gJiB2O1xuXG5cdFx0XHRpZiAoIXApXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fVxuXG5cdFx0XHRyIHw9IHY7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHI7XG5cdH1cblxuXHRyZXR1cm4gbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhleE9yKG46IG51bWJlciwgcD86IG51bWJlciwgLi4uYXJndjogbnVtYmVyW10pOiBudW1iZXJcbmV4cG9ydCBmdW5jdGlvbiBoZXhPcihuOiBudW1iZXIsIC4uLmFyZ3Y6IG51bWJlcltdKVxue1xuXHRmb3IgKGxldCB2IG9mIGFyZ3YpXG5cdHtcblx0XHRuIHw9IHY7XG5cdH1cblxuXHRyZXR1cm4gbjtcbn1cblxuZXhwb3J0IGRlY2xhcmUgZnVuY3Rpb24gY2xvbmVEZWVwPFQgZXh0ZW5kcyBvYmplY3QgfCBBcnJheTxhbnk+PihkYXRhOiBUKTogVFxuXG4vLyBAdHMtaWdub3JlXG5leHBvcnRzLmNsb25lRGVlcCA9IHJlcXVpcmUoJ2xvZGFzaC5jbG9uZWRlZXAnKTtcblxuLy9sZXQgcCA9IGhleEFuZCgweDYwMDAgfCAweDgwMDAsIDB4MjAwMCwgMHg0MDAwKVxuLy9kZWJ1ZyhwLCB0b0hleChwKSk7XG5cbmltcG9ydCAqIGFzIHNlbGYgZnJvbSAnLi9pbmRleCc7XG5leHBvcnQgZGVmYXVsdCBzZWxmO1xuIl19