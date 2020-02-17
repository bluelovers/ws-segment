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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGljdFRva2VuaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRpY3RUb2tlbml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLGdDQUE4RTtBQUk5RSx5Q0FBaUQ7QUFDakQsZ0RBQXNIO0FBR3RILHdDQUF3QztBQUczQixRQUFBLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztBQUM3QixRQUFBLDJCQUEyQixHQUFHLEVBQUUsQ0FBQztBQUU5Qzs7OztHQUlHO0FBQ0gsTUFBYSxhQUFjLFNBQVEseUJBQW1CO0lBQXREOztRQUdDOzs7Ozs7Ozs7V0FTRztRQUNILG9CQUFlLEdBQUcsK0JBQXVCLENBQUM7UUFDMUM7OztXQUdHO1FBQ0gsZ0NBQTJCLEdBQUcsbUNBQTJCLENBQUM7SUFzMEIzRCxDQUFDO0lBajBCQSxNQUFNO1FBRUwsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFbkMsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLG1DQUEyQixFQUM3SDtZQUNDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1NBQzFEO1FBRUQsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8s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QkFDQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUVaLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztxQkFDakI7eUJBRUQ7d0JBQ0MsTUFBTTtxQkFDTjtpQkFDRDtnQkFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ2I7aUJBRUQ7Z0JBQ0MsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVsQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxlQUFlLENBQUUsQ0FBQztnQkFDaEYsS0FBSyxJQUFJLEVBQUUsSUFBSSxNQUFNLEVBQ3JCO29CQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDNUI7Z0JBRUQsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNkO1NBQ0Q7UUFFRCxLQUFLLEdBQUcsU0FBUyxDQUFDO1FBQ2xCLE9BQU8sR0FBRyxTQUFTLENBQUM7UUFDcEIsQ0FBQyxHQUFHLFNBQVMsQ0FBQztRQUVkLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUNEO0FBeDFCRCxzQ0F3MUJDO0FBa0RZLFFBQUEsSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBdUMsQ0FBQztBQUVqRyxrQkFBZSxhQUFhLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IFN1YlNNb2R1bGUsIFN1YlNNb2R1bGVUb2tlbml6ZXIsIElTdWJUb2tlbml6ZXJDcmVhdGUgfSBmcm9tICcuLi9tb2QnO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHsgVVN0cmluZyB9IGZyb20gJ3VuaS1zdHJpbmcnO1xuaW1wb3J0IHsgSVRhYmxlRGljdFJvdyB9IGZyb20gJy4uL3RhYmxlL2RpY3QnO1xuaW1wb3J0IHsgaGV4QW5kQW55LCB0b0hleCB9IGZyb20gJy4uL3V0aWwvaW5kZXgnO1xuaW1wb3J0IENIU19OQU1FUywgeyBGQU1JTFlfTkFNRV8xLCBGQU1JTFlfTkFNRV8yLCBTSU5HTEVfTkFNRSwgRE9VQkxFX05BTUVfMSwgRE9VQkxFX05BTUVfMiB9IGZyb20gJy4uL21vZC9DSFNfTkFNRVMnO1xuaW1wb3J0IFNlZ21lbnQsIHsgSURJQ1QsIElXb3JkLCBJRElDVDIgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCB7IGRlYnVnIH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgeyBEQVRFVElNRSB9IGZyb20gJy4uL21vZC9jb25zdCc7XG5pbXBvcnQgSVBPU1RBRyBmcm9tICcuLi9QT1NUQUcnO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9NQVhfQ0hVTktfQ09VTlQgPSA0MDtcbmV4cG9ydCBjb25zdCBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4gPSAzMDtcblxuLyoqXG4gKiDlrZflhbjor4bliKvmqKHlnZdcbiAqXG4gKiBAYXV0aG9yIOiAgembtzxsZWl6b25nbWluQGdtYWlsLmNvbT5cbiAqL1xuZXhwb3J0IGNsYXNzIERpY3RUb2tlbml6ZXIgZXh0ZW5kcyBTdWJTTW9kdWxlVG9rZW5pemVyXG57XG5cblx0LyoqXG5cdCAqIOmYsuatouWboOeEoeWIhuauteWwjuiHtOWIhuaekOmBjuS5heeUmuiHs+i2hemBjuiZleeQhuiyoOiNt1xuXHQgKiDotorpq5jotornsr7mupbkvYbmmK/omZXnkIbmmYLplpPmnIPliqDlgI3miJDplbfnlJroh7PotoXpgY7oqJjmhrbpq5Tog73omZXnkIbnmoTnqIvluqZcblx0ICpcblx0ICog5pW45a2X6LaK5bCP6LaK5b+rXG5cdCAqXG5cdCAqIEZBVEFMIEVSUk9SOiBDQUxMX0FORF9SRVRSWV9MQVNUIEFsbG9jYXRpb24gZmFpbGVkIC0gSmF2YVNjcmlwdCBoZWFwIG91dCBvZiBtZW1vcnlcblx0ICpcblx0ICogQHR5cGUge251bWJlcn1cblx0ICovXG5cdE1BWF9DSFVOS19DT1VOVCA9IERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UO1xuXHQvKipcblx0ICpcblx0ICog6L+95Yqg5paw5qih5byP5L2/IE1BWF9DSFVOS19DT1VOVCDpgZ7muJvkvobpmLLmraLnhKHliIbmrrXplbfmrrXokL3nmoTnuL3omZXnkIbmrKHmlbjpgY7pq5gg55SxIERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTiDkvobpmZDliLbmnIDlsI/lgLxcblx0ICovXG5cdERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTiA9IERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTjtcblxuXHRwcm90ZWN0ZWQgX1RBQkxFOiBJRElDVDxJV29yZD47XG5cdHByb3RlY3RlZCBfVEFCTEUyOiBJRElDVDI8SVdvcmQ+O1xuXG5cdF9jYWNoZSgpXG5cdHtcblx0XHRzdXBlci5fY2FjaGUoKTtcblx0XHR0aGlzLl9UQUJMRSA9IHRoaXMuc2VnbWVudC5nZXREaWN0KCdUQUJMRScpO1xuXHRcdHRoaXMuX1RBQkxFMiA9IHRoaXMuc2VnbWVudC5nZXREaWN0KCdUQUJMRTInKTtcblx0XHR0aGlzLl9QT1NUQUcgPSB0aGlzLnNlZ21lbnQuUE9TVEFHO1xuXG5cdFx0aWYgKHR5cGVvZiB0aGlzLnNlZ21lbnQub3B0aW9ucy5tYXhDaHVua0NvdW50ID09ICdudW1iZXInICYmIHRoaXMuc2VnbWVudC5vcHRpb25zLm1heENodW5rQ291bnQgPiBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4pXG5cdFx0e1xuXHRcdFx0dGhpcy5NQVhfQ0hVTktfQ09VTlQgPSB0aGlzLnNlZ21lbnQub3B0aW9ucy5tYXhDaHVua0NvdW50O1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgdGhpcy5zZWdtZW50Lm9wdGlvbnMubWluQ2h1bmtDb3VudCA9PSAnbnVtYmVyJyAmJiB0aGlzLnNlZ21lbnQub3B0aW9ucy5taW5DaHVua0NvdW50ID4gREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOKVxuXHRcdHtcblx0XHRcdHRoaXMuREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOID0gdGhpcy5zZWdtZW50Lm9wdGlvbnMubWluQ2h1bmtDb3VudDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICog5a+55pyq6K+G5Yir55qE5Y2V6K+N6L+b6KGM5YiG6K+NXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuXHQgKiBAcmV0dXJuIHthcnJheX1cblx0ICovXG5cdHNwbGl0KHdvcmRzOiBJV29yZFtdKTogSVdvcmRbXVxuXHR7XG5cdFx0Ly9kZWJ1Zyh3b3Jkcyk7XG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLl9UQUJMRTtcblx0XHQvL2NvbnN0IFBPU1RBRyA9IHRoaXMuX1BPU1RBRztcblxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOyB3b3JkID0gd29yZHNbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAod29yZC5wID4gMClcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2god29yZCk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyDku4Xlr7nmnKror4bliKvnmoTor43ov5vooYzljLnphY1cblx0XHRcdGxldCB3b3JkaW5mbyA9IHRoaXMubWF0Y2hXb3JkKHdvcmQudywgMCwgd29yZHNbaSAtIDFdKTtcblx0XHRcdGlmICh3b3JkaW5mby5sZW5ndGggPCAxKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIOWIhuemu+WHuuW3suivhuWIq+eahOWNleivjVxuXHRcdFx0bGV0IGxhc3RjID0gMDtcblxuXHRcdFx0d29yZGluZm8uZm9yRWFjaChmdW5jdGlvbiAoYncsIHVpKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoYncuYyA+IGxhc3RjKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdFx0dzogd29yZC53LnN1YnN0cihsYXN0YywgYncuYyAtIGxhc3RjKSxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBjdyA9IHNlbGYuY3JlYXRlUmF3VG9rZW4oe1xuXHRcdFx0XHRcdHc6IGJ3LncsXG5cdFx0XHRcdFx0ZjogYncuZixcblx0XHRcdFx0fSwgVEFCTEVbYncud10pO1xuXG5cdFx0XHRcdHJldC5wdXNoKGN3KTtcblxuXHRcdFx0XHQvKlxuXHRcdFx0XHRyZXQucHVzaCh7XG5cdFx0XHRcdFx0dzogYncudyxcblx0XHRcdFx0XHRwOiB3dy5wLFxuXHRcdFx0XHRcdGY6IGJ3LmYsXG5cdFx0XHRcdFx0czogd3cucyxcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCovXG5cdFx0XHRcdGxhc3RjID0gYncuYyArIGJ3LncubGVuZ3RoO1xuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBsYXN0d29yZCA9IHdvcmRpbmZvW3dvcmRpbmZvLmxlbmd0aCAtIDFdO1xuXHRcdFx0aWYgKGxhc3R3b3JkLmMgKyBsYXN0d29yZC53Lmxlbmd0aCA8IHdvcmQudy5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBjdyA9IHNlbGYuY3JlYXRlUmF3VG9rZW4oe1xuXHRcdFx0XHRcdHc6IHdvcmQudy5zdWJzdHIobGFzdHdvcmQuYyArIGxhc3R3b3JkLncubGVuZ3RoKSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0LnB1c2goY3cpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHdvcmRzID0gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cblx0LyoqXG5cdCAqIOWMuemFjeWNleivje+8jOi/lOWbnuebuOWFs+S/oeaBr1xuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmlofmnKxcblx0ICogQHBhcmFtIHtpbnR9IGN1ciDlvIDlp4vkvY3nva5cblx0ICogQHBhcmFtIHtvYmplY3R9IHByZXdvcmQg5LiK5LiA5Liq5Y2V6K+NXG5cdCAqIEByZXR1cm4ge2FycmF5fSAg6L+U5Zue5qC85byPICAge3c6ICfljZXor40nLCBjOiDlvIDlp4vkvY3nva59XG5cdCAqL1xuXHRwcm90ZWN0ZWQgbWF0Y2hXb3JkKHRleHQ6IHN0cmluZywgY3VyOiBudW1iZXIsIHByZXdvcmQ6IElXb3JkKVxuXHR7XG5cdFx0aWYgKGlzTmFOKGN1cikpIGN1ciA9IDA7XG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xuXHRcdGxldCBzID0gZmFsc2U7XG5cblx0XHRjb25zdCBUQUJMRTIgPSB0aGlzLl9UQUJMRTI7XG5cblx0XHQvLyDljLnphY3lj6/og73lh7rnjrDnmoTljZXor41cblx0XHR3aGlsZSAoY3VyIDwgdGV4dC5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Zm9yIChsZXQgaSBpbiBUQUJMRTIpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB3ID0gdGV4dC5zdWJzdHIoY3VyLCBpIGFzIGFueSBhcyBudW1iZXIpO1xuXHRcdFx0XHRpZiAodyBpbiBUQUJMRTJbaV0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaCh7XG5cdFx0XHRcdFx0XHR3OiB3LFxuXHRcdFx0XHRcdFx0YzogY3VyLFxuXHRcdFx0XHRcdFx0ZjogVEFCTEUyW2ldW3ddLmYsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGN1cisrO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmZpbHRlcldvcmQocmV0LCBwcmV3b3JkLCB0ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiDpgInmi6nmnIDmnInlj6/og73ljLnphY3nmoTljZXor41cblx0ICpcblx0ICogQHBhcmFtIHthcnJheX0gd29yZHMg5Y2V6K+N5L+h5oGv5pWw57uEXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwcmV3b3JkIOS4iuS4gOS4quWNleivjVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmnKzoioLopoHliIbor43nmoTmlofmnKxcblx0ICogQHJldHVybiB7YXJyYXl9XG5cdCAqL1xuXHRwcm90ZWN0ZWQgZmlsdGVyV29yZCh3b3JkczogSVdvcmRbXSwgcHJld29yZDogSVdvcmQsIHRleHQ6IHN0cmluZylcblx0e1xuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5fVEFCTEU7XG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5fUE9TVEFHO1xuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblxuXHRcdC8vIOWwhuWNleivjeaMieS9jee9ruWIhue7hFxuXHRcdGxldCB3b3JkcG9zID0gdGhpcy5nZXRQb3NJbmZvKHdvcmRzLCB0ZXh0KTtcblx0XHQvL2RlYnVnKHdvcmRwb3MpO1xuXG5cdFx0LyoqXG5cdFx0ICog5L2/55So57G75Ly85LqOTU1TR+eahOWIhuivjeeul+azlVxuXHRcdCAqIOaJvuWHuuaJgOacieWIhuivjeWPr+iDve+8jOS4u+imgeagueaNruS4gOS4i+WHoOmhueadpeivhOS7t++8mlxuXHRcdCAqIHjjgIHor43mlbDph4/mnIDlsJHvvJtcblx0XHQgKiBh44CB6K+N5bmz5Z2H6aKR546H5pyA5aSn77ybXG5cdFx0ICogYuOAgeavj+S4quivjemVv+W6puagh+WHhuW3ruacgOWwj++8m1xuXHRcdCAqIGPjgIHmnKror4bliKvor43mnIDlsJHvvJtcblx0XHQgKiBk44CB56ym5ZCI6K+t5rOV57uT5p6E6aG577ya5aaC5Lik5Liq6L+e57ut55qE5Yqo6K+N5YeP5YiG77yM5pWw6K+N5ZCO6Z2i6Lef6YeP6K+N5Yqg5YiG77ybXG5cdFx0ICog5Y+W5Lul5LiK5Yeg6aG557u85ZCI5o6S5ZCN5pyA5pyA5aW955qEXG5cdFx0ICovXG5cdFx0bGV0IGNodW5rcyA9IHRoaXMuZ2V0Q2h1bmtzKHdvcmRwb3MsIDAsIHRleHQpO1xuXHRcdC8vZGVidWcoY2h1bmtzKTtcblx0XHRsZXQgYXNzZXNzOiBBcnJheTxJQXNzZXNzUm93PiA9IFtdOyAgLy8g6K+E5Lu36KGoXG5cblx0XHQvL2NvbnNvbGUubG9nKGNodW5rcyk7XG5cblx0XHQvLyDlr7nlkITkuKrliIbmlK/lsLHooYzor4TkvLBcblx0XHRmb3IgKGxldCBpID0gMCwgY2h1bms6IElXb3JkW107IGNodW5rID0gY2h1bmtzW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0YXNzZXNzW2ldID0ge1xuXHRcdFx0XHR4OiBjaHVuay5sZW5ndGgsXG5cdFx0XHRcdGE6IDAsXG5cdFx0XHRcdGI6IDAsXG5cdFx0XHRcdGM6IDAsXG5cdFx0XHRcdGQ6IDAsXG5cblx0XHRcdFx0aW5kZXg6IGksXG5cdFx0XHR9O1xuXHRcdFx0Ly8g6K+N5bmz5Z2H6ZW/5bqmXG5cdFx0XHRsZXQgc3AgPSB0ZXh0Lmxlbmd0aCAvIGNodW5rLmxlbmd0aDtcblx0XHRcdC8vIOWPpeWtkOe7j+W4uOWMheWQq+eahOivreazlee7k+aehFxuXHRcdFx0bGV0IGhhc19EX1YgPSBmYWxzZTsgIC8vIOaYr+WQpuWMheWQq+WKqOivjVxuXG5cdFx0XHQvLyDpgY3ljoblkITkuKror41cblx0XHRcdGxldCBwcmV3OiBJV29yZDtcblxuXHRcdFx0aWYgKHByZXdvcmQpXG5cdFx0XHR7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdHByZXcgPSB7XG5cdFx0XHRcdFx0dzogcHJld29yZC53LFxuXHRcdFx0XHRcdHA6IHByZXdvcmQucCxcblx0XHRcdFx0XHRmOiBwcmV3b3JkLmYsXG5cdFx0XHRcdFx0czogcHJld29yZC5zLFxuXHRcdFx0XHR9XG5cdFx0XHRcdCovXG5cblx0XHRcdFx0cHJldyA9IHRoaXMuY3JlYXRlUmF3VG9rZW4ocHJld29yZCk7XG5cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0cHJldyA9IG51bGw7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGxldCBqID0gMCwgdzogSVdvcmQ7IHcgPSBjaHVua1tqXTsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAody53IGluIFRBQkxFKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dy5wID0gVEFCTEVbdy53XS5wO1xuXHRcdFx0XHRcdGFzc2Vzc1tpXS5hICs9IHcuZjsgICAvLyDmgLvor43popFcblxuXHRcdFx0XHRcdGlmIChqID09PSAwICYmICFwcmV3b3JkICYmICh3LnAgJiBQT1NUQUcuRF9WKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdCAqIOWwh+esrOS4gOWAi+Wtl+S5n+ioiOeul+mAsuWOu+aYr+WQpuWMheWQq+WLleipnlxuXHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRoYXNfRF9WID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyA9PT09PT09PT09PT09PT09IOajgOafpeivreazlee7k+aehCA9PT09PT09PT09PT09PT09PT09XG5cdFx0XHRcdFx0aWYgKHByZXcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5LiK5LiA5Liq6K+N5piv5pWw6K+N5LiU5b2T5YmN6K+N5piv6YeP6K+N77yI5Y2V5L2N77yJ77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdChwcmV3LnAgJiBQT1NUQUcuQV9NKVxuXHRcdFx0XHRcdFx0XHQmJlxuXHRcdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdFx0KHcucCAmIFBPU1RBRy5BX1EpXG5cdFx0XHRcdFx0XHRcdFx0fHwgdy53IGluIERBVEVUSU1FXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5b2T5YmN6K+N5piv5Yqo6K+NXG5cdFx0XHRcdFx0XHRpZiAody5wICYgUE9TVEFHLkRfVilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aGFzX0RfViA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdC8vIOWmguaenOaYr+i/nue7reeahOS4pOS4quWKqOivje+8jOWImeWHj+WIhlxuXHRcdFx0XHRcdFx0XHQvL2lmICgocHJldy5wICYgUE9TVEFHLkRfVikgPiAwKVxuXHRcdFx0XHRcdFx0XHQvL2Fzc2Vzc1tpXS5kLS07XG5cblx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0Ly8g5aaC5p6c5pivIOW9ouWuueivjSArIOWKqOivje+8jOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0XHRpZiAoKHByZXcucCAmIFBPU1RBRy5EX0EpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDlia/or40gKyDliqjor43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdFx0aWYgKHByZXcucCAmIFBPU1RBRy5EX0QpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK/lnLDljLrlkI3jgIHmnLrmnoTlkI3miJblvaLlrrnor43vvIzlkI7pnaLot5/lnLDljLrjgIHmnLrmnoTjgIHku6Por43jgIHlkI3or43nrYnvvIzliJnliqDliIZcblx0XHRcdFx0XHRcdGlmICgoXG5cdFx0XHRcdFx0XHRcdFx0KHByZXcucCAmIFBPU1RBRy5BX05TKVxuXHRcdFx0XHRcdFx0XHRcdHx8IChwcmV3LnAgJiBQT1NUQUcuQV9OVClcblx0XHRcdFx0XHRcdFx0XHR8fCAocHJldy5wICYgUE9TVEFHLkRfQSlcblx0XHRcdFx0XHRcdFx0KSAmJlxuXHRcdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdFx0KHcucCAmIFBPU1RBRy5EX04pXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05SKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OUylcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkFfTlopXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05UKVxuXHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5pivIOaWueS9jeivjSArIOaVsOmHj+ivje+8jOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHQocHJldy5wICYgUE9TVEFHLkRfRilcblx0XHRcdFx0XHRcdFx0JiZcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdCh3LnAgJiBQT1NUQUcuQV9NKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuRF9NUSlcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9kZWJ1ZyhwcmV3LCB3KTtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDlp5MgKyDlkI3or43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdHByZXcudyBpbiBGQU1JTFlfTkFNRV8xXG5cdFx0XHRcdFx0XHRcdFx0fHwgcHJldy53IGluIEZBTUlMWV9OQU1FXzJcblx0XHRcdFx0XHRcdFx0KSAmJlxuXHRcdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdFx0KHcucCAmIFBPU1RBRy5EX04pXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05aKVxuXHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvL2RlYnVnKHByZXcsIHcpO1xuXHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdCAqIOWcsOWQjS/lpITmiYAgKyDmlrnkvY1cblx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0aWYgKGhleEFuZEFueShwcmV3LnBcblx0XHRcdFx0XHRcdFx0LCBQT1NUQUcuRF9TXG5cdFx0XHRcdFx0XHRcdCwgUE9TVEFHLkFfTlMsXG5cdFx0XHRcdFx0XHQpICYmIGhleEFuZEFueSh3LnBcblx0XHRcdFx0XHRcdFx0LCBQT1NUQUcuRF9GLFxuXHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC41O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyDmjqLmtYvkuIvkuIDkuKror41cblx0XHRcdFx0XHRcdGxldCBuZXh0dyA9IGNodW5rW2ogKyAxXTtcblx0XHRcdFx0XHRcdGlmIChuZXh0dylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKG5leHR3LncgaW4gVEFCTEUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRuZXh0dy5wID0gVEFCTEVbbmV4dHcud10ucDtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBfdGVtcF9vazogYm9vbGVhbiA9IHRydWU7XG5cblx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdCAqIOWmguaenOW9k+WJjeaYr+KAnOeahOKAnSsg5ZCN6K+N77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0KHcudyA9PT0gJ+eahCcgfHwgdy53ID09PSAn5LmLJylcblx0XHRcdFx0XHRcdFx0XHQmJiBuZXh0dy5wICYmIChcblx0XHRcdFx0XHRcdFx0XHRcdChuZXh0dy5wICYgUE9TVEFHLkRfTilcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkRfVilcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkFfTlIpXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCAobmV4dHcucCAmIFBPU1RBRy5BX05TKVxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OWilcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkFfTlQpXG5cdFx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kICs9IDEuNTtcblx0XHRcdFx0XHRcdFx0XHRfdGVtcF9vayA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0XHQgKiDlpoLmnpzmmK/ov57or43vvIzliY3lkI7kuKTkuKror43or43mgKfnm7jlkIzliJnliqDliIZcblx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKHByZXcucCAmJiAody5wICYgUE9TVEFHLkRfQykpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgcCA9IHByZXcucCAmIG5leHR3LnA7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAocHJldy5wID09PSBuZXh0dy5wKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdFx0XHRfdGVtcF9vayA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRlbHNlIGlmIChwKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kICs9IDAuMjU7XG5cdFx0XHRcdFx0XHRcdFx0XHRfdGVtcF9vayA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocCAmIFBPU1RBRy5EX04pXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kICs9IDAuNzU7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdCAqIOWcqOaEn+WLleeahOmHjemAouS4reacieS9meWcqOeahOipseWwseWkqumBjumWg+iAgFxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0aWYgKF90ZW1wX29rICYmICh3LnAgJiBQT1NUQUcuRF9SKSAmJiAobmV4dHcucCAmIFBPU1RBRy5EX1ApKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMTtcblx0XHRcdFx0XHRcdFx0XHRfdGVtcF9vayA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKF90ZW1wX29rICYmIG5leHR3LnAgJiYgKHcucCAmIFBPU1RBRy5EX1ApKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKG5leHR3LnAgJiBQT1NUQUcuQV9OUiAmJiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRuZXh0dy53Lmxlbmd0aCA+IDFcblx0XHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmIChwcmV3LncgPT09ICfnmoQnKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0XHRcdFx0ICog55qEICsg5LuL6KmeICsg5Lq65ZCNXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAxO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRfdGVtcF9vayA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChfdGVtcF9vayAmJiAody5wICYgUE9TVEFHLkRfUCkgJiYgaGV4QW5kQW55KHByZXcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9OLFxuXHRcdFx0XHRcdFx0XHQpICYmIGhleEFuZEFueShuZXh0dy5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX04sXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfVixcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlIGlmIChfdGVtcF9vayAmJiAody5wICYgUE9TVEFHLkRfUCkgJiYgaGV4QW5kQW55KHByZXcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9SLFxuXHRcdFx0XHRcdFx0XHQpICYmIGhleEFuZEFueShuZXh0dy5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX1IsXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAwLjU7XG5cdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdC8vIEBGSVhNRSDmmrTlipvop6Pmsbog5LiJ5aSp5ZCOIOeahOWVj+mhjFxuXHRcdFx0XHRcdFx0XHRpZiAobmV4dHcudyA9PT0gJ+WQjicgJiYgdy5wICYgUE9TVEFHLkRfVCAmJiBoZXhBbmRBbnkocHJldy5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX01RLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5BX00sXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8vIEBGSVhNRSDliLDmuZbkuK3plpPlkI7miYvntYLmlrzog73kvJHmga/kuoZcblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoXG5cdFx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdFx0bmV4dHcudyA9PT0gJ+WQjidcblx0XHRcdFx0XHRcdFx0XHRcdHx8IG5leHR3LncgPT09ICflvownXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdCYmIGhleEFuZEFueSh3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfRixcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdFx0dy53ID09PSAn5ZCOJ1xuXHRcdFx0XHRcdFx0XHRcdFx0fHwgdy53ID09PSAn5b6MJ1xuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHQmJiBoZXhBbmRBbnkocHJldy5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX0YsXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdCYmIGhleEFuZEFueShuZXh0dy5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX04sXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBfdGVtcF9vazogYm9vbGVhbiA9IHRydWU7XG5cblx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdCAqIOWlueaKiuiNt+WMheibi+aRhuWcqOWDj+aYr+WNsOW6pueDpOmlvOeahOmdouWMheS4ilxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0aWYgKF90ZW1wX29rICYmICh3LnAgJiBQT1NUQUcuRF9GKSAmJiBoZXhBbmRBbnkocHJldy5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX04sXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAxO1xuXHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIOacquivhuWIq+eahOivjeaVsOmHj1xuXHRcdFx0XHRcdGFzc2Vzc1tpXS5jKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8g5qCH5YeG5beuXG5cdFx0XHRcdGFzc2Vzc1tpXS5iICs9IE1hdGgucG93KHNwIC0gdy53Lmxlbmd0aCwgMik7XG5cdFx0XHRcdHByZXcgPSBjaHVua1tqXTtcblx0XHRcdH1cblxuXHRcdFx0Ly8g5aaC5p6c5Y+l5a2Q5Lit5YyF5ZCr5LqG6Iez5bCR5LiA5Liq5Yqo6K+NXG5cdFx0XHRpZiAoaGFzX0RfViA9PT0gZmFsc2UpIGFzc2Vzc1tpXS5kIC09IDAuNTtcblxuXHRcdFx0YXNzZXNzW2ldLmEgPSBhc3Nlc3NbaV0uYSAvIGNodW5rLmxlbmd0aDtcblx0XHRcdGFzc2Vzc1tpXS5iID0gYXNzZXNzW2ldLmIgLyBjaHVuay5sZW5ndGg7XG5cdFx0fVxuXG5cdFx0Ly9jb25zb2xlLmRpcihhc3Nlc3MpO1xuXG5cdFx0Ly8g6K6h566X5o6S5ZCNXG5cdFx0bGV0IHRvcCA9IHRoaXMuZ2V0VG9wcyhhc3Nlc3MpO1xuXHRcdGxldCBjdXJyY2h1bmsgPSBjaHVua3NbdG9wXTtcblxuXHRcdGlmIChmYWxzZSlcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGFzc2Vzcyk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKE9iamVjdC5lbnRyaWVzKGNodW5rcykpO1xuXHRcdFx0Y29uc29sZS5kaXIoT2JqZWN0LmVudHJpZXMoY2h1bmtzKVxuXHRcdFx0XHQubWFwKChbaSwgY2h1bmtdKSA9PiB7IHJldHVybiB7IGksIGFzc2VzOiBhc3Nlc3NbaSBhcyB1bmtub3duIGFzIG51bWJlcl0sIGNodW5rIH0gfSksIHsgZGVwdGg6IDUgfSk7XG5cdFx0XHRjb25zb2xlLmRpcih7IGk6IHRvcCwgYXNzZXM6IGFzc2Vzc1t0b3BdLCBjdXJyY2h1bmsgfSk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKHRvcCk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGN1cnJjaHVuayk7XG5cdFx0fVxuXG5cdFx0Ly8g5YmU6Zmk5LiN6IO96K+G5Yir55qE6K+NXG5cdFx0Zm9yIChsZXQgaSA9IDAsIHdvcmQ6IElXb3JkOyB3b3JkID0gY3VycmNodW5rW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKCEod29yZC53IGluIFRBQkxFKSlcblx0XHRcdHtcblx0XHRcdFx0Y3VycmNodW5rLnNwbGljZShpLS0sIDEpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXQgPSBjdXJyY2h1bms7XG5cblx0XHQvLyDoqablnJbkuLvli5XmuIXpmaToqJjmhrbpq5Rcblx0XHRhc3Nlc3MgPSB1bmRlZmluZWQ7XG5cdFx0Y2h1bmtzID0gdW5kZWZpbmVkO1xuXHRcdGN1cnJjaHVuayA9IHVuZGVmaW5lZDtcblx0XHR0b3AgPSB1bmRlZmluZWQ7XG5cdFx0d29yZHBvcyA9IHVuZGVmaW5lZDtcblxuXHRcdC8vZGVidWcocmV0KTtcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOivhOS7t+aOkuWQjVxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gYXNzZXNzXG5cdCAqIEByZXR1cm4ge29iamVjdH1cblx0ICovXG5cdGdldFRvcHMoYXNzZXNzOiBBcnJheTxJQXNzZXNzUm93Pilcblx0e1xuXHRcdC8vZGVidWcoYXNzZXNzKTtcblx0XHQvLyDlj5blkITpobnmnIDlpKflgLxcblx0XHRsZXQgdG9wOiBJQXNzZXNzUm93ID0ge1xuXHRcdFx0eDogYXNzZXNzWzBdLngsXG5cdFx0XHRhOiBhc3Nlc3NbMF0uYSxcblx0XHRcdGI6IGFzc2Vzc1swXS5iLFxuXHRcdFx0YzogYXNzZXNzWzBdLmMsXG5cdFx0XHRkOiBhc3Nlc3NbMF0uZCxcblx0XHR9O1xuXG5cdFx0Zm9yIChsZXQgaSA9IDEsIGFzczogSUFzc2Vzc1JvdzsgYXNzID0gYXNzZXNzW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKGFzcy5hID4gdG9wLmEpIHRvcC5hID0gYXNzLmE7ICAvLyDlj5bmnIDlpKflubPlnYfor43popFcblx0XHRcdGlmIChhc3MuYiA8IHRvcC5iKSB0b3AuYiA9IGFzcy5iOyAgLy8g5Y+W5pyA5bCP5qCH5YeG5beuXG5cdFx0XHRpZiAoYXNzLmMgPiB0b3AuYykgdG9wLmMgPSBhc3MuYzsgIC8vIOWPluacgOWkp+acquivhuWIq+ivjVxuXHRcdFx0aWYgKGFzcy5kIDwgdG9wLmQpIHRvcC5kID0gYXNzLmQ7ICAvLyDlj5bmnIDlsI/or63ms5XliIbmlbBcblx0XHRcdGlmIChhc3MueCA+IHRvcC54KSB0b3AueCA9IGFzcy54OyAgLy8g5Y+W5pyA5aSn5Y2V6K+N5pWw6YePXG5cdFx0fVxuXHRcdC8vZGVidWcodG9wKTtcblxuXHRcdC8vIOivhOS8sOaOkuWQjVxuXHRcdGxldCB0b3BzOiBudW1iZXJbXSA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwLCBhc3M6IElBc3Nlc3NSb3c7IGFzcyA9IGFzc2Vzc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdHRvcHNbaV0gPSAwO1xuXHRcdFx0Ly8g6K+N5pWw6YeP77yM6LaK5bCP6LaK5aW9XG5cdFx0XHR0b3BzW2ldICs9ICh0b3AueCAtIGFzcy54KSAqIDEuNTtcblx0XHRcdC8vIOivjeaAu+mikeeOh++8jOi2iuWkp+i2iuWlvVxuXHRcdFx0aWYgKGFzcy5hID49IHRvcC5hKSB0b3BzW2ldICs9IDE7XG5cdFx0XHQvLyDor43moIflh4blt67vvIzotorlsI/otorlpb1cblx0XHRcdGlmIChhc3MuYiA8PSB0b3AuYikgdG9wc1tpXSArPSAxO1xuXHRcdFx0Ly8g5pyq6K+G5Yir6K+N77yM6LaK5bCP6LaK5aW9XG5cdFx0XHR0b3BzW2ldICs9ICh0b3AuYyAtIGFzcy5jKTsvL2RlYnVnKHRvcHNbaV0pO1xuXHRcdFx0Ly8g56ym5ZCI6K+t5rOV57uT5p6E56iL5bqm77yM6LaK5aSn6LaK5aW9XG5cdFx0XHR0b3BzW2ldICs9IChhc3MuZCA8IDAgPyB0b3AuZCArIGFzcy5kIDogYXNzLmQgLSB0b3AuZCkgKiAxO1xuXG5cdFx0XHRhc3Muc2NvcmUgPSB0b3BzW2ldO1xuXG5cdFx0XHQvL2RlYnVnKHRvcHNbaV0pO2RlYnVnKCctLS0nKTtcblx0XHR9XG5cdFx0Ly9kZWJ1Zyh0b3BzLmpvaW4oJyAgJykpO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyh0b3BzKTtcblx0XHQvL2NvbnNvbGUubG9nKGFzc2Vzcyk7XG5cblx0XHQvL2NvbnN0IG9sZF9tZXRob2QgPSB0cnVlO1xuXHRcdGNvbnN0IG9sZF9tZXRob2QgPSBmYWxzZTtcblxuXHRcdC8vIOWPluWIhuaVsOacgOmrmOeahFxuXHRcdGxldCBjdXJyaSA9IDA7XG5cdFx0bGV0IG1heHMgPSB0b3BzWzBdO1xuXHRcdGZvciAobGV0IGkgaW4gdG9wcylcblx0XHR7XG5cdFx0XHRsZXQgcyA9IHRvcHNbaV07XG5cdFx0XHRpZiAocyA+IG1heHMpXG5cdFx0XHR7XG5cdFx0XHRcdGN1cnJpID0gaSBhcyBhbnkgYXMgbnVtYmVyO1xuXHRcdFx0XHRtYXhzID0gcztcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHMgPT09IG1heHMpXG5cdFx0XHR7XG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiDlpoLmnpzliIbmlbDnm7jlkIzvvIzliJnmoLnmja7or43plb/luqbjgIHmnKror4bliKvor43kuKrmlbDlkozlubPlnYfpopHnjofmnaXpgInmi6lcblx0XHRcdFx0ICpcblx0XHRcdFx0ICog5aaC5p6c5L6d54S25ZCM5YiG77yM5YmH5L+d5oyB5LiN6K6KXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHRsZXQgYSA9IDA7XG5cdFx0XHRcdGxldCBiID0gMDtcblx0XHRcdFx0aWYgKGFzc2Vzc1tpXS5jIDwgYXNzZXNzW2N1cnJpXS5jKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YSsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGFzc2Vzc1tpXS5jICE9PSBhc3Nlc3NbY3VycmldLmMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGFzc2Vzc1tpXS5hID4gYXNzZXNzW2N1cnJpXS5hKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YSsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGFzc2Vzc1tpXS5hICE9PSBhc3Nlc3NbY3VycmldLmEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGFzc2Vzc1tpXS54IDwgYXNzZXNzW2N1cnJpXS54KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YSsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGFzc2Vzc1tpXS54ICE9PSBhc3Nlc3NbY3VycmldLngpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGEgPiBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y3VycmkgPSBpIGFzIGFueSBhcyBudW1iZXI7XG5cdFx0XHRcdFx0bWF4cyA9IHM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vZGVidWcoeyBpLCBzLCBtYXhzLCBjdXJyaSB9KTtcblx0XHR9XG5cdFx0Ly9kZWJ1ZygnbWF4OiBpPScgKyBjdXJyaSArICcsIHM9JyArIHRvcHNbY3VycmldKTtcblxuXHRcdGFzc2VzcyA9IHVuZGVmaW5lZDtcblx0XHR0b3AgPSB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gY3Vycmk7XG5cdH1cblxuXHQvKipcblx0ICog5bCG5Y2V6K+N5oyJ54Wn5L2N572u5o6S5YiXXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG5cdCAqIEByZXR1cm4ge29iamVjdH1cblx0ICovXG5cdGdldFBvc0luZm8od29yZHM6IElXb3JkW10sIHRleHQ6IHN0cmluZyk6IHtcblx0XHRbaW5kZXg6IG51bWJlcl06IElXb3JkW107XG5cdH1cblx0e1xuXHRcdGxldCB3b3JkcG9zID0ge307XG5cdFx0Ly8g5bCG5Y2V6K+N5oyJ5L2N572u5YiG57uEXG5cdFx0Zm9yIChsZXQgaSA9IDAsIHdvcmQ7IHdvcmQgPSB3b3Jkc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICghd29yZHBvc1t3b3JkLmNdKVxuXHRcdFx0e1xuXHRcdFx0XHR3b3JkcG9zW3dvcmQuY10gPSBbXTtcblx0XHRcdH1cblx0XHRcdHdvcmRwb3Nbd29yZC5jXS5wdXNoKHdvcmQpO1xuXHRcdH1cblx0XHQvLyDmjInljZXlrZfliIblibLmlofmnKzvvIzloavooaXnqbrnvLrnmoTkvY3nva5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKCF3b3JkcG9zW2ldKVxuXHRcdFx0e1xuXHRcdFx0XHR3b3JkcG9zW2ldID0gW3sgdzogdGV4dC5jaGFyQXQoaSksIGM6IGksIGY6IDAgfV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdvcmRwb3M7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5omA5pyJ5YiG5pSvXG5cdCAqXG5cdCAqIEBwYXJhbSB7e1twOiBudW1iZXJdOiBTZWdtZW50LklXb3JkW119fSB3b3JkcG9zXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBwb3Mg5b2T5YmN5L2N572uXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IOacrOiKguimgeWIhuivjeeahOaWh+acrFxuXHQgKiBAcGFyYW0ge251bWJlcn0gdG90YWxfY291bnRcblx0ICogQHJldHVybnMge1NlZ21lbnQuSVdvcmRbXVtdfVxuXHQgKi9cblx0Z2V0Q2h1bmtzKHdvcmRwb3M6IHtcblx0XHRbaW5kZXg6IG51bWJlcl06IElXb3JkW107XG5cdH0sIHBvczogbnVtYmVyLCB0ZXh0Pzogc3RyaW5nLCB0b3RhbF9jb3VudCA9IDAsIE1BWF9DSFVOS19DT1VOVD86IG51bWJlcik6IElXb3JkW11bXVxuXHR7XG5cblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIOi/veWKoOaWsOaooeW8j+S9vyBNQVhfQ0hVTktfQ09VTlQg6YGe5rib5L6G6Ziy5q2i54Sh5YiG5q616ZW35q616JC955qE57i96JmV55CG5qyh5pW46YGO6auYIOeUsSBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4g5L6G6ZmQ5Yi25pyA5bCP5YC8XG5cdFx0ICovXG5cdFx0aWYgKHRvdGFsX2NvdW50ID09PSAwKVxuXHRcdHtcblx0XHRcdE1BWF9DSFVOS19DT1VOVCA9IHRoaXMuTUFYX0NIVU5LX0NPVU5UO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIOWPquacieeVtuebruWJjeaWh+Wtl+mVt+W6puWkp+aWvCBNQVhfQ0hVTktfQ09VTlQg5pmC5omN6YGe5ribXG5cdFx0XHQgKi9cblx0XHRcdGlmICh0ZXh0Lmxlbmd0aCA8IE1BWF9DSFVOS19DT1VOVClcblx0XHRcdHtcblx0XHRcdFx0TUFYX0NIVU5LX0NPVU5UICs9IDE7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYgKE1BWF9DSFVOS19DT1VOVCA8PSB0aGlzLk1BWF9DSFVOS19DT1VOVClcblx0XHR7XG5cdFx0XHRNQVhfQ0hVTktfQ09VTlQgPSBNYXRoLm1heChNQVhfQ0hVTktfQ09VTlQgLSAxLCB0aGlzLkRFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTiwgREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOKVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0Ly9NQVhfQ0hVTktfQ09VTlQgPSBNYXRoLm1heChNQVhfQ0hVTktfQ09VTlQsIHRoaXMuREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOLCBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4pXG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICog5b+955Wl6YCj5a2XXG5cdFx0ICpcblx0XHQgKiDkvovlpoI6IOWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWVilxuXHRcdCAqL1xuXHRcdGxldCBtOiBSZWdFeHBNYXRjaEFycmF5O1xuXHRcdGlmIChtID0gdGV4dC5tYXRjaCgvXigoLispXFwyezUsfSkvKSlcblx0XHR7XG5cdFx0XHRsZXQgczEgPSB0ZXh0LnNsaWNlKDAsIG1bMV0ubGVuZ3RoKTtcblx0XHRcdGxldCBzMiA9IHRleHQuc2xpY2UobVsxXS5sZW5ndGgpO1xuXG5cdFx0XHRsZXQgd29yZCA9IHtcblx0XHRcdFx0dzogczEsXG5cdFx0XHRcdGM6IHBvcyxcblx0XHRcdFx0ZjogMCxcblx0XHRcdH0gYXMgSVdvcmQ7XG5cblx0XHRcdGxldCBfcmV0OiBJV29yZFtdW10gPSBbXTtcblxuXHRcdFx0aWYgKHMyICE9PSAnJylcblx0XHRcdHtcblx0XHRcdFx0bGV0IGNodW5rcyA9IHRoaXMuZ2V0Q2h1bmtzKHdvcmRwb3MsIHBvcyArIHMxLmxlbmd0aCwgczIsIHRvdGFsX2NvdW50LCBNQVhfQ0hVTktfQ09VTlQpO1xuXG5cdFx0XHRcdGZvciAobGV0IHdzIG9mIGNodW5rcylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9yZXQucHVzaChbd29yZF0uY29uY2F0KHdzKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0X3JldC5wdXNoKFt3b3JkXSk7XG5cdFx0XHR9XG5cbi8vXHRcdFx0Y29uc29sZS5kaXIod29yZHBvcyk7XG4vL1xuLy9cdFx0XHRjb25zb2xlLmRpcihyZXQpO1xuLy9cbi8vXHRcdFx0Y29uc29sZS5kaXIoW3BvcywgdGV4dCwgdG90YWxfY291bnRdKTtcblxuXHRcdFx0cmV0dXJuIF9yZXQ7XG5cdFx0fVxuXG5cdFx0dG90YWxfY291bnQrKztcblxuXHRcdGxldCB3b3JkcyA9IHdvcmRwb3NbcG9zXSB8fCBbXTtcblxuXHRcdC8vZGVidWcodG90YWxfY291bnQsIE1BWF9DSFVOS19DT1VOVCk7XG5cbi8vXHRcdGRlYnVnKHtcbi8vXHRcdFx0dG90YWxfY291bnQsXG4vL1x0XHRcdE1BWF9DSFVOS19DT1VOVDogdGhpcy5NQVhfQ0hVTktfQ09VTlQsXG4vL1x0XHRcdHRleHQsXG4vL1x0XHRcdHdvcmRzLFxuLy9cdFx0fSk7XG5cblx0XHQvLyBkZWJ1ZygnZ2V0Q2h1bmtzOiAnKTtcblx0XHQvLyBkZWJ1Zyh3b3Jkcyk7XG5cdFx0Ly90aHJvdyBuZXcgRXJyb3IoKTtcblxuXHRcdGxldCByZXQ6IElXb3JkW11bXSA9IFtdO1xuXHRcdGZvciAobGV0IHdvcmQgb2Ygd29yZHMpXG5cdFx0e1xuXHRcdFx0Ly9kZWJ1Zyh3b3JkKTtcblx0XHRcdGxldCBuZXh0Y3VyID0gd29yZC5jICsgd29yZC53Lmxlbmd0aDtcblx0XHRcdC8qKlxuXHRcdFx0ICogQEZJWE1FXG5cdFx0XHQgKi9cblx0XHRcdGlmICghd29yZHBvc1tuZXh0Y3VyXSlcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2goW3dvcmRdKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHRvdGFsX2NvdW50ID4gTUFYX0NIVU5LX0NPVU5UKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBkbyBzb21ldGhpbmdcblxuLy9cdFx0XHRcdGNvbnNvbGUubG9nKDQ0NCwgd29yZHMuc2xpY2UoaSkpO1xuLy9cdFx0XHRcdGNvbnNvbGUubG9nKDMzMywgd29yZCk7XG5cblx0XHRcdFx0bGV0IHcxOiBJV29yZFtdID0gW3dvcmRdO1xuXG5cdFx0XHRcdGxldCBqID0gbmV4dGN1cjtcblx0XHRcdFx0d2hpbGUgKGogaW4gd29yZHBvcylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB3MiA9IHdvcmRwb3Nbal1bMF07XG5cblx0XHRcdFx0XHRpZiAodzIpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dzEucHVzaCh3Mik7XG5cblx0XHRcdFx0XHRcdGogKz0gdzIudy5sZW5ndGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXQucHVzaCh3MSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0ID0gdGV4dC5zbGljZSh3b3JkLncubGVuZ3RoKTtcblxuXHRcdFx0XHRsZXQgY2h1bmtzID0gdGhpcy5nZXRDaHVua3Mod29yZHBvcywgbmV4dGN1ciwgdCwgdG90YWxfY291bnQsIE1BWF9DSFVOS19DT1VOVCApO1xuXHRcdFx0XHRmb3IgKGxldCB3cyBvZiBjaHVua3MpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaChbd29yZF0uY29uY2F0KHdzKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjaHVua3MgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHdvcmRzID0gdW5kZWZpbmVkO1xuXHRcdHdvcmRwb3MgPSB1bmRlZmluZWQ7XG5cdFx0bSA9IHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBEaWN0VG9rZW5pemVyXG57XG5cdC8qKlxuXHQgKiDkvb/nlKjnsbvkvLzkuo5NTVNH55qE5YiG6K+N566X5rOVXG5cdCAqIOaJvuWHuuaJgOacieWIhuivjeWPr+iDve+8jOS4u+imgeagueaNruS4gOS4i+WHoOmhueadpeivhOS7t++8mlxuXHQgKlxuXHQgKiB444CB6K+N5pWw6YeP5pyA5bCR77ybXG5cdCAqIGHjgIHor43lubPlnYfpopHnjofmnIDlpKfvvJtcblx0ICogYuOAgeavj+S4quivjemVv+W6puagh+WHhuW3ruacgOWwj++8m1xuXHQgKiBj44CB5pyq6K+G5Yir6K+N5pyA5bCR77ybXG5cdCAqIGTjgIHnrKblkIjor63ms5Xnu5PmnoTpobnvvJrlpoLkuKTkuKrov57nu63nmoTliqjor43lh4/liIbvvIzmlbDor43lkI7pnaLot5/ph4/or43liqDliIbvvJtcblx0ICpcblx0ICog5Y+W5Lul5LiK5Yeg6aG557u85ZCI5o6S5ZCN5pyA5pyA5aW955qEXG5cdCAqL1xuXHRleHBvcnQgdHlwZSBJQXNzZXNzUm93ID0ge1xuXHRcdC8qKlxuXHRcdCAqIOivjeaVsOmHj++8jOi2iuWwj+i2iuWlvVxuXHRcdCAqL1xuXHRcdHg6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDor43mgLvpopHnjofvvIzotorlpKfotorlpb1cblx0XHQgKi9cblx0XHRhOiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICog6K+N5qCH5YeG5beu77yM6LaK5bCP6LaK5aW9XG5cdFx0ICog5q+P5Liq6K+N6ZW/5bqm5qCH5YeG5beu5pyA5bCPXG5cdFx0ICovXG5cdFx0YjogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIOacquivhuWIq+ivje+8jOi2iuWwj+i2iuWlvVxuXHRcdCAqL1xuXHRcdGM6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDnrKblkIjor63ms5Xnu5PmnoTnqIvluqbvvIzotorlpKfotorlpb1cblx0XHQgKiDnrKblkIjor63ms5Xnu5PmnoTpobnvvJrlpoLkuKTkuKrov57nu63nmoTliqjor43lh4/liIbvvIzmlbDor43lkI7pnaLot5/ph4/or43liqDliIZcblx0XHQgKi9cblx0XHRkOiBudW1iZXIsXG5cblx0XHQvKipcblx0XHQgKiDntZDnrpfoqZXliIYo6Ieq5YuV6KiI566XKVxuXHRcdCAqL1xuXHRcdHNjb3JlPzogbnVtYmVyLFxuXHRcdHJlYWRvbmx5IGluZGV4PzogbnVtYmVyLFxuXHR9O1xufVxuXG5leHBvcnQgaW1wb3J0IElBc3Nlc3NSb3cgPSBEaWN0VG9rZW5pemVyLklBc3Nlc3NSb3c7XG5cbmV4cG9ydCBjb25zdCBpbml0ID0gRGljdFRva2VuaXplci5pbml0LmJpbmQoRGljdFRva2VuaXplcikgYXMgSVN1YlRva2VuaXplckNyZWF0ZTxEaWN0VG9rZW5pemVyPjtcblxuZXhwb3J0IGRlZmF1bHQgRGljdFRva2VuaXplcjtcbiJdfQ==