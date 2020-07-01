"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchURL = exports.split = exports.init = exports.segment = exports.type = void 0;
/**
 * URL识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
/**
 * 模块类型
 * */
exports.type = 'tokenizer';
/**
 * 模块初始化
 *
 * @param {Segment} segment 分词接口
 */
function init(_segment) {
    exports.segment = _segment;
}
exports.init = init;
/**
 * 对未识别的单词进行分词
 *
 * @param {array} words 单词数组
 * @return {array}
 */
function split(words) {
    const POSTAG = exports.segment.POSTAG;
    const ret = [];
    for (let word of words) {
        if (word.p > 0) {
            ret.push(word);
            continue;
        }
        // 仅对未识别的词进行匹配
        const urlinfo = matchURL(word.w);
        if (urlinfo.length < 1) {
            ret.push(word);
            continue;
        }
        // 分离出URL
        let lastc = 0;
        for (let url of urlinfo) {
            if (url.c > lastc) {
                ret.push({ w: word.w.substr(lastc, url.c - lastc) });
            }
            ret.push({ w: url.w, p: POSTAG.URL });
            lastc = url.c + url.w.length;
        }
        const lasturl = urlinfo[urlinfo.length - 1];
        if (lasturl.c + lasturl.w.length < word.w.length) {
            ret.push({ w: word.w.substr(lasturl.c + lasturl.w.length) });
        }
    }
    // debug(ret);
    return ret;
}
exports.split = split;
/**
 * 协议URL头
 */
const PROTOTAL = ['http://', 'https://', 'ftp://', 'news://', 'telnet://'];
/**
 * 协议头最小长度
 */
let MIN_PROTOTAL_LEN = 100;
for (let i in PROTOTAL) {
    if (PROTOTAL[i].length < MIN_PROTOTAL_LEN) {
        MIN_PROTOTAL_LEN = PROTOTAL[i].length;
    }
}
/**
 * 允许出现在URL中的字符
 */
const URLCHAR = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '!',
    '#',
    '$',
    '%',
    '&',
    '‘',
    '(',
    ')',
    '*',
    '+',
    ',',
    '-',
    '.',
    '/',
    ':',
    ';',
    '=',
    '?',
    '@',
    '[',
    '\\',
    ']',
    '^',
    '_',
    '`',
    '|',
    '~',
].reduce((URLCHAR, c) => {
    URLCHAR[c] = true;
    return URLCHAR;
}, {});
/**
 * 匹配包含的网址，返回相关信息
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @return {array}  返回格式   {w: '网址', c: 开始位置}
 */
function matchURL(text, cur) {
    if (isNaN(cur))
        cur = 0;
    const ret = [];
    let s = null;
    while (cur < text.length) {
        // 判断是否为 http:// 之类的文本开头
        if (s === null && cur < text.length - MIN_PROTOTAL_LEN) {
            for (let prot of PROTOTAL) {
                if (text.substr(cur, prot.length) === prot) {
                    s = cur;
                    cur += prot.length - 1;
                    break;
                }
            }
        }
        else if (s !== null && !(text.charAt(cur) in URLCHAR)) {
            // 如果以http://之类开头，遇到了非URL字符，则结束
            ret.push({
                w: text.substr(s, cur - s),
                c: s,
            });
            s = null;
        }
        cur++;
    }
    // 检查剩余部分
    if (s !== null) {
        ret.push({
            w: text.substr(s, cur - s),
            c: s,
        });
    }
    return ret;
}
exports.matchURL = matchURL;
// debug(matchURL('http://www.baidu.com哈啊http://哇fdgggghttp://baidu.com/ss/'));
//# sourceMappingURL=URLTokenizer.js.map