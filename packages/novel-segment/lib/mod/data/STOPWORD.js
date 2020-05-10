"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STOPWORD2 = exports.STOPWORD = exports._STOPWORD = exports.NS_STOPWORD = void 0;
const array_hyper_unique_1 = require("array-hyper-unique");
var NS_STOPWORD;
(function (NS_STOPWORD) {
    var _a;
    NS_STOPWORD._TABLE = [
        ' ,.;+-|/\\\'":?<>[]{}=!@#$%^&*()~`' +
            '。，、＇：∶；?‘’“”〝〞ˆˇ﹕︰﹔﹖﹑·¨….¸;！´？！～—ˉ｜‖＂〃｀@﹫¡¿﹏﹋﹌︴々﹟#﹩$﹠&﹪%*﹡﹢﹦' +
            '﹤‐￣¯―﹨ˆ˜﹍﹎+=<­＿_-\ˇ~﹉﹊（）〈〉‹›﹛﹜『』〖〗［］《》〔〕{}「」【】︵︷︿︹︽_﹁﹃︻︶︸' +
            '﹀︺︾ˉ﹂﹄︼＋－×÷﹢﹣±／＝≈≡≠∧∨∑∏∪∩∈⊙⌒⊥∥∠∽≌＜＞≤≥≮≯∧∨√﹙﹚[]﹛﹜∫∮∝∞⊙∏' +
            '┌┬┐┏┳┓╒╤╕─│├┼┤┣╋┫╞╪╡━┃└┴┘┗┻┛╘╧╛┄┆┅┇╭─╮┏━┓╔╦╗┈┊│╳│┃┃╠╬╣┉┋╰─╯┗━┛' +
            '╚╩╝╲╱┞┟┠┡┢┦┧┨┩┪╉╊┭┮┯┰┱┲┵┶┷┸╇╈┹┺┽┾┿╀╁╂╃╄╅╆' +
            '○◇□△▽☆●◆■▲▼★♠♥♦♣☼☺◘♀√☻◙♂×▁▂▃▄▅▆▇█⊙◎۞卍卐╱╲▁▏↖↗↑←↔◤◥╲╱▔▕↙↘↓→↕◣◢∷▒░℡™',
        '．・　※',
        '⋯',
        /**
         * 丶並非標點符號 而為部首 但有的人會用這個作為 標點符號使用
         */
        '丶',
    ].join('');
    _a = parseStopWord(NS_STOPWORD._TABLE), NS_STOPWORD._STOPWORD = _a._STOPWORD, NS_STOPWORD.STOPWORD = _a.STOPWORD, NS_STOPWORD.STOPWORD2 = _a.STOPWORD2;
    function parseStopWord(_STOPWORD) {
        if (typeof _STOPWORD === 'string') {
            _STOPWORD = _STOPWORD.split('');
            //_STOPWORD = UString.split(_STOPWORD, '');
        }
        else if (!Array.isArray(_STOPWORD)) {
            throw new TypeError(`table must is string or string[]`);
        }
        _STOPWORD = array_hyper_unique_1.array_unique(_STOPWORD);
        let STOPWORD = {};
        let STOPWORD2 = {};
        for (let i in _STOPWORD) {
            if (_STOPWORD[i] == '')
                continue;
            let len = _STOPWORD[i].length;
            STOPWORD[_STOPWORD[i]] = len;
            if (!STOPWORD2[len])
                STOPWORD2[len] = {};
            STOPWORD2[len][_STOPWORD[i]] = len;
        }
        return {
            _STOPWORD,
            STOPWORD,
            STOPWORD2,
        };
    }
    NS_STOPWORD.parseStopWord = parseStopWord;
})(NS_STOPWORD = exports.NS_STOPWORD || (exports.NS_STOPWORD = {}));
exports._STOPWORD = NS_STOPWORD._STOPWORD, exports.STOPWORD = NS_STOPWORD.STOPWORD, exports.STOPWORD2 = NS_STOPWORD.STOPWORD2;
exports.default = exports;
//# sourceMappingURL=STOPWORD.js.map