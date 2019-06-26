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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7O0FBS0gsNkJBQTZCO0FBQzdCLDRCQUF1QjtBQUV2QixtQ0FBeUY7QUFDcEQsc0JBREEsbUJBQVcsQ0FDQTtBQUFFLGdCQURBLGFBQUssQ0FDQTtBQUFFLHlCQURBLHNCQUFjLENBQ0E7QUFFdkUsU0FBZ0IsYUFBYSxDQUFDLElBQVcsRUFBRSxVQUErQixFQUFFO0lBRTNFLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLE1BQU0sRUFBRSxJQUFJO0tBQ1osRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVaLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7UUFFMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDUixDQUFDO0FBVkQsc0NBVUM7QUFFRCxTQUFnQixLQUFLLENBQUMsR0FBRyxJQUFJO0lBRTVCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFIRCxzQkFHQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUFXLEVBQUUsT0FBNkI7SUFFdkUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFIRCxzQ0FHQztBQUdELFNBQWdCLFNBQVMsQ0FBQyxDQUFTLEVBQUUsR0FBRyxJQUFjO0lBRXJELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUNoQjtRQUNDLE9BQU8sQ0FBQyxDQUFDO0tBQ1Q7SUFFRCxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFDbEI7UUFDQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVoQixJQUFJLENBQUMsRUFDTDtZQUNDLE9BQU8sQ0FBQyxDQUFDO1NBQ1Q7S0FDRDtJQUVELE9BQU8sQ0FBQyxDQUFDO0FBQ1YsQ0FBQztBQWxCRCw4QkFrQkM7QUFHRCxTQUFnQixNQUFNLENBQUMsQ0FBUyxFQUFFLEdBQUcsSUFBYztJQUVsRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQ2Y7UUFDQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVixLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFDbEI7WUFDQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWQsSUFBSSxDQUFDLENBQUMsRUFDTjtnQkFDQyxPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNQO1FBRUQsT0FBTyxDQUFDLENBQUM7S0FDVDtJQUVELE9BQU8sQ0FBQyxDQUFDO0FBQ1YsQ0FBQztBQXRCRCx3QkFzQkM7QUFHRCxTQUFnQixLQUFLLENBQUMsQ0FBUyxFQUFFLEdBQUcsSUFBYztJQUVqRCxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFDbEI7UUFDQyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ1A7SUFFRCxPQUFPLENBQUMsQ0FBQztBQUNWLENBQUM7QUFSRCxzQkFRQztBQUlELGFBQWE7QUFDYixPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRWhELGlEQUFpRDtBQUNqRCxxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzQvMTcvMDE3LlxuICovXG5cbmltcG9ydCB7ICRlbnVtLCBFbnVtV3JhcHBlciwgfSBmcm9tIFwidHMtZW51bS11dGlsXCI7XG5pbXBvcnQgeyBQT1NUQUcgfSBmcm9tICcuLi9QT1NUQUcnO1xuaW1wb3J0IHsgSVdvcmQgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5leHBvcnQgKiBmcm9tICcuL2NvcmUnO1xuXG5pbXBvcnQgeyBJV29yZERlYnVnLCBJV29yZERlYnVnSW5mbywgZGVidWdfdG9rZW4sIHRvSGV4LCB0b2tlbl9hZGRfaW5mbyB9IGZyb20gJy4vZGVidWcnO1xuZXhwb3J0IHsgSVdvcmREZWJ1ZywgSVdvcmREZWJ1Z0luZm8sIGRlYnVnX3Rva2VuLCB0b0hleCwgdG9rZW5fYWRkX2luZm8gfVxuXG5leHBvcnQgZnVuY3Rpb24gZGVidWdfaW5zcGVjdChhcmd2OiBhbnlbXSwgb3B0aW9uczogdXRpbC5JbnNwZWN0T3B0aW9ucyA9IHt9KVxue1xuXHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0Y29sb3JzOiB0cnVlLFxuXHR9LCBvcHRpb25zKTtcblxuXHRyZXR1cm4gYXJndi5tYXAoZnVuY3Rpb24gKGIpXG5cdHtcblx0XHRyZXR1cm4gdXRpbC5pbnNwZWN0KGIsIG9wdGlvbnMpO1xuXHR9LCBbXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWJ1ZyguLi5hcmd2KVxue1xuXHRyZXR1cm4gY29uc29sZS5sb2coLi4uZGVidWdfaW5zcGVjdChhcmd2KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWJ1Z19vcHRpb25zKGFyZ3Y6IGFueVtdLCBvcHRpb25zPzogdXRpbC5JbnNwZWN0T3B0aW9ucylcbntcblx0cmV0dXJuIGNvbnNvbGUubG9nKC4uLmRlYnVnX2luc3BlY3QoYXJndiwgb3B0aW9ucykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGV4QW5kQW55KG46IG51bWJlciwgcD86IG51bWJlciwgLi4uYXJndjogbnVtYmVyW10pOiBudW1iZXJcbmV4cG9ydCBmdW5jdGlvbiBoZXhBbmRBbnkobjogbnVtYmVyLCAuLi5hcmd2OiBudW1iZXJbXSlcbntcblx0aWYgKCFhcmd2Lmxlbmd0aClcblx0e1xuXHRcdHJldHVybiBuO1xuXHR9XG5cblx0Zm9yIChsZXQgdiBvZiBhcmd2KVxuXHR7XG5cdFx0bGV0IHIgPSAobiAmIHYpO1xuXG5cdFx0aWYgKHIpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHI7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZXhBbmQobjogbnVtYmVyLCBwPzogbnVtYmVyLCAuLi5hcmd2OiBudW1iZXJbXSk6IG51bWJlclxuZXhwb3J0IGZ1bmN0aW9uIGhleEFuZChuOiBudW1iZXIsIC4uLmFyZ3Y6IG51bWJlcltdKVxue1xuXHRpZiAoYXJndi5sZW5ndGgpXG5cdHtcblx0XHRsZXQgciA9IDA7XG5cblx0XHRmb3IgKGxldCB2IG9mIGFyZ3YpXG5cdFx0e1xuXHRcdFx0bGV0IHAgPSBuICYgdjtcblxuXHRcdFx0aWYgKCFwKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH1cblxuXHRcdFx0ciB8PSB2O1xuXHRcdH1cblxuXHRcdHJldHVybiByO1xuXHR9XG5cblx0cmV0dXJuIG47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZXhPcihuOiBudW1iZXIsIHA/OiBudW1iZXIsIC4uLmFyZ3Y6IG51bWJlcltdKTogbnVtYmVyXG5leHBvcnQgZnVuY3Rpb24gaGV4T3IobjogbnVtYmVyLCAuLi5hcmd2OiBudW1iZXJbXSlcbntcblx0Zm9yIChsZXQgdiBvZiBhcmd2KVxuXHR7XG5cdFx0biB8PSB2O1xuXHR9XG5cblx0cmV0dXJuIG47XG59XG5cbmV4cG9ydCBkZWNsYXJlIGZ1bmN0aW9uIGNsb25lRGVlcDxUIGV4dGVuZHMgb2JqZWN0IHwgQXJyYXk8YW55Pj4oZGF0YTogVCk6IFRcblxuLy8gQHRzLWlnbm9yZVxuZXhwb3J0cy5jbG9uZURlZXAgPSByZXF1aXJlKCdsb2Rhc2guY2xvbmVkZWVwJyk7XG5cbi8vbGV0IHAgPSBoZXhBbmQoMHg2MDAwIHwgMHg4MDAwLCAweDIwMDAsIDB4NDAwMClcbi8vZGVidWcocCwgdG9IZXgocCkpO1xuXG5cbiJdfQ==