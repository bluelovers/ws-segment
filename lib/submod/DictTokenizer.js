'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.DictTokenizer = exports.DEFAULT_MAX_CHUNK_COUNT_MIN = exports.DEFAULT_MAX_CHUNK_COUNT = void 0;
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
        //const POSTAG = this._POSTAG;
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
                    if (j === 0 && !preword && (w.p & POSTAG.D_V)) {
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
                                ((w.p & POSTAG.A_Q)
                                    || w.w in const_1.DATETIME)) {
                            assess[i].d++;
                        }
                        // 如果当前词是动词
                        if (w.p & POSTAG.D_V) {
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
                            if ((w.w === '的' || w.w === '之')
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
                                    if (prew.w === '的') {
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
                            if (nextw.w === '后' && w.p & POSTAG.D_T && index_1.hexAndAny(prew.p, POSTAG.D_MQ, POSTAG.A_M)) {
                                assess[i].d++;
                            }
                            // @FIXME 到湖中間后手終於能休息了
                            else if ((nextw.w === '后'
                                || nextw.w === '後')
                                && index_1.hexAndAny(w.p, POSTAG.D_F)) {
                                assess[i].d++;
                            }
                            if ((w.w === '后'
                                || w.w === '後')
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
            else if (s === maxs) {
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
        if (total_count === 0) {
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
            let _ret = [];
            if (s2 !== '') {
                let chunks = this.getChunks(wordpos, pos + s1.length, s2, total_count, MAX_CHUNK_COUNT);
                for (let ws of chunks) {
                    _ret.push([word].concat(ws));
                }
            }
            else {
                _ret.push([word]);
            }
            //			console.dir(wordpos);
            //
            //			console.dir(ret);
            //
            //			console.dir([pos, text, total_count]);
            return _ret;
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
        for (let word of words) {
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
                for (let ws of chunks) {
                    ret.push([word].concat(ws));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGljdFRva2VuaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRpY3RUb2tlbml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYixnQ0FBOEU7QUFJOUUseUNBQWlEO0FBQ2pELGdEQUFzSDtBQUd0SCx3Q0FBd0M7QUFHM0IsUUFBQSx1QkFBdUIsR0FBRyxFQUFFLENBQUM7QUFDN0IsUUFBQSwyQkFBMkIsR0FBRyxFQUFFLENBQUM7QUFFOUM7Ozs7R0FJRztBQUNILE1BQWEsYUFBYyxTQUFRLHlCQUFtQjtJQUF0RDs7UUFHQzs7Ozs7Ozs7O1dBU0c7UUFDSCxvQkFBZSxHQUFHLCtCQUF1QixDQUFDO1FBQzFDOzs7V0FHRztRQUNILGdDQUEyQixHQUFHLG1DQUEyQixDQUFDO0lBczBCM0QsQ0FBQztJQWowQkEsTUFBTTtRQUVMLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBRW5DLElBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsR0FBRyxtQ0FBMkIsRUFDN0g7WUFDQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztTQUMxRDtRQUVELElBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFP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LENBQUM7U0FDZCxDQUFDO1FBRUYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBZSxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQ3JEO1lBQ0MsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFLFVBQVU7WUFDN0MsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFLFNBQVM7WUFDNUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFLFVBQVU7WUFDN0MsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFLFVBQVU7WUFDN0MsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFLFVBQVU7U0FDN0M7UUFDRCxhQUFhO1FBRWIsT0FBTztRQUNQLElBQUksSUFBSSxHQUFhLEVBQUUsQ0FBQztRQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFlLEVBQUUsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFDckQ7WUFDQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1osV0FBVztZQUNYLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxH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d0JBQ0MsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFFWixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7cUJBQ2pCO3lCQUVEO3dCQUNDLE1BQU07cUJBQ047aUJBQ0Q7Z0JBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNiO2lCQUVEO2dCQUNDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFbEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsZUFBZSxDQUFFLENBQUM7Z0JBQ2hGLEtBQUssSUFBSSxFQUFFLElBQUksTUFBTSxFQUNyQjtvQkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzVCO2dCQUVELE1BQU0sR0FBRyxJQUFJLENBQUM7YUFDZDtTQUNEO1FBRUQsS0FBSyxHQUFHLFNBQVMsQ0FBQztRQUNsQixPQUFPLEdBQUcsU0FBUyxDQUFDO1FBQ3BCLENBQUMsR0FBRyxTQUFTLENBQUM7UUFFZCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7Q0FDRDtBQXgxQkQsc0NBdzFCQztBQWtEWSxRQUFBLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQXVDLENBQUM7QUFFakcsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBTdWJTTW9kdWxlLCBTdWJTTW9kdWxlVG9rZW5pemVyLCBJU3ViVG9rZW5pemVyQ3JlYXRlIH0gZnJvbSAnLi4vbW9kJztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IFVTdHJpbmcgfSBmcm9tICd1bmktc3RyaW5nJztcbmltcG9ydCB7IElUYWJsZURpY3RSb3cgfSBmcm9tICcuLi90YWJsZS9kaWN0JztcbmltcG9ydCB7IGhleEFuZEFueSwgdG9IZXggfSBmcm9tICcuLi91dGlsL2luZGV4JztcbmltcG9ydCBDSFNfTkFNRVMsIHsgRkFNSUxZX05BTUVfMSwgRkFNSUxZX05BTUVfMiwgU0lOR0xFX05BTUUsIERPVUJMRV9OQU1FXzEsIERPVUJMRV9OQU1FXzIgfSBmcm9tICcuLi9tb2QvQ0hTX05BTUVTJztcbmltcG9ydCBTZWdtZW50LCB7IElESUNULCBJV29yZCwgSURJQ1QyIH0gZnJvbSAnLi4vU2VnbWVudCc7XG5pbXBvcnQgeyBkZWJ1ZyB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHsgREFURVRJTUUgfSBmcm9tICcuLi9tb2QvY29uc3QnO1xuaW1wb3J0IElQT1NUQUcgZnJvbSAnLi4vUE9TVEFHJztcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UID0gNDA7XG5leHBvcnQgY29uc3QgREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOID0gMzA7XG5cbi8qKlxuICog5a2X5YW46K+G5Yir5qih5Z2XXG4gKlxuICogQGF1dGhvciDogIHpm7c8bGVpem9uZ21pbkBnbWFpbC5jb20+XG4gKi9cbmV4cG9ydCBjbGFzcyBEaWN0VG9rZW5pemVyIGV4dGVuZHMgU3ViU01vZHVsZVRva2VuaXplclxue1xuXG5cdC8qKlxuXHQgKiDpmLLmraLlm6DnhKHliIbmrrXlsI7oh7TliIbmnpDpgY7kuYXnlJroh7PotoXpgY7omZXnkIbosqDojbdcblx0ICog6LaK6auY6LaK57K+5rqW5L2G5piv6JmV55CG5pmC6ZaT5pyD5Yqg5YCN5oiQ6ZW355Sa6Iez6LaF6YGO6KiY5oa26auU6IO96JmV55CG55qE56iL5bqmXG5cdCAqXG5cdCAqIOaVuOWtl+i2iuWwj+i2iuW/q1xuXHQgKlxuXHQgKiBGQVRBTCBFUlJPUjogQ0FMTF9BTkRfUkVUUllfTEFTVCBBbGxvY2F0aW9uIGZhaWxlZCAtIEphdmFTY3JpcHQgaGVhcCBvdXQgb2YgbWVtb3J5XG5cdCAqXG5cdCAqIEB0eXBlIHtudW1iZXJ9XG5cdCAqL1xuXHRNQVhfQ0hVTktfQ09VTlQgPSBERUZBVUxUX01BWF9DSFVOS19DT1VOVDtcblx0LyoqXG5cdCAqXG5cdCAqIOi/veWKoOaWsOaooeW8j+S9vyBNQVhfQ0hVTktfQ09VTlQg6YGe5rib5L6G6Ziy5q2i54Sh5YiG5q616ZW35q616JC955qE57i96JmV55CG5qyh5pW46YGO6auYIOeUsSBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4g5L6G6ZmQ5Yi25pyA5bCP5YC8XG5cdCAqL1xuXHRERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4gPSBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU47XG5cblx0cHJvdGVjdGVkIF9UQUJMRTogSURJQ1Q8SVdvcmQ+O1xuXHRwcm90ZWN0ZWQgX1RBQkxFMjogSURJQ1QyPElXb3JkPjtcblxuXHRfY2FjaGUoKVxuXHR7XG5cdFx0c3VwZXIuX2NhY2hlKCk7XG5cdFx0dGhpcy5fVEFCTEUgPSB0aGlzLnNlZ21lbnQuZ2V0RGljdCgnVEFCTEUnKTtcblx0XHR0aGlzLl9UQUJMRTIgPSB0aGlzLnNlZ21lbnQuZ2V0RGljdCgnVEFCTEUyJyk7XG5cdFx0dGhpcy5fUE9TVEFHID0gdGhpcy5zZWdtZW50LlBPU1RBRztcblxuXHRcdGlmICh0eXBlb2YgdGhpcy5zZWdtZW50Lm9wdGlvbnMubWF4Q2h1bmtDb3VudCA9PSAnbnVtYmVyJyAmJiB0aGlzLnNlZ21lbnQub3B0aW9ucy5tYXhDaHVua0NvdW50ID4gREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOKVxuXHRcdHtcblx0XHRcdHRoaXMuTUFYX0NIVU5LX0NPVU5UID0gdGhpcy5zZWdtZW50Lm9wdGlvbnMubWF4Q2h1bmtDb3VudDtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHRoaXMuc2VnbWVudC5vcHRpb25zLm1pbkNodW5rQ291bnQgPT0gJ251bWJlcicgJiYgdGhpcy5zZWdtZW50Lm9wdGlvbnMubWluQ2h1bmtDb3VudCA+IERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTilcblx0XHR7XG5cdFx0XHR0aGlzLkRFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTiA9IHRoaXMuc2VnbWVudC5vcHRpb25zLm1pbkNodW5rQ291bnQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIOWvueacquivhuWIq+eahOWNleivjei/m+ihjOWIhuivjVxuXHQgKlxuXHQgKiBAcGFyYW0ge2FycmF5fSB3b3JkcyDljZXor43mlbDnu4Rcblx0ICogQHJldHVybiB7YXJyYXl9XG5cdCAqL1xuXHRzcGxpdCh3b3JkczogSVdvcmRbXSk6IElXb3JkW11cblx0e1xuXHRcdC8vZGVidWcod29yZHMpO1xuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5fVEFCTEU7XG5cdFx0Ly9jb25zdCBQT1NUQUcgPSB0aGlzLl9QT1NUQUc7XG5cblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMCwgd29yZDsgd29yZCA9IHdvcmRzW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKHdvcmQucCA+IDApXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKHdvcmQpO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8g5LuF5a+55pyq6K+G5Yir55qE6K+N6L+b6KGM5Yy56YWNXG5cdFx0XHRsZXQgd29yZGluZm8gPSB0aGlzLm1hdGNoV29yZCh3b3JkLncsIDAsIHdvcmRzW2kgLSAxXSk7XG5cdFx0XHRpZiAod29yZGluZm8ubGVuZ3RoIDwgMSlcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2god29yZCk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyDliIbnprvlh7rlt7Lor4bliKvnmoTljZXor41cblx0XHRcdGxldCBsYXN0YyA9IDA7XG5cblx0XHRcdHdvcmRpbmZvLmZvckVhY2goZnVuY3Rpb24gKGJ3LCB1aSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKGJ3LmMgPiBsYXN0Yylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldC5wdXNoKHtcblx0XHRcdFx0XHRcdHc6IHdvcmQudy5zdWJzdHIobGFzdGMsIGJ3LmMgLSBsYXN0YyksXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgY3cgPSBzZWxmLmNyZWF0ZVJhd1Rva2VuKHtcblx0XHRcdFx0XHR3OiBidy53LFxuXHRcdFx0XHRcdGY6IGJ3LmYsXG5cdFx0XHRcdH0sIFRBQkxFW2J3LnddKTtcblxuXHRcdFx0XHRyZXQucHVzaChjdyk7XG5cblx0XHRcdFx0Lypcblx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdHc6IGJ3LncsXG5cdFx0XHRcdFx0cDogd3cucCxcblx0XHRcdFx0XHRmOiBidy5mLFxuXHRcdFx0XHRcdHM6IHd3LnMsXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQqL1xuXHRcdFx0XHRsYXN0YyA9IGJ3LmMgKyBidy53Lmxlbmd0aDtcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgbGFzdHdvcmQgPSB3b3JkaW5mb1t3b3JkaW5mby5sZW5ndGggLSAxXTtcblx0XHRcdGlmIChsYXN0d29yZC5jICsgbGFzdHdvcmQudy5sZW5ndGggPCB3b3JkLncubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgY3cgPSBzZWxmLmNyZWF0ZVJhd1Rva2VuKHtcblx0XHRcdFx0XHR3OiB3b3JkLncuc3Vic3RyKGxhc3R3b3JkLmMgKyBsYXN0d29yZC53Lmxlbmd0aCksXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldC5wdXNoKGN3KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR3b3JkcyA9IHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5cdC8qKlxuXHQgKiDljLnphY3ljZXor43vvIzov5Tlm57nm7jlhbPkv6Hmga9cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQg5paH5pysXG5cdCAqIEBwYXJhbSB7aW50fSBjdXIg5byA5aeL5L2N572uXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwcmV3b3JkIOS4iuS4gOS4quWNleivjVxuXHQgKiBAcmV0dXJuIHthcnJheX0gIOi/lOWbnuagvOW8jyAgIHt3OiAn5Y2V6K+NJywgYzog5byA5aeL5L2N572ufVxuXHQgKi9cblx0cHJvdGVjdGVkIG1hdGNoV29yZCh0ZXh0OiBzdHJpbmcsIGN1cjogbnVtYmVyLCBwcmV3b3JkOiBJV29yZClcblx0e1xuXHRcdGlmIChpc05hTihjdXIpKSBjdXIgPSAwO1xuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblx0XHRsZXQgcyA9IGZhbHNlO1xuXG5cdFx0Y29uc3QgVEFCTEUyID0gdGhpcy5fVEFCTEUyO1xuXG5cdFx0Ly8g5Yy56YWN5Y+v6IO95Ye6546w55qE5Y2V6K+NXG5cdFx0d2hpbGUgKGN1ciA8IHRleHQubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGZvciAobGV0IGkgaW4gVEFCTEUyKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdyA9IHRleHQuc3Vic3RyKGN1ciwgaSBhcyBhbnkgYXMgbnVtYmVyKTtcblx0XHRcdFx0aWYgKHcgaW4gVEFCTEUyW2ldKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdFx0dzogdyxcblx0XHRcdFx0XHRcdGM6IGN1cixcblx0XHRcdFx0XHRcdGY6IFRBQkxFMltpXVt3XS5mLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjdXIrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5maWx0ZXJXb3JkKHJldCwgcHJld29yZCwgdGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICog6YCJ5oup5pyA5pyJ5Y+v6IO95Yy56YWN55qE5Y2V6K+NXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeS/oeaBr+aVsOe7hFxuXHQgKiBAcGFyYW0ge29iamVjdH0gcHJld29yZCDkuIrkuIDkuKrljZXor41cblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQg5pys6IqC6KaB5YiG6K+N55qE5paH5pysXG5cdCAqIEByZXR1cm4ge2FycmF5fVxuXHQgKi9cblx0cHJvdGVjdGVkIGZpbHRlcldvcmQod29yZHM6IElXb3JkW10sIHByZXdvcmQ6IElXb3JkLCB0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuX1RBQkxFO1xuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuX1BPU1RBRztcblx0XHRsZXQgcmV0OiBJV29yZFtdID0gW107XG5cblx0XHQvLyDlsIbljZXor43mjInkvY3nva7liIbnu4Rcblx0XHRsZXQgd29yZHBvcyA9IHRoaXMuZ2V0UG9zSW5mbyh3b3JkcywgdGV4dCk7XG5cdFx0Ly9kZWJ1Zyh3b3JkcG9zKTtcblxuXHRcdC8qKlxuXHRcdCAqIOS9v+eUqOexu+S8vOS6jk1NU0fnmoTliIbor43nrpfms5Vcblx0XHQgKiDmib7lh7rmiYDmnInliIbor43lj6/og73vvIzkuLvopoHmoLnmja7kuIDkuIvlh6DpobnmnaXor4Tku7fvvJpcblx0XHQgKiB444CB6K+N5pWw6YeP5pyA5bCR77ybXG5cdFx0ICogYeOAgeivjeW5s+Wdh+mikeeOh+acgOWkp++8m1xuXHRcdCAqIGLjgIHmr4/kuKror43plb/luqbmoIflh4blt67mnIDlsI/vvJtcblx0XHQgKiBj44CB5pyq6K+G5Yir6K+N5pyA5bCR77ybXG5cdFx0ICogZOOAgeespuWQiOivreazlee7k+aehOmhue+8muWmguS4pOS4qui/nue7reeahOWKqOivjeWHj+WIhu+8jOaVsOivjeWQjumdoui3n+mHj+ivjeWKoOWIhu+8m1xuXHRcdCAqIOWPluS7peS4iuWHoOmhuee7vOWQiOaOkuWQjeacgOacgOWlveeahFxuXHRcdCAqL1xuXHRcdGxldCBjaHVua3MgPSB0aGlzLmdldENodW5rcyh3b3JkcG9zLCAwLCB0ZXh0KTtcblx0XHQvL2RlYnVnKGNodW5rcyk7XG5cdFx0bGV0IGFzc2VzczogQXJyYXk8SUFzc2Vzc1Jvdz4gPSBbXTsgIC8vIOivhOS7t+ihqFxuXG5cdFx0Ly9jb25zb2xlLmxvZyhjaHVua3MpO1xuXG5cdFx0Ly8g5a+55ZCE5Liq5YiG5pSv5bCx6KGM6K+E5LywXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGNodW5rOiBJV29yZFtdOyBjaHVuayA9IGNodW5rc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGFzc2Vzc1tpXSA9IHtcblx0XHRcdFx0eDogY2h1bmsubGVuZ3RoLFxuXHRcdFx0XHRhOiAwLFxuXHRcdFx0XHRiOiAwLFxuXHRcdFx0XHRjOiAwLFxuXHRcdFx0XHRkOiAwLFxuXG5cdFx0XHRcdGluZGV4OiBpLFxuXHRcdFx0fTtcblx0XHRcdC8vIOivjeW5s+Wdh+mVv+W6plxuXHRcdFx0bGV0IHNwID0gdGV4dC5sZW5ndGggLyBjaHVuay5sZW5ndGg7XG5cdFx0XHQvLyDlj6XlrZDnu4/luLjljIXlkKvnmoTor63ms5Xnu5PmnoRcblx0XHRcdGxldCBoYXNfRF9WID0gZmFsc2U7ICAvLyDmmK/lkKbljIXlkKvliqjor41cblxuXHRcdFx0Ly8g6YGN5Y6G5ZCE5Liq6K+NXG5cdFx0XHRsZXQgcHJldzogSVdvcmQ7XG5cblx0XHRcdGlmIChwcmV3b3JkKVxuXHRcdFx0e1xuXHRcdFx0XHQvKlxuXHRcdFx0XHRwcmV3ID0ge1xuXHRcdFx0XHRcdHc6IHByZXdvcmQudyxcblx0XHRcdFx0XHRwOiBwcmV3b3JkLnAsXG5cdFx0XHRcdFx0ZjogcHJld29yZC5mLFxuXHRcdFx0XHRcdHM6IHByZXdvcmQucyxcblx0XHRcdFx0fVxuXHRcdFx0XHQqL1xuXG5cdFx0XHRcdHByZXcgPSB0aGlzLmNyZWF0ZVJhd1Rva2VuKHByZXdvcmQpO1xuXG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHByZXcgPSBudWxsO1xuXHRcdFx0fVxuXHRcdFx0Zm9yIChsZXQgaiA9IDAsIHc6IElXb3JkOyB3ID0gY2h1bmtbal07IGorKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHcudyBpbiBUQUJMRSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHcucCA9IFRBQkxFW3cud10ucDtcblx0XHRcdFx0XHRhc3Nlc3NbaV0uYSArPSB3LmY7ICAgLy8g5oC76K+N6aKRXG5cblx0XHRcdFx0XHRpZiAoaiA9PT0gMCAmJiAhcHJld29yZCAmJiAody5wICYgUE9TVEFHLkRfVikpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHQgKiDlsIfnrKzkuIDlgIvlrZfkuZ/oqIjnrpfpgLLljrvmmK/lkKbljIXlkKvli5XoqZ5cblx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0aGFzX0RfViA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gPT09PT09PT09PT09PT09PSDmo4Dmn6Xor63ms5Xnu5PmnoQgPT09PT09PT09PT09PT09PT09PVxuXHRcdFx0XHRcdGlmIChwcmV3KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIOWmguaenOS4iuS4gOS4quivjeaYr+aVsOivjeS4lOW9k+WJjeivjeaYr+mHj+ivje+8iOWNleS9je+8ie+8jOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHQocHJldy5wICYgUE9TVEFHLkFfTSlcblx0XHRcdFx0XHRcdFx0JiZcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdCh3LnAgJiBQT1NUQUcuQV9RKVxuXHRcdFx0XHRcdFx0XHRcdHx8IHcudyBpbiBEQVRFVElNRVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIOWmguaenOW9k+WJjeivjeaYr+WKqOivjVxuXHRcdFx0XHRcdFx0aWYgKHcucCAmIFBPU1RBRy5EX1YpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGhhc19EX1YgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK/ov57nu63nmoTkuKTkuKrliqjor43vvIzliJnlh4/liIZcblx0XHRcdFx0XHRcdFx0Ly9pZiAoKHByZXcucCAmIFBPU1RBRy5EX1YpID4gMClcblx0XHRcdFx0XHRcdFx0Ly9hc3Nlc3NbaV0uZC0tO1xuXG5cdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDlvaLlrrnor40gKyDliqjor43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdFx0aWYgKChwcmV3LnAgJiBQT1NUQUcuRF9BKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK8g5Ymv6K+NICsg5Yqo6K+N77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRcdGlmIChwcmV3LnAgJiBQT1NUQUcuRF9EKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5piv5Zyw5Yy65ZCN44CB5py65p6E5ZCN5oiW5b2i5a656K+N77yM5ZCO6Z2i6Lef5Zyw5Yy644CB5py65p6E44CB5Luj6K+N44CB5ZCN6K+N562J77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRpZiAoKFxuXHRcdFx0XHRcdFx0XHRcdChwcmV3LnAgJiBQT1NUQUcuQV9OUylcblx0XHRcdFx0XHRcdFx0XHR8fCAocHJldy5wICYgUE9TVEFHLkFfTlQpXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHByZXcucCAmIFBPU1RBRy5EX0EpXG5cdFx0XHRcdFx0XHRcdCkgJiZcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdCh3LnAgJiBQT1NUQUcuRF9OKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OUilcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkFfTlMpXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05aKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OVClcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDmlrnkvY3or40gKyDmlbDph4/or43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0KHByZXcucCAmIFBPU1RBRy5EX0YpXG5cdFx0XHRcdFx0XHRcdCYmXG5cdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHQody5wICYgUE9TVEFHLkFfTSlcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkRfTVEpXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vZGVidWcocHJldywgdyk7XG5cdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK8g5aeTICsg5ZCN6K+N77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHRwcmV3LncgaW4gRkFNSUxZX05BTUVfMVxuXHRcdFx0XHRcdFx0XHRcdHx8IHByZXcudyBpbiBGQU1JTFlfTkFNRV8yXG5cdFx0XHRcdFx0XHRcdCkgJiZcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdCh3LnAgJiBQT1NUQUcuRF9OKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OWilcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9kZWJ1ZyhwcmV3LCB3KTtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHQgKiDlnLDlkI0v5aSE5omAICsg5pa55L2NXG5cdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdGlmIChoZXhBbmRBbnkocHJldy5wXG5cdFx0XHRcdFx0XHRcdCwgUE9TVEFHLkRfU1xuXHRcdFx0XHRcdFx0XHQsIFBPU1RBRy5BX05TLFxuXHRcdFx0XHRcdFx0KSAmJiBoZXhBbmRBbnkody5wXG5cdFx0XHRcdFx0XHRcdCwgUE9TVEFHLkRfRixcblx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kICs9IDAuNTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8g5o6i5rWL5LiL5LiA5Liq6K+NXG5cdFx0XHRcdFx0XHRsZXQgbmV4dHcgPSBjaHVua1tqICsgMV07XG5cdFx0XHRcdFx0XHRpZiAobmV4dHcpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChuZXh0dy53IGluIFRBQkxFKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bmV4dHcucCA9IFRBQkxFW25leHR3LnddLnA7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgX3RlbXBfb2s6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0XHQgKiDlpoLmnpzlvZPliY3mmK/igJznmoTigJ0rIOWQjeivje+8jOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdCh3LncgPT09ICfnmoQnIHx8IHcudyA9PT0gJ+S5iycpXG5cdFx0XHRcdFx0XHRcdFx0JiYgbmV4dHcucCAmJiAoXG5cdFx0XHRcdFx0XHRcdFx0XHQobmV4dHcucCAmIFBPU1RBRy5EX04pXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCAobmV4dHcucCAmIFBPU1RBRy5EX1YpXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCAobmV4dHcucCAmIFBPU1RBRy5BX05SKVxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OUylcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkFfTlopXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCAobmV4dHcucCAmIFBPU1RBRy5BX05UKVxuXHRcdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAxLjU7XG5cdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0ICog5aaC5p6c5piv6L+e6K+N77yM5YmN5ZCO5Lik5Liq6K+N6K+N5oCn55u45ZCM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRlbHNlIGlmIChwcmV3LnAgJiYgKHcucCAmIFBPU1RBRy5EX0MpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IHAgPSBwcmV3LnAgJiBuZXh0dy5wO1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHByZXcucCA9PT0gbmV4dHcucClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAocClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAwLjI1O1xuXHRcdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHAgJiBQT1NUQUcuRF9OKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAwLjc1O1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0XHQgKiDlnKjmhJ/li5XnmoTph43pgKLkuK3mnInkvZnlnKjnmoToqbHlsLHlpKrpgY7ploPogIBcblx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdGlmIChfdGVtcF9vayAmJiAody5wICYgUE9TVEFHLkRfUikgJiYgKG5leHR3LnAgJiBQT1NUQUcuRF9QKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kICs9IDE7XG5cdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChfdGVtcF9vayAmJiBuZXh0dy5wICYmICh3LnAgJiBQT1NUQUcuRF9QKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGlmIChuZXh0dy5wICYgUE9TVEFHLkFfTlIgJiYgKFxuXHRcdFx0XHRcdFx0XHRcdFx0bmV4dHcudy5sZW5ndGggPiAxXG5cdFx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocHJldy53ID09PSAn55qEJylcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAqIOeahCArIOS7i+ipniArIOS6uuWQjVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoX3RlbXBfb2sgJiYgKHcucCAmIFBPU1RBRy5EX1ApICYmIGhleEFuZEFueShwcmV3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfTixcblx0XHRcdFx0XHRcdFx0KSAmJiBoZXhBbmRBbnkobmV4dHcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9OLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX1YsXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoX3RlbXBfb2sgJiYgKHcucCAmIFBPU1RBRy5EX1ApICYmIGhleEFuZEFueShwcmV3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfUixcblx0XHRcdFx0XHRcdFx0KSAmJiBoZXhBbmRBbnkobmV4dHcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9SLFxuXHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC41O1xuXHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvLyBARklYTUUg5pq05Yqb6Kej5rG6IOS4ieWkqeWQjiDnmoTllY/poYxcblx0XHRcdFx0XHRcdFx0aWYgKG5leHR3LncgPT09ICflkI4nICYmIHcucCAmIFBPU1RBRy5EX1QgJiYgaGV4QW5kQW55KHByZXcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9NUSxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuQV9NLFxuXHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQvLyBARklYTUUg5Yiw5rmW5Lit6ZaT5ZCO5omL57WC5pa86IO95LyR5oGv5LqGXG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKFxuXHRcdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHRcdG5leHR3LncgPT09ICflkI4nXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCBuZXh0dy53ID09PSAn5b6MJ1xuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHQmJiBoZXhBbmRBbnkody5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX0YsXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHRcdHcudyA9PT0gJ+WQjidcblx0XHRcdFx0XHRcdFx0XHRcdHx8IHcudyA9PT0gJ+W+jCdcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0JiYgaGV4QW5kQW55KHByZXcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9GLFxuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHQmJiBoZXhBbmRBbnkobmV4dHcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9OLFxuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgX3RlbXBfb2s6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0XHQgKiDlpbnmiorojbfljIXom4vmkYblnKjlg4/mmK/ljbDluqbng6TppbznmoTpnaLljIXkuIpcblx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdGlmIChfdGVtcF9vayAmJiAody5wICYgUE9TVEFHLkRfRikgJiYgaGV4QW5kQW55KHByZXcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9OLFxuXHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMTtcblx0XHRcdFx0XHRcdFx0XHRfdGVtcF9vayA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyDmnKror4bliKvnmoTor43mlbDph49cblx0XHRcdFx0XHRhc3Nlc3NbaV0uYysrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIOagh+WHhuW3rlxuXHRcdFx0XHRhc3Nlc3NbaV0uYiArPSBNYXRoLnBvdyhzcCAtIHcudy5sZW5ndGgsIDIpO1xuXHRcdFx0XHRwcmV3ID0gY2h1bmtbal07XG5cdFx0XHR9XG5cblx0XHRcdC8vIOWmguaenOWPpeWtkOS4reWMheWQq+S6huiHs+WwkeS4gOS4quWKqOivjVxuXHRcdFx0aWYgKGhhc19EX1YgPT09IGZhbHNlKSBhc3Nlc3NbaV0uZCAtPSAwLjU7XG5cblx0XHRcdGFzc2Vzc1tpXS5hID0gYXNzZXNzW2ldLmEgLyBjaHVuay5sZW5ndGg7XG5cdFx0XHRhc3Nlc3NbaV0uYiA9IGFzc2Vzc1tpXS5iIC8gY2h1bmsubGVuZ3RoO1xuXHRcdH1cblxuXHRcdC8vY29uc29sZS5kaXIoYXNzZXNzKTtcblxuXHRcdC8vIOiuoeeul+aOkuWQjVxuXHRcdGxldCB0b3AgPSB0aGlzLmdldFRvcHMoYXNzZXNzKTtcblx0XHRsZXQgY3VycmNodW5rID0gY2h1bmtzW3RvcF07XG5cblx0XHRpZiAoZmFsc2UpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhhc3Nlc3MpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhPYmplY3QuZW50cmllcyhjaHVua3MpKTtcblx0XHRcdGNvbnNvbGUuZGlyKE9iamVjdC5lbnRyaWVzKGNodW5rcylcblx0XHRcdFx0Lm1hcCgoW2ksIGNodW5rXSkgPT4geyByZXR1cm4geyBpLCBhc3NlczogYXNzZXNzW2kgYXMgdW5rbm93biBhcyBudW1iZXJdLCBjaHVuayB9IH0pLCB7IGRlcHRoOiA1IH0pO1xuXHRcdFx0Y29uc29sZS5kaXIoeyBpOiB0b3AsIGFzc2VzOiBhc3Nlc3NbdG9wXSwgY3VycmNodW5rIH0pO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyh0b3ApO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhjdXJyY2h1bmspO1xuXHRcdH1cblxuXHRcdC8vIOWJlOmZpOS4jeiDveivhuWIq+eahOivjVxuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOiBJV29yZDsgd29yZCA9IGN1cnJjaHVua1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICghKHdvcmQudyBpbiBUQUJMRSkpXG5cdFx0XHR7XG5cdFx0XHRcdGN1cnJjaHVuay5zcGxpY2UoaS0tLCAxKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0ID0gY3VycmNodW5rO1xuXG5cdFx0Ly8g6Kmm5ZyW5Li75YuV5riF6Zmk6KiY5oa26auUXG5cdFx0YXNzZXNzID0gdW5kZWZpbmVkO1xuXHRcdGNodW5rcyA9IHVuZGVmaW5lZDtcblx0XHRjdXJyY2h1bmsgPSB1bmRlZmluZWQ7XG5cdFx0dG9wID0gdW5kZWZpbmVkO1xuXHRcdHdvcmRwb3MgPSB1bmRlZmluZWQ7XG5cblx0XHQvL2RlYnVnKHJldCk7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiDor4Tku7fmjpLlkI1cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IGFzc2Vzc1xuXHQgKiBAcmV0dXJuIHtvYmplY3R9XG5cdCAqL1xuXHRnZXRUb3BzKGFzc2VzczogQXJyYXk8SUFzc2Vzc1Jvdz4pXG5cdHtcblx0XHQvL2RlYnVnKGFzc2Vzcyk7XG5cdFx0Ly8g5Y+W5ZCE6aG55pyA5aSn5YC8XG5cdFx0bGV0IHRvcDogSUFzc2Vzc1JvdyA9IHtcblx0XHRcdHg6IGFzc2Vzc1swXS54LFxuXHRcdFx0YTogYXNzZXNzWzBdLmEsXG5cdFx0XHRiOiBhc3Nlc3NbMF0uYixcblx0XHRcdGM6IGFzc2Vzc1swXS5jLFxuXHRcdFx0ZDogYXNzZXNzWzBdLmQsXG5cdFx0fTtcblxuXHRcdGZvciAobGV0IGkgPSAxLCBhc3M6IElBc3Nlc3NSb3c7IGFzcyA9IGFzc2Vzc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGlmIChhc3MuYSA+IHRvcC5hKSB0b3AuYSA9IGFzcy5hOyAgLy8g5Y+W5pyA5aSn5bmz5Z2H6K+N6aKRXG5cdFx0XHRpZiAoYXNzLmIgPCB0b3AuYikgdG9wLmIgPSBhc3MuYjsgIC8vIOWPluacgOWwj+agh+WHhuW3rlxuXHRcdFx0aWYgKGFzcy5jID4gdG9wLmMpIHRvcC5jID0gYXNzLmM7ICAvLyDlj5bmnIDlpKfmnKror4bliKvor41cblx0XHRcdGlmIChhc3MuZCA8IHRvcC5kKSB0b3AuZCA9IGFzcy5kOyAgLy8g5Y+W5pyA5bCP6K+t5rOV5YiG5pWwXG5cdFx0XHRpZiAoYXNzLnggPiB0b3AueCkgdG9wLnggPSBhc3MueDsgIC8vIOWPluacgOWkp+WNleivjeaVsOmHj1xuXHRcdH1cblx0XHQvL2RlYnVnKHRvcCk7XG5cblx0XHQvLyDor4TkvLDmjpLlkI1cblx0XHRsZXQgdG9wczogbnVtYmVyW10gPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMCwgYXNzOiBJQXNzZXNzUm93OyBhc3MgPSBhc3Nlc3NbaV07IGkrKylcblx0XHR7XG5cdFx0XHR0b3BzW2ldID0gMDtcblx0XHRcdC8vIOivjeaVsOmHj++8jOi2iuWwj+i2iuWlvVxuXHRcdFx0dG9wc1tpXSArPSAodG9wLnggLSBhc3MueCkgKiAxLjU7XG5cdFx0XHQvLyDor43mgLvpopHnjofvvIzotorlpKfotorlpb1cblx0XHRcdGlmIChhc3MuYSA+PSB0b3AuYSkgdG9wc1tpXSArPSAxO1xuXHRcdFx0Ly8g6K+N5qCH5YeG5beu77yM6LaK5bCP6LaK5aW9XG5cdFx0XHRpZiAoYXNzLmIgPD0gdG9wLmIpIHRvcHNbaV0gKz0gMTtcblx0XHRcdC8vIOacquivhuWIq+ivje+8jOi2iuWwj+i2iuWlvVxuXHRcdFx0dG9wc1tpXSArPSAodG9wLmMgLSBhc3MuYyk7Ly9kZWJ1Zyh0b3BzW2ldKTtcblx0XHRcdC8vIOespuWQiOivreazlee7k+aehOeoi+W6pu+8jOi2iuWkp+i2iuWlvVxuXHRcdFx0dG9wc1tpXSArPSAoYXNzLmQgPCAwID8gdG9wLmQgKyBhc3MuZCA6IGFzcy5kIC0gdG9wLmQpICogMTtcblxuXHRcdFx0YXNzLnNjb3JlID0gdG9wc1tpXTtcblxuXHRcdFx0Ly9kZWJ1Zyh0b3BzW2ldKTtkZWJ1ZygnLS0tJyk7XG5cdFx0fVxuXHRcdC8vZGVidWcodG9wcy5qb2luKCcgICcpKTtcblxuXHRcdC8vY29uc29sZS5sb2codG9wcyk7XG5cdFx0Ly9jb25zb2xlLmxvZyhhc3Nlc3MpO1xuXG5cdFx0Ly9jb25zdCBvbGRfbWV0aG9kID0gdHJ1ZTtcblx0XHRjb25zdCBvbGRfbWV0aG9kID0gZmFsc2U7XG5cblx0XHQvLyDlj5bliIbmlbDmnIDpq5jnmoRcblx0XHRsZXQgY3VycmkgPSAwO1xuXHRcdGxldCBtYXhzID0gdG9wc1swXTtcblx0XHRmb3IgKGxldCBpIGluIHRvcHMpXG5cdFx0e1xuXHRcdFx0bGV0IHMgPSB0b3BzW2ldO1xuXHRcdFx0aWYgKHMgPiBtYXhzKVxuXHRcdFx0e1xuXHRcdFx0XHRjdXJyaSA9IGkgYXMgYW55IGFzIG51bWJlcjtcblx0XHRcdFx0bWF4cyA9IHM7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChzID09PSBtYXhzKVxuXHRcdFx0e1xuXHRcdFx0XHQvKipcblx0XHRcdFx0ICog5aaC5p6c5YiG5pWw55u45ZCM77yM5YiZ5qC55o2u6K+N6ZW/5bqm44CB5pyq6K+G5Yir6K+N5Liq5pWw5ZKM5bmz5Z2H6aKR546H5p2l6YCJ5oupXG5cdFx0XHRcdCAqXG5cdFx0XHRcdCAqIOWmguaenOS+neeEtuWQjOWIhu+8jOWJh+S/neaMgeS4jeiuilxuXHRcdFx0XHQgKi9cblx0XHRcdFx0bGV0IGEgPSAwO1xuXHRcdFx0XHRsZXQgYiA9IDA7XG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0uYyA8IGFzc2Vzc1tjdXJyaV0uYylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGErKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0uYyAhPT0gYXNzZXNzW2N1cnJpXS5jKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0uYSA+IGFzc2Vzc1tjdXJyaV0uYSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGErKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0uYSAhPT0gYXNzZXNzW2N1cnJpXS5hKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0ueCA8IGFzc2Vzc1tjdXJyaV0ueClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGErKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0ueCAhPT0gYXNzZXNzW2N1cnJpXS54KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhID4gYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGN1cnJpID0gaSBhcyBhbnkgYXMgbnVtYmVyO1xuXHRcdFx0XHRcdG1heHMgPSBzO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvL2RlYnVnKHsgaSwgcywgbWF4cywgY3VycmkgfSk7XG5cdFx0fVxuXHRcdC8vZGVidWcoJ21heDogaT0nICsgY3VycmkgKyAnLCBzPScgKyB0b3BzW2N1cnJpXSk7XG5cblx0XHRhc3Nlc3MgPSB1bmRlZmluZWQ7XG5cdFx0dG9wID0gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIGN1cnJpO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWwhuWNleivjeaMieeFp+S9jee9ruaOkuWIl1xuXHQgKlxuXHQgKiBAcGFyYW0ge2FycmF5fSB3b3Jkc1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuXHQgKiBAcmV0dXJuIHtvYmplY3R9XG5cdCAqL1xuXHRnZXRQb3NJbmZvKHdvcmRzOiBJV29yZFtdLCB0ZXh0OiBzdHJpbmcpOiB7XG5cdFx0W2luZGV4OiBudW1iZXJdOiBJV29yZFtdO1xuXHR9XG5cdHtcblx0XHRsZXQgd29yZHBvcyA9IHt9O1xuXHRcdC8vIOWwhuWNleivjeaMieS9jee9ruWIhue7hFxuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOyB3b3JkID0gd29yZHNbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAoIXdvcmRwb3Nbd29yZC5jXSlcblx0XHRcdHtcblx0XHRcdFx0d29yZHBvc1t3b3JkLmNdID0gW107XG5cdFx0XHR9XG5cdFx0XHR3b3JkcG9zW3dvcmQuY10ucHVzaCh3b3JkKTtcblx0XHR9XG5cdFx0Ly8g5oyJ5Y2V5a2X5YiG5Ymy5paH5pys77yM5aGr6KGl56m657y655qE5L2N572uXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0Lmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICghd29yZHBvc1tpXSlcblx0XHRcdHtcblx0XHRcdFx0d29yZHBvc1tpXSA9IFt7IHc6IHRleHQuY2hhckF0KGkpLCBjOiBpLCBmOiAwIH1dO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB3b3JkcG9zO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWPluaJgOacieWIhuaUr1xuXHQgKlxuXHQgKiBAcGFyYW0ge3tbcDogbnVtYmVyXTogU2VnbWVudC5JV29yZFtdfX0gd29yZHBvc1xuXHQgKiBAcGFyYW0ge251bWJlcn0gcG9zIOW9k+WJjeS9jee9rlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmnKzoioLopoHliIbor43nmoTmlofmnKxcblx0ICogQHBhcmFtIHtudW1iZXJ9IHRvdGFsX2NvdW50XG5cdCAqIEByZXR1cm5zIHtTZWdtZW50LklXb3JkW11bXX1cblx0ICovXG5cdGdldENodW5rcyh3b3JkcG9zOiB7XG5cdFx0W2luZGV4OiBudW1iZXJdOiBJV29yZFtdO1xuXHR9LCBwb3M6IG51bWJlciwgdGV4dD86IHN0cmluZywgdG90YWxfY291bnQgPSAwLCBNQVhfQ0hVTktfQ09VTlQ/OiBudW1iZXIpOiBJV29yZFtdW11cblx0e1xuXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiDov73liqDmlrDmqKHlvI/kvb8gTUFYX0NIVU5LX0NPVU5UIOmBnua4m+S+humYsuatoueEoeWIhuautemVt+auteiQveeahOe4veiZleeQhuasoeaVuOmBjumrmCDnlLEgREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOIOS+humZkOWItuacgOWwj+WAvFxuXHRcdCAqL1xuXHRcdGlmICh0b3RhbF9jb3VudCA9PT0gMClcblx0XHR7XG5cdFx0XHRNQVhfQ0hVTktfQ09VTlQgPSB0aGlzLk1BWF9DSFVOS19DT1VOVDtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiDlj6rmnInnlbbnm67liY3mloflrZfplbfluqblpKfmlrwgTUFYX0NIVU5LX0NPVU5UIOaZguaJjemBnua4m1xuXHRcdFx0ICovXG5cdFx0XHRpZiAodGV4dC5sZW5ndGggPCBNQVhfQ0hVTktfQ09VTlQpXG5cdFx0XHR7XG5cdFx0XHRcdE1BWF9DSFVOS19DT1VOVCArPSAxO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmIChNQVhfQ0hVTktfQ09VTlQgPD0gdGhpcy5NQVhfQ0hVTktfQ09VTlQpXG5cdFx0e1xuXHRcdFx0TUFYX0NIVU5LX0NPVU5UID0gTWF0aC5tYXgoTUFYX0NIVU5LX0NPVU5UIC0gMSwgdGhpcy5ERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4sIERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTilcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdC8vTUFYX0NIVU5LX0NPVU5UID0gTWF0aC5tYXgoTUFYX0NIVU5LX0NPVU5ULCB0aGlzLkRFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTiwgREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOKVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIOW/veeVpemAo+Wtl1xuXHRcdCAqXG5cdFx0ICog5L6L5aaCOiDllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYrllYpcblx0XHQgKi9cblx0XHRsZXQgbTogUmVnRXhwTWF0Y2hBcnJheTtcblx0XHRpZiAobSA9IHRleHQubWF0Y2goL14oKC4rKVxcMns1LH0pLykpXG5cdFx0e1xuXHRcdFx0bGV0IHMxID0gdGV4dC5zbGljZSgwLCBtWzFdLmxlbmd0aCk7XG5cdFx0XHRsZXQgczIgPSB0ZXh0LnNsaWNlKG1bMV0ubGVuZ3RoKTtcblxuXHRcdFx0bGV0IHdvcmQgPSB7XG5cdFx0XHRcdHc6IHMxLFxuXHRcdFx0XHRjOiBwb3MsXG5cdFx0XHRcdGY6IDAsXG5cdFx0XHR9IGFzIElXb3JkO1xuXG5cdFx0XHRsZXQgX3JldDogSVdvcmRbXVtdID0gW107XG5cblx0XHRcdGlmIChzMiAhPT0gJycpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBjaHVua3MgPSB0aGlzLmdldENodW5rcyh3b3JkcG9zLCBwb3MgKyBzMS5sZW5ndGgsIHMyLCB0b3RhbF9jb3VudCwgTUFYX0NIVU5LX0NPVU5UKTtcblxuXHRcdFx0XHRmb3IgKGxldCB3cyBvZiBjaHVua3MpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfcmV0LnB1c2goW3dvcmRdLmNvbmNhdCh3cykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdF9yZXQucHVzaChbd29yZF0pO1xuXHRcdFx0fVxuXG4vL1x0XHRcdGNvbnNvbGUuZGlyKHdvcmRwb3MpO1xuLy9cbi8vXHRcdFx0Y29uc29sZS5kaXIocmV0KTtcbi8vXG4vL1x0XHRcdGNvbnNvbGUuZGlyKFtwb3MsIHRleHQsIHRvdGFsX2NvdW50XSk7XG5cblx0XHRcdHJldHVybiBfcmV0O1xuXHRcdH1cblxuXHRcdHRvdGFsX2NvdW50Kys7XG5cblx0XHRsZXQgd29yZHMgPSB3b3JkcG9zW3Bvc10gfHwgW107XG5cblx0XHQvL2RlYnVnKHRvdGFsX2NvdW50LCBNQVhfQ0hVTktfQ09VTlQpO1xuXG4vL1x0XHRkZWJ1Zyh7XG4vL1x0XHRcdHRvdGFsX2NvdW50LFxuLy9cdFx0XHRNQVhfQ0hVTktfQ09VTlQ6IHRoaXMuTUFYX0NIVU5LX0NPVU5ULFxuLy9cdFx0XHR0ZXh0LFxuLy9cdFx0XHR3b3Jkcyxcbi8vXHRcdH0pO1xuXG5cdFx0Ly8gZGVidWcoJ2dldENodW5rczogJyk7XG5cdFx0Ly8gZGVidWcod29yZHMpO1xuXHRcdC8vdGhyb3cgbmV3IEVycm9yKCk7XG5cblx0XHRsZXQgcmV0OiBJV29yZFtdW10gPSBbXTtcblx0XHRmb3IgKGxldCB3b3JkIG9mIHdvcmRzKVxuXHRcdHtcblx0XHRcdC8vZGVidWcod29yZCk7XG5cdFx0XHRsZXQgbmV4dGN1ciA9IHdvcmQuYyArIHdvcmQudy5sZW5ndGg7XG5cdFx0XHQvKipcblx0XHRcdCAqIEBGSVhNRVxuXHRcdFx0ICovXG5cdFx0XHRpZiAoIXdvcmRwb3NbbmV4dGN1cl0pXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKFt3b3JkXSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0b3RhbF9jb3VudCA+IE1BWF9DSFVOS19DT1VOVClcblx0XHRcdHtcblx0XHRcdFx0Ly8gZG8gc29tZXRoaW5nXG5cbi8vXHRcdFx0XHRjb25zb2xlLmxvZyg0NDQsIHdvcmRzLnNsaWNlKGkpKTtcbi8vXHRcdFx0XHRjb25zb2xlLmxvZygzMzMsIHdvcmQpO1xuXG5cdFx0XHRcdGxldCB3MTogSVdvcmRbXSA9IFt3b3JkXTtcblxuXHRcdFx0XHRsZXQgaiA9IG5leHRjdXI7XG5cdFx0XHRcdHdoaWxlIChqIGluIHdvcmRwb3MpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdzIgPSB3b3JkcG9zW2pdWzBdO1xuXG5cdFx0XHRcdFx0aWYgKHcyKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHcxLnB1c2godzIpO1xuXG5cdFx0XHRcdFx0XHRqICs9IHcyLncubGVuZ3RoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0LnB1c2godzEpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdCA9IHRleHQuc2xpY2Uod29yZC53Lmxlbmd0aCk7XG5cblx0XHRcdFx0bGV0IGNodW5rcyA9IHRoaXMuZ2V0Q2h1bmtzKHdvcmRwb3MsIG5leHRjdXIsIHQsIHRvdGFsX2NvdW50LCBNQVhfQ0hVTktfQ09VTlQgKTtcblx0XHRcdFx0Zm9yIChsZXQgd3Mgb2YgY2h1bmtzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goW3dvcmRdLmNvbmNhdCh3cykpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2h1bmtzID0gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR3b3JkcyA9IHVuZGVmaW5lZDtcblx0XHR3b3JkcG9zID0gdW5kZWZpbmVkO1xuXHRcdG0gPSB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG59XG5cbmV4cG9ydCBuYW1lc3BhY2UgRGljdFRva2VuaXplclxue1xuXHQvKipcblx0ICog5L2/55So57G75Ly85LqOTU1TR+eahOWIhuivjeeul+azlVxuXHQgKiDmib7lh7rmiYDmnInliIbor43lj6/og73vvIzkuLvopoHmoLnmja7kuIDkuIvlh6DpobnmnaXor4Tku7fvvJpcblx0ICpcblx0ICogeOOAgeivjeaVsOmHj+acgOWwke+8m1xuXHQgKiBh44CB6K+N5bmz5Z2H6aKR546H5pyA5aSn77ybXG5cdCAqIGLjgIHmr4/kuKror43plb/luqbmoIflh4blt67mnIDlsI/vvJtcblx0ICogY+OAgeacquivhuWIq+ivjeacgOWwke+8m1xuXHQgKiBk44CB56ym5ZCI6K+t5rOV57uT5p6E6aG577ya5aaC5Lik5Liq6L+e57ut55qE5Yqo6K+N5YeP5YiG77yM5pWw6K+N5ZCO6Z2i6Lef6YeP6K+N5Yqg5YiG77ybXG5cdCAqXG5cdCAqIOWPluS7peS4iuWHoOmhuee7vOWQiOaOkuWQjeacgOacgOWlveeahFxuXHQgKi9cblx0ZXhwb3J0IHR5cGUgSUFzc2Vzc1JvdyA9IHtcblx0XHQvKipcblx0XHQgKiDor43mlbDph4/vvIzotorlsI/otorlpb1cblx0XHQgKi9cblx0XHR4OiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICog6K+N5oC76aKR546H77yM6LaK5aSn6LaK5aW9XG5cdFx0ICovXG5cdFx0YTogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIOivjeagh+WHhuW3ru+8jOi2iuWwj+i2iuWlvVxuXHRcdCAqIOavj+S4quivjemVv+W6puagh+WHhuW3ruacgOWwj1xuXHRcdCAqL1xuXHRcdGI6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDmnKror4bliKvor43vvIzotorlsI/otorlpb1cblx0XHQgKi9cblx0XHRjOiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICog56ym5ZCI6K+t5rOV57uT5p6E56iL5bqm77yM6LaK5aSn6LaK5aW9XG5cdFx0ICog56ym5ZCI6K+t5rOV57uT5p6E6aG577ya5aaC5Lik5Liq6L+e57ut55qE5Yqo6K+N5YeP5YiG77yM5pWw6K+N5ZCO6Z2i6Lef6YeP6K+N5Yqg5YiGXG5cdFx0ICovXG5cdFx0ZDogbnVtYmVyLFxuXG5cdFx0LyoqXG5cdFx0ICog57WQ566X6KmV5YiGKOiHquWLleioiOeulylcblx0XHQgKi9cblx0XHRzY29yZT86IG51bWJlcixcblx0XHRyZWFkb25seSBpbmRleD86IG51bWJlcixcblx0fTtcbn1cblxuZXhwb3J0IGltcG9ydCBJQXNzZXNzUm93ID0gRGljdFRva2VuaXplci5JQXNzZXNzUm93O1xuXG5leHBvcnQgY29uc3QgaW5pdCA9IERpY3RUb2tlbml6ZXIuaW5pdC5iaW5kKERpY3RUb2tlbml6ZXIpIGFzIElTdWJUb2tlbml6ZXJDcmVhdGU8RGljdFRva2VuaXplcj47XG5cbmV4cG9ydCBkZWZhdWx0IERpY3RUb2tlbml6ZXI7XG4iXX0=