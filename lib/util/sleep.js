"use strict";
/**
 * Created by user on 2018/4/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSupport = null;
try {
    let s = require.resolve('deasync');
    if (s) {
        exports.hasSupport = true;
    }
}
catch (e) {
    if (e.code == 'MODULE_NOT_FOUND') {
        exports.hasSupport = false;
    }
    else {
        console.error(e);
    }
}
function initDeAsync() {
    if (!exports.libDeAsync) {
        exports.libDeAsync = require('deasync');
    }
    return exports.libDeAsync;
}
exports.initDeAsync = initDeAsync;
function sleepSync(timeout) {
    let p = new Promise(function (done) {
        setTimeout(done, timeout);
    });
    initDeAsync().await(p);
    p = p.then(function () {
        return timeout;
    });
    return wrapPromiseFakeSync(p, timeout);
}
exports.sleepSync = sleepSync;
function awaitSync(pr) {
    pr = pr instanceof Promise ? pr : Promise.resolve(pr);
    let v = initDeAsync().await(pr);
    return wrapPromiseFakeSync(pr, v);
}
exports.awaitSync = awaitSync;
function wrapPromiseFakeSync(pr, value) {
    let p = pr;
    p.thenSync = function (fn) {
        return fn(value);
    };
    return p;
}
exports.wrapPromiseFakeSync = wrapPromiseFakeSync;
exports.default = sleepSync;
