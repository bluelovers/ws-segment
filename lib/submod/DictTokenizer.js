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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGljdFRva2VuaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRpY3RUb2tlbml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLGdDQUE4RTtBQUk5RSx5Q0FBaUQ7QUFDakQsZ0RBQXNIO0FBR3RILHdDQUF3QztBQUczQixRQUFBLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztBQUM3QixRQUFBLDJCQUEyQixHQUFHLEVBQUUsQ0FBQztBQUU5Qzs7OztHQUlHO0FBQ0gsTUFBYSxhQUFjLFNBQVEseUJBQW1CO0lBQXREOztRQUdDOzs7Ozs7Ozs7V0FTRztRQUNILG9CQUFlLEdBQUcsK0JBQXVCLENBQUM7UUFDMUM7OztXQUdHO1FBQ0gsZ0NBQTJCLEdBQUcsbUNBQTJCLENBQUM7SUE4ekIzRCxDQUFDO0lBenpCQSxNQUFNO1FBRUwsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFbkMsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLG1DQUEyQixFQUM3SDtZQUNDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1NBQzFEO1FBRUQsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8s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QUMsRUFBRSxDQUFDLENBQUM7d0JBRVosQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO3FCQUNqQjt5QkFFRDt3QkFDQyxNQUFNO3FCQUNOO2lCQUNEO2dCQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDYjtpQkFFRDtnQkFDQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWxDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLGVBQWUsQ0FBRSxDQUFDO2dCQUNoRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFDdEM7b0JBQ0MsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNuQztnQkFFRCxNQUFNLEdBQUcsSUFBSSxDQUFDO2FBQ2Q7U0FDRDtRQUVELEtBQUssR0FBRyxTQUFTLENBQUM7UUFDbEIsT0FBTyxHQUFHLFNBQVMsQ0FBQztRQUNwQixDQUFDLEdBQUcsU0FBUyxDQUFDO1FBRWQsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0NBQ0Q7QUFoMUJELHNDQWcxQkM7QUFrRFksUUFBQSxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUF1QyxDQUFDO0FBRWpHLGtCQUFlLGFBQWEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgU3ViU01vZHVsZSwgU3ViU01vZHVsZVRva2VuaXplciwgSVN1YlRva2VuaXplckNyZWF0ZSB9IGZyb20gJy4uL21vZCc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBVU3RyaW5nIH0gZnJvbSAndW5pLXN0cmluZyc7XG5pbXBvcnQgeyBJVGFibGVEaWN0Um93IH0gZnJvbSAnLi4vdGFibGUvZGljdCc7XG5pbXBvcnQgeyBoZXhBbmRBbnksIHRvSGV4IH0gZnJvbSAnLi4vdXRpbC9pbmRleCc7XG5pbXBvcnQgQ0hTX05BTUVTLCB7IEZBTUlMWV9OQU1FXzEsIEZBTUlMWV9OQU1FXzIsIFNJTkdMRV9OQU1FLCBET1VCTEVfTkFNRV8xLCBET1VCTEVfTkFNRV8yIH0gZnJvbSAnLi4vbW9kL0NIU19OQU1FUyc7XG5pbXBvcnQgU2VnbWVudCwgeyBJRElDVCwgSVdvcmQsIElESUNUMiB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0IHsgZGVidWcgfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7IERBVEVUSU1FIH0gZnJvbSAnLi4vbW9kL2NvbnN0JztcbmltcG9ydCBJUE9TVEFHIGZyb20gJy4uL1BPU1RBRyc7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX01BWF9DSFVOS19DT1VOVCA9IDQwO1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTiA9IDMwO1xuXG4vKipcbiAqIOWtl+WFuOivhuWIq+aooeWdl1xuICpcbiAqIEBhdXRob3Ig6ICB6Zu3PGxlaXpvbmdtaW5AZ21haWwuY29tPlxuICovXG5leHBvcnQgY2xhc3MgRGljdFRva2VuaXplciBleHRlbmRzIFN1YlNNb2R1bGVUb2tlbml6ZXJcbntcblxuXHQvKipcblx0ICog6Ziy5q2i5Zug54Sh5YiG5q615bCO6Ie05YiG5p6Q6YGO5LmF55Sa6Iez6LaF6YGO6JmV55CG6LKg6I23XG5cdCAqIOi2iumrmOi2iueyvua6luS9huaYr+iZleeQhuaZgumWk+acg+WKoOWAjeaIkOmVt+eUmuiHs+i2hemBjuiomOaGtumrlOiDveiZleeQhueahOeoi+W6plxuXHQgKlxuXHQgKiDmlbjlrZfotorlsI/otorlv6tcblx0ICpcblx0ICogRkFUQUwgRVJST1I6IENBTExfQU5EX1JFVFJZX0xBU1QgQWxsb2NhdGlvbiBmYWlsZWQgLSBKYXZhU2NyaXB0IGhlYXAgb3V0IG9mIG1lbW9yeVxuXHQgKlxuXHQgKiBAdHlwZSB7bnVtYmVyfVxuXHQgKi9cblx0TUFYX0NIVU5LX0NPVU5UID0gREVGQVVMVF9NQVhfQ0hVTktfQ09VTlQ7XG5cdC8qKlxuXHQgKlxuXHQgKiDov73liqDmlrDmqKHlvI/kvb8gTUFYX0NIVU5LX0NPVU5UIOmBnua4m+S+humYsuatoueEoeWIhuautemVt+auteiQveeahOe4veiZleeQhuasoeaVuOmBjumrmCDnlLEgREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOIOS+humZkOWItuacgOWwj+WAvFxuXHQgKi9cblx0REVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOID0gREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOO1xuXG5cdHByb3RlY3RlZCBfVEFCTEU6IElESUNUPElXb3JkPjtcblx0cHJvdGVjdGVkIF9UQUJMRTI6IElESUNUMjxJV29yZD47XG5cblx0X2NhY2hlKClcblx0e1xuXHRcdHN1cGVyLl9jYWNoZSgpO1xuXHRcdHRoaXMuX1RBQkxFID0gdGhpcy5zZWdtZW50LmdldERpY3QoJ1RBQkxFJyk7XG5cdFx0dGhpcy5fVEFCTEUyID0gdGhpcy5zZWdtZW50LmdldERpY3QoJ1RBQkxFMicpO1xuXHRcdHRoaXMuX1BPU1RBRyA9IHRoaXMuc2VnbWVudC5QT1NUQUc7XG5cblx0XHRpZiAodHlwZW9mIHRoaXMuc2VnbWVudC5vcHRpb25zLm1heENodW5rQ291bnQgPT0gJ251bWJlcicgJiYgdGhpcy5zZWdtZW50Lm9wdGlvbnMubWF4Q2h1bmtDb3VudCA+IERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTilcblx0XHR7XG5cdFx0XHR0aGlzLk1BWF9DSFVOS19DT1VOVCA9IHRoaXMuc2VnbWVudC5vcHRpb25zLm1heENodW5rQ291bnQ7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiB0aGlzLnNlZ21lbnQub3B0aW9ucy5taW5DaHVua0NvdW50ID09ICdudW1iZXInICYmIHRoaXMuc2VnbWVudC5vcHRpb25zLm1pbkNodW5rQ291bnQgPiBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4pXG5cdFx0e1xuXHRcdFx0dGhpcy5ERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4gPSB0aGlzLnNlZ21lbnQub3B0aW9ucy5taW5DaHVua0NvdW50O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiDlr7nmnKror4bliKvnmoTljZXor43ov5vooYzliIbor41cblx0ICpcblx0ICogQHBhcmFtIHthcnJheX0gd29yZHMg5Y2V6K+N5pWw57uEXG5cdCAqIEByZXR1cm4ge2FycmF5fVxuXHQgKi9cblx0c3BsaXQod29yZHM6IElXb3JkW10pOiBJV29yZFtdXG5cdHtcblx0XHQvL2RlYnVnKHdvcmRzKTtcblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuX1RBQkxFO1xuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuX1BPU1RBRztcblxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOyB3b3JkID0gd29yZHNbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAod29yZC5wID4gMClcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2god29yZCk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyDku4Xlr7nmnKror4bliKvnmoTor43ov5vooYzljLnphY1cblx0XHRcdGxldCB3b3JkaW5mbyA9IHRoaXMubWF0Y2hXb3JkKHdvcmQudywgMCwgd29yZHNbaSAtIDFdKTtcblx0XHRcdGlmICh3b3JkaW5mby5sZW5ndGggPCAxKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIOWIhuemu+WHuuW3suivhuWIq+eahOWNleivjVxuXHRcdFx0bGV0IGxhc3RjID0gMDtcblxuXHRcdFx0d29yZGluZm8uZm9yRWFjaChmdW5jdGlvbiAoYncsIHVpKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoYncuYyA+IGxhc3RjKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdFx0dzogd29yZC53LnN1YnN0cihsYXN0YywgYncuYyAtIGxhc3RjKSxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBjdyA9IHNlbGYuY3JlYXRlUmF3VG9rZW4oe1xuXHRcdFx0XHRcdHc6IGJ3LncsXG5cdFx0XHRcdFx0ZjogYncuZixcblx0XHRcdFx0fSwgVEFCTEVbYncud10pO1xuXG5cdFx0XHRcdHJldC5wdXNoKGN3KTtcblxuXHRcdFx0XHQvKlxuXHRcdFx0XHRyZXQucHVzaCh7XG5cdFx0XHRcdFx0dzogYncudyxcblx0XHRcdFx0XHRwOiB3dy5wLFxuXHRcdFx0XHRcdGY6IGJ3LmYsXG5cdFx0XHRcdFx0czogd3cucyxcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCovXG5cdFx0XHRcdGxhc3RjID0gYncuYyArIGJ3LncubGVuZ3RoO1xuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBsYXN0d29yZCA9IHdvcmRpbmZvW3dvcmRpbmZvLmxlbmd0aCAtIDFdO1xuXHRcdFx0aWYgKGxhc3R3b3JkLmMgKyBsYXN0d29yZC53Lmxlbmd0aCA8IHdvcmQudy5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBjdyA9IHNlbGYuY3JlYXRlUmF3VG9rZW4oe1xuXHRcdFx0XHRcdHc6IHdvcmQudy5zdWJzdHIobGFzdHdvcmQuYyArIGxhc3R3b3JkLncubGVuZ3RoKSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0LnB1c2goY3cpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHdvcmRzID0gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cblx0LyoqXG5cdCAqIOWMuemFjeWNleivje+8jOi/lOWbnuebuOWFs+S/oeaBr1xuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmlofmnKxcblx0ICogQHBhcmFtIHtpbnR9IGN1ciDlvIDlp4vkvY3nva5cblx0ICogQHBhcmFtIHtvYmplY3R9IHByZXdvcmQg5LiK5LiA5Liq5Y2V6K+NXG5cdCAqIEByZXR1cm4ge2FycmF5fSAg6L+U5Zue5qC85byPICAge3c6ICfljZXor40nLCBjOiDlvIDlp4vkvY3nva59XG5cdCAqL1xuXHRwcm90ZWN0ZWQgbWF0Y2hXb3JkKHRleHQ6IHN0cmluZywgY3VyOiBudW1iZXIsIHByZXdvcmQ6IElXb3JkKVxuXHR7XG5cdFx0aWYgKGlzTmFOKGN1cikpIGN1ciA9IDA7XG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xuXHRcdGxldCBzID0gZmFsc2U7XG5cblx0XHRjb25zdCBUQUJMRTIgPSB0aGlzLl9UQUJMRTI7XG5cblx0XHQvLyDljLnphY3lj6/og73lh7rnjrDnmoTljZXor41cblx0XHR3aGlsZSAoY3VyIDwgdGV4dC5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Zm9yIChsZXQgaSBpbiBUQUJMRTIpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB3ID0gdGV4dC5zdWJzdHIoY3VyLCBpIGFzIGFueSBhcyBudW1iZXIpO1xuXHRcdFx0XHRpZiAodyBpbiBUQUJMRTJbaV0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaCh7XG5cdFx0XHRcdFx0XHR3OiB3LFxuXHRcdFx0XHRcdFx0YzogY3VyLFxuXHRcdFx0XHRcdFx0ZjogVEFCTEUyW2ldW3ddLmYsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGN1cisrO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmZpbHRlcldvcmQocmV0LCBwcmV3b3JkLCB0ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiDpgInmi6nmnIDmnInlj6/og73ljLnphY3nmoTljZXor41cblx0ICpcblx0ICogQHBhcmFtIHthcnJheX0gd29yZHMg5Y2V6K+N5L+h5oGv5pWw57uEXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwcmV3b3JkIOS4iuS4gOS4quWNleivjVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmnKzoioLopoHliIbor43nmoTmlofmnKxcblx0ICogQHJldHVybiB7YXJyYXl9XG5cdCAqL1xuXHRwcm90ZWN0ZWQgZmlsdGVyV29yZCh3b3JkczogSVdvcmRbXSwgcHJld29yZDogSVdvcmQsIHRleHQ6IHN0cmluZylcblx0e1xuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5fVEFCTEU7XG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5fUE9TVEFHO1xuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblxuXHRcdC8vIOWwhuWNleivjeaMieS9jee9ruWIhue7hFxuXHRcdGxldCB3b3JkcG9zID0gdGhpcy5nZXRQb3NJbmZvKHdvcmRzLCB0ZXh0KTtcblx0XHQvL2RlYnVnKHdvcmRwb3MpO1xuXG5cdFx0LyoqXG5cdFx0ICog5L2/55So57G75Ly85LqOTU1TR+eahOWIhuivjeeul+azlVxuXHRcdCAqIOaJvuWHuuaJgOacieWIhuivjeWPr+iDve+8jOS4u+imgeagueaNruS4gOS4i+WHoOmhueadpeivhOS7t++8mlxuXHRcdCAqIHjjgIHor43mlbDph4/mnIDlsJHvvJtcblx0XHQgKiBh44CB6K+N5bmz5Z2H6aKR546H5pyA5aSn77ybXG5cdFx0ICogYuOAgeavj+S4quivjemVv+W6puagh+WHhuW3ruacgOWwj++8m1xuXHRcdCAqIGPjgIHmnKror4bliKvor43mnIDlsJHvvJtcblx0XHQgKiBk44CB56ym5ZCI6K+t5rOV57uT5p6E6aG577ya5aaC5Lik5Liq6L+e57ut55qE5Yqo6K+N5YeP5YiG77yM5pWw6K+N5ZCO6Z2i6Lef6YeP6K+N5Yqg5YiG77ybXG5cdFx0ICog5Y+W5Lul5LiK5Yeg6aG557u85ZCI5o6S5ZCN5pyA5pyA5aW955qEXG5cdFx0ICovXG5cdFx0bGV0IGNodW5rcyA9IHRoaXMuZ2V0Q2h1bmtzKHdvcmRwb3MsIDAsIHRleHQpO1xuXHRcdC8vZGVidWcoY2h1bmtzKTtcblx0XHRsZXQgYXNzZXNzOiBBcnJheTxJQXNzZXNzUm93PiA9IFtdOyAgLy8g6K+E5Lu36KGoXG5cblx0XHQvL2NvbnNvbGUubG9nKGNodW5rcyk7XG5cblx0XHQvLyDlr7nlkITkuKrliIbmlK/lsLHooYzor4TkvLBcblx0XHRmb3IgKGxldCBpID0gMCwgY2h1bms6IElXb3JkW107IGNodW5rID0gY2h1bmtzW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0YXNzZXNzW2ldID0ge1xuXHRcdFx0XHR4OiBjaHVuay5sZW5ndGgsXG5cdFx0XHRcdGE6IDAsXG5cdFx0XHRcdGI6IDAsXG5cdFx0XHRcdGM6IDAsXG5cdFx0XHRcdGQ6IDAsXG5cblx0XHRcdFx0aW5kZXg6IGksXG5cdFx0XHR9O1xuXHRcdFx0Ly8g6K+N5bmz5Z2H6ZW/5bqmXG5cdFx0XHRsZXQgc3AgPSB0ZXh0Lmxlbmd0aCAvIGNodW5rLmxlbmd0aDtcblx0XHRcdC8vIOWPpeWtkOe7j+W4uOWMheWQq+eahOivreazlee7k+aehFxuXHRcdFx0bGV0IGhhc19EX1YgPSBmYWxzZTsgIC8vIOaYr+WQpuWMheWQq+WKqOivjVxuXG5cdFx0XHQvLyDpgY3ljoblkITkuKror41cblx0XHRcdGxldCBwcmV3OiBJV29yZDtcblxuXHRcdFx0aWYgKHByZXdvcmQpXG5cdFx0XHR7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdHByZXcgPSB7XG5cdFx0XHRcdFx0dzogcHJld29yZC53LFxuXHRcdFx0XHRcdHA6IHByZXdvcmQucCxcblx0XHRcdFx0XHRmOiBwcmV3b3JkLmYsXG5cdFx0XHRcdFx0czogcHJld29yZC5zLFxuXHRcdFx0XHR9XG5cdFx0XHRcdCovXG5cblx0XHRcdFx0cHJldyA9IHRoaXMuY3JlYXRlUmF3VG9rZW4ocHJld29yZCk7XG5cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0cHJldyA9IG51bGw7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGxldCBqID0gMCwgdzogSVdvcmQ7IHcgPSBjaHVua1tqXTsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAody53IGluIFRBQkxFKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dy5wID0gVEFCTEVbdy53XS5wO1xuXHRcdFx0XHRcdGFzc2Vzc1tpXS5hICs9IHcuZjsgICAvLyDmgLvor43popFcblxuXHRcdFx0XHRcdGlmIChqID09IDAgJiYgIXByZXdvcmQgJiYgKHcucCAmIFBPU1RBRy5EX1YpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0ICog5bCH56ys5LiA5YCL5a2X5Lmf6KiI566X6YCy5Y675piv5ZCm5YyF5ZCr5YuV6KmeXG5cdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdGhhc19EX1YgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vID09PT09PT09PT09PT09PT0g5qOA5p+l6K+t5rOV57uT5p6EID09PT09PT09PT09PT09PT09PT1cblx0XHRcdFx0XHRpZiAocHJldylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzkuIrkuIDkuKror43mmK/mlbDor43kuJTlvZPliY3or43mmK/ph4/or43vvIjljZXkvY3vvInvvIzliJnliqDliIZcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0KHByZXcucCAmIFBPU1RBRy5BX00pXG5cdFx0XHRcdFx0XHRcdCYmXG5cdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHQoKHcucCAmIFBPU1RBRy5BX1EpKVxuXHRcdFx0XHRcdFx0XHRcdHx8IHcudyBpbiBEQVRFVElNRVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIOWmguaenOW9k+WJjeivjeaYr+WKqOivjVxuXHRcdFx0XHRcdFx0aWYgKCh3LnAgJiBQT1NUQUcuRF9WKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aGFzX0RfViA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdC8vIOWmguaenOaYr+i/nue7reeahOS4pOS4quWKqOivje+8jOWImeWHj+WIhlxuXHRcdFx0XHRcdFx0XHQvL2lmICgocHJldy5wICYgUE9TVEFHLkRfVikgPiAwKVxuXHRcdFx0XHRcdFx0XHQvL2Fzc2Vzc1tpXS5kLS07XG5cblx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0Ly8g5aaC5p6c5pivIOW9ouWuueivjSArIOWKqOivje+8jOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0XHRpZiAoKHByZXcucCAmIFBPU1RBRy5EX0EpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDlia/or40gKyDliqjor43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdFx0aWYgKHByZXcucCAmIFBPU1RBRy5EX0QpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK/lnLDljLrlkI3jgIHmnLrmnoTlkI3miJblvaLlrrnor43vvIzlkI7pnaLot5/lnLDljLrjgIHmnLrmnoTjgIHku6Por43jgIHlkI3or43nrYnvvIzliJnliqDliIZcblx0XHRcdFx0XHRcdGlmICgoXG5cdFx0XHRcdFx0XHRcdFx0KHByZXcucCAmIFBPU1RBRy5BX05TKVxuXHRcdFx0XHRcdFx0XHRcdHx8IChwcmV3LnAgJiBQT1NUQUcuQV9OVClcblx0XHRcdFx0XHRcdFx0XHR8fCAocHJldy5wICYgUE9TVEFHLkRfQSlcblx0XHRcdFx0XHRcdFx0KSAmJlxuXHRcdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdFx0KHcucCAmIFBPU1RBRy5EX04pXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05SKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OUylcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkFfTlopXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05UKVxuXHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5pivIOaWueS9jeivjSArIOaVsOmHj+ivje+8jOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHQocHJldy5wICYgUE9TVEFHLkRfRilcblx0XHRcdFx0XHRcdFx0JiZcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdCh3LnAgJiBQT1NUQUcuQV9NKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuRF9NUSlcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9kZWJ1ZyhwcmV3LCB3KTtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDlp5MgKyDlkI3or43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdHByZXcudyBpbiBGQU1JTFlfTkFNRV8xXG5cdFx0XHRcdFx0XHRcdFx0fHwgcHJldy53IGluIEZBTUlMWV9OQU1FXzJcblx0XHRcdFx0XHRcdFx0KSAmJlxuXHRcdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdFx0KHcucCAmIFBPU1RBRy5EX04pXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05aKVxuXHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvL2RlYnVnKHByZXcsIHcpO1xuXHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdCAqIOWcsOWQjS/lpITmiYAgKyDmlrnkvY1cblx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0aWYgKGhleEFuZEFueShwcmV3LnBcblx0XHRcdFx0XHRcdFx0LCBQT1NUQUcuRF9TXG5cdFx0XHRcdFx0XHRcdCwgUE9TVEFHLkFfTlMsXG5cdFx0XHRcdFx0XHQpICYmIGhleEFuZEFueSh3LnBcblx0XHRcdFx0XHRcdFx0LCBQT1NUQUcuRF9GLFxuXHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC41O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyDmjqLmtYvkuIvkuIDkuKror41cblx0XHRcdFx0XHRcdGxldCBuZXh0dyA9IGNodW5rW2ogKyAxXTtcblx0XHRcdFx0XHRcdGlmIChuZXh0dylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKG5leHR3LncgaW4gVEFCTEUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRuZXh0dy5wID0gVEFCTEVbbmV4dHcud10ucDtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBfdGVtcF9vazogYm9vbGVhbiA9IHRydWU7XG5cblx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdCAqIOWmguaenOW9k+WJjeaYr+KAnOeahOKAnSsg5ZCN6K+N77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0KHcudyA9PSAn55qEJyB8fCB3LncgPT0gJ+S5iycpXG5cdFx0XHRcdFx0XHRcdFx0JiYgbmV4dHcucCAmJiAoXG5cdFx0XHRcdFx0XHRcdFx0XHQobmV4dHcucCAmIFBPU1RBRy5EX04pXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCAobmV4dHcucCAmIFBPU1RBRy5EX1YpXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCAobmV4dHcucCAmIFBPU1RBRy5BX05SKVxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OUylcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkFfTlopXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCAobmV4dHcucCAmIFBPU1RBRy5BX05UKVxuXHRcdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAxLjU7XG5cdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0ICog5aaC5p6c5piv6L+e6K+N77yM5YmN5ZCO5Lik5Liq6K+N6K+N5oCn55u45ZCM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRlbHNlIGlmIChwcmV3LnAgJiYgKHcucCAmIFBPU1RBRy5EX0MpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IHAgPSBwcmV3LnAgJiBuZXh0dy5wO1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHByZXcucCA9PT0gbmV4dHcucClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAocClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAwLjI1O1xuXHRcdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHAgJiBQT1NUQUcuRF9OKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAwLjc1O1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChfdGVtcF9vayAmJiBuZXh0dy5wICYmICh3LnAgJiBQT1NUQUcuRF9QKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGlmIChuZXh0dy5wICYgUE9TVEFHLkFfTlIgJiYgKFxuXHRcdFx0XHRcdFx0XHRcdFx0bmV4dHcudy5sZW5ndGggPiAxXG5cdFx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocHJldy53ID09ICfnmoQnKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0XHRcdFx0ICog55qEICsg5LuL6KmeICsg5Lq65ZCNXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAxO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRfdGVtcF9vayA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChfdGVtcF9vayAmJiAody5wICYgUE9TVEFHLkRfUCkgJiYgaGV4QW5kQW55KHByZXcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9OLFxuXHRcdFx0XHRcdFx0XHQpICYmIGhleEFuZEFueShuZXh0dy5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX04sXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfVixcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlIGlmIChfdGVtcF9vayAmJiAody5wICYgUE9TVEFHLkRfUCkgJiYgaGV4QW5kQW55KHByZXcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9SLFxuXHRcdFx0XHRcdFx0XHQpICYmIGhleEFuZEFueShuZXh0dy5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX1IsXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAwLjU7XG5cdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdC8vIEBGSVhNRSDmmrTlipvop6Pmsbog5LiJ5aSp5ZCOIOeahOWVj+mhjFxuXHRcdFx0XHRcdFx0XHRpZiAobmV4dHcudyA9PSAn5ZCOJyAmJiB3LnAgJiBQT1NUQUcuRF9UICYmIGhleEFuZEFueShwcmV3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfTVEsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkFfTSxcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Ly8gQEZJWE1FIOWIsOa5luS4remWk+WQjuaJi+e1guaWvOiDveS8keaBr+S6hlxuXHRcdFx0XHRcdFx0XHRlbHNlIGlmIChcblx0XHRcdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdFx0XHRuZXh0dy53ID09ICflkI4nXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCBuZXh0dy53ID09ICflvownXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdCYmIGhleEFuZEFueSh3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfRixcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdFx0dy53ID09ICflkI4nXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCB3LncgPT0gJ+W+jCdcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0JiYgaGV4QW5kQW55KHByZXcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9GLFxuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHQmJiBoZXhBbmRBbnkobmV4dHcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9OLFxuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgX3RlbXBfb2s6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0XHQgKiDlpbnmiorojbfljIXom4vmkYblnKjlg4/mmK/ljbDluqbng6TppbznmoTpnaLljIXkuIpcblx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdGlmIChfdGVtcF9vayAmJiAody5wICYgUE9TVEFHLkRfRikgJiYgaGV4QW5kQW55KHByZXcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9OLFxuXHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMTtcblx0XHRcdFx0XHRcdFx0XHRfdGVtcF9vayA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyDmnKror4bliKvnmoTor43mlbDph49cblx0XHRcdFx0XHRhc3Nlc3NbaV0uYysrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIOagh+WHhuW3rlxuXHRcdFx0XHRhc3Nlc3NbaV0uYiArPSBNYXRoLnBvdyhzcCAtIHcudy5sZW5ndGgsIDIpO1xuXHRcdFx0XHRwcmV3ID0gY2h1bmtbal07XG5cdFx0XHR9XG5cblx0XHRcdC8vIOWmguaenOWPpeWtkOS4reWMheWQq+S6huiHs+WwkeS4gOS4quWKqOivjVxuXHRcdFx0aWYgKGhhc19EX1YgPT09IGZhbHNlKSBhc3Nlc3NbaV0uZCAtPSAwLjU7XG5cblx0XHRcdGFzc2Vzc1tpXS5hID0gYXNzZXNzW2ldLmEgLyBjaHVuay5sZW5ndGg7XG5cdFx0XHRhc3Nlc3NbaV0uYiA9IGFzc2Vzc1tpXS5iIC8gY2h1bmsubGVuZ3RoO1xuXHRcdH1cblxuXHRcdC8vY29uc29sZS5kaXIoYXNzZXNzKTtcblxuXHRcdC8vIOiuoeeul+aOkuWQjVxuXHRcdGxldCB0b3AgPSB0aGlzLmdldFRvcHMoYXNzZXNzKTtcblx0XHRsZXQgY3VycmNodW5rID0gY2h1bmtzW3RvcF07XG5cblx0XHRpZiAoZmFsc2UpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhhc3Nlc3MpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhPYmplY3QuZW50cmllcyhjaHVua3MpKTtcblx0XHRcdGNvbnNvbGUuZGlyKE9iamVjdC5lbnRyaWVzKGNodW5rcylcblx0XHRcdFx0Lm1hcCgoW2ksIGNodW5rXSkgPT4geyByZXR1cm4geyBpLCBhc3NlczogYXNzZXNzW2kgYXMgdW5rbm93biBhcyBudW1iZXJdLCBjaHVuayB9IH0pLCB7IGRlcHRoOiA1IH0pO1xuXHRcdFx0Y29uc29sZS5kaXIoeyBpOiB0b3AsIGFzc2VzOiBhc3Nlc3NbdG9wXSwgY3VycmNodW5rIH0pO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyh0b3ApO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhjdXJyY2h1bmspO1xuXHRcdH1cblxuXHRcdC8vIOWJlOmZpOS4jeiDveivhuWIq+eahOivjVxuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOiBJV29yZDsgd29yZCA9IGN1cnJjaHVua1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICghKHdvcmQudyBpbiBUQUJMRSkpXG5cdFx0XHR7XG5cdFx0XHRcdGN1cnJjaHVuay5zcGxpY2UoaS0tLCAxKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0ID0gY3VycmNodW5rO1xuXG5cdFx0Ly8g6Kmm5ZyW5Li75YuV5riF6Zmk6KiY5oa26auUXG5cdFx0YXNzZXNzID0gdW5kZWZpbmVkO1xuXHRcdGNodW5rcyA9IHVuZGVmaW5lZDtcblx0XHRjdXJyY2h1bmsgPSB1bmRlZmluZWQ7XG5cdFx0dG9wID0gdW5kZWZpbmVkO1xuXHRcdHdvcmRwb3MgPSB1bmRlZmluZWQ7XG5cblx0XHQvL2RlYnVnKHJldCk7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiDor4Tku7fmjpLlkI1cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IGFzc2Vzc1xuXHQgKiBAcmV0dXJuIHtvYmplY3R9XG5cdCAqL1xuXHRnZXRUb3BzKGFzc2VzczogQXJyYXk8SUFzc2Vzc1Jvdz4pXG5cdHtcblx0XHQvL2RlYnVnKGFzc2Vzcyk7XG5cdFx0Ly8g5Y+W5ZCE6aG55pyA5aSn5YC8XG5cdFx0bGV0IHRvcDogSUFzc2Vzc1JvdyA9IHtcblx0XHRcdHg6IGFzc2Vzc1swXS54LFxuXHRcdFx0YTogYXNzZXNzWzBdLmEsXG5cdFx0XHRiOiBhc3Nlc3NbMF0uYixcblx0XHRcdGM6IGFzc2Vzc1swXS5jLFxuXHRcdFx0ZDogYXNzZXNzWzBdLmQsXG5cdFx0fTtcblxuXHRcdGZvciAobGV0IGkgPSAxLCBhc3M6IElBc3Nlc3NSb3c7IGFzcyA9IGFzc2Vzc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGlmIChhc3MuYSA+IHRvcC5hKSB0b3AuYSA9IGFzcy5hOyAgLy8g5Y+W5pyA5aSn5bmz5Z2H6K+N6aKRXG5cdFx0XHRpZiAoYXNzLmIgPCB0b3AuYikgdG9wLmIgPSBhc3MuYjsgIC8vIOWPluacgOWwj+agh+WHhuW3rlxuXHRcdFx0aWYgKGFzcy5jID4gdG9wLmMpIHRvcC5jID0gYXNzLmM7ICAvLyDlj5bmnIDlpKfmnKror4bliKvor41cblx0XHRcdGlmIChhc3MuZCA8IHRvcC5kKSB0b3AuZCA9IGFzcy5kOyAgLy8g5Y+W5pyA5bCP6K+t5rOV5YiG5pWwXG5cdFx0XHRpZiAoYXNzLnggPiB0b3AueCkgdG9wLnggPSBhc3MueDsgIC8vIOWPluacgOWkp+WNleivjeaVsOmHj1xuXHRcdH1cblx0XHQvL2RlYnVnKHRvcCk7XG5cblx0XHQvLyDor4TkvLDmjpLlkI1cblx0XHRsZXQgdG9wczogbnVtYmVyW10gPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMCwgYXNzOiBJQXNzZXNzUm93OyBhc3MgPSBhc3Nlc3NbaV07IGkrKylcblx0XHR7XG5cdFx0XHR0b3BzW2ldID0gMDtcblx0XHRcdC8vIOivjeaVsOmHj++8jOi2iuWwj+i2iuWlvVxuXHRcdFx0dG9wc1tpXSArPSAodG9wLnggLSBhc3MueCkgKiAxLjU7XG5cdFx0XHQvLyDor43mgLvpopHnjofvvIzotorlpKfotorlpb1cblx0XHRcdGlmIChhc3MuYSA+PSB0b3AuYSkgdG9wc1tpXSArPSAxO1xuXHRcdFx0Ly8g6K+N5qCH5YeG5beu77yM6LaK5bCP6LaK5aW9XG5cdFx0XHRpZiAoYXNzLmIgPD0gdG9wLmIpIHRvcHNbaV0gKz0gMTtcblx0XHRcdC8vIOacquivhuWIq+ivje+8jOi2iuWwj+i2iuWlvVxuXHRcdFx0dG9wc1tpXSArPSAodG9wLmMgLSBhc3MuYyk7Ly9kZWJ1Zyh0b3BzW2ldKTtcblx0XHRcdC8vIOespuWQiOivreazlee7k+aehOeoi+W6pu+8jOi2iuWkp+i2iuWlvVxuXHRcdFx0dG9wc1tpXSArPSAoYXNzLmQgPCAwID8gdG9wLmQgKyBhc3MuZCA6IGFzcy5kIC0gdG9wLmQpICogMTtcblxuXHRcdFx0YXNzLnNjb3JlID0gdG9wc1tpXTtcblxuXHRcdFx0Ly9kZWJ1Zyh0b3BzW2ldKTtkZWJ1ZygnLS0tJyk7XG5cdFx0fVxuXHRcdC8vZGVidWcodG9wcy5qb2luKCcgICcpKTtcblxuXHRcdC8vY29uc29sZS5sb2codG9wcyk7XG5cdFx0Ly9jb25zb2xlLmxvZyhhc3Nlc3MpO1xuXG5cdFx0Ly9jb25zdCBvbGRfbWV0aG9kID0gdHJ1ZTtcblx0XHRjb25zdCBvbGRfbWV0aG9kID0gZmFsc2U7XG5cblx0XHQvLyDlj5bliIbmlbDmnIDpq5jnmoRcblx0XHRsZXQgY3VycmkgPSAwO1xuXHRcdGxldCBtYXhzID0gdG9wc1swXTtcblx0XHRmb3IgKGxldCBpIGluIHRvcHMpXG5cdFx0e1xuXHRcdFx0bGV0IHMgPSB0b3BzW2ldO1xuXHRcdFx0aWYgKHMgPiBtYXhzKVxuXHRcdFx0e1xuXHRcdFx0XHRjdXJyaSA9IGkgYXMgYW55IGFzIG51bWJlcjtcblx0XHRcdFx0bWF4cyA9IHM7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChzID09IG1heHMpXG5cdFx0XHR7XG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiDlpoLmnpzliIbmlbDnm7jlkIzvvIzliJnmoLnmja7or43plb/luqbjgIHmnKror4bliKvor43kuKrmlbDlkozlubPlnYfpopHnjofmnaXpgInmi6lcblx0XHRcdFx0ICpcblx0XHRcdFx0ICog5aaC5p6c5L6d54S25ZCM5YiG77yM5YmH5L+d5oyB5LiN6K6KXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHRsZXQgYSA9IDA7XG5cdFx0XHRcdGxldCBiID0gMDtcblx0XHRcdFx0aWYgKGFzc2Vzc1tpXS5jIDwgYXNzZXNzW2N1cnJpXS5jKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YSsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGFzc2Vzc1tpXS5jICE9PSBhc3Nlc3NbY3VycmldLmMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGFzc2Vzc1tpXS5hID4gYXNzZXNzW2N1cnJpXS5hKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YSsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGFzc2Vzc1tpXS5hICE9PSBhc3Nlc3NbY3VycmldLmEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGFzc2Vzc1tpXS54IDwgYXNzZXNzW2N1cnJpXS54KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YSsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGFzc2Vzc1tpXS54ICE9PSBhc3Nlc3NbY3VycmldLngpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGEgPiBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y3VycmkgPSBpIGFzIGFueSBhcyBudW1iZXI7XG5cdFx0XHRcdFx0bWF4cyA9IHM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vZGVidWcoeyBpLCBzLCBtYXhzLCBjdXJyaSB9KTtcblx0XHR9XG5cdFx0Ly9kZWJ1ZygnbWF4OiBpPScgKyBjdXJyaSArICcsIHM9JyArIHRvcHNbY3VycmldKTtcblxuXHRcdGFzc2VzcyA9IHVuZGVmaW5lZDtcblx0XHR0b3AgPSB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gY3Vycmk7XG5cdH1cblxuXHQvKipcblx0ICog5bCG5Y2V6K+N5oyJ54Wn5L2N572u5o6S5YiXXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG5cdCAqIEByZXR1cm4ge29iamVjdH1cblx0ICovXG5cdGdldFBvc0luZm8od29yZHM6IElXb3JkW10sIHRleHQ6IHN0cmluZyk6IHtcblx0XHRbaW5kZXg6IG51bWJlcl06IElXb3JkW107XG5cdH1cblx0e1xuXHRcdGxldCB3b3JkcG9zID0ge307XG5cdFx0Ly8g5bCG5Y2V6K+N5oyJ5L2N572u5YiG57uEXG5cdFx0Zm9yIChsZXQgaSA9IDAsIHdvcmQ7IHdvcmQgPSB3b3Jkc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICghd29yZHBvc1t3b3JkLmNdKVxuXHRcdFx0e1xuXHRcdFx0XHR3b3JkcG9zW3dvcmQuY10gPSBbXTtcblx0XHRcdH1cblx0XHRcdHdvcmRwb3Nbd29yZC5jXS5wdXNoKHdvcmQpO1xuXHRcdH1cblx0XHQvLyDmjInljZXlrZfliIblibLmlofmnKzvvIzloavooaXnqbrnvLrnmoTkvY3nva5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKCF3b3JkcG9zW2ldKVxuXHRcdFx0e1xuXHRcdFx0XHR3b3JkcG9zW2ldID0gW3sgdzogdGV4dC5jaGFyQXQoaSksIGM6IGksIGY6IDAgfV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdvcmRwb3M7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5omA5pyJ5YiG5pSvXG5cdCAqXG5cdCAqIEBwYXJhbSB7e1twOiBudW1iZXJdOiBTZWdtZW50LklXb3JkW119fSB3b3JkcG9zXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBwb3Mg5b2T5YmN5L2N572uXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IOacrOiKguimgeWIhuivjeeahOaWh+acrFxuXHQgKiBAcGFyYW0ge251bWJlcn0gdG90YWxfY291bnRcblx0ICogQHJldHVybnMge1NlZ21lbnQuSVdvcmRbXVtdfVxuXHQgKi9cblx0Z2V0Q2h1bmtzKHdvcmRwb3M6IHtcblx0XHRbaW5kZXg6IG51bWJlcl06IElXb3JkW107XG5cdH0sIHBvczogbnVtYmVyLCB0ZXh0Pzogc3RyaW5nLCB0b3RhbF9jb3VudCA9IDAsIE1BWF9DSFVOS19DT1VOVD86IG51bWJlcik6IElXb3JkW11bXVxuXHR7XG5cblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIOi/veWKoOaWsOaooeW8j+S9vyBNQVhfQ0hVTktfQ09VTlQg6YGe5rib5L6G6Ziy5q2i54Sh5YiG5q616ZW35q616JC955qE57i96JmV55CG5qyh5pW46YGO6auYIOeUsSBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4g5L6G6ZmQ5Yi25pyA5bCP5YC8XG5cdFx0ICovXG5cdFx0aWYgKHRvdGFsX2NvdW50ID09IDApXG5cdFx0e1xuXHRcdFx0TUFYX0NIVU5LX0NPVU5UID0gdGhpcy5NQVhfQ0hVTktfQ09VTlQ7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICog5Y+q5pyJ55W255uu5YmN5paH5a2X6ZW35bqm5aSn5pa8IE1BWF9DSFVOS19DT1VOVCDmmYLmiY3pgZ7muJtcblx0XHRcdCAqL1xuXHRcdFx0aWYgKHRleHQubGVuZ3RoIDwgTUFYX0NIVU5LX0NPVU5UKVxuXHRcdFx0e1xuXHRcdFx0XHRNQVhfQ0hVTktfQ09VTlQgKz0gMTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAoTUFYX0NIVU5LX0NPVU5UIDw9IHRoaXMuTUFYX0NIVU5LX0NPVU5UKVxuXHRcdHtcblx0XHRcdE1BWF9DSFVOS19DT1VOVCA9IE1hdGgubWF4KE1BWF9DSFVOS19DT1VOVCAtIDEsIHRoaXMuREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOLCBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4pXG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHQvL01BWF9DSFVOS19DT1VOVCA9IE1hdGgubWF4KE1BWF9DSFVOS19DT1VOVCwgdGhpcy5ERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4sIERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTilcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiDlv73nlaXpgKPlrZdcblx0XHQgKlxuXHRcdCAqIOS+i+Wmgjog5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWKXG5cdFx0ICovXG5cdFx0bGV0IG07XG5cdFx0aWYgKG0gPSB0ZXh0Lm1hdGNoKC9eKCguKylcXDJ7NSx9KS8pKVxuXHRcdHtcblx0XHRcdGxldCBzMSA9IHRleHQuc2xpY2UoMCwgbVsxXS5sZW5ndGgpO1xuXHRcdFx0bGV0IHMyID0gdGV4dC5zbGljZShtWzFdLmxlbmd0aCk7XG5cblx0XHRcdGxldCB3b3JkID0ge1xuXHRcdFx0XHR3OiBzMSxcblx0XHRcdFx0YzogcG9zLFxuXHRcdFx0XHRmOiAwLFxuXHRcdFx0fSBhcyBJV29yZDtcblxuXHRcdFx0bGV0IHJldDogSVdvcmRbXVtdID0gW107XG5cblx0XHRcdGlmIChzMiAhPT0gJycpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBjaHVua3MgPSB0aGlzLmdldENodW5rcyh3b3JkcG9zLCBwb3MgKyBzMS5sZW5ndGgsIHMyLCB0b3RhbF9jb3VudCwgTUFYX0NIVU5LX0NPVU5UKTtcblxuXHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGNodW5rcy5sZW5ndGg7IGorKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldC5wdXNoKFt3b3JkXS5jb25jYXQoY2h1bmtzW2pdKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2goW3dvcmRdKTtcblx0XHRcdH1cblxuLy9cdFx0XHRjb25zb2xlLmRpcih3b3JkcG9zKTtcbi8vXG4vL1x0XHRcdGNvbnNvbGUuZGlyKHJldCk7XG4vL1xuLy9cdFx0XHRjb25zb2xlLmRpcihbcG9zLCB0ZXh0LCB0b3RhbF9jb3VudF0pO1xuXG5cdFx0XHRyZXR1cm4gcmV0O1xuXHRcdH1cblxuXHRcdHRvdGFsX2NvdW50Kys7XG5cblx0XHRsZXQgd29yZHMgPSB3b3JkcG9zW3Bvc10gfHwgW107XG5cblx0XHQvL2RlYnVnKHRvdGFsX2NvdW50LCBNQVhfQ0hVTktfQ09VTlQpO1xuXG4vL1x0XHRkZWJ1Zyh7XG4vL1x0XHRcdHRvdGFsX2NvdW50LFxuLy9cdFx0XHRNQVhfQ0hVTktfQ09VTlQ6IHRoaXMuTUFYX0NIVU5LX0NPVU5ULFxuLy9cdFx0XHR0ZXh0LFxuLy9cdFx0XHR3b3Jkcyxcbi8vXHRcdH0pO1xuXG5cdFx0Ly8gZGVidWcoJ2dldENodW5rczogJyk7XG5cdFx0Ly8gZGVidWcod29yZHMpO1xuXHRcdC8vdGhyb3cgbmV3IEVycm9yKCk7XG5cblx0XHRsZXQgcmV0OiBJV29yZFtdW10gPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHdvcmRzLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGxldCB3b3JkID0gd29yZHNbaV07XG5cdFx0XHQvL2RlYnVnKHdvcmQpO1xuXHRcdFx0bGV0IG5leHRjdXIgPSB3b3JkLmMgKyB3b3JkLncubGVuZ3RoO1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBARklYTUVcblx0XHRcdCAqL1xuXHRcdFx0aWYgKCF3b3JkcG9zW25leHRjdXJdKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaChbd29yZF0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodG90YWxfY291bnQgPiBNQVhfQ0hVTktfQ09VTlQpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIGRvIHNvbWV0aGluZ1xuXG4vL1x0XHRcdFx0Y29uc29sZS5sb2coNDQ0LCB3b3Jkcy5zbGljZShpKSk7XG4vL1x0XHRcdFx0Y29uc29sZS5sb2coMzMzLCB3b3JkKTtcblxuXHRcdFx0XHRsZXQgdzE6IElXb3JkW10gPSBbd29yZF07XG5cblx0XHRcdFx0bGV0IGogPSBuZXh0Y3VyO1xuXHRcdFx0XHR3aGlsZSAoaiBpbiB3b3JkcG9zKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHcyID0gd29yZHBvc1tqXVswXTtcblxuXHRcdFx0XHRcdGlmICh3Milcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR3MS5wdXNoKHcyKTtcblxuXHRcdFx0XHRcdFx0aiArPSB3Mi53Lmxlbmd0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldC5wdXNoKHcxKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0bGV0IHQgPSB0ZXh0LnNsaWNlKHdvcmQudy5sZW5ndGgpO1xuXG5cdFx0XHRcdGxldCBjaHVua3MgPSB0aGlzLmdldENodW5rcyh3b3JkcG9zLCBuZXh0Y3VyLCB0LCB0b3RhbF9jb3VudCwgTUFYX0NIVU5LX0NPVU5UICk7XG5cdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgY2h1bmtzLmxlbmd0aDsgaisrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goW3dvcmRdLmNvbmNhdChjaHVua3Nbal0pKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNodW5rcyA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0d29yZHMgPSB1bmRlZmluZWQ7XG5cdFx0d29yZHBvcyA9IHVuZGVmaW5lZDtcblx0XHRtID0gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxufVxuXG5leHBvcnQgbmFtZXNwYWNlIERpY3RUb2tlbml6ZXJcbntcblx0LyoqXG5cdCAqIOS9v+eUqOexu+S8vOS6jk1NU0fnmoTliIbor43nrpfms5Vcblx0ICog5om+5Ye65omA5pyJ5YiG6K+N5Y+v6IO977yM5Li76KaB5qC55o2u5LiA5LiL5Yeg6aG55p2l6K+E5Lu377yaXG5cdCAqXG5cdCAqIHjjgIHor43mlbDph4/mnIDlsJHvvJtcblx0ICogYeOAgeivjeW5s+Wdh+mikeeOh+acgOWkp++8m1xuXHQgKiBi44CB5q+P5Liq6K+N6ZW/5bqm5qCH5YeG5beu5pyA5bCP77ybXG5cdCAqIGPjgIHmnKror4bliKvor43mnIDlsJHvvJtcblx0ICogZOOAgeespuWQiOivreazlee7k+aehOmhue+8muWmguS4pOS4qui/nue7reeahOWKqOivjeWHj+WIhu+8jOaVsOivjeWQjumdoui3n+mHj+ivjeWKoOWIhu+8m1xuXHQgKlxuXHQgKiDlj5bku6XkuIrlh6Dpobnnu7zlkIjmjpLlkI3mnIDmnIDlpb3nmoRcblx0ICovXG5cdGV4cG9ydCB0eXBlIElBc3Nlc3NSb3cgPSB7XG5cdFx0LyoqXG5cdFx0ICog6K+N5pWw6YeP77yM6LaK5bCP6LaK5aW9XG5cdFx0ICovXG5cdFx0eDogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIOivjeaAu+mikeeOh++8jOi2iuWkp+i2iuWlvVxuXHRcdCAqL1xuXHRcdGE6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDor43moIflh4blt67vvIzotorlsI/otorlpb1cblx0XHQgKiDmr4/kuKror43plb/luqbmoIflh4blt67mnIDlsI9cblx0XHQgKi9cblx0XHRiOiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICog5pyq6K+G5Yir6K+N77yM6LaK5bCP6LaK5aW9XG5cdFx0ICovXG5cdFx0YzogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIOespuWQiOivreazlee7k+aehOeoi+W6pu+8jOi2iuWkp+i2iuWlvVxuXHRcdCAqIOespuWQiOivreazlee7k+aehOmhue+8muWmguS4pOS4qui/nue7reeahOWKqOivjeWHj+WIhu+8jOaVsOivjeWQjumdoui3n+mHj+ivjeWKoOWIhlxuXHRcdCAqL1xuXHRcdGQ6IG51bWJlcixcblxuXHRcdC8qKlxuXHRcdCAqIOe1kOeul+ipleWIhijoh6rli5XoqIjnrpcpXG5cdFx0ICovXG5cdFx0c2NvcmU/OiBudW1iZXIsXG5cdFx0cmVhZG9ubHkgaW5kZXg/OiBudW1iZXIsXG5cdH07XG59XG5cbmV4cG9ydCBpbXBvcnQgSUFzc2Vzc1JvdyA9IERpY3RUb2tlbml6ZXIuSUFzc2Vzc1JvdztcblxuZXhwb3J0IGNvbnN0IGluaXQgPSBEaWN0VG9rZW5pemVyLmluaXQuYmluZChEaWN0VG9rZW5pemVyKSBhcyBJU3ViVG9rZW5pemVyQ3JlYXRlPERpY3RUb2tlbml6ZXI+O1xuXG5leHBvcnQgZGVmYXVsdCBEaWN0VG9rZW5pemVyO1xuIl19