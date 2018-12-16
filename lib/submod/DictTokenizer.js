'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
const index_1 = require("../util/index");
const CHS_NAMES_1 = require("../mod/CHS_NAMES");
const const_1 = require("../mod/const");
exports.DEFAULT_MAX_CHUNK_COUNT = 40;
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
    }
    _cache() {
        super._cache();
        this._TABLE = this.segment.getDict('TABLE');
        this._TABLE2 = this.segment.getDict('TABLE2');
        this._POSTAG = this.segment.POSTAG;
        if (typeof this.segment.options.maxChunkCount == 'number' && this.segment.options.maxChunkCount) {
            this.MAX_CHUNK_COUNT = this.segment.options.maxChunkCount;
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
    getChunks(wordpos, pos, text, total_count = 0) {
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
                let chunks = this.getChunks(wordpos, pos + s1.length, s2, total_count);
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
        // debug('getChunks: ');
        // debug(words);
        // throw new Error();
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
            else if (total_count > this.MAX_CHUNK_COUNT) {
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
                let chunks = this.getChunks(wordpos, nextcur, t, total_count);
                for (let j = 0; j < chunks.length; j++) {
                    ret.push([word].concat(chunks[j]));
                }
                chunks = null;
            }
        }
        words = undefined;
        return ret;
    }
}
exports.DictTokenizer = DictTokenizer;
exports.init = DictTokenizer.init.bind(DictTokenizer);
exports.default = DictTokenizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGljdFRva2VuaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRpY3RUb2tlbml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLGdDQUE4RTtBQUk5RSx5Q0FBaUQ7QUFDakQsZ0RBQXNIO0FBR3RILHdDQUF3QztBQUczQixRQUFBLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztBQUUxQzs7OztHQUlHO0FBQ0gsTUFBYSxhQUFjLFNBQVEseUJBQW1CO0lBQXREOztRQUdDOzs7Ozs7Ozs7V0FTRztRQUNILG9CQUFlLEdBQUcsK0JBQXVCLENBQUM7SUFzdUIzQyxDQUFDO0lBanVCQSxNQUFNO1FBRUwsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFbkMsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUMvRjtZQUNDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1NBQzFEO0lBQ0YsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLEtBQWM7UUFFbkIsZUFBZTtRQUNmLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUU1QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7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QUksT0FBTyxFQUNuQjtvQkFDQyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRXZCLElBQUksRUFBRSxFQUNOO3dCQUNDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBRVosQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO3FCQUNqQjt5QkFFRDt3QkFDQyxNQUFNO3FCQUNOO2lCQUNEO2dCQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDYjtpQkFFRDtnQkFDQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWxDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQzlELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUN0QztvQkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ25DO2dCQUVELE1BQU0sR0FBRyxJQUFJLENBQUM7YUFDZDtTQUNEO1FBRUQsS0FBSyxHQUFHLFNBQVMsQ0FBQztRQUVsQixPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7Q0FDRDtBQW52QkQsc0NBbXZCQztBQWtEWSxRQUFBLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQXVDLENBQUM7QUFFakcsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBTdWJTTW9kdWxlLCBTdWJTTW9kdWxlVG9rZW5pemVyLCBJU3ViVG9rZW5pemVyQ3JlYXRlIH0gZnJvbSAnLi4vbW9kJztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IFVTdHJpbmcgfSBmcm9tICd1bmktc3RyaW5nJztcbmltcG9ydCB7IElUYWJsZURpY3RSb3cgfSBmcm9tICcuLi90YWJsZS9kaWN0JztcbmltcG9ydCB7IGhleEFuZEFueSwgdG9IZXggfSBmcm9tICcuLi91dGlsL2luZGV4JztcbmltcG9ydCBDSFNfTkFNRVMsIHsgRkFNSUxZX05BTUVfMSwgRkFNSUxZX05BTUVfMiwgU0lOR0xFX05BTUUsIERPVUJMRV9OQU1FXzEsIERPVUJMRV9OQU1FXzIgfSBmcm9tICcuLi9tb2QvQ0hTX05BTUVTJztcbmltcG9ydCBTZWdtZW50LCB7IElESUNULCBJV29yZCwgSURJQ1QyIH0gZnJvbSAnLi4vU2VnbWVudCc7XG5pbXBvcnQgeyBkZWJ1ZyB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHsgREFURVRJTUUgfSBmcm9tICcuLi9tb2QvY29uc3QnO1xuaW1wb3J0IElQT1NUQUcgZnJvbSAnLi4vUE9TVEFHJztcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UID0gNDA7XG5cbi8qKlxuICog5a2X5YW46K+G5Yir5qih5Z2XXG4gKlxuICogQGF1dGhvciDogIHpm7c8bGVpem9uZ21pbkBnbWFpbC5jb20+XG4gKi9cbmV4cG9ydCBjbGFzcyBEaWN0VG9rZW5pemVyIGV4dGVuZHMgU3ViU01vZHVsZVRva2VuaXplclxue1xuXG5cdC8qKlxuXHQgKiDpmLLmraLlm6DnhKHliIbmrrXlsI7oh7TliIbmnpDpgY7kuYXnlJroh7PotoXpgY7omZXnkIbosqDojbdcblx0ICog6LaK6auY6LaK57K+5rqW5L2G5piv6JmV55CG5pmC6ZaT5pyD5Yqg5YCN5oiQ6ZW355Sa6Iez6LaF6YGO6KiY5oa26auU6IO96JmV55CG55qE56iL5bqmXG5cdCAqXG5cdCAqIOaVuOWtl+i2iuWwj+i2iuW/q1xuXHQgKlxuXHQgKiBGQVRBTCBFUlJPUjogQ0FMTF9BTkRfUkVUUllfTEFTVCBBbGxvY2F0aW9uIGZhaWxlZCAtIEphdmFTY3JpcHQgaGVhcCBvdXQgb2YgbWVtb3J5XG5cdCAqXG5cdCAqIEB0eXBlIHtudW1iZXJ9XG5cdCAqL1xuXHRNQVhfQ0hVTktfQ09VTlQgPSBERUZBVUxUX01BWF9DSFVOS19DT1VOVDtcblxuXHRwcm90ZWN0ZWQgX1RBQkxFOiBJRElDVDxJV29yZD47XG5cdHByb3RlY3RlZCBfVEFCTEUyOiBJRElDVDI8SVdvcmQ+O1xuXG5cdF9jYWNoZSgpXG5cdHtcblx0XHRzdXBlci5fY2FjaGUoKTtcblx0XHR0aGlzLl9UQUJMRSA9IHRoaXMuc2VnbWVudC5nZXREaWN0KCdUQUJMRScpO1xuXHRcdHRoaXMuX1RBQkxFMiA9IHRoaXMuc2VnbWVudC5nZXREaWN0KCdUQUJMRTInKTtcblx0XHR0aGlzLl9QT1NUQUcgPSB0aGlzLnNlZ21lbnQuUE9TVEFHO1xuXG5cdFx0aWYgKHR5cGVvZiB0aGlzLnNlZ21lbnQub3B0aW9ucy5tYXhDaHVua0NvdW50ID09ICdudW1iZXInICYmIHRoaXMuc2VnbWVudC5vcHRpb25zLm1heENodW5rQ291bnQpXG5cdFx0e1xuXHRcdFx0dGhpcy5NQVhfQ0hVTktfQ09VTlQgPSB0aGlzLnNlZ21lbnQub3B0aW9ucy5tYXhDaHVua0NvdW50O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiDlr7nmnKror4bliKvnmoTljZXor43ov5vooYzliIbor41cblx0ICpcblx0ICogQHBhcmFtIHthcnJheX0gd29yZHMg5Y2V6K+N5pWw57uEXG5cdCAqIEByZXR1cm4ge2FycmF5fVxuXHQgKi9cblx0c3BsaXQod29yZHM6IElXb3JkW10pOiBJV29yZFtdXG5cdHtcblx0XHQvL2RlYnVnKHdvcmRzKTtcblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuX1RBQkxFO1xuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuX1BPU1RBRztcblxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOyB3b3JkID0gd29yZHNbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAod29yZC5wID4gMClcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2god29yZCk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyDku4Xlr7nmnKror4bliKvnmoTor43ov5vooYzljLnphY1cblx0XHRcdGxldCB3b3JkaW5mbyA9IHRoaXMubWF0Y2hXb3JkKHdvcmQudywgMCwgd29yZHNbaSAtIDFdKTtcblx0XHRcdGlmICh3b3JkaW5mby5sZW5ndGggPCAxKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIOWIhuemu+WHuuW3suivhuWIq+eahOWNleivjVxuXHRcdFx0bGV0IGxhc3RjID0gMDtcblxuXHRcdFx0d29yZGluZm8uZm9yRWFjaChmdW5jdGlvbiAoYncsIHVpKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoYncuYyA+IGxhc3RjKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdFx0dzogd29yZC53LnN1YnN0cihsYXN0YywgYncuYyAtIGxhc3RjKSxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBjdyA9IHNlbGYuY3JlYXRlUmF3VG9rZW4oe1xuXHRcdFx0XHRcdHc6IGJ3LncsXG5cdFx0XHRcdFx0ZjogYncuZixcblx0XHRcdFx0fSwgVEFCTEVbYncud10pO1xuXG5cdFx0XHRcdHJldC5wdXNoKGN3KTtcblxuXHRcdFx0XHQvKlxuXHRcdFx0XHRyZXQucHVzaCh7XG5cdFx0XHRcdFx0dzogYncudyxcblx0XHRcdFx0XHRwOiB3dy5wLFxuXHRcdFx0XHRcdGY6IGJ3LmYsXG5cdFx0XHRcdFx0czogd3cucyxcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCovXG5cdFx0XHRcdGxhc3RjID0gYncuYyArIGJ3LncubGVuZ3RoO1xuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBsYXN0d29yZCA9IHdvcmRpbmZvW3dvcmRpbmZvLmxlbmd0aCAtIDFdO1xuXHRcdFx0aWYgKGxhc3R3b3JkLmMgKyBsYXN0d29yZC53Lmxlbmd0aCA8IHdvcmQudy5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBjdyA9IHNlbGYuY3JlYXRlUmF3VG9rZW4oe1xuXHRcdFx0XHRcdHc6IHdvcmQudy5zdWJzdHIobGFzdHdvcmQuYyArIGxhc3R3b3JkLncubGVuZ3RoKSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0LnB1c2goY3cpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5cdC8qKlxuXHQgKiDljLnphY3ljZXor43vvIzov5Tlm57nm7jlhbPkv6Hmga9cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQg5paH5pysXG5cdCAqIEBwYXJhbSB7aW50fSBjdXIg5byA5aeL5L2N572uXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwcmV3b3JkIOS4iuS4gOS4quWNleivjVxuXHQgKiBAcmV0dXJuIHthcnJheX0gIOi/lOWbnuagvOW8jyAgIHt3OiAn5Y2V6K+NJywgYzog5byA5aeL5L2N572ufVxuXHQgKi9cblx0cHJvdGVjdGVkIG1hdGNoV29yZCh0ZXh0OiBzdHJpbmcsIGN1cjogbnVtYmVyLCBwcmV3b3JkOiBJV29yZClcblx0e1xuXHRcdGlmIChpc05hTihjdXIpKSBjdXIgPSAwO1xuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblx0XHRsZXQgcyA9IGZhbHNlO1xuXG5cdFx0Y29uc3QgVEFCTEUyID0gdGhpcy5fVEFCTEUyO1xuXG5cdFx0Ly8g5Yy56YWN5Y+v6IO95Ye6546w55qE5Y2V6K+NXG5cdFx0d2hpbGUgKGN1ciA8IHRleHQubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGZvciAobGV0IGkgaW4gVEFCTEUyKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdyA9IHRleHQuc3Vic3RyKGN1ciwgaSBhcyBhbnkgYXMgbnVtYmVyKTtcblx0XHRcdFx0aWYgKHcgaW4gVEFCTEUyW2ldKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdFx0dzogdyxcblx0XHRcdFx0XHRcdGM6IGN1cixcblx0XHRcdFx0XHRcdGY6IFRBQkxFMltpXVt3XS5mLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjdXIrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5maWx0ZXJXb3JkKHJldCwgcHJld29yZCwgdGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICog6YCJ5oup5pyA5pyJ5Y+v6IO95Yy56YWN55qE5Y2V6K+NXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeS/oeaBr+aVsOe7hFxuXHQgKiBAcGFyYW0ge29iamVjdH0gcHJld29yZCDkuIrkuIDkuKrljZXor41cblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQg5pys6IqC6KaB5YiG6K+N55qE5paH5pysXG5cdCAqIEByZXR1cm4ge2FycmF5fVxuXHQgKi9cblx0cHJvdGVjdGVkIGZpbHRlcldvcmQod29yZHM6IElXb3JkW10sIHByZXdvcmQ6IElXb3JkLCB0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuX1RBQkxFO1xuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuX1BPU1RBRztcblx0XHRsZXQgcmV0OiBJV29yZFtdID0gW107XG5cblx0XHQvLyDlsIbljZXor43mjInkvY3nva7liIbnu4Rcblx0XHRsZXQgd29yZHBvcyA9IHRoaXMuZ2V0UG9zSW5mbyh3b3JkcywgdGV4dCk7XG5cdFx0Ly9kZWJ1Zyh3b3JkcG9zKTtcblxuXHRcdC8qKlxuXHRcdCAqIOS9v+eUqOexu+S8vOS6jk1NU0fnmoTliIbor43nrpfms5Vcblx0XHQgKiDmib7lh7rmiYDmnInliIbor43lj6/og73vvIzkuLvopoHmoLnmja7kuIDkuIvlh6DpobnmnaXor4Tku7fvvJpcblx0XHQgKiB444CB6K+N5pWw6YeP5pyA5bCR77ybXG5cdFx0ICogYeOAgeivjeW5s+Wdh+mikeeOh+acgOWkp++8m1xuXHRcdCAqIGLjgIHmr4/kuKror43plb/luqbmoIflh4blt67mnIDlsI/vvJtcblx0XHQgKiBj44CB5pyq6K+G5Yir6K+N5pyA5bCR77ybXG5cdFx0ICogZOOAgeespuWQiOivreazlee7k+aehOmhue+8muWmguS4pOS4qui/nue7reeahOWKqOivjeWHj+WIhu+8jOaVsOivjeWQjumdoui3n+mHj+ivjeWKoOWIhu+8m1xuXHRcdCAqIOWPluS7peS4iuWHoOmhuee7vOWQiOaOkuWQjeacgOacgOWlveeahFxuXHRcdCAqL1xuXHRcdGxldCBjaHVua3MgPSB0aGlzLmdldENodW5rcyh3b3JkcG9zLCAwLCB0ZXh0KTtcblx0XHQvL2RlYnVnKGNodW5rcyk7XG5cdFx0bGV0IGFzc2VzczogQXJyYXk8SUFzc2Vzc1Jvdz4gPSBbXTsgIC8vIOivhOS7t+ihqFxuXG5cdFx0Ly9jb25zb2xlLmxvZyhjaHVua3MpO1xuXG5cdFx0Ly8g5a+55ZCE5Liq5YiG5pSv5bCx6KGM6K+E5LywXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGNodW5rOiBJV29yZFtdOyBjaHVuayA9IGNodW5rc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGFzc2Vzc1tpXSA9IHtcblx0XHRcdFx0eDogY2h1bmsubGVuZ3RoLFxuXHRcdFx0XHRhOiAwLFxuXHRcdFx0XHRiOiAwLFxuXHRcdFx0XHRjOiAwLFxuXHRcdFx0XHRkOiAwLFxuXG5cdFx0XHRcdGluZGV4OiBpLFxuXHRcdFx0fTtcblx0XHRcdC8vIOivjeW5s+Wdh+mVv+W6plxuXHRcdFx0bGV0IHNwID0gdGV4dC5sZW5ndGggLyBjaHVuay5sZW5ndGg7XG5cdFx0XHQvLyDlj6XlrZDnu4/luLjljIXlkKvnmoTor63ms5Xnu5PmnoRcblx0XHRcdGxldCBoYXNfRF9WID0gZmFsc2U7ICAvLyDmmK/lkKbljIXlkKvliqjor41cblxuXHRcdFx0Ly8g6YGN5Y6G5ZCE5Liq6K+NXG5cdFx0XHRsZXQgcHJldzogSVdvcmQ7XG5cblx0XHRcdGlmIChwcmV3b3JkKVxuXHRcdFx0e1xuXHRcdFx0XHQvKlxuXHRcdFx0XHRwcmV3ID0ge1xuXHRcdFx0XHRcdHc6IHByZXdvcmQudyxcblx0XHRcdFx0XHRwOiBwcmV3b3JkLnAsXG5cdFx0XHRcdFx0ZjogcHJld29yZC5mLFxuXHRcdFx0XHRcdHM6IHByZXdvcmQucyxcblx0XHRcdFx0fVxuXHRcdFx0XHQqL1xuXG5cdFx0XHRcdHByZXcgPSB0aGlzLmNyZWF0ZVJhd1Rva2VuKHByZXdvcmQpO1xuXG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHByZXcgPSBudWxsO1xuXHRcdFx0fVxuXHRcdFx0Zm9yIChsZXQgaiA9IDAsIHc6IElXb3JkOyB3ID0gY2h1bmtbal07IGorKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHcudyBpbiBUQUJMRSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHcucCA9IFRBQkxFW3cud10ucDtcblx0XHRcdFx0XHRhc3Nlc3NbaV0uYSArPSB3LmY7ICAgLy8g5oC76K+N6aKRXG5cblx0XHRcdFx0XHRpZiAoaiA9PSAwICYmICFwcmV3b3JkICYmICh3LnAgJiBQT1NUQUcuRF9WKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdCAqIOWwh+esrOS4gOWAi+Wtl+S5n+ioiOeul+mAsuWOu+aYr+WQpuWMheWQq+WLleipnlxuXHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRoYXNfRF9WID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyA9PT09PT09PT09PT09PT09IOajgOafpeivreazlee7k+aehCA9PT09PT09PT09PT09PT09PT09XG5cdFx0XHRcdFx0aWYgKHByZXcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5LiK5LiA5Liq6K+N5piv5pWw6K+N5LiU5b2T5YmN6K+N5piv6YeP6K+N77yI5Y2V5L2N77yJ77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdChwcmV3LnAgJiBQT1NUQUcuQV9NKVxuXHRcdFx0XHRcdFx0XHQmJlxuXHRcdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdFx0KCh3LnAgJiBQT1NUQUcuQV9RKSlcblx0XHRcdFx0XHRcdFx0XHR8fCB3LncgaW4gREFURVRJTUVcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzlvZPliY3or43mmK/liqjor41cblx0XHRcdFx0XHRcdGlmICgody5wICYgUE9TVEFHLkRfVikpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGhhc19EX1YgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK/ov57nu63nmoTkuKTkuKrliqjor43vvIzliJnlh4/liIZcblx0XHRcdFx0XHRcdFx0Ly9pZiAoKHByZXcucCAmIFBPU1RBRy5EX1YpID4gMClcblx0XHRcdFx0XHRcdFx0Ly9hc3Nlc3NbaV0uZC0tO1xuXG5cdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDlvaLlrrnor40gKyDliqjor43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdFx0aWYgKChwcmV3LnAgJiBQT1NUQUcuRF9BKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK8g5Ymv6K+NICsg5Yqo6K+N77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRcdGlmIChwcmV3LnAgJiBQT1NUQUcuRF9EKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5piv5Zyw5Yy65ZCN44CB5py65p6E5ZCN5oiW5b2i5a656K+N77yM5ZCO6Z2i6Lef5Zyw5Yy644CB5py65p6E44CB5Luj6K+N44CB5ZCN6K+N562J77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRpZiAoKFxuXHRcdFx0XHRcdFx0XHRcdChwcmV3LnAgJiBQT1NUQUcuQV9OUylcblx0XHRcdFx0XHRcdFx0XHR8fCAocHJldy5wICYgUE9TVEFHLkFfTlQpXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHByZXcucCAmIFBPU1RBRy5EX0EpXG5cdFx0XHRcdFx0XHRcdCkgJiZcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdCh3LnAgJiBQT1NUQUcuRF9OKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OUilcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkFfTlMpXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05aKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OVClcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDmlrnkvY3or40gKyDmlbDph4/or43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0KHByZXcucCAmIFBPU1RBRy5EX0YpXG5cdFx0XHRcdFx0XHRcdCYmXG5cdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHQody5wICYgUE9TVEFHLkFfTSlcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkRfTVEpXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vZGVidWcocHJldywgdyk7XG5cdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK8g5aeTICsg5ZCN6K+N77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHRwcmV3LncgaW4gRkFNSUxZX05BTUVfMVxuXHRcdFx0XHRcdFx0XHRcdHx8IHByZXcudyBpbiBGQU1JTFlfTkFNRV8yXG5cdFx0XHRcdFx0XHRcdCkgJiZcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdCh3LnAgJiBQT1NUQUcuRF9OKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OWilcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9kZWJ1ZyhwcmV3LCB3KTtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHQgKiDlnLDlkI0v5aSE5omAICsg5pa55L2NXG5cdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdGlmIChoZXhBbmRBbnkocHJldy5wXG5cdFx0XHRcdFx0XHRcdCwgUE9TVEFHLkRfU1xuXHRcdFx0XHRcdFx0XHQsIFBPU1RBRy5BX05TLFxuXHRcdFx0XHRcdFx0KSAmJiBoZXhBbmRBbnkody5wXG5cdFx0XHRcdFx0XHRcdCwgUE9TVEFHLkRfRixcblx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kICs9IDAuNTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8g5o6i5rWL5LiL5LiA5Liq6K+NXG5cdFx0XHRcdFx0XHRsZXQgbmV4dHcgPSBjaHVua1tqICsgMV07XG5cdFx0XHRcdFx0XHRpZiAobmV4dHcpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChuZXh0dy53IGluIFRBQkxFKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bmV4dHcucCA9IFRBQkxFW25leHR3LnddLnA7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgX3RlbXBfb2s6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0XHQgKiDlpoLmnpzlvZPliY3mmK/igJznmoTigJ0rIOWQjeivje+8jOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdCh3LncgPT0gJ+eahCcgfHwgdy53ID09ICfkuYsnKVxuXHRcdFx0XHRcdFx0XHRcdCYmIG5leHR3LnAgJiYgKFxuXHRcdFx0XHRcdFx0XHRcdFx0KG5leHR3LnAgJiBQT1NUQUcuRF9OKVxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuRF9WKVxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OUilcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkFfTlMpXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCAobmV4dHcucCAmIFBPU1RBRy5BX05aKVxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OVClcblx0XHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMS41O1xuXHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdCAqIOWmguaenOaYr+i/nuivje+8jOWJjeWQjuS4pOS4quivjeivjeaAp+ebuOWQjOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAocHJldy5wICYmICh3LnAgJiBQT1NUQUcuRF9DKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBwID0gcHJldy5wICYgbmV4dHcucDtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChwcmV3LnAgPT09IG5leHR3LnApXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGVsc2UgaWYgKHApXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC4yNTtcblx0XHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmIChwICYgUE9TVEFHLkRfTilcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC43NTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoX3RlbXBfb2sgJiYgbmV4dHcucCAmJiAody5wICYgUE9TVEFHLkRfUCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpZiAobmV4dHcucCAmIFBPU1RBRy5BX05SICYmIChcblx0XHRcdFx0XHRcdFx0XHRcdG5leHR3LncubGVuZ3RoID4gMVxuXHRcdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHByZXcudyA9PSAn55qEJylcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAqIOeahCArIOS7i+ipniArIOS6uuWQjVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvLyBARklYTUUg5pq05Yqb6Kej5rG6IOS4ieWkqeWQjiDnmoTllY/poYxcblx0XHRcdFx0XHRcdFx0aWYgKG5leHR3LncgPT0gJ+WQjicgJiYgdy5wICYgUE9TVEFHLkRfVCAmJiBoZXhBbmRBbnkocHJldy5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX01RLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5BX00sXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8vIEBGSVhNRSDliLDmuZbkuK3plpPlkI7miYvntYLmlrzog73kvJHmga/kuoZcblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoXG5cdFx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdFx0bmV4dHcudyA9PSAn5ZCOJ1xuXHRcdFx0XHRcdFx0XHRcdFx0fHwgbmV4dHcudyA9PSAn5b6MJ1xuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHQmJiBoZXhBbmRBbnkody5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX0YsXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHRcdHcudyA9PSAn5ZCOJ1xuXHRcdFx0XHRcdFx0XHRcdFx0fHwgdy53ID09ICflvownXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdCYmIGhleEFuZEFueShwcmV3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfRixcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0JiYgaGV4QW5kQW55KG5leHR3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfTixcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIOacquivhuWIq+eahOivjeaVsOmHj1xuXHRcdFx0XHRcdGFzc2Vzc1tpXS5jKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8g5qCH5YeG5beuXG5cdFx0XHRcdGFzc2Vzc1tpXS5iICs9IE1hdGgucG93KHNwIC0gdy53Lmxlbmd0aCwgMik7XG5cdFx0XHRcdHByZXcgPSBjaHVua1tqXTtcblx0XHRcdH1cblxuXHRcdFx0Ly8g5aaC5p6c5Y+l5a2Q5Lit5YyF5ZCr5LqG6Iez5bCR5LiA5Liq5Yqo6K+NXG5cdFx0XHRpZiAoaGFzX0RfViA9PT0gZmFsc2UpIGFzc2Vzc1tpXS5kIC09IDAuNTtcblxuXHRcdFx0YXNzZXNzW2ldLmEgPSBhc3Nlc3NbaV0uYSAvIGNodW5rLmxlbmd0aDtcblx0XHRcdGFzc2Vzc1tpXS5iID0gYXNzZXNzW2ldLmIgLyBjaHVuay5sZW5ndGg7XG5cdFx0fVxuXG5cdFx0Ly9jb25zb2xlLmRpcihhc3Nlc3MpO1xuXG5cdFx0Ly8g6K6h566X5o6S5ZCNXG5cdFx0bGV0IHRvcCA9IHRoaXMuZ2V0VG9wcyhhc3Nlc3MpO1xuXHRcdGxldCBjdXJyY2h1bmsgPSBjaHVua3NbdG9wXTtcblxuXHRcdGlmIChmYWxzZSlcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGFzc2Vzcyk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKE9iamVjdC5lbnRyaWVzKGNodW5rcykpO1xuXHRcdFx0Y29uc29sZS5kaXIoT2JqZWN0LmVudHJpZXMoY2h1bmtzKVxuXHRcdFx0XHQubWFwKChbaSwgY2h1bmtdKSA9PiB7IHJldHVybiB7IGksIGFzc2VzOiBhc3Nlc3NbaSBhcyB1bmtub3duIGFzIG51bWJlcl0sIGNodW5rIH0gfSksIHsgZGVwdGg6IDUgfSk7XG5cdFx0XHRjb25zb2xlLmRpcih7IGk6IHRvcCwgYXNzZXM6IGFzc2Vzc1t0b3BdLCBjdXJyY2h1bmsgfSk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKHRvcCk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGN1cnJjaHVuayk7XG5cdFx0fVxuXG5cdFx0Ly8g5YmU6Zmk5LiN6IO96K+G5Yir55qE6K+NXG5cdFx0Zm9yIChsZXQgaSA9IDAsIHdvcmQ6IElXb3JkOyB3b3JkID0gY3VycmNodW5rW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKCEod29yZC53IGluIFRBQkxFKSlcblx0XHRcdHtcblx0XHRcdFx0Y3VycmNodW5rLnNwbGljZShpLS0sIDEpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXQgPSBjdXJyY2h1bms7XG5cblx0XHQvLyDoqablnJbkuLvli5XmuIXpmaToqJjmhrbpq5Rcblx0XHRhc3Nlc3MgPSB1bmRlZmluZWQ7XG5cdFx0Y2h1bmtzID0gdW5kZWZpbmVkO1xuXG5cdFx0Ly9kZWJ1ZyhyZXQpO1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHQvKipcblx0ICog6K+E5Lu35o6S5ZCNXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhc3Nlc3Ncblx0ICogQHJldHVybiB7b2JqZWN0fVxuXHQgKi9cblx0Z2V0VG9wcyhhc3Nlc3M6IEFycmF5PElBc3Nlc3NSb3c+KVxuXHR7XG5cdFx0Ly9kZWJ1Zyhhc3Nlc3MpO1xuXHRcdC8vIOWPluWQhOmhueacgOWkp+WAvFxuXHRcdGxldCB0b3A6IElBc3Nlc3NSb3cgPSB7XG5cdFx0XHR4OiBhc3Nlc3NbMF0ueCxcblx0XHRcdGE6IGFzc2Vzc1swXS5hLFxuXHRcdFx0YjogYXNzZXNzWzBdLmIsXG5cdFx0XHRjOiBhc3Nlc3NbMF0uYyxcblx0XHRcdGQ6IGFzc2Vzc1swXS5kLFxuXHRcdH07XG5cblx0XHRmb3IgKGxldCBpID0gMSwgYXNzOiBJQXNzZXNzUm93OyBhc3MgPSBhc3Nlc3NbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAoYXNzLmEgPiB0b3AuYSkgdG9wLmEgPSBhc3MuYTsgIC8vIOWPluacgOWkp+W5s+Wdh+ivjemikVxuXHRcdFx0aWYgKGFzcy5iIDwgdG9wLmIpIHRvcC5iID0gYXNzLmI7ICAvLyDlj5bmnIDlsI/moIflh4blt65cblx0XHRcdGlmIChhc3MuYyA+IHRvcC5jKSB0b3AuYyA9IGFzcy5jOyAgLy8g5Y+W5pyA5aSn5pyq6K+G5Yir6K+NXG5cdFx0XHRpZiAoYXNzLmQgPCB0b3AuZCkgdG9wLmQgPSBhc3MuZDsgIC8vIOWPluacgOWwj+ivreazleWIhuaVsFxuXHRcdFx0aWYgKGFzcy54ID4gdG9wLngpIHRvcC54ID0gYXNzLng7ICAvLyDlj5bmnIDlpKfljZXor43mlbDph49cblx0XHR9XG5cdFx0Ly9kZWJ1Zyh0b3ApO1xuXG5cdFx0Ly8g6K+E5Lyw5o6S5ZCNXG5cdFx0bGV0IHRvcHM6IG51bWJlcltdID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDAsIGFzczogSUFzc2Vzc1JvdzsgYXNzID0gYXNzZXNzW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0dG9wc1tpXSA9IDA7XG5cdFx0XHQvLyDor43mlbDph4/vvIzotorlsI/otorlpb1cblx0XHRcdHRvcHNbaV0gKz0gKHRvcC54IC0gYXNzLngpICogMS41O1xuXHRcdFx0Ly8g6K+N5oC76aKR546H77yM6LaK5aSn6LaK5aW9XG5cdFx0XHRpZiAoYXNzLmEgPj0gdG9wLmEpIHRvcHNbaV0gKz0gMTtcblx0XHRcdC8vIOivjeagh+WHhuW3ru+8jOi2iuWwj+i2iuWlvVxuXHRcdFx0aWYgKGFzcy5iIDw9IHRvcC5iKSB0b3BzW2ldICs9IDE7XG5cdFx0XHQvLyDmnKror4bliKvor43vvIzotorlsI/otorlpb1cblx0XHRcdHRvcHNbaV0gKz0gKHRvcC5jIC0gYXNzLmMpOy8vZGVidWcodG9wc1tpXSk7XG5cdFx0XHQvLyDnrKblkIjor63ms5Xnu5PmnoTnqIvluqbvvIzotorlpKfotorlpb1cblx0XHRcdHRvcHNbaV0gKz0gKGFzcy5kIDwgMCA/IHRvcC5kICsgYXNzLmQgOiBhc3MuZCAtIHRvcC5kKSAqIDE7XG5cblx0XHRcdGFzcy5zY29yZSA9IHRvcHNbaV07XG5cblx0XHRcdC8vZGVidWcodG9wc1tpXSk7ZGVidWcoJy0tLScpO1xuXHRcdH1cblx0XHQvL2RlYnVnKHRvcHMuam9pbignICAnKSk7XG5cblx0XHQvL2NvbnNvbGUubG9nKHRvcHMpO1xuXHRcdC8vY29uc29sZS5sb2coYXNzZXNzKTtcblxuXHRcdC8vY29uc3Qgb2xkX21ldGhvZCA9IHRydWU7XG5cdFx0Y29uc3Qgb2xkX21ldGhvZCA9IGZhbHNlO1xuXG5cdFx0Ly8g5Y+W5YiG5pWw5pyA6auY55qEXG5cdFx0bGV0IGN1cnJpID0gMDtcblx0XHRsZXQgbWF4cyA9IHRvcHNbMF07XG5cdFx0Zm9yIChsZXQgaSBpbiB0b3BzKVxuXHRcdHtcblx0XHRcdGxldCBzID0gdG9wc1tpXTtcblx0XHRcdGlmIChzID4gbWF4cylcblx0XHRcdHtcblx0XHRcdFx0Y3VycmkgPSBpIGFzIGFueSBhcyBudW1iZXI7XG5cdFx0XHRcdG1heHMgPSBzO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocyA9PSBtYXhzKVxuXHRcdFx0e1xuXHRcdFx0XHQvKipcblx0XHRcdFx0ICog5aaC5p6c5YiG5pWw55u45ZCM77yM5YiZ5qC55o2u6K+N6ZW/5bqm44CB5pyq6K+G5Yir6K+N5Liq5pWw5ZKM5bmz5Z2H6aKR546H5p2l6YCJ5oupXG5cdFx0XHRcdCAqXG5cdFx0XHRcdCAqIOWmguaenOS+neeEtuWQjOWIhu+8jOWJh+S/neaMgeS4jeiuilxuXHRcdFx0XHQgKi9cblx0XHRcdFx0bGV0IGEgPSAwO1xuXHRcdFx0XHRsZXQgYiA9IDA7XG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0uYyA8IGFzc2Vzc1tjdXJyaV0uYylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGErKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0uYyAhPT0gYXNzZXNzW2N1cnJpXS5jKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0uYSA+IGFzc2Vzc1tjdXJyaV0uYSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGErKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0uYSAhPT0gYXNzZXNzW2N1cnJpXS5hKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0ueCA8IGFzc2Vzc1tjdXJyaV0ueClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGErKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0ueCAhPT0gYXNzZXNzW2N1cnJpXS54KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhID4gYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGN1cnJpID0gaSBhcyBhbnkgYXMgbnVtYmVyO1xuXHRcdFx0XHRcdG1heHMgPSBzO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvL2RlYnVnKHsgaSwgcywgbWF4cywgY3VycmkgfSk7XG5cdFx0fVxuXHRcdC8vZGVidWcoJ21heDogaT0nICsgY3VycmkgKyAnLCBzPScgKyB0b3BzW2N1cnJpXSk7XG5cdFx0cmV0dXJuIGN1cnJpO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWwhuWNleivjeaMieeFp+S9jee9ruaOkuWIl1xuXHQgKlxuXHQgKiBAcGFyYW0ge2FycmF5fSB3b3Jkc1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuXHQgKiBAcmV0dXJuIHtvYmplY3R9XG5cdCAqL1xuXHRnZXRQb3NJbmZvKHdvcmRzOiBJV29yZFtdLCB0ZXh0OiBzdHJpbmcpOiB7XG5cdFx0W2luZGV4OiBudW1iZXJdOiBJV29yZFtdO1xuXHR9XG5cdHtcblx0XHRsZXQgd29yZHBvcyA9IHt9O1xuXHRcdC8vIOWwhuWNleivjeaMieS9jee9ruWIhue7hFxuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOyB3b3JkID0gd29yZHNbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAoIXdvcmRwb3Nbd29yZC5jXSlcblx0XHRcdHtcblx0XHRcdFx0d29yZHBvc1t3b3JkLmNdID0gW107XG5cdFx0XHR9XG5cdFx0XHR3b3JkcG9zW3dvcmQuY10ucHVzaCh3b3JkKTtcblx0XHR9XG5cdFx0Ly8g5oyJ5Y2V5a2X5YiG5Ymy5paH5pys77yM5aGr6KGl56m657y655qE5L2N572uXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0Lmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICghd29yZHBvc1tpXSlcblx0XHRcdHtcblx0XHRcdFx0d29yZHBvc1tpXSA9IFt7IHc6IHRleHQuY2hhckF0KGkpLCBjOiBpLCBmOiAwIH1dO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB3b3JkcG9zO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWPluaJgOacieWIhuaUr1xuXHQgKlxuXHQgKiBAcGFyYW0ge3tbcDogbnVtYmVyXTogU2VnbWVudC5JV29yZFtdfX0gd29yZHBvc1xuXHQgKiBAcGFyYW0ge251bWJlcn0gcG9zIOW9k+WJjeS9jee9rlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmnKzoioLopoHliIbor43nmoTmlofmnKxcblx0ICogQHBhcmFtIHtudW1iZXJ9IHRvdGFsX2NvdW50XG5cdCAqIEByZXR1cm5zIHtTZWdtZW50LklXb3JkW11bXX1cblx0ICovXG5cdGdldENodW5rcyh3b3JkcG9zOiB7XG5cdFx0W2luZGV4OiBudW1iZXJdOiBJV29yZFtdO1xuXHR9LCBwb3M6IG51bWJlciwgdGV4dD86IHN0cmluZywgdG90YWxfY291bnQgPSAwKTogSVdvcmRbXVtdXG5cdHtcblx0XHQvKipcblx0XHQgKiDlv73nlaXpgKPlrZdcblx0XHQgKlxuXHRcdCAqIOS+i+Wmgjog5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWKXG5cdFx0ICovXG5cdFx0bGV0IG07XG5cdFx0aWYgKG0gPSB0ZXh0Lm1hdGNoKC9eKCguKylcXDJ7NSx9KS8pKVxuXHRcdHtcblx0XHRcdGxldCBzMSA9IHRleHQuc2xpY2UoMCwgbVsxXS5sZW5ndGgpO1xuXHRcdFx0bGV0IHMyID0gdGV4dC5zbGljZShtWzFdLmxlbmd0aCk7XG5cblx0XHRcdGxldCB3b3JkID0ge1xuXHRcdFx0XHR3OiBzMSxcblx0XHRcdFx0YzogcG9zLFxuXHRcdFx0XHRmOiAwLFxuXHRcdFx0fSBhcyBJV29yZDtcblxuXHRcdFx0bGV0IHJldDogSVdvcmRbXVtdID0gW107XG5cblx0XHRcdGlmIChzMiAhPT0gJycpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBjaHVua3MgPSB0aGlzLmdldENodW5rcyh3b3JkcG9zLCBwb3MgKyBzMS5sZW5ndGgsIHMyLCB0b3RhbF9jb3VudCk7XG5cblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBjaHVua3MubGVuZ3RoOyBqKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaChbd29yZF0uY29uY2F0KGNodW5rc1tqXSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKFt3b3JkXSk7XG5cdFx0XHR9XG5cbi8vXHRcdFx0Y29uc29sZS5kaXIod29yZHBvcyk7XG4vL1xuLy9cdFx0XHRjb25zb2xlLmRpcihyZXQpO1xuLy9cbi8vXHRcdFx0Y29uc29sZS5kaXIoW3BvcywgdGV4dCwgdG90YWxfY291bnRdKTtcblxuXHRcdFx0cmV0dXJuIHJldDtcblx0XHR9XG5cblx0XHR0b3RhbF9jb3VudCsrO1xuXG5cdFx0bGV0IHdvcmRzID0gd29yZHBvc1twb3NdIHx8IFtdO1xuXHRcdC8vIGRlYnVnKCdnZXRDaHVua3M6ICcpO1xuXHRcdC8vIGRlYnVnKHdvcmRzKTtcblx0XHQvLyB0aHJvdyBuZXcgRXJyb3IoKTtcblx0XHRsZXQgcmV0OiBJV29yZFtdW10gPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHdvcmRzLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGxldCB3b3JkID0gd29yZHNbaV07XG5cdFx0XHQvL2RlYnVnKHdvcmQpO1xuXHRcdFx0bGV0IG5leHRjdXIgPSB3b3JkLmMgKyB3b3JkLncubGVuZ3RoO1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBARklYTUVcblx0XHRcdCAqL1xuXHRcdFx0aWYgKCF3b3JkcG9zW25leHRjdXJdKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaChbd29yZF0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodG90YWxfY291bnQgPiB0aGlzLk1BWF9DSFVOS19DT1VOVClcblx0XHRcdHtcblx0XHRcdFx0Ly8gZG8gc29tZXRoaW5nXG5cbi8vXHRcdFx0XHRjb25zb2xlLmxvZyg0NDQsIHdvcmRzLnNsaWNlKGkpKTtcbi8vXHRcdFx0XHRjb25zb2xlLmxvZygzMzMsIHdvcmQpO1xuXG5cdFx0XHRcdGxldCB3MTogSVdvcmRbXSA9IFt3b3JkXTtcblxuXHRcdFx0XHRsZXQgaiA9IG5leHRjdXI7XG5cdFx0XHRcdHdoaWxlIChqIGluIHdvcmRwb3MpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdzIgPSB3b3JkcG9zW2pdWzBdO1xuXG5cdFx0XHRcdFx0aWYgKHcyKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHcxLnB1c2godzIpO1xuXG5cdFx0XHRcdFx0XHRqICs9IHcyLncubGVuZ3RoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0LnB1c2godzEpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdCA9IHRleHQuc2xpY2Uod29yZC53Lmxlbmd0aCk7XG5cblx0XHRcdFx0bGV0IGNodW5rcyA9IHRoaXMuZ2V0Q2h1bmtzKHdvcmRwb3MsIG5leHRjdXIsIHQsIHRvdGFsX2NvdW50KTtcblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBjaHVua3MubGVuZ3RoOyBqKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaChbd29yZF0uY29uY2F0KGNodW5rc1tqXSkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2h1bmtzID0gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR3b3JkcyA9IHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBEaWN0VG9rZW5pemVyXG57XG5cdC8qKlxuXHQgKiDkvb/nlKjnsbvkvLzkuo5NTVNH55qE5YiG6K+N566X5rOVXG5cdCAqIOaJvuWHuuaJgOacieWIhuivjeWPr+iDve+8jOS4u+imgeagueaNruS4gOS4i+WHoOmhueadpeivhOS7t++8mlxuXHQgKlxuXHQgKiB444CB6K+N5pWw6YeP5pyA5bCR77ybXG5cdCAqIGHjgIHor43lubPlnYfpopHnjofmnIDlpKfvvJtcblx0ICogYuOAgeavj+S4quivjemVv+W6puagh+WHhuW3ruacgOWwj++8m1xuXHQgKiBj44CB5pyq6K+G5Yir6K+N5pyA5bCR77ybXG5cdCAqIGTjgIHnrKblkIjor63ms5Xnu5PmnoTpobnvvJrlpoLkuKTkuKrov57nu63nmoTliqjor43lh4/liIbvvIzmlbDor43lkI7pnaLot5/ph4/or43liqDliIbvvJtcblx0ICpcblx0ICog5Y+W5Lul5LiK5Yeg6aG557u85ZCI5o6S5ZCN5pyA5pyA5aW955qEXG5cdCAqL1xuXHRleHBvcnQgdHlwZSBJQXNzZXNzUm93ID0ge1xuXHRcdC8qKlxuXHRcdCAqIOivjeaVsOmHj++8jOi2iuWwj+i2iuWlvVxuXHRcdCAqL1xuXHRcdHg6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDor43mgLvpopHnjofvvIzotorlpKfotorlpb1cblx0XHQgKi9cblx0XHRhOiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICog6K+N5qCH5YeG5beu77yM6LaK5bCP6LaK5aW9XG5cdFx0ICog5q+P5Liq6K+N6ZW/5bqm5qCH5YeG5beu5pyA5bCPXG5cdFx0ICovXG5cdFx0YjogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIOacquivhuWIq+ivje+8jOi2iuWwj+i2iuWlvVxuXHRcdCAqL1xuXHRcdGM6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDnrKblkIjor63ms5Xnu5PmnoTnqIvluqbvvIzotorlpKfotorlpb1cblx0XHQgKiDnrKblkIjor63ms5Xnu5PmnoTpobnvvJrlpoLkuKTkuKrov57nu63nmoTliqjor43lh4/liIbvvIzmlbDor43lkI7pnaLot5/ph4/or43liqDliIZcblx0XHQgKi9cblx0XHRkOiBudW1iZXIsXG5cblx0XHQvKipcblx0XHQgKiDntZDnrpfoqZXliIYo6Ieq5YuV6KiI566XKVxuXHRcdCAqL1xuXHRcdHNjb3JlPzogbnVtYmVyLFxuXHRcdHJlYWRvbmx5IGluZGV4PzogbnVtYmVyLFxuXHR9O1xufVxuXG5leHBvcnQgaW1wb3J0IElBc3Nlc3NSb3cgPSBEaWN0VG9rZW5pemVyLklBc3Nlc3NSb3c7XG5cbmV4cG9ydCBjb25zdCBpbml0ID0gRGljdFRva2VuaXplci5pbml0LmJpbmQoRGljdFRva2VuaXplcikgYXMgSVN1YlRva2VuaXplckNyZWF0ZTxEaWN0VG9rZW5pemVyPjtcblxuZXhwb3J0IGRlZmF1bHQgRGljdFRva2VuaXplcjtcbiJdfQ==