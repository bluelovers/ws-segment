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
        var _a;
        if (typeof _STOPWORD === 'string') {
            _STOPWORD = _STOPWORD.split('');
            //_STOPWORD = UString.split(_STOPWORD, '');
        }
        else if (!Array.isArray(_STOPWORD)) {
            throw new TypeError(`table must is string or string[]`);
        }
        _STOPWORD = (0, array_hyper_unique_1.array_unique)(_STOPWORD);
        let STOPWORD = {};
        let STOPWORD2 = {};
        for (const _STOPWORDItem of _STOPWORD) {
            if (_STOPWORDItem === '')
                continue;
            let len = _STOPWORDItem.length;
            STOPWORD[_STOPWORDItem] = len;
            STOPWORD2[len] = (_a = STOPWORD2[len]) !== null && _a !== void 0 ? _a : {};
            STOPWORD2[len][_STOPWORDItem] = len;
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