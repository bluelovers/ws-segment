'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** 模块类型 */
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
    let ret = [];
    for (let i = 0, word; word = words[i]; i++) {
        if (word.p > 0) {
            ret.push(word);
            continue;
        }
        // 仅对未识别的词进行匹配
        let stopinfo = matchStopword(word.w);
        if (stopinfo.length < 1) {
            ret.push(word);
            continue;
        }
        // 分离出标点符号
        let lastc = 0;
        for (let ui = 0, sw; sw = stopinfo[ui]; ui++) {
            if (sw.c > lastc) {
                ret.push({ w: word.w.substr(lastc, sw.c - lastc) });
            }
            // 忽略空格
            if (sw.w != ' ') {
                ret.push({ w: sw.w, p: POSTAG.D_W });
            }
            else {
                // 保留空格
                ret.push({ w: sw.w, p: POSTAG.D_W });
            }
            lastc = sw.c + sw.w.length;
        }
        let lastsw = stopinfo[stopinfo.length - 1];
        if (lastsw.c + lastsw.w.length < word.w.length) {
            ret.push({ w: word.w.substr(lastsw.c + lastsw.w.length) });
        }
    }
    return ret;
}
exports.split = split;
// =================================================================
// 标点符号
exports._STOPWORD = (' ,.;+-|/\\\'":?<>[]{}=!@#$%^&*()~`' +
    '。，、＇：∶；?‘’“”〝〞ˆˇ﹕︰﹔﹖﹑·¨….¸;！´？！～—ˉ｜‖＂〃｀@﹫¡¿﹏﹋﹌︴々﹟#﹩$﹠&﹪%*﹡﹢﹦' +
    '﹤‐￣¯―﹨ˆ˜﹍﹎+=<­＿_-\ˇ~﹉﹊（）〈〉‹›﹛﹜『』〖〗［］《》〔〕{}「」【】︵︷︿︹︽_﹁﹃︻︶︸' +
    '﹀︺︾ˉ﹂﹄︼＋－×÷﹢﹣±／＝≈≡≠∧∨∑∏∪∩∈⊙⌒⊥∥∠∽≌＜＞≤≥≮≯∧∨√﹙﹚[]﹛﹜∫∮∝∞⊙∏' +
    '┌┬┐┏┳┓╒╤╕─│├┼┤┣╋┫╞╪╡━┃└┴┘┗┻┛╘╧╛┄┆┅┇╭─╮┏━┓╔╦╗┈┊│╳│┃┃╠╬╣┉┋╰─╯┗━┛' +
    '╚╩╝╲╱┞┟┠┡┢┦┧┨┩┪╉╊┭┮┯┰┱┲┵┶┷┸╇╈┹┺┽┾┿╀╁╂╃╄╅╆' +
    '○◇□△▽☆●◆■▲▼★♠♥♦♣☼☺◘♀√☻◙♂×▁▂▃▄▅▆▇█⊙◎۞卍卐╱╲▁▏↖↗↑←↔◤◥╲╱▔▕↙↘↓→↕◣◢∷▒░℡™')
    .split('');
exports._STOPWORD.push('・');
exports.STOPWORD = {};
exports.STOPWORD2 = {};
for (let i in exports._STOPWORD) {
    if (exports._STOPWORD[i] == '')
        continue;
    let len = exports._STOPWORD[i].length;
    exports.STOPWORD[exports._STOPWORD[i]] = len;
    if (!exports.STOPWORD2[len])
        exports.STOPWORD2[len] = {};
    exports.STOPWORD2[len][exports._STOPWORD[i]] = len;
}
// debug(STOPWORD2);
// =================================================================
/**
 * 匹配包含的标点符号，返回相关信息
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @return {array}  返回格式   {w: '网址', c: 开始位置}
 */
function matchStopword(text, cur) {
    if (isNaN(cur))
        cur = 0;
    let ret = [];
    let isMatch = false;
    while (cur < text.length) {
        let w;
        for (let i in exports.STOPWORD2) {
            w = text.substr(cur, i);
            if (w in exports.STOPWORD2[i]) {
                ret.push({ w: w, c: cur });
                isMatch = true;
                break;
            }
        }
        cur += isMatch === false ? 1 : w.length;
        isMatch = false;
    }
    return ret;
}
exports.matchStopword = matchStopword;
