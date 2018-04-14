"use strict";
/**
 * Created by user on 2018/4/15/015.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cjk_conv_1 = require("cjk-conv");
const uni_string_1 = require("uni-string");
function char_table(text) {
    let a = uni_string_1.default.split(text, '');
    return a
        .reduce(function (a, c) {
        a.push(cjk_conv_1.zhTable.auto(c));
        return a;
    }, []);
}
exports.char_table = char_table;
function text_list(text) {
    let aa = [];
    char_table(text)
        .forEach(function (v, index, arr) {
        f(v, '', 0, arr);
    });
    function f(v, str = '', index, arr) {
        return v.reduce(function (a, c) {
            let s = str + c;
            let i = index + 1;
            if (i < arr.length) {
                let r = f(arr[i], s, i, arr);
            }
            else if ((i) == arr.length) {
                aa.push(s);
            }
            return a;
        }, []);
    }
    return aa;
}
exports.text_list = text_list;
