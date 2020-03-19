"use strict";
/**
 * Created by user on 2018/4/17/017.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (!exports.hasOwnProperty(p)) __createBinding(exports, m, p);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexOr = exports.hexAnd = exports.hexAndAny = exports.debug_options = exports.debug = exports.debug_inspect = exports.token_add_info = exports.toHex = exports.debug_token = void 0;
const util = require("util");
__exportStar(require("./core"), exports);
const debug_1 = require("./debug");
Object.defineProperty(exports, "debug_token", { enumerable: true, get: function () { return debug_1.debug_token; } });
Object.defineProperty(exports, "toHex", { enumerable: true, get: function () { return debug_1.toHex; } });
Object.defineProperty(exports, "token_add_info", { enumerable: true, get: function () { return debug_1.token_add_info; } });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7Ozs7QUFLSCw2QkFBNkI7QUFDN0IseUNBQXVCO0FBRXZCLG1DQUF5RjtBQUNwRCw0RkFEQSxtQkFBVyxPQUNBO0FBQUUsc0ZBREEsYUFBSyxPQUNBO0FBQUUsK0ZBREEsc0JBQWMsT0FDQTtBQUV2RSxTQUFnQixhQUFhLENBQUMsSUFBVyxFQUFFLFVBQStCLEVBQUU7SUFFM0UsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDdkIsTUFBTSxFQUFFLElBQUk7S0FDWixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRVosT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztRQUUxQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2pDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNSLENBQUM7QUFWRCxzQ0FVQztBQUVELFNBQWdCLEtBQUssQ0FBQyxHQUFHLElBQUk7SUFFNUIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUhELHNCQUdDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLElBQVcsRUFBRSxPQUE2QjtJQUV2RSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDckQsQ0FBQztBQUhELHNDQUdDO0FBR0QsU0FBZ0IsU0FBUyxDQUFDLENBQVMsRUFBRSxHQUFHLElBQWM7SUFFckQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQ2hCO1FBQ0MsT0FBTyxDQUFDLENBQUM7S0FDVDtJQUVELEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxFQUNsQjtRQUNDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRWhCLElBQUksQ0FBQyxFQUNMO1lBQ0MsT0FBTyxDQUFDLENBQUM7U0FDVDtLQUNEO0lBRUQsT0FBTyxDQUFDLENBQUM7QUFDVixDQUFDO0FBbEJELDhCQWtCQztBQUdELFNBQWdCLE1BQU0sQ0FBQyxDQUFTLEVBQUUsR0FBRyxJQUFjO0lBRWxELElBQUksSUFBSSxDQUFDLE1BQU0sRUFDZjtRQUNDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVWLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxFQUNsQjtZQUNDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFZCxJQUFJLENBQUMsQ0FBQyxFQUNOO2dCQUNDLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFFRCxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ1A7UUFFRCxPQUFPLENBQUMsQ0FBQztLQUNUO0lBRUQsT0FBTyxDQUFDLENBQUM7QUFDVixDQUFDO0FBdEJELHdCQXNCQztBQUdELFNBQWdCLEtBQUssQ0FBQyxDQUFTLEVBQUUsR0FBRyxJQUFjO0lBRWpELEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxFQUNsQjtRQUNDLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDUDtJQUVELE9BQU8sQ0FBQyxDQUFDO0FBQ1YsQ0FBQztBQVJELHNCQVFDO0FBSUQsYUFBYTtBQUNiLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFFaEQsaURBQWlEO0FBQ2pELHFCQUFxQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNC8xNy8wMTcuXG4gKi9cblxuaW1wb3J0IHsgJGVudW0sIEVudW1XcmFwcGVyLCB9IGZyb20gXCJ0cy1lbnVtLXV0aWxcIjtcbmltcG9ydCB7IFBPU1RBRyB9IGZyb20gJy4uL1BPU1RBRyc7XG5pbXBvcnQgeyBJV29yZCB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmV4cG9ydCAqIGZyb20gJy4vY29yZSc7XG5cbmltcG9ydCB7IElXb3JkRGVidWcsIElXb3JkRGVidWdJbmZvLCBkZWJ1Z190b2tlbiwgdG9IZXgsIHRva2VuX2FkZF9pbmZvIH0gZnJvbSAnLi9kZWJ1Zyc7XG5leHBvcnQgeyBJV29yZERlYnVnLCBJV29yZERlYnVnSW5mbywgZGVidWdfdG9rZW4sIHRvSGV4LCB0b2tlbl9hZGRfaW5mbyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWJ1Z19pbnNwZWN0KGFyZ3Y6IGFueVtdLCBvcHRpb25zOiB1dGlsLkluc3BlY3RPcHRpb25zID0ge30pXG57XG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRjb2xvcnM6IHRydWUsXG5cdH0sIG9wdGlvbnMpO1xuXG5cdHJldHVybiBhcmd2Lm1hcChmdW5jdGlvbiAoYilcblx0e1xuXHRcdHJldHVybiB1dGlsLmluc3BlY3QoYiwgb3B0aW9ucyk7XG5cdH0sIFtdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnKC4uLmFyZ3YpXG57XG5cdHJldHVybiBjb25zb2xlLmxvZyguLi5kZWJ1Z19pbnNwZWN0KGFyZ3YpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnX29wdGlvbnMoYXJndjogYW55W10sIG9wdGlvbnM/OiB1dGlsLkluc3BlY3RPcHRpb25zKVxue1xuXHRyZXR1cm4gY29uc29sZS5sb2coLi4uZGVidWdfaW5zcGVjdChhcmd2LCBvcHRpb25zKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZXhBbmRBbnkobjogbnVtYmVyLCBwPzogbnVtYmVyLCAuLi5hcmd2OiBudW1iZXJbXSk6IG51bWJlclxuZXhwb3J0IGZ1bmN0aW9uIGhleEFuZEFueShuOiBudW1iZXIsIC4uLmFyZ3Y6IG51bWJlcltdKVxue1xuXHRpZiAoIWFyZ3YubGVuZ3RoKVxuXHR7XG5cdFx0cmV0dXJuIG47XG5cdH1cblxuXHRmb3IgKGxldCB2IG9mIGFyZ3YpXG5cdHtcblx0XHRsZXQgciA9IChuICYgdik7XG5cblx0XHRpZiAocilcblx0XHR7XG5cdFx0XHRyZXR1cm4gcjtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhleEFuZChuOiBudW1iZXIsIHA/OiBudW1iZXIsIC4uLmFyZ3Y6IG51bWJlcltdKTogbnVtYmVyXG5leHBvcnQgZnVuY3Rpb24gaGV4QW5kKG46IG51bWJlciwgLi4uYXJndjogbnVtYmVyW10pXG57XG5cdGlmIChhcmd2Lmxlbmd0aClcblx0e1xuXHRcdGxldCByID0gMDtcblxuXHRcdGZvciAobGV0IHYgb2YgYXJndilcblx0XHR7XG5cdFx0XHRsZXQgcCA9IG4gJiB2O1xuXG5cdFx0XHRpZiAoIXApXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fVxuXG5cdFx0XHRyIHw9IHY7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHI7XG5cdH1cblxuXHRyZXR1cm4gbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhleE9yKG46IG51bWJlciwgcD86IG51bWJlciwgLi4uYXJndjogbnVtYmVyW10pOiBudW1iZXJcbmV4cG9ydCBmdW5jdGlvbiBoZXhPcihuOiBudW1iZXIsIC4uLmFyZ3Y6IG51bWJlcltdKVxue1xuXHRmb3IgKGxldCB2IG9mIGFyZ3YpXG5cdHtcblx0XHRuIHw9IHY7XG5cdH1cblxuXHRyZXR1cm4gbjtcbn1cblxuZXhwb3J0IGRlY2xhcmUgZnVuY3Rpb24gY2xvbmVEZWVwPFQgZXh0ZW5kcyBvYmplY3QgfCBBcnJheTxhbnk+PihkYXRhOiBUKTogVFxuXG4vLyBAdHMtaWdub3JlXG5leHBvcnRzLmNsb25lRGVlcCA9IHJlcXVpcmUoJ2xvZGFzaC5jbG9uZWRlZXAnKTtcblxuLy9sZXQgcCA9IGhleEFuZCgweDYwMDAgfCAweDgwMDAsIDB4MjAwMCwgMHg0MDAwKVxuLy9kZWJ1ZyhwLCB0b0hleChwKSk7XG5cblxuIl19