'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
const index_1 = require("../util/index");
const CHS_NAMES_1 = require("../mod/CHS_NAMES");
const const_1 = require("../mod/const");
exports.DEFAULT_MAX_CHUNK_COUNT = 40;
exports.DEFAULT_MAX_CHUNK_COUNT_MIN = 30;
/**
 * 字典识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
class DictTokenizer extends mod_1.SubSModuleTokenizer {
    constructor() {
        super(...arguments);
        /**
         * 防止因無分段導致分析過久甚至超過處理負荷
         * 越高越精準但是處理時間會加倍成長甚至超過記憶體能處理的程度
         *
         * 數字越小越快
         *
         * FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
         *
         * @type {number}
         */
        this.MAX_CHUNK_COUNT = exports.DEFAULT_MAX_CHUNK_COUNT;
        /**
         *
         * 追加新模式使 MAX_CHUNK_COUNT 遞減來防止無分段長段落的總處理次數過高 由 DEFAULT_MAX_CHUNK_COUNT_MIN 來限制最小值
         */
        this.DEFAULT_MAX_CHUNK_COUNT_MIN = exports.DEFAULT_MAX_CHUNK_COUNT_MIN;
    }
    _cache() {
        super._cache();
        this._TABLE = this.segment.getDict('TABLE');
        this._TABLE2 = this.segment.getDict('TABLE2');
        this._POSTAG = this.segment.POSTAG;
        if (typeof this.segment.options.maxChunkCount == 'number' && this.segment.options.maxChunkCount > exports.DEFAULT_MAX_CHUNK_COUNT_MIN) {
            this.MAX_CHUNK_COUNT = this.segment.options.maxChunkCount;
        }
        if (typeof this.segment.options.minChunkCount == 'number' && this.segment.options.minChunkCount > exports.DEFAULT_MAX_CHUNK_COUNT_MIN) {
            this.DEFAULT_MAX_CHUNK_COUNT_MIN = this.segment.options.minChunkCount;
        }
    }
    /**
     * 对未识别的单词进行分词
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    split(words) {
        //debug(words);
        const TABLE = this._TABLE;
        const POSTAG = this._POSTAG;
        const self = this;
        let ret = [];
        for (let i = 0, word; word = words[i]; i++) {
            if (word.p > 0) {
                ret.push(word);
                continue;
            }
            // 仅对未识别的词进行匹配
            let wordinfo = this.matchWord(word.w, 0, words[i - 1]);
            if (wordinfo.length < 1) {
                ret.push(word);
                continue;
            }
            // 分离出已识别的单词
            let lastc = 0;
            wordinfo.forEach(function (bw, ui) {
                if (bw.c > lastc) {
                    ret.push({
                        w: word.w.substr(lastc, bw.c - lastc),
                    });
                }
                let cw = self.createRawToken({
                    w: bw.w,
                    f: bw.f,
                }, TABLE[bw.w]);
                ret.push(cw);
                /*
                ret.push({
                    w: bw.w,
                    p: ww.p,
                    f: bw.f,
                    s: ww.s,
                });
                */
                lastc = bw.c + bw.w.length;
            });
            let lastword = wordinfo[wordinfo.length - 1];
            if (lastword.c + lastword.w.length < word.w.length) {
                let cw = self.createRawToken({
                    w: word.w.substr(lastword.c + lastword.w.length),
                });
                ret.push(cw);
            }
        }
        words = undefined;
        return ret;
    }
    // =================================================================
    /**
     * 匹配单词，返回相关信息
     *
     * @param {string} text 文本
     * @param {int} cur 开始位置
     * @param {object} preword 上一个单词
     * @return {array}  返回格式   {w: '单词', c: 开始位置}
     */
    matchWord(text, cur, preword) {
        if (isNaN(cur))
            cur = 0;
        let ret = [];
        let s = false;
        const TABLE2 = this._TABLE2;
        // 匹配可能出现的单词
        while (cur < text.length) {
            for (let i in TABLE2) {
                let w = text.substr(cur, i);
                if (w in TABLE2[i]) {
                    ret.push({
                        w: w,
                        c: cur,
                        f: TABLE2[i][w].f,
                    });
                }
            }
            cur++;
        }
        return this.filterWord(ret, preword, text);
    }
    /**
     * 选择最有可能匹配的单词
     *
     * @param {array} words 单词信息数组
     * @param {object} preword 上一个单词
     * @param {string} text 本节要分词的文本
     * @return {array}
     */
    filterWord(words, preword, text) {
        const TABLE = this._TABLE;
        const POSTAG = this._POSTAG;
        let ret = [];
        // 将单词按位置分组
        let wordpos = this.getPosInfo(words, text);
        //debug(wordpos);
        /**
         * 使用类似于MMSG的分词算法
         * 找出所有分词可能，主要根据一下几项来评价：
         * x、词数量最少；
         * a、词平均频率最大；
         * b、每个词长度标准差最小；
         * c、未识别词最少；
         * d、符合语法结构项：如两个连续的动词减分，数词后面跟量词加分；
         * 取以上几项综合排名最最好的
         */
        let chunks = this.getChunks(wordpos, 0, text);
        //debug(chunks);
        let assess = []; // 评价表
        //console.log(chunks);
        // 对各个分支就行评估
        for (let i = 0, chunk; chunk = chunks[i]; i++) {
            assess[i] = {
                x: chunk.length,
                a: 0,
                b: 0,
                c: 0,
                d: 0,
                index: i,
            };
            // 词平均长度
            let sp = text.length / chunk.length;
            // 句子经常包含的语法结构
            let has_D_V = false; // 是否包含动词
            // 遍历各个词
            let prew;
            if (preword) {
                /*
                prew = {
                    w: preword.w,
                    p: preword.p,
                    f: preword.f,
                    s: preword.s,
                }
                */
                prew = this.createRawToken(preword);
            }
            else {
                prew = null;
            }
            for (let j = 0, w; w = chunk[j]; j++) {
                if (w.w in TABLE) {
                    w.p = TABLE[w.w].p;
                    assess[i].a += w.f; // 总词频
                    if (j == 0 && !preword && (w.p & POSTAG.D_V)) {
                        /**
                         * 將第一個字也計算進去是否包含動詞
                         */
                        has_D_V = true;
                    }
                    // ================ 检查语法结构 ===================
                    if (prew) {
                        // 如果上一个词是数词且当前词是量词（单位），则加分
                        if ((prew.p & POSTAG.A_M)
                            &&
                                (((w.p & POSTAG.A_Q))
                                    || w.w in const_1.DATETIME)) {
                            assess[i].d++;
                        }
                        // 如果当前词是动词
                        if ((w.p & POSTAG.D_V)) {
                            has_D_V = true;
                            // 如果是连续的两个动词，则减分
                            //if ((prew.p & POSTAG.D_V) > 0)
                            //assess[i].d--;
                            /*
                            // 如果是 形容词 + 动词，则加分
                            if ((prew.p & POSTAG.D_A))
                            {
                                assess[i].d++;
                            }
                            */
                            // 如果是 副词 + 动词，则加分
                            if (prew.p & POSTAG.D_D) {
                                assess[i].d++;
                            }
                        }
                        // 如果是地区名、机构名或形容词，后面跟地区、机构、代词、名词等，则加分
                        if (((prew.p & POSTAG.A_NS)
                            || (prew.p & POSTAG.A_NT)
                            || (prew.p & POSTAG.D_A)) &&
                            ((w.p & POSTAG.D_N)
                                || (w.p & POSTAG.A_NR)
                                || (w.p & POSTAG.A_NS)
                                || (w.p & POSTAG.A_NZ)
                                || (w.p & POSTAG.A_NT))) {
                            assess[i].d++;
                        }
                        // 如果是 方位词 + 数量词，则加分
                        if ((prew.p & POSTAG.D_F)
                            &&
                                ((w.p & POSTAG.A_M)
                                    || (w.p & POSTAG.D_MQ))) {
                            //debug(prew, w);
                            assess[i].d++;
                        }
                        // 如果是 姓 + 名词，则加分
                        if ((prew.w in CHS_NAMES_1.FAMILY_NAME_1
                            || prew.w in CHS_NAMES_1.FAMILY_NAME_2) &&
                            ((w.p & POSTAG.D_N)
                                || (w.p & POSTAG.A_NZ))) {
                            //debug(prew, w);
                            assess[i].d++;
                        }
                        /**
                         * 地名/处所 + 方位
                         */
                        if (index_1.hexAndAny(prew.p, POSTAG.D_S, POSTAG.A_NS) && index_1.hexAndAny(w.p, POSTAG.D_F)) {
                            assess[i].d += 0.5;
                        }
                        // 探测下一个词
                        let nextw = chunk[j + 1];
                        if (nextw) {
                            if (nextw.w in TABLE) {
                                nextw.p = TABLE[nextw.w].p;
                            }
                            let _temp_ok = true;
                            /**
                             * 如果当前是“的”+ 名词，则加分
                             */
                            if ((w.w == '的' || w.w == '之')
                                && nextw.p && ((nextw.p & POSTAG.D_N)
                                || (nextw.p & POSTAG.D_V)
                                || (nextw.p & POSTAG.A_NR)
                                || (nextw.p & POSTAG.A_NS)
                                || (nextw.p & POSTAG.A_NZ)
                                || (nextw.p & POSTAG.A_NT))) {
                                assess[i].d += 1.5;
                                _temp_ok = false;
                            }
                            /**
                             * 如果是连词，前后两个词词性相同则加分
                             */
                            else if (prew.p && (w.p & POSTAG.D_C)) {
                                let p = prew.p & nextw.p;
                                if (prew.p === nextw.p) {
                                    assess[i].d++;
                                    _temp_ok = false;
                                }
                                else if (p) {
                                    assess[i].d += 0.25;
                                    _temp_ok = false;
                                    if (p & POSTAG.D_N) {
                                        assess[i].d += 0.75;
                                    }
                                }
                            }
                            /**
                             * 在感動的重逢中有余在的話就太過閃耀
                             */
                            if (_temp_ok && (w.p & POSTAG.D_R) && (nextw.p & POSTAG.D_P)) {
                                assess[i].d += 1;
                                _temp_ok = false;
                            }
                            if (_temp_ok && nextw.p && (w.p & POSTAG.D_P)) {
                                if (nextw.p & POSTAG.A_NR && (nextw.w.length > 1)) {
                                    assess[i].d++;
                                    if (prew.w == '的') {
                                        /**
                                         * 的 + 介詞 + 人名
                                         */
                                        assess[i].d += 1;
                                        _temp_ok = false;
                                    }
                                }
                            }
                            if (_temp_ok && (w.p & POSTAG.D_P) && index_1.hexAndAny(prew.p, POSTAG.D_N) && index_1.hexAndAny(nextw.p, POSTAG.D_N, POSTAG.D_V)) {
                                assess[i].d++;
                                _temp_ok = false;
                            }
                            else if (_temp_ok && (w.p & POSTAG.D_P) && index_1.hexAndAny(prew.p, POSTAG.D_R) && index_1.hexAndAny(nextw.p, POSTAG.D_R)) {
                                assess[i].d += 0.5;
                                _temp_ok = false;
                            }
                            // @FIXME 暴力解決 三天后 的問題
                            if (nextw.w == '后' && w.p & POSTAG.D_T && index_1.hexAndAny(prew.p, POSTAG.D_MQ, POSTAG.A_M)) {
                                assess[i].d++;
                            }
                            // @FIXME 到湖中間后手終於能休息了
                            else if ((nextw.w == '后'
                                || nextw.w == '後')
                                && index_1.hexAndAny(w.p, POSTAG.D_F)) {
                                assess[i].d++;
                            }
                            if ((w.w == '后'
                                || w.w == '後')
                                && index_1.hexAndAny(prew.p, POSTAG.D_F)
                                && index_1.hexAndAny(nextw.p, POSTAG.D_N)) {
                                assess[i].d++;
                            }
                        }
                        else {
                            let _temp_ok = true;
                            /**
                             * 她把荷包蛋摆在像是印度烤饼的面包上
                             */
                            if (_temp_ok && (w.p & POSTAG.D_F) && index_1.hexAndAny(prew.p, POSTAG.D_N)) {
                                assess[i].d += 1;
                                _temp_ok = false;
                            }
                        }
                    }
                    // ===========================================
                }
                else {
                    // 未识别的词数量
                    assess[i].c++;
                }
                // 标准差
                assess[i].b += Math.pow(sp - w.w.length, 2);
                prew = chunk[j];
            }
            // 如果句子中包含了至少一个动词
            if (has_D_V === false)
                assess[i].d -= 0.5;
            assess[i].a = assess[i].a / chunk.length;
            assess[i].b = assess[i].b / chunk.length;
        }
        //console.dir(assess);
        // 计算排名
        let top = this.getTops(assess);
        let currchunk = chunks[top];
        if (false) {
            //console.log(assess);
            //console.log(Object.entries(chunks));
            console.dir(Object.entries(chunks)
                .map(([i, chunk]) => { return { i, asses: assess[i], chunk }; }), { depth: 5 });
            console.dir({ i: top, asses: assess[top], currchunk });
            //console.log(top);
            //console.log(currchunk);
        }
        // 剔除不能识别的词
        for (let i = 0, word; word = currchunk[i]; i++) {
            if (!(word.w in TABLE)) {
                currchunk.splice(i--, 1);
            }
        }
        ret = currchunk;
        // 試圖主動清除記憶體
        assess = undefined;
        chunks = undefined;
        currchunk = undefined;
        top = undefined;
        wordpos = undefined;
        //debug(ret);
        return ret;
    }
    /**
     * 评价排名
     *
     * @param {object} assess
     * @return {object}
     */
    getTops(assess) {
        //debug(assess);
        // 取各项最大值
        let top = {
            x: assess[0].x,
            a: assess[0].a,
            b: assess[0].b,
            c: assess[0].c,
            d: assess[0].d,
        };
        for (let i = 1, ass; ass = assess[i]; i++) {
            if (ass.a > top.a)
                top.a = ass.a; // 取最大平均词频
            if (ass.b < top.b)
                top.b = ass.b; // 取最小标准差
            if (ass.c > top.c)
                top.c = ass.c; // 取最大未识别词
            if (ass.d < top.d)
                top.d = ass.d; // 取最小语法分数
            if (ass.x > top.x)
                top.x = ass.x; // 取最大单词数量
        }
        //debug(top);
        // 评估排名
        let tops = [];
        for (let i = 0, ass; ass = assess[i]; i++) {
            tops[i] = 0;
            // 词数量，越小越好
            tops[i] += (top.x - ass.x) * 1.5;
            // 词总频率，越大越好
            if (ass.a >= top.a)
                tops[i] += 1;
            // 词标准差，越小越好
            if (ass.b <= top.b)
                tops[i] += 1;
            // 未识别词，越小越好
            tops[i] += (top.c - ass.c); //debug(tops[i]);
            // 符合语法结构程度，越大越好
            tops[i] += (ass.d < 0 ? top.d + ass.d : ass.d - top.d) * 1;
            ass.score = tops[i];
            //debug(tops[i]);debug('---');
        }
        //debug(tops.join('  '));
        //console.log(tops);
        //console.log(assess);
        //const old_method = true;
        const old_method = false;
        // 取分数最高的
        let curri = 0;
        let maxs = tops[0];
        for (let i in tops) {
            let s = tops[i];
            if (s > maxs) {
                curri = i;
                maxs = s;
            }
            else if (s == maxs) {
                /**
                 * 如果分数相同，则根据词长度、未识别词个数和平均频率来选择
                 *
                 * 如果依然同分，則保持不變
                 */
                let a = 0;
                let b = 0;
                if (assess[i].c < assess[curri].c) {
                    a++;
                }
                else if (assess[i].c !== assess[curri].c) {
                    b++;
                }
                if (assess[i].a > assess[curri].a) {
                    a++;
                }
                else if (assess[i].a !== assess[curri].a) {
                    b++;
                }
                if (assess[i].x < assess[curri].x) {
                    a++;
                }
                else if (assess[i].x !== assess[curri].x) {
                    b++;
                }
                if (a > b) {
                    curri = i;
                    maxs = s;
                }
            }
            //debug({ i, s, maxs, curri });
        }
        //debug('max: i=' + curri + ', s=' + tops[curri]);
        assess = undefined;
        top = undefined;
        return curri;
    }
    /**
     * 将单词按照位置排列
     *
     * @param {array} words
     * @param {string} text
     * @return {object}
     */
    getPosInfo(words, text) {
        let wordpos = {};
        // 将单词按位置分组
        for (let i = 0, word; word = words[i]; i++) {
            if (!wordpos[word.c]) {
                wordpos[word.c] = [];
            }
            wordpos[word.c].push(word);
        }
        // 按单字分割文本，填补空缺的位置
        for (let i = 0; i < text.length; i++) {
            if (!wordpos[i]) {
                wordpos[i] = [{ w: text.charAt(i), c: i, f: 0 }];
            }
        }
        return wordpos;
    }
    /**
     * 取所有分支
     *
     * @param {{[p: number]: Segment.IWord[]}} wordpos
     * @param {number} pos 当前位置
     * @param {string} text 本节要分词的文本
     * @param {number} total_count
     * @returns {Segment.IWord[][]}
     */
    getChunks(wordpos, pos, text, total_count = 0, MAX_CHUNK_COUNT) {
        /**
         *
         * 追加新模式使 MAX_CHUNK_COUNT 遞減來防止無分段長段落的總處理次數過高 由 DEFAULT_MAX_CHUNK_COUNT_MIN 來限制最小值
         */
        if (total_count == 0) {
            MAX_CHUNK_COUNT = this.MAX_CHUNK_COUNT;
            /**
             * 只有當目前文字長度大於 MAX_CHUNK_COUNT 時才遞減
             */
            if (text.length < MAX_CHUNK_COUNT) {
                MAX_CHUNK_COUNT += 1;
            }
        }
        else if (MAX_CHUNK_COUNT <= this.MAX_CHUNK_COUNT) {
            MAX_CHUNK_COUNT = Math.max(MAX_CHUNK_COUNT - 1, this.DEFAULT_MAX_CHUNK_COUNT_MIN, exports.DEFAULT_MAX_CHUNK_COUNT_MIN);
        }
        else {
            //MAX_CHUNK_COUNT = Math.max(MAX_CHUNK_COUNT, this.DEFAULT_MAX_CHUNK_COUNT_MIN, DEFAULT_MAX_CHUNK_COUNT_MIN)
        }
        /**
         * 忽略連字
         *
         * 例如: 啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊
         */
        let m;
        if (m = text.match(/^((.+)\2{5,})/)) {
            let s1 = text.slice(0, m[1].length);
            let s2 = text.slice(m[1].length);
            let word = {
                w: s1,
                c: pos,
                f: 0,
            };
            let ret = [];
            if (s2 !== '') {
                let chunks = this.getChunks(wordpos, pos + s1.length, s2, total_count, MAX_CHUNK_COUNT);
                for (let j = 0; j < chunks.length; j++) {
                    ret.push([word].concat(chunks[j]));
                }
            }
            else {
                ret.push([word]);
            }
            //			console.dir(wordpos);
            //
            //			console.dir(ret);
            //
            //			console.dir([pos, text, total_count]);
            return ret;
        }
        total_count++;
        let words = wordpos[pos] || [];
        //debug(total_count, MAX_CHUNK_COUNT);
        //		debug({
        //			total_count,
        //			MAX_CHUNK_COUNT: this.MAX_CHUNK_COUNT,
        //			text,
        //			words,
        //		});
        // debug('getChunks: ');
        // debug(words);
        //throw new Error();
        let ret = [];
        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            //debug(word);
            let nextcur = word.c + word.w.length;
            /**
             * @FIXME
             */
            if (!wordpos[nextcur]) {
                ret.push([word]);
            }
            else if (total_count > MAX_CHUNK_COUNT) {
                // do something
                //				console.log(444, words.slice(i));
                //				console.log(333, word);
                let w1 = [word];
                let j = nextcur;
                while (j in wordpos) {
                    let w2 = wordpos[j][0];
                    if (w2) {
                        w1.push(w2);
                        j += w2.w.length;
                    }
                    else {
                        break;
                    }
                }
                ret.push(w1);
            }
            else {
                let t = text.slice(word.w.length);
                let chunks = this.getChunks(wordpos, nextcur, t, total_count, MAX_CHUNK_COUNT);
                for (let j = 0; j < chunks.length; j++) {
                    ret.push([word].concat(chunks[j]));
                }
                chunks = null;
            }
        }
        words = undefined;
        wordpos = undefined;
        m = undefined;
        return ret;
    }
}
exports.DictTokenizer = DictTokenizer;
exports.init = DictTokenizer.init.bind(DictTokenizer);
exports.default = DictTokenizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGljdFRva2VuaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRpY3RUb2tlbml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLGdDQUE4RTtBQUk5RSx5Q0FBaUQ7QUFDakQsZ0RBQXNIO0FBR3RILHdDQUF3QztBQUczQixRQUFBLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztBQUM3QixRQUFBLDJCQUEyQixHQUFHLEVBQUUsQ0FBQztBQUU5Qzs7OztHQUlHO0FBQ0gsTUFBYSxhQUFjLFNBQVEseUJBQW1CO0lBQXREOztRQUdDOzs7Ozs7Ozs7V0FTRztRQUNILG9CQUFlLEdBQUcsK0JBQXVCLENBQUM7UUFDMUM7OztXQUdHO1FBQ0gsZ0NBQTJCLEdBQUcsbUNBQTJCLENBQUM7SUF1MEIzRCxDQUFDO0lBbDBCQSxNQUFNO1FBRUwsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFbkMsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLG1DQUEyQixFQUM3SDtZQUNDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1NBQzFEO1FBRUQsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8s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QUFDLENBQUM7WUFDZCxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDZCxDQUFDO1FBRUYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBZSxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQ3JEO1lBQ0MsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFLFVBQVU7WUFDN0MsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFLFNBQVM7WUFDNUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFLFVBQVU7WUFDN0MsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFLFVBQVU7WUFDN0MsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFLFVBQVU7U0FDN0M7UUFDRCxhQUFhO1FBRWIsT0FBTztRQUNQLElBQUksSUFBSSxHQUFhLEVBQUUsQ0FBQztRQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFlLEVBQUUsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFDckQ7WUFDQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1osV0FBVztZQUNYLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNqQyxZQUFZO1lBQ1osSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2dCQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakMsWUFBWTtZQUNaLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztnQkFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pDLFlBQVk7WUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLGlCQUFpQjtZQUM1QyxnQkFBZ0I7WUFDaEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTNELEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXBCLDhCQUE4QjtTQUM5QjtRQUNELHlCQUF5QjtRQUV6QixvQkFBb0I7UUFDcEIsc0JBQXNCO1FBRXRCLDBCQUEwQjtRQUMxQixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFFekIsU0FBUztRQUNULElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQixLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFDbEI7WUFDQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUNaO2dCQUNDLEtBQUssR0FBRyxDQUFrQixDQUFDO2dCQUMzQixJQUFJLEdBQUcsQ0FBQyxDQUFDO2FBQ1Q7aUJBQ0ksSUFBSSxDQUFDLElBQUksSUFBSSxFQUNsQjtnQkFDQzs7OzttQkFJRztnQkFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNWLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUNqQztvQkFDQyxDQUFDLEVBQUUsQ0FBQztpQkFDSjtxQkFDSSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDeEM7b0JBQ0MsQ0FBQyxFQUFFLENBQUM7aUJBQ0o7Z0JBQ0QsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ2pDO29CQUNDLENBQUMsRUFBRSxDQUFDO2lCQUNKO3FCQUNJLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUN4QztvQkFDQyxDQUFDLEVBQUUsQ0FBQztpQkFDSjtnQkFDRCxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDakM7b0JBQ0MsQ0FBQyxFQUFFLENBQUM7aUJBQ0o7cUJBQ0ksSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ3hDO29CQUNDLENBQUMsRUFBRSxDQUFDO2lCQUNKO2dCQUNELElBQUksQ0FBQyxHQUFHLENBQUMsRUFDVDtvQkFDQyxLQUFLLEdBQUcsQ0FBa0IsQ0FBQztvQkFDM0IsSUFBSSxHQUFHLENBQUMsQ0FBQztpQkFDVDthQUNEO1lBQ0QsK0JBQStCO1NBQy9CO1FBQ0Qsa0RBQWtEO1FBRWxELE1BQU0sR0FBRyxTQUFTLENBQUM7UUFDbkIsR0FBRyxHQUFHLFNBQVMsQ0FBQztRQUVoQixPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxVQUFVLENBQUMsS0FBYyxFQUFFLElBQVk7UUFJdEMsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLFdBQVc7UUFDWCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFDMUM7WUFDQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDcEI7Z0JBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDckI7WUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMzQjtRQUNELGtCQUFrQjtRQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFDcEM7WUFDQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUNmO2dCQUNDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNqRDtTQUNEO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsU0FBUyxDQUFDLE9BRVQsRUFBRSxHQUFXLEVBQUUsSUFBYSxFQUFFLFdBQVcsR0FBRyxDQUFDLEVBQUUsZUFBd0I7UUFHdkU7OztXQUdHO1FBQ0gsSUFBSSxXQUFXLElBQUksQ0FBQyxFQUNwQjtZQUNDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBRXZDOztlQUVHO1lBQ0gsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLGVBQWUsRUFDakM7Z0JBQ0MsZUFBZSxJQUFJLENBQUMsQ0FBQzthQUNyQjtTQUNEO2FBQ0ksSUFBSSxlQUFlLElBQUksSUFBSSxDQUFDLGVBQWUsRUFDaEQ7WUFDQyxlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQywyQkFBMkIsRUFBRSxtQ0FBMkIsQ0FBQyxDQUFBO1NBQzlHO2FBRUQ7WUFDQyw0R0FBNEc7U0FDNUc7UUFFRDs7OztXQUlHO1FBQ0gsSUFBSSxDQUFDLENBQUM7UUFDTixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxFQUNuQztZQUNDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVqQyxJQUFJLElBQUksR0FBRztnQkFDVixDQUFDLEVBQUUsRUFBRTtnQkFDTCxDQUFDLEVBQUUsR0FBRztnQkFDTixDQUFDLEVBQUUsQ0FBQzthQUNLLENBQUM7WUFFWCxJQUFJLEdBQUcsR0FBYyxFQUFFLENBQUM7WUFFeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUNiO2dCQUNDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7Z0JBRXhGLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUN0QztvQkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ25DO2FBQ0Q7aUJBRUQ7Z0JBQ0MsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDakI7WUFFSiwwQkFBMEI7WUFDMUIsRUFBRTtZQUNGLHNCQUFzQjtZQUN0QixFQUFFO1lBQ0YsMkNBQTJDO1lBRXhDLE9BQU8sR0FBRyxDQUFDO1NBQ1g7UUFFRCxXQUFXLEVBQUUsQ0FBQztRQUVkLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFL0Isc0NBQXNDO1FBRXhDLFdBQVc7UUFDWCxpQkFBaUI7UUFDakIsMkNBQTJDO1FBQzNDLFVBQVU7UUFDVixXQUFXO1FBQ1gsT0FBTztRQUVMLHdCQUF3QjtRQUN4QixnQkFBZ0I7UUFDaEIsb0JBQW9CO1FBRXBCLElBQUksR0FBRyxHQUFjLEVBQUUsQ0FBQztRQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFDckM7WUFDQyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsY0FBYztZQUNkLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDckM7O2VBRUc7WUFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUNyQjtnQkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNqQjtpQkFDSSxJQUFJLFdBQVcsR0FBRyxlQUFlLEVBQ3RDO2dCQUNDLGVBQWU7Z0JBRW5CLHVDQUF1QztnQkFDdkMsNkJBQTZCO2dCQUV6QixJQUFJLEVBQUUsR0FBWSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUV6QixJQUFJLENBQUMsR0FBRyxPQUFPLENBQUM7Z0JBQ2hCLE9BQU8sQ0FBQyxJQUFJLE9BQU8sRUFDbkI7b0JBQ0MsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUV2QixJQUFJLEVBQUUsRUFDTjt3QkFDQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUVaLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztxQkFDakI7eUJBRUQ7d0JBQ0MsTUFBTTtxQkFDTjtpQkFDRDtnQkFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ2I7aUJBRUQ7Z0JBQ0MsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVsQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxlQUFlLENBQUUsQ0FBQztnQkFDaEYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQ3RDO29CQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDbkM7Z0JBRUQsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNkO1NBQ0Q7UUFFRCxLQUFLLEdBQUcsU0FBUyxDQUFDO1FBQ2xCLE9BQU8sR0FBRyxTQUFTLENBQUM7UUFDcEIsQ0FBQyxHQUFHLFNBQVMsQ0FBQztRQUVkLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUNEO0FBejFCRCxzQ0F5MUJDO0FBa0RZLFFBQUEsSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBdUMsQ0FBQztBQUVqRyxrQkFBZSxhQUFhLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IFN1YlNNb2R1bGUsIFN1YlNNb2R1bGVUb2tlbml6ZXIsIElTdWJUb2tlbml6ZXJDcmVhdGUgfSBmcm9tICcuLi9tb2QnO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHsgVVN0cmluZyB9IGZyb20gJ3VuaS1zdHJpbmcnO1xuaW1wb3J0IHsgSVRhYmxlRGljdFJvdyB9IGZyb20gJy4uL3RhYmxlL2RpY3QnO1xuaW1wb3J0IHsgaGV4QW5kQW55LCB0b0hleCB9IGZyb20gJy4uL3V0aWwvaW5kZXgnO1xuaW1wb3J0IENIU19OQU1FUywgeyBGQU1JTFlfTkFNRV8xLCBGQU1JTFlfTkFNRV8yLCBTSU5HTEVfTkFNRSwgRE9VQkxFX05BTUVfMSwgRE9VQkxFX05BTUVfMiB9IGZyb20gJy4uL21vZC9DSFNfTkFNRVMnO1xuaW1wb3J0IFNlZ21lbnQsIHsgSURJQ1QsIElXb3JkLCBJRElDVDIgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCB7IGRlYnVnIH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgeyBEQVRFVElNRSB9IGZyb20gJy4uL21vZC9jb25zdCc7XG5pbXBvcnQgSVBPU1RBRyBmcm9tICcuLi9QT1NUQUcnO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9NQVhfQ0hVTktfQ09VTlQgPSA0MDtcbmV4cG9ydCBjb25zdCBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4gPSAzMDtcblxuLyoqXG4gKiDlrZflhbjor4bliKvmqKHlnZdcbiAqXG4gKiBAYXV0aG9yIOiAgembtzxsZWl6b25nbWluQGdtYWlsLmNvbT5cbiAqL1xuZXhwb3J0IGNsYXNzIERpY3RUb2tlbml6ZXIgZXh0ZW5kcyBTdWJTTW9kdWxlVG9rZW5pemVyXG57XG5cblx0LyoqXG5cdCAqIOmYsuatouWboOeEoeWIhuauteWwjuiHtOWIhuaekOmBjuS5heeUmuiHs+i2hemBjuiZleeQhuiyoOiNt1xuXHQgKiDotorpq5jotornsr7mupbkvYbmmK/omZXnkIbmmYLplpPmnIPliqDlgI3miJDplbfnlJroh7PotoXpgY7oqJjmhrbpq5Tog73omZXnkIbnmoTnqIvluqZcblx0ICpcblx0ICog5pW45a2X6LaK5bCP6LaK5b+rXG5cdCAqXG5cdCAqIEZBVEFMIEVSUk9SOiBDQUxMX0FORF9SRVRSWV9MQVNUIEFsbG9jYXRpb24gZmFpbGVkIC0gSmF2YVNjcmlwdCBoZWFwIG91dCBvZiBtZW1vcnlcblx0ICpcblx0ICogQHR5cGUge251bWJlcn1cblx0ICovXG5cdE1BWF9DSFVOS19DT1VOVCA9IERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UO1xuXHQvKipcblx0ICpcblx0ICog6L+95Yqg5paw5qih5byP5L2/IE1BWF9DSFVOS19DT1VOVCDpgZ7muJvkvobpmLLmraLnhKHliIbmrrXplbfmrrXokL3nmoTnuL3omZXnkIbmrKHmlbjpgY7pq5gg55SxIERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTiDkvobpmZDliLbmnIDlsI/lgLxcblx0ICovXG5cdERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTiA9IERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTjtcblxuXHRwcm90ZWN0ZWQgX1RBQkxFOiBJRElDVDxJV29yZD47XG5cdHByb3RlY3RlZCBfVEFCTEUyOiBJRElDVDI8SVdvcmQ+O1xuXG5cdF9jYWNoZSgpXG5cdHtcblx0XHRzdXBlci5fY2FjaGUoKTtcblx0XHR0aGlzLl9UQUJMRSA9IHRoaXMuc2VnbWVudC5nZXREaWN0KCdUQUJMRScpO1xuXHRcdHRoaXMuX1RBQkxFMiA9IHRoaXMuc2VnbWVudC5nZXREaWN0KCdUQUJMRTInKTtcblx0XHR0aGlzLl9QT1NUQUcgPSB0aGlzLnNlZ21lbnQuUE9TVEFHO1xuXG5cdFx0aWYgKHR5cGVvZiB0aGlzLnNlZ21lbnQub3B0aW9ucy5tYXhDaHVua0NvdW50ID09ICdudW1iZXInICYmIHRoaXMuc2VnbWVudC5vcHRpb25zLm1heENodW5rQ291bnQgPiBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4pXG5cdFx0e1xuXHRcdFx0dGhpcy5NQVhfQ0hVTktfQ09VTlQgPSB0aGlzLnNlZ21lbnQub3B0aW9ucy5tYXhDaHVua0NvdW50O1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgdGhpcy5zZWdtZW50Lm9wdGlvbnMubWluQ2h1bmtDb3VudCA9PSAnbnVtYmVyJyAmJiB0aGlzLnNlZ21lbnQub3B0aW9ucy5taW5DaHVua0NvdW50ID4gREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOKVxuXHRcdHtcblx0XHRcdHRoaXMuREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOID0gdGhpcy5zZWdtZW50Lm9wdGlvbnMubWluQ2h1bmtDb3VudDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICog5a+55pyq6K+G5Yir55qE5Y2V6K+N6L+b6KGM5YiG6K+NXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuXHQgKiBAcmV0dXJuIHthcnJheX1cblx0ICovXG5cdHNwbGl0KHdvcmRzOiBJV29yZFtdKTogSVdvcmRbXVxuXHR7XG5cdFx0Ly9kZWJ1Zyh3b3Jkcyk7XG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLl9UQUJMRTtcblx0XHRjb25zdCBQT1NUQUcgPSB0aGlzLl9QT1NUQUc7XG5cblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMCwgd29yZDsgd29yZCA9IHdvcmRzW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKHdvcmQucCA+IDApXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKHdvcmQpO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8g5LuF5a+55pyq6K+G5Yir55qE6K+N6L+b6KGM5Yy56YWNXG5cdFx0XHRsZXQgd29yZGluZm8gPSB0aGlzLm1hdGNoV29yZCh3b3JkLncsIDAsIHdvcmRzW2kgLSAxXSk7XG5cdFx0XHRpZiAod29yZGluZm8ubGVuZ3RoIDwgMSlcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2god29yZCk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyDliIbnprvlh7rlt7Lor4bliKvnmoTljZXor41cblx0XHRcdGxldCBsYXN0YyA9IDA7XG5cblx0XHRcdHdvcmRpbmZvLmZvckVhY2goZnVuY3Rpb24gKGJ3LCB1aSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKGJ3LmMgPiBsYXN0Yylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldC5wdXNoKHtcblx0XHRcdFx0XHRcdHc6IHdvcmQudy5zdWJzdHIobGFzdGMsIGJ3LmMgLSBsYXN0YyksXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgY3cgPSBzZWxmLmNyZWF0ZVJhd1Rva2VuKHtcblx0XHRcdFx0XHR3OiBidy53LFxuXHRcdFx0XHRcdGY6IGJ3LmYsXG5cdFx0XHRcdH0sIFRBQkxFW2J3LnddKTtcblxuXHRcdFx0XHRyZXQucHVzaChjdyk7XG5cblx0XHRcdFx0Lypcblx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdHc6IGJ3LncsXG5cdFx0XHRcdFx0cDogd3cucCxcblx0XHRcdFx0XHRmOiBidy5mLFxuXHRcdFx0XHRcdHM6IHd3LnMsXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQqL1xuXHRcdFx0XHRsYXN0YyA9IGJ3LmMgKyBidy53Lmxlbmd0aDtcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgbGFzdHdvcmQgPSB3b3JkaW5mb1t3b3JkaW5mby5sZW5ndGggLSAxXTtcblx0XHRcdGlmIChsYXN0d29yZC5jICsgbGFzdHdvcmQudy5sZW5ndGggPCB3b3JkLncubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgY3cgPSBzZWxmLmNyZWF0ZVJhd1Rva2VuKHtcblx0XHRcdFx0XHR3OiB3b3JkLncuc3Vic3RyKGxhc3R3b3JkLmMgKyBsYXN0d29yZC53Lmxlbmd0aCksXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldC5wdXNoKGN3KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR3b3JkcyA9IHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5cdC8qKlxuXHQgKiDljLnphY3ljZXor43vvIzov5Tlm57nm7jlhbPkv6Hmga9cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQg5paH5pysXG5cdCAqIEBwYXJhbSB7aW50fSBjdXIg5byA5aeL5L2N572uXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwcmV3b3JkIOS4iuS4gOS4quWNleivjVxuXHQgKiBAcmV0dXJuIHthcnJheX0gIOi/lOWbnuagvOW8jyAgIHt3OiAn5Y2V6K+NJywgYzog5byA5aeL5L2N572ufVxuXHQgKi9cblx0cHJvdGVjdGVkIG1hdGNoV29yZCh0ZXh0OiBzdHJpbmcsIGN1cjogbnVtYmVyLCBwcmV3b3JkOiBJV29yZClcblx0e1xuXHRcdGlmIChpc05hTihjdXIpKSBjdXIgPSAwO1xuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblx0XHRsZXQgcyA9IGZhbHNlO1xuXG5cdFx0Y29uc3QgVEFCTEUyID0gdGhpcy5fVEFCTEUyO1xuXG5cdFx0Ly8g5Yy56YWN5Y+v6IO95Ye6546w55qE5Y2V6K+NXG5cdFx0d2hpbGUgKGN1ciA8IHRleHQubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGZvciAobGV0IGkgaW4gVEFCTEUyKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdyA9IHRleHQuc3Vic3RyKGN1ciwgaSBhcyBhbnkgYXMgbnVtYmVyKTtcblx0XHRcdFx0aWYgKHcgaW4gVEFCTEUyW2ldKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdFx0dzogdyxcblx0XHRcdFx0XHRcdGM6IGN1cixcblx0XHRcdFx0XHRcdGY6IFRBQkxFMltpXVt3XS5mLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjdXIrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5maWx0ZXJXb3JkKHJldCwgcHJld29yZCwgdGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICog6YCJ5oup5pyA5pyJ5Y+v6IO95Yy56YWN55qE5Y2V6K+NXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeS/oeaBr+aVsOe7hFxuXHQgKiBAcGFyYW0ge29iamVjdH0gcHJld29yZCDkuIrkuIDkuKrljZXor41cblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQg5pys6IqC6KaB5YiG6K+N55qE5paH5pysXG5cdCAqIEByZXR1cm4ge2FycmF5fVxuXHQgKi9cblx0cHJvdGVjdGVkIGZpbHRlcldvcmQod29yZHM6IElXb3JkW10sIHByZXdvcmQ6IElXb3JkLCB0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuX1RBQkxFO1xuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuX1BPU1RBRztcblx0XHRsZXQgcmV0OiBJV29yZFtdID0gW107XG5cblx0XHQvLyDlsIbljZXor43mjInkvY3nva7liIbnu4Rcblx0XHRsZXQgd29yZHBvcyA9IHRoaXMuZ2V0UG9zSW5mbyh3b3JkcywgdGV4dCk7XG5cdFx0Ly9kZWJ1Zyh3b3JkcG9zKTtcblxuXHRcdC8qKlxuXHRcdCAqIOS9v+eUqOexu+S8vOS6jk1NU0fnmoTliIbor43nrpfms5Vcblx0XHQgKiDmib7lh7rmiYDmnInliIbor43lj6/og73vvIzkuLvopoHmoLnmja7kuIDkuIvlh6DpobnmnaXor4Tku7fvvJpcblx0XHQgKiB444CB6K+N5pWw6YeP5pyA5bCR77ybXG5cdFx0ICogYeOAgeivjeW5s+Wdh+mikeeOh+acgOWkp++8m1xuXHRcdCAqIGLjgIHmr4/kuKror43plb/luqbmoIflh4blt67mnIDlsI/vvJtcblx0XHQgKiBj44CB5pyq6K+G5Yir6K+N5pyA5bCR77ybXG5cdFx0ICogZOOAgeespuWQiOivreazlee7k+aehOmhue+8muWmguS4pOS4qui/nue7reeahOWKqOivjeWHj+WIhu+8jOaVsOivjeWQjumdoui3n+mHj+ivjeWKoOWIhu+8m1xuXHRcdCAqIOWPluS7peS4iuWHoOmhuee7vOWQiOaOkuWQjeacgOacgOWlveeahFxuXHRcdCAqL1xuXHRcdGxldCBjaHVua3MgPSB0aGlzLmdldENodW5rcyh3b3JkcG9zLCAwLCB0ZXh0KTtcblx0XHQvL2RlYnVnKGNodW5rcyk7XG5cdFx0bGV0IGFzc2VzczogQXJyYXk8SUFzc2Vzc1Jvdz4gPSBbXTsgIC8vIOivhOS7t+ihqFxuXG5cdFx0Ly9jb25zb2xlLmxvZyhjaHVua3MpO1xuXG5cdFx0Ly8g5a+55ZCE5Liq5YiG5pSv5bCx6KGM6K+E5LywXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGNodW5rOiBJV29yZFtdOyBjaHVuayA9IGNodW5rc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGFzc2Vzc1tpXSA9IHtcblx0XHRcdFx0eDogY2h1bmsubGVuZ3RoLFxuXHRcdFx0XHRhOiAwLFxuXHRcdFx0XHRiOiAwLFxuXHRcdFx0XHRjOiAwLFxuXHRcdFx0XHRkOiAwLFxuXG5cdFx0XHRcdGluZGV4OiBpLFxuXHRcdFx0fTtcblx0XHRcdC8vIOivjeW5s+Wdh+mVv+W6plxuXHRcdFx0bGV0IHNwID0gdGV4dC5sZW5ndGggLyBjaHVuay5sZW5ndGg7XG5cdFx0XHQvLyDlj6XlrZDnu4/luLjljIXlkKvnmoTor63ms5Xnu5PmnoRcblx0XHRcdGxldCBoYXNfRF9WID0gZmFsc2U7ICAvLyDmmK/lkKbljIXlkKvliqjor41cblxuXHRcdFx0Ly8g6YGN5Y6G5ZCE5Liq6K+NXG5cdFx0XHRsZXQgcHJldzogSVdvcmQ7XG5cblx0XHRcdGlmIChwcmV3b3JkKVxuXHRcdFx0e1xuXHRcdFx0XHQvKlxuXHRcdFx0XHRwcmV3ID0ge1xuXHRcdFx0XHRcdHc6IHByZXdvcmQudyxcblx0XHRcdFx0XHRwOiBwcmV3b3JkLnAsXG5cdFx0XHRcdFx0ZjogcHJld29yZC5mLFxuXHRcdFx0XHRcdHM6IHByZXdvcmQucyxcblx0XHRcdFx0fVxuXHRcdFx0XHQqL1xuXG5cdFx0XHRcdHByZXcgPSB0aGlzLmNyZWF0ZVJhd1Rva2VuKHByZXdvcmQpO1xuXG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHByZXcgPSBudWxsO1xuXHRcdFx0fVxuXHRcdFx0Zm9yIChsZXQgaiA9IDAsIHc6IElXb3JkOyB3ID0gY2h1bmtbal07IGorKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHcudyBpbiBUQUJMRSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHcucCA9IFRBQkxFW3cud10ucDtcblx0XHRcdFx0XHRhc3Nlc3NbaV0uYSArPSB3LmY7ICAgLy8g5oC76K+N6aKRXG5cblx0XHRcdFx0XHRpZiAoaiA9PSAwICYmICFwcmV3b3JkICYmICh3LnAgJiBQT1NUQUcuRF9WKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdCAqIOWwh+esrOS4gOWAi+Wtl+S5n+ioiOeul+mAsuWOu+aYr+WQpuWMheWQq+WLleipnlxuXHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRoYXNfRF9WID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyA9PT09PT09PT09PT09PT09IOajgOafpeivreazlee7k+aehCA9PT09PT09PT09PT09PT09PT09XG5cdFx0XHRcdFx0aWYgKHByZXcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5LiK5LiA5Liq6K+N5piv5pWw6K+N5LiU5b2T5YmN6K+N5piv6YeP6K+N77yI5Y2V5L2N77yJ77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdChwcmV3LnAgJiBQT1NUQUcuQV9NKVxuXHRcdFx0XHRcdFx0XHQmJlxuXHRcdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdFx0KCh3LnAgJiBQT1NUQUcuQV9RKSlcblx0XHRcdFx0XHRcdFx0XHR8fCB3LncgaW4gREFURVRJTUVcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzlvZPliY3or43mmK/liqjor41cblx0XHRcdFx0XHRcdGlmICgody5wICYgUE9TVEFHLkRfVikpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGhhc19EX1YgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK/ov57nu63nmoTkuKTkuKrliqjor43vvIzliJnlh4/liIZcblx0XHRcdFx0XHRcdFx0Ly9pZiAoKHByZXcucCAmIFBPU1RBRy5EX1YpID4gMClcblx0XHRcdFx0XHRcdFx0Ly9hc3Nlc3NbaV0uZC0tO1xuXG5cdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDlvaLlrrnor40gKyDliqjor43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdFx0aWYgKChwcmV3LnAgJiBQT1NUQUcuRF9BKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK8g5Ymv6K+NICsg5Yqo6K+N77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRcdGlmIChwcmV3LnAgJiBQT1NUQUcuRF9EKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5piv5Zyw5Yy65ZCN44CB5py65p6E5ZCN5oiW5b2i5a656K+N77yM5ZCO6Z2i6Lef5Zyw5Yy644CB5py65p6E44CB5Luj6K+N44CB5ZCN6K+N562J77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRpZiAoKFxuXHRcdFx0XHRcdFx0XHRcdChwcmV3LnAgJiBQT1NUQUcuQV9OUylcblx0XHRcdFx0XHRcdFx0XHR8fCAocHJldy5wICYgUE9TVEFHLkFfTlQpXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHByZXcucCAmIFBPU1RBRy5EX0EpXG5cdFx0XHRcdFx0XHRcdCkgJiZcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdCh3LnAgJiBQT1NUQUcuRF9OKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OUilcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkFfTlMpXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05aKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OVClcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDmlrnkvY3or40gKyDmlbDph4/or43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0KHByZXcucCAmIFBPU1RBRy5EX0YpXG5cdFx0XHRcdFx0XHRcdCYmXG5cdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHQody5wICYgUE9TVEFHLkFfTSlcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkRfTVEpXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vZGVidWcocHJldywgdyk7XG5cdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK8g5aeTICsg5ZCN6K+N77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHRwcmV3LncgaW4gRkFNSUxZX05BTUVfMVxuXHRcdFx0XHRcdFx0XHRcdHx8IHByZXcudyBpbiBGQU1JTFlfTkFNRV8yXG5cdFx0XHRcdFx0XHRcdCkgJiZcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdCh3LnAgJiBQT1NUQUcuRF9OKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OWilcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9kZWJ1ZyhwcmV3LCB3KTtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHQgKiDlnLDlkI0v5aSE5omAICsg5pa55L2NXG5cdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdGlmIChoZXhBbmRBbnkocHJldy5wXG5cdFx0XHRcdFx0XHRcdCwgUE9TVEFHLkRfU1xuXHRcdFx0XHRcdFx0XHQsIFBPU1RBRy5BX05TLFxuXHRcdFx0XHRcdFx0KSAmJiBoZXhBbmRBbnkody5wXG5cdFx0XHRcdFx0XHRcdCwgUE9TVEFHLkRfRixcblx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kICs9IDAuNTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8g5o6i5rWL5LiL5LiA5Liq6K+NXG5cdFx0XHRcdFx0XHRsZXQgbmV4dHcgPSBjaHVua1tqICsgMV07XG5cdFx0XHRcdFx0XHRpZiAobmV4dHcpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChuZXh0dy53IGluIFRBQkxFKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bmV4dHcucCA9IFRBQkxFW25leHR3LnddLnA7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgX3RlbXBfb2s6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0XHQgKiDlpoLmnpzlvZPliY3mmK/igJznmoTigJ0rIOWQjeivje+8jOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdCh3LncgPT0gJ+eahCcgfHwgdy53ID09ICfkuYsnKVxuXHRcdFx0XHRcdFx0XHRcdCYmIG5leHR3LnAgJiYgKFxuXHRcdFx0XHRcdFx0XHRcdFx0KG5leHR3LnAgJiBQT1NUQUcuRF9OKVxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuRF9WKVxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OUilcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkFfTlMpXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCAobmV4dHcucCAmIFBPU1RBRy5BX05aKVxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OVClcblx0XHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMS41O1xuXHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdCAqIOWmguaenOaYr+i/nuivje+8jOWJjeWQjuS4pOS4quivjeivjeaAp+ebuOWQjOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAocHJldy5wICYmICh3LnAgJiBQT1NUQUcuRF9DKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBwID0gcHJldy5wICYgbmV4dHcucDtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChwcmV3LnAgPT09IG5leHR3LnApXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGVsc2UgaWYgKHApXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC4yNTtcblx0XHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmIChwICYgUE9TVEFHLkRfTilcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC43NTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0ICog5Zyo5oSf5YuV55qE6YeN6YCi5Lit5pyJ5L2Z5Zyo55qE6Kmx5bCx5aSq6YGO6ZaD6ICAXG5cdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRpZiAoX3RlbXBfb2sgJiYgKHcucCAmIFBPU1RBRy5EX1IpICYmIChuZXh0dy5wICYgUE9TVEFHLkRfUCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAxO1xuXHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoX3RlbXBfb2sgJiYgbmV4dHcucCAmJiAody5wICYgUE9TVEFHLkRfUCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpZiAobmV4dHcucCAmIFBPU1RBRy5BX05SICYmIChcblx0XHRcdFx0XHRcdFx0XHRcdG5leHR3LncubGVuZ3RoID4gMVxuXHRcdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHByZXcudyA9PSAn55qEJylcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAqIOeahCArIOS7i+ipniArIOS6uuWQjVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoX3RlbXBfb2sgJiYgKHcucCAmIFBPU1RBRy5EX1ApICYmIGhleEFuZEFueShwcmV3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfTixcblx0XHRcdFx0XHRcdFx0KSAmJiBoZXhBbmRBbnkobmV4dHcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9OLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX1YsXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoX3RlbXBfb2sgJiYgKHcucCAmIFBPU1RBRy5EX1ApICYmIGhleEFuZEFueShwcmV3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfUixcblx0XHRcdFx0XHRcdFx0KSAmJiBoZXhBbmRBbnkobmV4dHcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9SLFxuXHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC41O1xuXHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvLyBARklYTUUg5pq05Yqb6Kej5rG6IOS4ieWkqeWQjiDnmoTllY/poYxcblx0XHRcdFx0XHRcdFx0aWYgKG5leHR3LncgPT0gJ+WQjicgJiYgdy5wICYgUE9TVEFHLkRfVCAmJiBoZXhBbmRBbnkocHJldy5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX01RLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5BX00sXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8vIEBGSVhNRSDliLDmuZbkuK3plpPlkI7miYvntYLmlrzog73kvJHmga/kuoZcblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoXG5cdFx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdFx0bmV4dHcudyA9PSAn5ZCOJ1xuXHRcdFx0XHRcdFx0XHRcdFx0fHwgbmV4dHcudyA9PSAn5b6MJ1xuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHQmJiBoZXhBbmRBbnkody5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX0YsXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHRcdHcudyA9PSAn5ZCOJ1xuXHRcdFx0XHRcdFx0XHRcdFx0fHwgdy53ID09ICflvownXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdCYmIGhleEFuZEFueShwcmV3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfRixcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0JiYgaGV4QW5kQW55KG5leHR3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfTixcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IF90ZW1wX29rOiBib29sZWFuID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0ICog5aW55oqK6I235YyF6JuL5pGG5Zyo5YOP5piv5Y2w5bqm54Ok6aW855qE6Z2i5YyF5LiKXG5cdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRpZiAoX3RlbXBfb2sgJiYgKHcucCAmIFBPU1RBRy5EX0YpICYmIGhleEFuZEFueShwcmV3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfTixcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kICs9IDE7XG5cdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8g5pyq6K+G5Yir55qE6K+N5pWw6YePXG5cdFx0XHRcdFx0YXNzZXNzW2ldLmMrKztcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyDmoIflh4blt65cblx0XHRcdFx0YXNzZXNzW2ldLmIgKz0gTWF0aC5wb3coc3AgLSB3LncubGVuZ3RoLCAyKTtcblx0XHRcdFx0cHJldyA9IGNodW5rW2pdO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyDlpoLmnpzlj6XlrZDkuK3ljIXlkKvkuoboh7PlsJHkuIDkuKrliqjor41cblx0XHRcdGlmIChoYXNfRF9WID09PSBmYWxzZSkgYXNzZXNzW2ldLmQgLT0gMC41O1xuXG5cdFx0XHRhc3Nlc3NbaV0uYSA9IGFzc2Vzc1tpXS5hIC8gY2h1bmsubGVuZ3RoO1xuXHRcdFx0YXNzZXNzW2ldLmIgPSBhc3Nlc3NbaV0uYiAvIGNodW5rLmxlbmd0aDtcblx0XHR9XG5cblx0XHQvL2NvbnNvbGUuZGlyKGFzc2Vzcyk7XG5cblx0XHQvLyDorqHnrpfmjpLlkI1cblx0XHRsZXQgdG9wID0gdGhpcy5nZXRUb3BzKGFzc2Vzcyk7XG5cdFx0bGV0IGN1cnJjaHVuayA9IGNodW5rc1t0b3BdO1xuXG5cdFx0aWYgKGZhbHNlKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coYXNzZXNzKTtcblx0XHRcdC8vY29uc29sZS5sb2coT2JqZWN0LmVudHJpZXMoY2h1bmtzKSk7XG5cdFx0XHRjb25zb2xlLmRpcihPYmplY3QuZW50cmllcyhjaHVua3MpXG5cdFx0XHRcdC5tYXAoKFtpLCBjaHVua10pID0+IHsgcmV0dXJuIHsgaSwgYXNzZXM6IGFzc2Vzc1tpIGFzIHVua25vd24gYXMgbnVtYmVyXSwgY2h1bmsgfSB9KSwgeyBkZXB0aDogNSB9KTtcblx0XHRcdGNvbnNvbGUuZGlyKHsgaTogdG9wLCBhc3NlczogYXNzZXNzW3RvcF0sIGN1cnJjaHVuayB9KTtcblx0XHRcdC8vY29uc29sZS5sb2codG9wKTtcblx0XHRcdC8vY29uc29sZS5sb2coY3VycmNodW5rKTtcblx0XHR9XG5cblx0XHQvLyDliZTpmaTkuI3og73or4bliKvnmoTor41cblx0XHRmb3IgKGxldCBpID0gMCwgd29yZDogSVdvcmQ7IHdvcmQgPSBjdXJyY2h1bmtbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAoISh3b3JkLncgaW4gVEFCTEUpKVxuXHRcdFx0e1xuXHRcdFx0XHRjdXJyY2h1bmsuc3BsaWNlKGktLSwgMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldCA9IGN1cnJjaHVuaztcblxuXHRcdC8vIOippuWcluS4u+WLlea4hemZpOiomOaGtumrlFxuXHRcdGFzc2VzcyA9IHVuZGVmaW5lZDtcblx0XHRjaHVua3MgPSB1bmRlZmluZWQ7XG5cdFx0Y3VycmNodW5rID0gdW5kZWZpbmVkO1xuXHRcdHRvcCA9IHVuZGVmaW5lZDtcblx0XHR3b3JkcG9zID0gdW5kZWZpbmVkO1xuXG5cdFx0Ly9kZWJ1ZyhyZXQpO1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHQvKipcblx0ICog6K+E5Lu35o6S5ZCNXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhc3Nlc3Ncblx0ICogQHJldHVybiB7b2JqZWN0fVxuXHQgKi9cblx0Z2V0VG9wcyhhc3Nlc3M6IEFycmF5PElBc3Nlc3NSb3c+KVxuXHR7XG5cdFx0Ly9kZWJ1Zyhhc3Nlc3MpO1xuXHRcdC8vIOWPluWQhOmhueacgOWkp+WAvFxuXHRcdGxldCB0b3A6IElBc3Nlc3NSb3cgPSB7XG5cdFx0XHR4OiBhc3Nlc3NbMF0ueCxcblx0XHRcdGE6IGFzc2Vzc1swXS5hLFxuXHRcdFx0YjogYXNzZXNzWzBdLmIsXG5cdFx0XHRjOiBhc3Nlc3NbMF0uYyxcblx0XHRcdGQ6IGFzc2Vzc1swXS5kLFxuXHRcdH07XG5cblx0XHRmb3IgKGxldCBpID0gMSwgYXNzOiBJQXNzZXNzUm93OyBhc3MgPSBhc3Nlc3NbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAoYXNzLmEgPiB0b3AuYSkgdG9wLmEgPSBhc3MuYTsgIC8vIOWPluacgOWkp+W5s+Wdh+ivjemikVxuXHRcdFx0aWYgKGFzcy5iIDwgdG9wLmIpIHRvcC5iID0gYXNzLmI7ICAvLyDlj5bmnIDlsI/moIflh4blt65cblx0XHRcdGlmIChhc3MuYyA+IHRvcC5jKSB0b3AuYyA9IGFzcy5jOyAgLy8g5Y+W5pyA5aSn5pyq6K+G5Yir6K+NXG5cdFx0XHRpZiAoYXNzLmQgPCB0b3AuZCkgdG9wLmQgPSBhc3MuZDsgIC8vIOWPluacgOWwj+ivreazleWIhuaVsFxuXHRcdFx0aWYgKGFzcy54ID4gdG9wLngpIHRvcC54ID0gYXNzLng7ICAvLyDlj5bmnIDlpKfljZXor43mlbDph49cblx0XHR9XG5cdFx0Ly9kZWJ1Zyh0b3ApO1xuXG5cdFx0Ly8g6K+E5Lyw5o6S5ZCNXG5cdFx0bGV0IHRvcHM6IG51bWJlcltdID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDAsIGFzczogSUFzc2Vzc1JvdzsgYXNzID0gYXNzZXNzW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0dG9wc1tpXSA9IDA7XG5cdFx0XHQvLyDor43mlbDph4/vvIzotorlsI/otorlpb1cblx0XHRcdHRvcHNbaV0gKz0gKHRvcC54IC0gYXNzLngpICogMS41O1xuXHRcdFx0Ly8g6K+N5oC76aKR546H77yM6LaK5aSn6LaK5aW9XG5cdFx0XHRpZiAoYXNzLmEgPj0gdG9wLmEpIHRvcHNbaV0gKz0gMTtcblx0XHRcdC8vIOivjeagh+WHhuW3ru+8jOi2iuWwj+i2iuWlvVxuXHRcdFx0aWYgKGFzcy5iIDw9IHRvcC5iKSB0b3BzW2ldICs9IDE7XG5cdFx0XHQvLyDmnKror4bliKvor43vvIzotorlsI/otorlpb1cblx0XHRcdHRvcHNbaV0gKz0gKHRvcC5jIC0gYXNzLmMpOy8vZGVidWcodG9wc1tpXSk7XG5cdFx0XHQvLyDnrKblkIjor63ms5Xnu5PmnoTnqIvluqbvvIzotorlpKfotorlpb1cblx0XHRcdHRvcHNbaV0gKz0gKGFzcy5kIDwgMCA/IHRvcC5kICsgYXNzLmQgOiBhc3MuZCAtIHRvcC5kKSAqIDE7XG5cblx0XHRcdGFzcy5zY29yZSA9IHRvcHNbaV07XG5cblx0XHRcdC8vZGVidWcodG9wc1tpXSk7ZGVidWcoJy0tLScpO1xuXHRcdH1cblx0XHQvL2RlYnVnKHRvcHMuam9pbignICAnKSk7XG5cblx0XHQvL2NvbnNvbGUubG9nKHRvcHMpO1xuXHRcdC8vY29uc29sZS5sb2coYXNzZXNzKTtcblxuXHRcdC8vY29uc3Qgb2xkX21ldGhvZCA9IHRydWU7XG5cdFx0Y29uc3Qgb2xkX21ldGhvZCA9IGZhbHNlO1xuXG5cdFx0Ly8g5Y+W5YiG5pWw5pyA6auY55qEXG5cdFx0bGV0IGN1cnJpID0gMDtcblx0XHRsZXQgbWF4cyA9IHRvcHNbMF07XG5cdFx0Zm9yIChsZXQgaSBpbiB0b3BzKVxuXHRcdHtcblx0XHRcdGxldCBzID0gdG9wc1tpXTtcblx0XHRcdGlmIChzID4gbWF4cylcblx0XHRcdHtcblx0XHRcdFx0Y3VycmkgPSBpIGFzIGFueSBhcyBudW1iZXI7XG5cdFx0XHRcdG1heHMgPSBzO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocyA9PSBtYXhzKVxuXHRcdFx0e1xuXHRcdFx0XHQvKipcblx0XHRcdFx0ICog5aaC5p6c5YiG5pWw55u45ZCM77yM5YiZ5qC55o2u6K+N6ZW/5bqm44CB5pyq6K+G5Yir6K+N5Liq5pWw5ZKM5bmz5Z2H6aKR546H5p2l6YCJ5oupXG5cdFx0XHRcdCAqXG5cdFx0XHRcdCAqIOWmguaenOS+neeEtuWQjOWIhu+8jOWJh+S/neaMgeS4jeiuilxuXHRcdFx0XHQgKi9cblx0XHRcdFx0bGV0IGEgPSAwO1xuXHRcdFx0XHRsZXQgYiA9IDA7XG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0uYyA8IGFzc2Vzc1tjdXJyaV0uYylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGErKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0uYyAhPT0gYXNzZXNzW2N1cnJpXS5jKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0uYSA+IGFzc2Vzc1tjdXJyaV0uYSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGErKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0uYSAhPT0gYXNzZXNzW2N1cnJpXS5hKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0ueCA8IGFzc2Vzc1tjdXJyaV0ueClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGErKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0ueCAhPT0gYXNzZXNzW2N1cnJpXS54KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhID4gYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGN1cnJpID0gaSBhcyBhbnkgYXMgbnVtYmVyO1xuXHRcdFx0XHRcdG1heHMgPSBzO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvL2RlYnVnKHsgaSwgcywgbWF4cywgY3VycmkgfSk7XG5cdFx0fVxuXHRcdC8vZGVidWcoJ21heDogaT0nICsgY3VycmkgKyAnLCBzPScgKyB0b3BzW2N1cnJpXSk7XG5cblx0XHRhc3Nlc3MgPSB1bmRlZmluZWQ7XG5cdFx0dG9wID0gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIGN1cnJpO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWwhuWNleivjeaMieeFp+S9jee9ruaOkuWIl1xuXHQgKlxuXHQgKiBAcGFyYW0ge2FycmF5fSB3b3Jkc1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuXHQgKiBAcmV0dXJuIHtvYmplY3R9XG5cdCAqL1xuXHRnZXRQb3NJbmZvKHdvcmRzOiBJV29yZFtdLCB0ZXh0OiBzdHJpbmcpOiB7XG5cdFx0W2luZGV4OiBudW1iZXJdOiBJV29yZFtdO1xuXHR9XG5cdHtcblx0XHRsZXQgd29yZHBvcyA9IHt9O1xuXHRcdC8vIOWwhuWNleivjeaMieS9jee9ruWIhue7hFxuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOyB3b3JkID0gd29yZHNbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAoIXdvcmRwb3Nbd29yZC5jXSlcblx0XHRcdHtcblx0XHRcdFx0d29yZHBvc1t3b3JkLmNdID0gW107XG5cdFx0XHR9XG5cdFx0XHR3b3JkcG9zW3dvcmQuY10ucHVzaCh3b3JkKTtcblx0XHR9XG5cdFx0Ly8g5oyJ5Y2V5a2X5YiG5Ymy5paH5pys77yM5aGr6KGl56m657y655qE5L2N572uXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0Lmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICghd29yZHBvc1tpXSlcblx0XHRcdHtcblx0XHRcdFx0d29yZHBvc1tpXSA9IFt7IHc6IHRleHQuY2hhckF0KGkpLCBjOiBpLCBmOiAwIH1dO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB3b3JkcG9zO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWPluaJgOacieWIhuaUr1xuXHQgKlxuXHQgKiBAcGFyYW0ge3tbcDogbnVtYmVyXTogU2VnbWVudC5JV29yZFtdfX0gd29yZHBvc1xuXHQgKiBAcGFyYW0ge251bWJlcn0gcG9zIOW9k+WJjeS9jee9rlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmnKzoioLopoHliIbor43nmoTmlofmnKxcblx0ICogQHBhcmFtIHtudW1iZXJ9IHRvdGFsX2NvdW50XG5cdCAqIEByZXR1cm5zIHtTZWdtZW50LklXb3JkW11bXX1cblx0ICovXG5cdGdldENodW5rcyh3b3JkcG9zOiB7XG5cdFx0W2luZGV4OiBudW1iZXJdOiBJV29yZFtdO1xuXHR9LCBwb3M6IG51bWJlciwgdGV4dD86IHN0cmluZywgdG90YWxfY291bnQgPSAwLCBNQVhfQ0hVTktfQ09VTlQ/OiBudW1iZXIpOiBJV29yZFtdW11cblx0e1xuXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiDov73liqDmlrDmqKHlvI/kvb8gTUFYX0NIVU5LX0NPVU5UIOmBnua4m+S+humYsuatoueEoeWIhuautemVt+auteiQveeahOe4veiZleeQhuasoeaVuOmBjumrmCDnlLEgREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOIOS+humZkOWItuacgOWwj+WAvFxuXHRcdCAqL1xuXHRcdGlmICh0b3RhbF9jb3VudCA9PSAwKVxuXHRcdHtcblx0XHRcdE1BWF9DSFVOS19DT1VOVCA9IHRoaXMuTUFYX0NIVU5LX0NPVU5UO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIOWPquacieeVtuebruWJjeaWh+Wtl+mVt+W6puWkp+aWvCBNQVhfQ0hVTktfQ09VTlQg5pmC5omN6YGe5ribXG5cdFx0XHQgKi9cblx0XHRcdGlmICh0ZXh0Lmxlbmd0aCA8IE1BWF9DSFVOS19DT1VOVClcblx0XHRcdHtcblx0XHRcdFx0TUFYX0NIVU5LX0NPVU5UICs9IDE7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYgKE1BWF9DSFVOS19DT1VOVCA8PSB0aGlzLk1BWF9DSFVOS19DT1VOVClcblx0XHR7XG5cdFx0XHRNQVhfQ0hVTktfQ09VTlQgPSBNYXRoLm1heChNQVhfQ0hVTktfQ09VTlQgLSAxLCB0aGlzLkRFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTiwgREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOKVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0Ly9NQVhfQ0hVTktfQ09VTlQgPSBNYXRoLm1heChNQVhfQ0hVTktfQ09VTlQsIHRoaXMuREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOLCBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4pXG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICog5b+955Wl6YCj5a2XXG5cdFx0ICpcblx0XHQgKiDkvovlpoI6IOWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWVilxuXHRcdCAqL1xuXHRcdGxldCBtO1xuXHRcdGlmIChtID0gdGV4dC5tYXRjaCgvXigoLispXFwyezUsfSkvKSlcblx0XHR7XG5cdFx0XHRsZXQgczEgPSB0ZXh0LnNsaWNlKDAsIG1bMV0ubGVuZ3RoKTtcblx0XHRcdGxldCBzMiA9IHRleHQuc2xpY2UobVsxXS5sZW5ndGgpO1xuXG5cdFx0XHRsZXQgd29yZCA9IHtcblx0XHRcdFx0dzogczEsXG5cdFx0XHRcdGM6IHBvcyxcblx0XHRcdFx0ZjogMCxcblx0XHRcdH0gYXMgSVdvcmQ7XG5cblx0XHRcdGxldCByZXQ6IElXb3JkW11bXSA9IFtdO1xuXG5cdFx0XHRpZiAoczIgIT09ICcnKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgY2h1bmtzID0gdGhpcy5nZXRDaHVua3Mod29yZHBvcywgcG9zICsgczEubGVuZ3RoLCBzMiwgdG90YWxfY291bnQsIE1BWF9DSFVOS19DT1VOVCk7XG5cblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBjaHVua3MubGVuZ3RoOyBqKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaChbd29yZF0uY29uY2F0KGNodW5rc1tqXSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKFt3b3JkXSk7XG5cdFx0XHR9XG5cbi8vXHRcdFx0Y29uc29sZS5kaXIod29yZHBvcyk7XG4vL1xuLy9cdFx0XHRjb25zb2xlLmRpcihyZXQpO1xuLy9cbi8vXHRcdFx0Y29uc29sZS5kaXIoW3BvcywgdGV4dCwgdG90YWxfY291bnRdKTtcblxuXHRcdFx0cmV0dXJuIHJldDtcblx0XHR9XG5cblx0XHR0b3RhbF9jb3VudCsrO1xuXG5cdFx0bGV0IHdvcmRzID0gd29yZHBvc1twb3NdIHx8IFtdO1xuXG5cdFx0Ly9kZWJ1Zyh0b3RhbF9jb3VudCwgTUFYX0NIVU5LX0NPVU5UKTtcblxuLy9cdFx0ZGVidWcoe1xuLy9cdFx0XHR0b3RhbF9jb3VudCxcbi8vXHRcdFx0TUFYX0NIVU5LX0NPVU5UOiB0aGlzLk1BWF9DSFVOS19DT1VOVCxcbi8vXHRcdFx0dGV4dCxcbi8vXHRcdFx0d29yZHMsXG4vL1x0XHR9KTtcblxuXHRcdC8vIGRlYnVnKCdnZXRDaHVua3M6ICcpO1xuXHRcdC8vIGRlYnVnKHdvcmRzKTtcblx0XHQvL3Rocm93IG5ldyBFcnJvcigpO1xuXG5cdFx0bGV0IHJldDogSVdvcmRbXVtdID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB3b3Jkcy5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRsZXQgd29yZCA9IHdvcmRzW2ldO1xuXHRcdFx0Ly9kZWJ1Zyh3b3JkKTtcblx0XHRcdGxldCBuZXh0Y3VyID0gd29yZC5jICsgd29yZC53Lmxlbmd0aDtcblx0XHRcdC8qKlxuXHRcdFx0ICogQEZJWE1FXG5cdFx0XHQgKi9cblx0XHRcdGlmICghd29yZHBvc1tuZXh0Y3VyXSlcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2goW3dvcmRdKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHRvdGFsX2NvdW50ID4gTUFYX0NIVU5LX0NPVU5UKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBkbyBzb21ldGhpbmdcblxuLy9cdFx0XHRcdGNvbnNvbGUubG9nKDQ0NCwgd29yZHMuc2xpY2UoaSkpO1xuLy9cdFx0XHRcdGNvbnNvbGUubG9nKDMzMywgd29yZCk7XG5cblx0XHRcdFx0bGV0IHcxOiBJV29yZFtdID0gW3dvcmRdO1xuXG5cdFx0XHRcdGxldCBqID0gbmV4dGN1cjtcblx0XHRcdFx0d2hpbGUgKGogaW4gd29yZHBvcylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB3MiA9IHdvcmRwb3Nbal1bMF07XG5cblx0XHRcdFx0XHRpZiAodzIpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dzEucHVzaCh3Mik7XG5cblx0XHRcdFx0XHRcdGogKz0gdzIudy5sZW5ndGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXQucHVzaCh3MSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0ID0gdGV4dC5zbGljZSh3b3JkLncubGVuZ3RoKTtcblxuXHRcdFx0XHRsZXQgY2h1bmtzID0gdGhpcy5nZXRDaHVua3Mod29yZHBvcywgbmV4dGN1ciwgdCwgdG90YWxfY291bnQsIE1BWF9DSFVOS19DT1VOVCApO1xuXHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGNodW5rcy5sZW5ndGg7IGorKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldC5wdXNoKFt3b3JkXS5jb25jYXQoY2h1bmtzW2pdKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaHVua3MgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHdvcmRzID0gdW5kZWZpbmVkO1xuXHRcdHdvcmRwb3MgPSB1bmRlZmluZWQ7XG5cdFx0bSA9IHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBEaWN0VG9rZW5pemVyXG57XG5cdC8qKlxuXHQgKiDkvb/nlKjnsbvkvLzkuo5NTVNH55qE5YiG6K+N566X5rOVXG5cdCAqIOaJvuWHuuaJgOacieWIhuivjeWPr+iDve+8jOS4u+imgeagueaNruS4gOS4i+WHoOmhueadpeivhOS7t++8mlxuXHQgKlxuXHQgKiB444CB6K+N5pWw6YeP5pyA5bCR77ybXG5cdCAqIGHjgIHor43lubPlnYfpopHnjofmnIDlpKfvvJtcblx0ICogYuOAgeavj+S4quivjemVv+W6puagh+WHhuW3ruacgOWwj++8m1xuXHQgKiBj44CB5pyq6K+G5Yir6K+N5pyA5bCR77ybXG5cdCAqIGTjgIHnrKblkIjor63ms5Xnu5PmnoTpobnvvJrlpoLkuKTkuKrov57nu63nmoTliqjor43lh4/liIbvvIzmlbDor43lkI7pnaLot5/ph4/or43liqDliIbvvJtcblx0ICpcblx0ICog5Y+W5Lul5LiK5Yeg6aG557u85ZCI5o6S5ZCN5pyA5pyA5aW955qEXG5cdCAqL1xuXHRleHBvcnQgdHlwZSBJQXNzZXNzUm93ID0ge1xuXHRcdC8qKlxuXHRcdCAqIOivjeaVsOmHj++8jOi2iuWwj+i2iuWlvVxuXHRcdCAqL1xuXHRcdHg6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDor43mgLvpopHnjofvvIzotorlpKfotorlpb1cblx0XHQgKi9cblx0XHRhOiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICog6K+N5qCH5YeG5beu77yM6LaK5bCP6LaK5aW9XG5cdFx0ICog5q+P5Liq6K+N6ZW/5bqm5qCH5YeG5beu5pyA5bCPXG5cdFx0ICovXG5cdFx0YjogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIOacquivhuWIq+ivje+8jOi2iuWwj+i2iuWlvVxuXHRcdCAqL1xuXHRcdGM6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDnrKblkIjor63ms5Xnu5PmnoTnqIvluqbvvIzotorlpKfotorlpb1cblx0XHQgKiDnrKblkIjor63ms5Xnu5PmnoTpobnvvJrlpoLkuKTkuKrov57nu63nmoTliqjor43lh4/liIbvvIzmlbDor43lkI7pnaLot5/ph4/or43liqDliIZcblx0XHQgKi9cblx0XHRkOiBudW1iZXIsXG5cblx0XHQvKipcblx0XHQgKiDntZDnrpfoqZXliIYo6Ieq5YuV6KiI566XKVxuXHRcdCAqL1xuXHRcdHNjb3JlPzogbnVtYmVyLFxuXHRcdHJlYWRvbmx5IGluZGV4PzogbnVtYmVyLFxuXHR9O1xufVxuXG5leHBvcnQgaW1wb3J0IElBc3Nlc3NSb3cgPSBEaWN0VG9rZW5pemVyLklBc3Nlc3NSb3c7XG5cbmV4cG9ydCBjb25zdCBpbml0ID0gRGljdFRva2VuaXplci5pbml0LmJpbmQoRGljdFRva2VuaXplcikgYXMgSVN1YlRva2VuaXplckNyZWF0ZTxEaWN0VG9rZW5pemVyPjtcblxuZXhwb3J0IGRlZmF1bHQgRGljdFRva2VuaXplcjtcbiJdfQ==