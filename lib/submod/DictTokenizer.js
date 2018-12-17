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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGljdFRva2VuaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRpY3RUb2tlbml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLGdDQUE4RTtBQUk5RSx5Q0FBaUQ7QUFDakQsZ0RBQXNIO0FBR3RILHdDQUF3QztBQUczQixRQUFBLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztBQUUxQzs7OztHQUlHO0FBQ0gsTUFBYSxhQUFjLFNBQVEseUJBQW1CO0lBQXREOztRQUdDOzs7Ozs7Ozs7V0FTRztRQUNILG9CQUFlLEdBQUcsK0JBQXVCLENBQUM7SUFzdUIzQyxDQUFDO0lBanVCQSxNQUFNO1FBRUwsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFbkMsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUMvRjtZQUNDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1NBQzFEO0lBQ0YsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLEtBQWM7UUFFbkIsZUFBZTtRQUNmLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUU1QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7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QUksT0FBTyxFQUNuQjtvQkFDQyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRXZCLElBQUksRUFBRSxFQUNOO3dCQUNDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBRVosQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO3FCQUNqQjt5QkFFRDt3QkFDQyxNQUFNO3FCQUNOO2lCQUNEO2dCQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDYjtpQkFFRDtnQkFDQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWxDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQzlELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUN0QztvQkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ25DO2dCQUVELE1BQU0sR0FBRyxJQUFJLENBQUM7YUFDZDtTQUNEO1FBRUQsS0FBSyxHQUFHLFNBQVMsQ0FBQztRQUVsQixPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7Q0FDRDtBQW52QkQsc0NBbXZCQztBQWtEWSxRQUFBLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQXVDLENBQUM7QUFFakcsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgU3ViU01vZHVsZSwgU3ViU01vZHVsZVRva2VuaXplciwgSVN1YlRva2VuaXplckNyZWF0ZSB9IGZyb20gJy4uL21vZCc7XHJcbi8vIEB0cy1pZ25vcmVcclxuaW1wb3J0IHsgVVN0cmluZyB9IGZyb20gJ3VuaS1zdHJpbmcnO1xyXG5pbXBvcnQgeyBJVGFibGVEaWN0Um93IH0gZnJvbSAnLi4vdGFibGUvZGljdCc7XHJcbmltcG9ydCB7IGhleEFuZEFueSwgdG9IZXggfSBmcm9tICcuLi91dGlsL2luZGV4JztcclxuaW1wb3J0IENIU19OQU1FUywgeyBGQU1JTFlfTkFNRV8xLCBGQU1JTFlfTkFNRV8yLCBTSU5HTEVfTkFNRSwgRE9VQkxFX05BTUVfMSwgRE9VQkxFX05BTUVfMiB9IGZyb20gJy4uL21vZC9DSFNfTkFNRVMnO1xyXG5pbXBvcnQgU2VnbWVudCwgeyBJRElDVCwgSVdvcmQsIElESUNUMiB9IGZyb20gJy4uL1NlZ21lbnQnO1xyXG5pbXBvcnQgeyBkZWJ1ZyB9IGZyb20gJy4uL3V0aWwnO1xyXG5pbXBvcnQgeyBEQVRFVElNRSB9IGZyb20gJy4uL21vZC9jb25zdCc7XHJcbmltcG9ydCBJUE9TVEFHIGZyb20gJy4uL1BPU1RBRyc7XHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9NQVhfQ0hVTktfQ09VTlQgPSA0MDtcclxuXHJcbi8qKlxyXG4gKiDlrZflhbjor4bliKvmqKHlnZdcclxuICpcclxuICogQGF1dGhvciDogIHpm7c8bGVpem9uZ21pbkBnbWFpbC5jb20+XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRGljdFRva2VuaXplciBleHRlbmRzIFN1YlNNb2R1bGVUb2tlbml6ZXJcclxue1xyXG5cclxuXHQvKipcclxuXHQgKiDpmLLmraLlm6DnhKHliIbmrrXlsI7oh7TliIbmnpDpgY7kuYXnlJroh7PotoXpgY7omZXnkIbosqDojbdcclxuXHQgKiDotorpq5jotornsr7mupbkvYbmmK/omZXnkIbmmYLplpPmnIPliqDlgI3miJDplbfnlJroh7PotoXpgY7oqJjmhrbpq5Tog73omZXnkIbnmoTnqIvluqZcclxuXHQgKlxyXG5cdCAqIOaVuOWtl+i2iuWwj+i2iuW/q1xyXG5cdCAqXHJcblx0ICogRkFUQUwgRVJST1I6IENBTExfQU5EX1JFVFJZX0xBU1QgQWxsb2NhdGlvbiBmYWlsZWQgLSBKYXZhU2NyaXB0IGhlYXAgb3V0IG9mIG1lbW9yeVxyXG5cdCAqXHJcblx0ICogQHR5cGUge251bWJlcn1cclxuXHQgKi9cclxuXHRNQVhfQ0hVTktfQ09VTlQgPSBERUZBVUxUX01BWF9DSFVOS19DT1VOVDtcclxuXHJcblx0cHJvdGVjdGVkIF9UQUJMRTogSURJQ1Q8SVdvcmQ+O1xyXG5cdHByb3RlY3RlZCBfVEFCTEUyOiBJRElDVDI8SVdvcmQ+O1xyXG5cclxuXHRfY2FjaGUoKVxyXG5cdHtcclxuXHRcdHN1cGVyLl9jYWNoZSgpO1xyXG5cdFx0dGhpcy5fVEFCTEUgPSB0aGlzLnNlZ21lbnQuZ2V0RGljdCgnVEFCTEUnKTtcclxuXHRcdHRoaXMuX1RBQkxFMiA9IHRoaXMuc2VnbWVudC5nZXREaWN0KCdUQUJMRTInKTtcclxuXHRcdHRoaXMuX1BPU1RBRyA9IHRoaXMuc2VnbWVudC5QT1NUQUc7XHJcblxyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLnNlZ21lbnQub3B0aW9ucy5tYXhDaHVua0NvdW50ID09ICdudW1iZXInICYmIHRoaXMuc2VnbWVudC5vcHRpb25zLm1heENodW5rQ291bnQpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuTUFYX0NIVU5LX0NPVU5UID0gdGhpcy5zZWdtZW50Lm9wdGlvbnMubWF4Q2h1bmtDb3VudDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIOWvueacquivhuWIq+eahOWNleivjei/m+ihjOWIhuivjVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gd29yZHMg5Y2V6K+N5pWw57uEXHJcblx0ICogQHJldHVybiB7YXJyYXl9XHJcblx0ICovXHJcblx0c3BsaXQod29yZHM6IElXb3JkW10pOiBJV29yZFtdXHJcblx0e1xyXG5cdFx0Ly9kZWJ1Zyh3b3Jkcyk7XHJcblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuX1RBQkxFO1xyXG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5fUE9TVEFHO1xyXG5cclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cclxuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcclxuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOyB3b3JkID0gd29yZHNbaV07IGkrKylcclxuXHRcdHtcclxuXHRcdFx0aWYgKHdvcmQucCA+IDApXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8g5LuF5a+55pyq6K+G5Yir55qE6K+N6L+b6KGM5Yy56YWNXHJcblx0XHRcdGxldCB3b3JkaW5mbyA9IHRoaXMubWF0Y2hXb3JkKHdvcmQudywgMCwgd29yZHNbaSAtIDFdKTtcclxuXHRcdFx0aWYgKHdvcmRpbmZvLmxlbmd0aCA8IDEpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8g5YiG56a75Ye65bey6K+G5Yir55qE5Y2V6K+NXHJcblx0XHRcdGxldCBsYXN0YyA9IDA7XHJcblxyXG5cdFx0XHR3b3JkaW5mby5mb3JFYWNoKGZ1bmN0aW9uIChidywgdWkpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZiAoYncuYyA+IGxhc3RjKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJldC5wdXNoKHtcclxuXHRcdFx0XHRcdFx0dzogd29yZC53LnN1YnN0cihsYXN0YywgYncuYyAtIGxhc3RjKSxcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0bGV0IGN3ID0gc2VsZi5jcmVhdGVSYXdUb2tlbih7XHJcblx0XHRcdFx0XHR3OiBidy53LFxyXG5cdFx0XHRcdFx0ZjogYncuZixcclxuXHRcdFx0XHR9LCBUQUJMRVtidy53XSk7XHJcblxyXG5cdFx0XHRcdHJldC5wdXNoKGN3KTtcclxuXHJcblx0XHRcdFx0LypcclxuXHRcdFx0XHRyZXQucHVzaCh7XHJcblx0XHRcdFx0XHR3OiBidy53LFxyXG5cdFx0XHRcdFx0cDogd3cucCxcclxuXHRcdFx0XHRcdGY6IGJ3LmYsXHJcblx0XHRcdFx0XHRzOiB3dy5zLFxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdCovXHJcblx0XHRcdFx0bGFzdGMgPSBidy5jICsgYncudy5sZW5ndGg7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0bGV0IGxhc3R3b3JkID0gd29yZGluZm9bd29yZGluZm8ubGVuZ3RoIC0gMV07XHJcblx0XHRcdGlmIChsYXN0d29yZC5jICsgbGFzdHdvcmQudy5sZW5ndGggPCB3b3JkLncubGVuZ3RoKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IGN3ID0gc2VsZi5jcmVhdGVSYXdUb2tlbih7XHJcblx0XHRcdFx0XHR3OiB3b3JkLncuc3Vic3RyKGxhc3R3b3JkLmMgKyBsYXN0d29yZC53Lmxlbmd0aCksXHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdHJldC5wdXNoKGN3KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG5cclxuXHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuXHQvKipcclxuXHQgKiDljLnphY3ljZXor43vvIzov5Tlm57nm7jlhbPkv6Hmga9cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IOaWh+acrFxyXG5cdCAqIEBwYXJhbSB7aW50fSBjdXIg5byA5aeL5L2N572uXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IHByZXdvcmQg5LiK5LiA5Liq5Y2V6K+NXHJcblx0ICogQHJldHVybiB7YXJyYXl9ICDov5Tlm57moLzlvI8gICB7dzogJ+WNleivjScsIGM6IOW8gOWni+S9jee9rn1cclxuXHQgKi9cclxuXHRwcm90ZWN0ZWQgbWF0Y2hXb3JkKHRleHQ6IHN0cmluZywgY3VyOiBudW1iZXIsIHByZXdvcmQ6IElXb3JkKVxyXG5cdHtcclxuXHRcdGlmIChpc05hTihjdXIpKSBjdXIgPSAwO1xyXG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xyXG5cdFx0bGV0IHMgPSBmYWxzZTtcclxuXHJcblx0XHRjb25zdCBUQUJMRTIgPSB0aGlzLl9UQUJMRTI7XHJcblxyXG5cdFx0Ly8g5Yy56YWN5Y+v6IO95Ye6546w55qE5Y2V6K+NXHJcblx0XHR3aGlsZSAoY3VyIDwgdGV4dC5sZW5ndGgpXHJcblx0XHR7XHJcblx0XHRcdGZvciAobGV0IGkgaW4gVEFCTEUyKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IHcgPSB0ZXh0LnN1YnN0cihjdXIsIGkgYXMgYW55IGFzIG51bWJlcik7XHJcblx0XHRcdFx0aWYgKHcgaW4gVEFCTEUyW2ldKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJldC5wdXNoKHtcclxuXHRcdFx0XHRcdFx0dzogdyxcclxuXHRcdFx0XHRcdFx0YzogY3VyLFxyXG5cdFx0XHRcdFx0XHRmOiBUQUJMRTJbaV1bd10uZixcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRjdXIrKztcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5maWx0ZXJXb3JkKHJldCwgcHJld29yZCwgdGV4dCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiDpgInmi6nmnIDmnInlj6/og73ljLnphY3nmoTljZXor41cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeS/oeaBr+aVsOe7hFxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwcmV3b3JkIOS4iuS4gOS4quWNleivjVxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IOacrOiKguimgeWIhuivjeeahOaWh+acrFxyXG5cdCAqIEByZXR1cm4ge2FycmF5fVxyXG5cdCAqL1xyXG5cdHByb3RlY3RlZCBmaWx0ZXJXb3JkKHdvcmRzOiBJV29yZFtdLCBwcmV3b3JkOiBJV29yZCwgdGV4dDogc3RyaW5nKVxyXG5cdHtcclxuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5fVEFCTEU7XHJcblx0XHRjb25zdCBQT1NUQUcgPSB0aGlzLl9QT1NUQUc7XHJcblx0XHRsZXQgcmV0OiBJV29yZFtdID0gW107XHJcblxyXG5cdFx0Ly8g5bCG5Y2V6K+N5oyJ5L2N572u5YiG57uEXHJcblx0XHRsZXQgd29yZHBvcyA9IHRoaXMuZ2V0UG9zSW5mbyh3b3JkcywgdGV4dCk7XHJcblx0XHQvL2RlYnVnKHdvcmRwb3MpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICog5L2/55So57G75Ly85LqOTU1TR+eahOWIhuivjeeul+azlVxyXG5cdFx0ICog5om+5Ye65omA5pyJ5YiG6K+N5Y+v6IO977yM5Li76KaB5qC55o2u5LiA5LiL5Yeg6aG55p2l6K+E5Lu377yaXHJcblx0XHQgKiB444CB6K+N5pWw6YeP5pyA5bCR77ybXHJcblx0XHQgKiBh44CB6K+N5bmz5Z2H6aKR546H5pyA5aSn77ybXHJcblx0XHQgKiBi44CB5q+P5Liq6K+N6ZW/5bqm5qCH5YeG5beu5pyA5bCP77ybXHJcblx0XHQgKiBj44CB5pyq6K+G5Yir6K+N5pyA5bCR77ybXHJcblx0XHQgKiBk44CB56ym5ZCI6K+t5rOV57uT5p6E6aG577ya5aaC5Lik5Liq6L+e57ut55qE5Yqo6K+N5YeP5YiG77yM5pWw6K+N5ZCO6Z2i6Lef6YeP6K+N5Yqg5YiG77ybXHJcblx0XHQgKiDlj5bku6XkuIrlh6Dpobnnu7zlkIjmjpLlkI3mnIDmnIDlpb3nmoRcclxuXHRcdCAqL1xyXG5cdFx0bGV0IGNodW5rcyA9IHRoaXMuZ2V0Q2h1bmtzKHdvcmRwb3MsIDAsIHRleHQpO1xyXG5cdFx0Ly9kZWJ1ZyhjaHVua3MpO1xyXG5cdFx0bGV0IGFzc2VzczogQXJyYXk8SUFzc2Vzc1Jvdz4gPSBbXTsgIC8vIOivhOS7t+ihqFxyXG5cclxuXHRcdC8vY29uc29sZS5sb2coY2h1bmtzKTtcclxuXHJcblx0XHQvLyDlr7nlkITkuKrliIbmlK/lsLHooYzor4TkvLBcclxuXHRcdGZvciAobGV0IGkgPSAwLCBjaHVuazogSVdvcmRbXTsgY2h1bmsgPSBjaHVua3NbaV07IGkrKylcclxuXHRcdHtcclxuXHRcdFx0YXNzZXNzW2ldID0ge1xyXG5cdFx0XHRcdHg6IGNodW5rLmxlbmd0aCxcclxuXHRcdFx0XHRhOiAwLFxyXG5cdFx0XHRcdGI6IDAsXHJcblx0XHRcdFx0YzogMCxcclxuXHRcdFx0XHRkOiAwLFxyXG5cclxuXHRcdFx0XHRpbmRleDogaSxcclxuXHRcdFx0fTtcclxuXHRcdFx0Ly8g6K+N5bmz5Z2H6ZW/5bqmXHJcblx0XHRcdGxldCBzcCA9IHRleHQubGVuZ3RoIC8gY2h1bmsubGVuZ3RoO1xyXG5cdFx0XHQvLyDlj6XlrZDnu4/luLjljIXlkKvnmoTor63ms5Xnu5PmnoRcclxuXHRcdFx0bGV0IGhhc19EX1YgPSBmYWxzZTsgIC8vIOaYr+WQpuWMheWQq+WKqOivjVxyXG5cclxuXHRcdFx0Ly8g6YGN5Y6G5ZCE5Liq6K+NXHJcblx0XHRcdGxldCBwcmV3OiBJV29yZDtcclxuXHJcblx0XHRcdGlmIChwcmV3b3JkKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0LypcclxuXHRcdFx0XHRwcmV3ID0ge1xyXG5cdFx0XHRcdFx0dzogcHJld29yZC53LFxyXG5cdFx0XHRcdFx0cDogcHJld29yZC5wLFxyXG5cdFx0XHRcdFx0ZjogcHJld29yZC5mLFxyXG5cdFx0XHRcdFx0czogcHJld29yZC5zLFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0XHRwcmV3ID0gdGhpcy5jcmVhdGVSYXdUb2tlbihwcmV3b3JkKTtcclxuXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0cHJldyA9IG51bGw7XHJcblx0XHRcdH1cclxuXHRcdFx0Zm9yIChsZXQgaiA9IDAsIHc6IElXb3JkOyB3ID0gY2h1bmtbal07IGorKylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGlmICh3LncgaW4gVEFCTEUpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0dy5wID0gVEFCTEVbdy53XS5wO1xyXG5cdFx0XHRcdFx0YXNzZXNzW2ldLmEgKz0gdy5mOyAgIC8vIOaAu+ivjemikVxyXG5cclxuXHRcdFx0XHRcdGlmIChqID09IDAgJiYgIXByZXdvcmQgJiYgKHcucCAmIFBPU1RBRy5EX1YpKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHQvKipcclxuXHRcdFx0XHRcdFx0ICog5bCH56ys5LiA5YCL5a2X5Lmf6KiI566X6YCy5Y675piv5ZCm5YyF5ZCr5YuV6KmeXHJcblx0XHRcdFx0XHRcdCAqL1xyXG5cdFx0XHRcdFx0XHRoYXNfRF9WID0gdHJ1ZTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHQvLyA9PT09PT09PT09PT09PT09IOajgOafpeivreazlee7k+aehCA9PT09PT09PT09PT09PT09PT09XHJcblx0XHRcdFx0XHRpZiAocHJldylcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5LiK5LiA5Liq6K+N5piv5pWw6K+N5LiU5b2T5YmN6K+N5piv6YeP6K+N77yI5Y2V5L2N77yJ77yM5YiZ5Yqg5YiGXHJcblx0XHRcdFx0XHRcdGlmIChcclxuXHRcdFx0XHRcdFx0XHQocHJldy5wICYgUE9TVEFHLkFfTSlcclxuXHRcdFx0XHRcdFx0XHQmJlxyXG5cdFx0XHRcdFx0XHRcdChcclxuXHRcdFx0XHRcdFx0XHRcdCgody5wICYgUE9TVEFHLkFfUSkpXHJcblx0XHRcdFx0XHRcdFx0XHR8fCB3LncgaW4gREFURVRJTUVcclxuXHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdC8vIOWmguaenOW9k+WJjeivjeaYr+WKqOivjVxyXG5cdFx0XHRcdFx0XHRpZiAoKHcucCAmIFBPU1RBRy5EX1YpKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aGFzX0RfViA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0Ly8g5aaC5p6c5piv6L+e57ut55qE5Lik5Liq5Yqo6K+N77yM5YiZ5YeP5YiGXHJcblx0XHRcdFx0XHRcdFx0Ly9pZiAoKHByZXcucCAmIFBPU1RBRy5EX1YpID4gMClcclxuXHRcdFx0XHRcdFx0XHQvL2Fzc2Vzc1tpXS5kLS07XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8qXHJcblx0XHRcdFx0XHRcdFx0Ly8g5aaC5p6c5pivIOW9ouWuueivjSArIOWKqOivje+8jOWImeWKoOWIhlxyXG5cdFx0XHRcdFx0XHRcdGlmICgocHJldy5wICYgUE9TVEFHLkRfQSkpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8g5aaC5p6c5pivIOWJr+ivjSArIOWKqOivje+8jOWImeWKoOWIhlxyXG5cdFx0XHRcdFx0XHRcdGlmIChwcmV3LnAgJiBQT1NUQUcuRF9EKVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdC8vIOWmguaenOaYr+WcsOWMuuWQjeOAgeacuuaehOWQjeaIluW9ouWuueivje+8jOWQjumdoui3n+WcsOWMuuOAgeacuuaehOOAgeS7o+ivjeOAgeWQjeivjeetie+8jOWImeWKoOWIhlxyXG5cdFx0XHRcdFx0XHRpZiAoKFxyXG5cdFx0XHRcdFx0XHRcdFx0KHByZXcucCAmIFBPU1RBRy5BX05TKVxyXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHByZXcucCAmIFBPU1RBRy5BX05UKVxyXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHByZXcucCAmIFBPU1RBRy5EX0EpXHJcblx0XHRcdFx0XHRcdFx0KSAmJlxyXG5cdFx0XHRcdFx0XHRcdChcclxuXHRcdFx0XHRcdFx0XHRcdCh3LnAgJiBQT1NUQUcuRF9OKVxyXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05SKVxyXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05TKVxyXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05aKVxyXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05UKVxyXG5cdFx0XHRcdFx0XHRcdCkpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDmlrnkvY3or40gKyDmlbDph4/or43vvIzliJnliqDliIZcclxuXHRcdFx0XHRcdFx0aWYgKFxyXG5cdFx0XHRcdFx0XHRcdChwcmV3LnAgJiBQT1NUQUcuRF9GKVxyXG5cdFx0XHRcdFx0XHRcdCYmXHJcblx0XHRcdFx0XHRcdFx0KFxyXG5cdFx0XHRcdFx0XHRcdFx0KHcucCAmIFBPU1RBRy5BX00pXHJcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkRfTVEpXHJcblx0XHRcdFx0XHRcdFx0KSlcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdC8vZGVidWcocHJldywgdyk7XHJcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK8g5aeTICsg5ZCN6K+N77yM5YiZ5Yqg5YiGXHJcblx0XHRcdFx0XHRcdGlmIChcclxuXHRcdFx0XHRcdFx0XHQoXHJcblx0XHRcdFx0XHRcdFx0XHRwcmV3LncgaW4gRkFNSUxZX05BTUVfMVxyXG5cdFx0XHRcdFx0XHRcdFx0fHwgcHJldy53IGluIEZBTUlMWV9OQU1FXzJcclxuXHRcdFx0XHRcdFx0XHQpICYmXHJcblx0XHRcdFx0XHRcdFx0KFxyXG5cdFx0XHRcdFx0XHRcdFx0KHcucCAmIFBPU1RBRy5EX04pXHJcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkFfTlopXHJcblx0XHRcdFx0XHRcdFx0KSlcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdC8vZGVidWcocHJldywgdyk7XHJcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0LyoqXHJcblx0XHRcdFx0XHRcdCAqIOWcsOWQjS/lpITmiYAgKyDmlrnkvY1cclxuXHRcdFx0XHRcdFx0ICovXHJcblx0XHRcdFx0XHRcdGlmIChoZXhBbmRBbnkocHJldy5wXHJcblx0XHRcdFx0XHRcdFx0LCBQT1NUQUcuRF9TXHJcblx0XHRcdFx0XHRcdFx0LCBQT1NUQUcuQV9OUyxcclxuXHRcdFx0XHRcdFx0KSAmJiBoZXhBbmRBbnkody5wXHJcblx0XHRcdFx0XHRcdFx0LCBQT1NUQUcuRF9GLFxyXG5cdFx0XHRcdFx0XHQpKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC41O1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHQvLyDmjqLmtYvkuIvkuIDkuKror41cclxuXHRcdFx0XHRcdFx0bGV0IG5leHR3ID0gY2h1bmtbaiArIDFdO1xyXG5cdFx0XHRcdFx0XHRpZiAobmV4dHcpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRpZiAobmV4dHcudyBpbiBUQUJMRSlcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRuZXh0dy5wID0gVEFCTEVbbmV4dHcud10ucDtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGxldCBfdGVtcF9vazogYm9vbGVhbiA9IHRydWU7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8qKlxyXG5cdFx0XHRcdFx0XHRcdCAqIOWmguaenOW9k+WJjeaYr+KAnOeahOKAnSsg5ZCN6K+N77yM5YiZ5Yqg5YiGXHJcblx0XHRcdFx0XHRcdFx0ICovXHJcblx0XHRcdFx0XHRcdFx0aWYgKFxyXG5cdFx0XHRcdFx0XHRcdFx0KHcudyA9PSAn55qEJyB8fCB3LncgPT0gJ+S5iycpXHJcblx0XHRcdFx0XHRcdFx0XHQmJiBuZXh0dy5wICYmIChcclxuXHRcdFx0XHRcdFx0XHRcdFx0KG5leHR3LnAgJiBQT1NUQUcuRF9OKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCAobmV4dHcucCAmIFBPU1RBRy5EX1YpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkFfTlIpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkFfTlMpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkFfTlopXHJcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkFfTlQpXHJcblx0XHRcdFx0XHRcdFx0XHQpKVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kICs9IDEuNTtcclxuXHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdC8qKlxyXG5cdFx0XHRcdFx0XHRcdCAqIOWmguaenOaYr+i/nuivje+8jOWJjeWQjuS4pOS4quivjeivjeaAp+ebuOWQjOWImeWKoOWIhlxyXG5cdFx0XHRcdFx0XHRcdCAqL1xyXG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKHByZXcucCAmJiAody5wICYgUE9TVEFHLkRfQykpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IHAgPSBwcmV3LnAgJiBuZXh0dy5wO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGlmIChwcmV3LnAgPT09IG5leHR3LnApXHJcblx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XHJcblx0XHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRlbHNlIGlmIChwKVxyXG5cdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAwLjI1O1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRfdGVtcF9vayA9IGZhbHNlO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHAgJiBQT1NUQUcuRF9OKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC43NTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKF90ZW1wX29rICYmIG5leHR3LnAgJiYgKHcucCAmIFBPU1RBRy5EX1ApKVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChuZXh0dy5wICYgUE9TVEFHLkFfTlIgJiYgKFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRuZXh0dy53Lmxlbmd0aCA+IDFcclxuXHRcdFx0XHRcdFx0XHRcdCkpXHJcblx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocHJldy53ID09ICfnmoQnKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0LyoqXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0ICog55qEICsg5LuL6KmeICsg5Lq65ZCNXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0ICovXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRfdGVtcF9vayA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyBARklYTUUg5pq05Yqb6Kej5rG6IOS4ieWkqeWQjiDnmoTllY/poYxcclxuXHRcdFx0XHRcdFx0XHRpZiAobmV4dHcudyA9PSAn5ZCOJyAmJiB3LnAgJiBQT1NUQUcuRF9UICYmIGhleEFuZEFueShwcmV3LnAsXHJcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9NUSxcclxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5BX00sXHJcblx0XHRcdFx0XHRcdFx0KSlcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHQvLyBARklYTUUg5Yiw5rmW5Lit6ZaT5ZCO5omL57WC5pa86IO95LyR5oGv5LqGXHJcblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoXHJcblx0XHRcdFx0XHRcdFx0XHQoXHJcblx0XHRcdFx0XHRcdFx0XHRcdG5leHR3LncgPT0gJ+WQjidcclxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgbmV4dHcudyA9PSAn5b6MJ1xyXG5cdFx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdFx0JiYgaGV4QW5kQW55KHcucCxcclxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX0YsXHJcblx0XHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoXHJcblx0XHRcdFx0XHRcdFx0XHQoXHJcblx0XHRcdFx0XHRcdFx0XHRcdHcudyA9PSAn5ZCOJ1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCB3LncgPT0gJ+W+jCdcclxuXHRcdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHRcdCYmIGhleEFuZEFueShwcmV3LnAsXHJcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9GLFxyXG5cdFx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdFx0JiYgaGV4QW5kQW55KG5leHR3LnAsXHJcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9OLFxyXG5cdFx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Ly8g5pyq6K+G5Yir55qE6K+N5pWw6YePXHJcblx0XHRcdFx0XHRhc3Nlc3NbaV0uYysrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvLyDmoIflh4blt65cclxuXHRcdFx0XHRhc3Nlc3NbaV0uYiArPSBNYXRoLnBvdyhzcCAtIHcudy5sZW5ndGgsIDIpO1xyXG5cdFx0XHRcdHByZXcgPSBjaHVua1tqXTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8g5aaC5p6c5Y+l5a2Q5Lit5YyF5ZCr5LqG6Iez5bCR5LiA5Liq5Yqo6K+NXHJcblx0XHRcdGlmIChoYXNfRF9WID09PSBmYWxzZSkgYXNzZXNzW2ldLmQgLT0gMC41O1xyXG5cclxuXHRcdFx0YXNzZXNzW2ldLmEgPSBhc3Nlc3NbaV0uYSAvIGNodW5rLmxlbmd0aDtcclxuXHRcdFx0YXNzZXNzW2ldLmIgPSBhc3Nlc3NbaV0uYiAvIGNodW5rLmxlbmd0aDtcclxuXHRcdH1cclxuXHJcblx0XHQvL2NvbnNvbGUuZGlyKGFzc2Vzcyk7XHJcblxyXG5cdFx0Ly8g6K6h566X5o6S5ZCNXHJcblx0XHRsZXQgdG9wID0gdGhpcy5nZXRUb3BzKGFzc2Vzcyk7XHJcblx0XHRsZXQgY3VycmNodW5rID0gY2h1bmtzW3RvcF07XHJcblxyXG5cdFx0aWYgKGZhbHNlKVxyXG5cdFx0e1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKGFzc2Vzcyk7XHJcblx0XHRcdC8vY29uc29sZS5sb2coT2JqZWN0LmVudHJpZXMoY2h1bmtzKSk7XHJcblx0XHRcdGNvbnNvbGUuZGlyKE9iamVjdC5lbnRyaWVzKGNodW5rcylcclxuXHRcdFx0XHQubWFwKChbaSwgY2h1bmtdKSA9PiB7IHJldHVybiB7IGksIGFzc2VzOiBhc3Nlc3NbaSBhcyB1bmtub3duIGFzIG51bWJlcl0sIGNodW5rIH0gfSksIHsgZGVwdGg6IDUgfSk7XHJcblx0XHRcdGNvbnNvbGUuZGlyKHsgaTogdG9wLCBhc3NlczogYXNzZXNzW3RvcF0sIGN1cnJjaHVuayB9KTtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyh0b3ApO1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKGN1cnJjaHVuayk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8g5YmU6Zmk5LiN6IO96K+G5Yir55qE6K+NXHJcblx0XHRmb3IgKGxldCBpID0gMCwgd29yZDogSVdvcmQ7IHdvcmQgPSBjdXJyY2h1bmtbaV07IGkrKylcclxuXHRcdHtcclxuXHRcdFx0aWYgKCEod29yZC53IGluIFRBQkxFKSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGN1cnJjaHVuay5zcGxpY2UoaS0tLCAxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0ID0gY3VycmNodW5rO1xyXG5cclxuXHRcdC8vIOippuWcluS4u+WLlea4hemZpOiomOaGtumrlFxyXG5cdFx0YXNzZXNzID0gdW5kZWZpbmVkO1xyXG5cdFx0Y2h1bmtzID0gdW5kZWZpbmVkO1xyXG5cclxuXHRcdC8vZGVidWcocmV0KTtcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiDor4Tku7fmjpLlkI1cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhc3Nlc3NcclxuXHQgKiBAcmV0dXJuIHtvYmplY3R9XHJcblx0ICovXHJcblx0Z2V0VG9wcyhhc3Nlc3M6IEFycmF5PElBc3Nlc3NSb3c+KVxyXG5cdHtcclxuXHRcdC8vZGVidWcoYXNzZXNzKTtcclxuXHRcdC8vIOWPluWQhOmhueacgOWkp+WAvFxyXG5cdFx0bGV0IHRvcDogSUFzc2Vzc1JvdyA9IHtcclxuXHRcdFx0eDogYXNzZXNzWzBdLngsXHJcblx0XHRcdGE6IGFzc2Vzc1swXS5hLFxyXG5cdFx0XHRiOiBhc3Nlc3NbMF0uYixcclxuXHRcdFx0YzogYXNzZXNzWzBdLmMsXHJcblx0XHRcdGQ6IGFzc2Vzc1swXS5kLFxyXG5cdFx0fTtcclxuXHJcblx0XHRmb3IgKGxldCBpID0gMSwgYXNzOiBJQXNzZXNzUm93OyBhc3MgPSBhc3Nlc3NbaV07IGkrKylcclxuXHRcdHtcclxuXHRcdFx0aWYgKGFzcy5hID4gdG9wLmEpIHRvcC5hID0gYXNzLmE7ICAvLyDlj5bmnIDlpKflubPlnYfor43popFcclxuXHRcdFx0aWYgKGFzcy5iIDwgdG9wLmIpIHRvcC5iID0gYXNzLmI7ICAvLyDlj5bmnIDlsI/moIflh4blt65cclxuXHRcdFx0aWYgKGFzcy5jID4gdG9wLmMpIHRvcC5jID0gYXNzLmM7ICAvLyDlj5bmnIDlpKfmnKror4bliKvor41cclxuXHRcdFx0aWYgKGFzcy5kIDwgdG9wLmQpIHRvcC5kID0gYXNzLmQ7ICAvLyDlj5bmnIDlsI/or63ms5XliIbmlbBcclxuXHRcdFx0aWYgKGFzcy54ID4gdG9wLngpIHRvcC54ID0gYXNzLng7ICAvLyDlj5bmnIDlpKfljZXor43mlbDph49cclxuXHRcdH1cclxuXHRcdC8vZGVidWcodG9wKTtcclxuXHJcblx0XHQvLyDor4TkvLDmjpLlkI1cclxuXHRcdGxldCB0b3BzOiBudW1iZXJbXSA9IFtdO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGFzczogSUFzc2Vzc1JvdzsgYXNzID0gYXNzZXNzW2ldOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdHRvcHNbaV0gPSAwO1xyXG5cdFx0XHQvLyDor43mlbDph4/vvIzotorlsI/otorlpb1cclxuXHRcdFx0dG9wc1tpXSArPSAodG9wLnggLSBhc3MueCkgKiAxLjU7XHJcblx0XHRcdC8vIOivjeaAu+mikeeOh++8jOi2iuWkp+i2iuWlvVxyXG5cdFx0XHRpZiAoYXNzLmEgPj0gdG9wLmEpIHRvcHNbaV0gKz0gMTtcclxuXHRcdFx0Ly8g6K+N5qCH5YeG5beu77yM6LaK5bCP6LaK5aW9XHJcblx0XHRcdGlmIChhc3MuYiA8PSB0b3AuYikgdG9wc1tpXSArPSAxO1xyXG5cdFx0XHQvLyDmnKror4bliKvor43vvIzotorlsI/otorlpb1cclxuXHRcdFx0dG9wc1tpXSArPSAodG9wLmMgLSBhc3MuYyk7Ly9kZWJ1Zyh0b3BzW2ldKTtcclxuXHRcdFx0Ly8g56ym5ZCI6K+t5rOV57uT5p6E56iL5bqm77yM6LaK5aSn6LaK5aW9XHJcblx0XHRcdHRvcHNbaV0gKz0gKGFzcy5kIDwgMCA/IHRvcC5kICsgYXNzLmQgOiBhc3MuZCAtIHRvcC5kKSAqIDE7XHJcblxyXG5cdFx0XHRhc3Muc2NvcmUgPSB0b3BzW2ldO1xyXG5cclxuXHRcdFx0Ly9kZWJ1Zyh0b3BzW2ldKTtkZWJ1ZygnLS0tJyk7XHJcblx0XHR9XHJcblx0XHQvL2RlYnVnKHRvcHMuam9pbignICAnKSk7XHJcblxyXG5cdFx0Ly9jb25zb2xlLmxvZyh0b3BzKTtcclxuXHRcdC8vY29uc29sZS5sb2coYXNzZXNzKTtcclxuXHJcblx0XHQvL2NvbnN0IG9sZF9tZXRob2QgPSB0cnVlO1xyXG5cdFx0Y29uc3Qgb2xkX21ldGhvZCA9IGZhbHNlO1xyXG5cclxuXHRcdC8vIOWPluWIhuaVsOacgOmrmOeahFxyXG5cdFx0bGV0IGN1cnJpID0gMDtcclxuXHRcdGxldCBtYXhzID0gdG9wc1swXTtcclxuXHRcdGZvciAobGV0IGkgaW4gdG9wcylcclxuXHRcdHtcclxuXHRcdFx0bGV0IHMgPSB0b3BzW2ldO1xyXG5cdFx0XHRpZiAocyA+IG1heHMpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRjdXJyaSA9IGkgYXMgYW55IGFzIG51bWJlcjtcclxuXHRcdFx0XHRtYXhzID0gcztcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmIChzID09IG1heHMpXHJcblx0XHRcdHtcclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgKiDlpoLmnpzliIbmlbDnm7jlkIzvvIzliJnmoLnmja7or43plb/luqbjgIHmnKror4bliKvor43kuKrmlbDlkozlubPlnYfpopHnjofmnaXpgInmi6lcclxuXHRcdFx0XHQgKlxyXG5cdFx0XHRcdCAqIOWmguaenOS+neeEtuWQjOWIhu+8jOWJh+S/neaMgeS4jeiuilxyXG5cdFx0XHRcdCAqL1xyXG5cdFx0XHRcdGxldCBhID0gMDtcclxuXHRcdFx0XHRsZXQgYiA9IDA7XHJcblx0XHRcdFx0aWYgKGFzc2Vzc1tpXS5jIDwgYXNzZXNzW2N1cnJpXS5jKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGErKztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBpZiAoYXNzZXNzW2ldLmMgIT09IGFzc2Vzc1tjdXJyaV0uYylcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRiKys7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0uYSA+IGFzc2Vzc1tjdXJyaV0uYSlcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRhKys7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2UgaWYgKGFzc2Vzc1tpXS5hICE9PSBhc3Nlc3NbY3VycmldLmEpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0YisrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoYXNzZXNzW2ldLnggPCBhc3Nlc3NbY3VycmldLngpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0YSsrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0ueCAhPT0gYXNzZXNzW2N1cnJpXS54KVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGIrKztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGEgPiBiKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGN1cnJpID0gaSBhcyBhbnkgYXMgbnVtYmVyO1xyXG5cdFx0XHRcdFx0bWF4cyA9IHM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vZGVidWcoeyBpLCBzLCBtYXhzLCBjdXJyaSB9KTtcclxuXHRcdH1cclxuXHRcdC8vZGVidWcoJ21heDogaT0nICsgY3VycmkgKyAnLCBzPScgKyB0b3BzW2N1cnJpXSk7XHJcblx0XHRyZXR1cm4gY3Vycmk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiDlsIbljZXor43mjInnhafkvY3nva7mjpLliJdcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHRcclxuXHQgKiBAcmV0dXJuIHtvYmplY3R9XHJcblx0ICovXHJcblx0Z2V0UG9zSW5mbyh3b3JkczogSVdvcmRbXSwgdGV4dDogc3RyaW5nKToge1xyXG5cdFx0W2luZGV4OiBudW1iZXJdOiBJV29yZFtdO1xyXG5cdH1cclxuXHR7XHJcblx0XHRsZXQgd29yZHBvcyA9IHt9O1xyXG5cdFx0Ly8g5bCG5Y2V6K+N5oyJ5L2N572u5YiG57uEXHJcblx0XHRmb3IgKGxldCBpID0gMCwgd29yZDsgd29yZCA9IHdvcmRzW2ldOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdGlmICghd29yZHBvc1t3b3JkLmNdKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0d29yZHBvc1t3b3JkLmNdID0gW107XHJcblx0XHRcdH1cclxuXHRcdFx0d29yZHBvc1t3b3JkLmNdLnB1c2god29yZCk7XHJcblx0XHR9XHJcblx0XHQvLyDmjInljZXlrZfliIblibLmlofmnKzvvIzloavooaXnqbrnvLrnmoTkvY3nva5cclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGV4dC5sZW5ndGg7IGkrKylcclxuXHRcdHtcclxuXHRcdFx0aWYgKCF3b3JkcG9zW2ldKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0d29yZHBvc1tpXSA9IFt7IHc6IHRleHQuY2hhckF0KGkpLCBjOiBpLCBmOiAwIH1dO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHdvcmRwb3M7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiDlj5bmiYDmnInliIbmlK9cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7e1twOiBudW1iZXJdOiBTZWdtZW50LklXb3JkW119fSB3b3JkcG9zXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHBvcyDlvZPliY3kvY3nva5cclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmnKzoioLopoHliIbor43nmoTmlofmnKxcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gdG90YWxfY291bnRcclxuXHQgKiBAcmV0dXJucyB7U2VnbWVudC5JV29yZFtdW119XHJcblx0ICovXHJcblx0Z2V0Q2h1bmtzKHdvcmRwb3M6IHtcclxuXHRcdFtpbmRleDogbnVtYmVyXTogSVdvcmRbXTtcclxuXHR9LCBwb3M6IG51bWJlciwgdGV4dD86IHN0cmluZywgdG90YWxfY291bnQgPSAwKTogSVdvcmRbXVtdXHJcblx0e1xyXG5cdFx0LyoqXHJcblx0XHQgKiDlv73nlaXpgKPlrZdcclxuXHRcdCAqXHJcblx0XHQgKiDkvovlpoI6IOWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWVilxyXG5cdFx0ICovXHJcblx0XHRsZXQgbTtcclxuXHRcdGlmIChtID0gdGV4dC5tYXRjaCgvXigoLispXFwyezUsfSkvKSlcclxuXHRcdHtcclxuXHRcdFx0bGV0IHMxID0gdGV4dC5zbGljZSgwLCBtWzFdLmxlbmd0aCk7XHJcblx0XHRcdGxldCBzMiA9IHRleHQuc2xpY2UobVsxXS5sZW5ndGgpO1xyXG5cclxuXHRcdFx0bGV0IHdvcmQgPSB7XHJcblx0XHRcdFx0dzogczEsXHJcblx0XHRcdFx0YzogcG9zLFxyXG5cdFx0XHRcdGY6IDAsXHJcblx0XHRcdH0gYXMgSVdvcmQ7XHJcblxyXG5cdFx0XHRsZXQgcmV0OiBJV29yZFtdW10gPSBbXTtcclxuXHJcblx0XHRcdGlmIChzMiAhPT0gJycpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRsZXQgY2h1bmtzID0gdGhpcy5nZXRDaHVua3Mod29yZHBvcywgcG9zICsgczEubGVuZ3RoLCBzMiwgdG90YWxfY291bnQpO1xyXG5cclxuXHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGNodW5rcy5sZW5ndGg7IGorKylcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXQucHVzaChbd29yZF0uY29uY2F0KGNodW5rc1tqXSkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyZXQucHVzaChbd29yZF0pO1xyXG5cdFx0XHR9XHJcblxyXG4vL1x0XHRcdGNvbnNvbGUuZGlyKHdvcmRwb3MpO1xyXG4vL1xyXG4vL1x0XHRcdGNvbnNvbGUuZGlyKHJldCk7XHJcbi8vXHJcbi8vXHRcdFx0Y29uc29sZS5kaXIoW3BvcywgdGV4dCwgdG90YWxfY291bnRdKTtcclxuXHJcblx0XHRcdHJldHVybiByZXQ7XHJcblx0XHR9XHJcblxyXG5cdFx0dG90YWxfY291bnQrKztcclxuXHJcblx0XHRsZXQgd29yZHMgPSB3b3JkcG9zW3Bvc10gfHwgW107XHJcblx0XHQvLyBkZWJ1ZygnZ2V0Q2h1bmtzOiAnKTtcclxuXHRcdC8vIGRlYnVnKHdvcmRzKTtcclxuXHRcdC8vIHRocm93IG5ldyBFcnJvcigpO1xyXG5cdFx0bGV0IHJldDogSVdvcmRbXVtdID0gW107XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHdvcmRzLmxlbmd0aDsgaSsrKVxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgd29yZCA9IHdvcmRzW2ldO1xyXG5cdFx0XHQvL2RlYnVnKHdvcmQpO1xyXG5cdFx0XHRsZXQgbmV4dGN1ciA9IHdvcmQuYyArIHdvcmQudy5sZW5ndGg7XHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBARklYTUVcclxuXHRcdFx0ICovXHJcblx0XHRcdGlmICghd29yZHBvc1tuZXh0Y3VyXSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHJldC5wdXNoKFt3b3JkXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAodG90YWxfY291bnQgPiB0aGlzLk1BWF9DSFVOS19DT1VOVClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIGRvIHNvbWV0aGluZ1xyXG5cclxuLy9cdFx0XHRcdGNvbnNvbGUubG9nKDQ0NCwgd29yZHMuc2xpY2UoaSkpO1xyXG4vL1x0XHRcdFx0Y29uc29sZS5sb2coMzMzLCB3b3JkKTtcclxuXHJcblx0XHRcdFx0bGV0IHcxOiBJV29yZFtdID0gW3dvcmRdO1xyXG5cclxuXHRcdFx0XHRsZXQgaiA9IG5leHRjdXI7XHJcblx0XHRcdFx0d2hpbGUgKGogaW4gd29yZHBvcylcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRsZXQgdzIgPSB3b3JkcG9zW2pdWzBdO1xyXG5cclxuXHRcdFx0XHRcdGlmICh3MilcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0dzEucHVzaCh3Mik7XHJcblxyXG5cdFx0XHRcdFx0XHRqICs9IHcyLncubGVuZ3RoO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldC5wdXNoKHcxKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdHtcclxuXHRcdFx0XHRsZXQgdCA9IHRleHQuc2xpY2Uod29yZC53Lmxlbmd0aCk7XHJcblxyXG5cdFx0XHRcdGxldCBjaHVua3MgPSB0aGlzLmdldENodW5rcyh3b3JkcG9zLCBuZXh0Y3VyLCB0LCB0b3RhbF9jb3VudCk7XHJcblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBjaHVua3MubGVuZ3RoOyBqKyspXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cmV0LnB1c2goW3dvcmRdLmNvbmNhdChjaHVua3Nbal0pKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGNodW5rcyA9IG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR3b3JkcyA9IHVuZGVmaW5lZDtcclxuXHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IG5hbWVzcGFjZSBEaWN0VG9rZW5pemVyXHJcbntcclxuXHQvKipcclxuXHQgKiDkvb/nlKjnsbvkvLzkuo5NTVNH55qE5YiG6K+N566X5rOVXHJcblx0ICog5om+5Ye65omA5pyJ5YiG6K+N5Y+v6IO977yM5Li76KaB5qC55o2u5LiA5LiL5Yeg6aG55p2l6K+E5Lu377yaXHJcblx0ICpcclxuXHQgKiB444CB6K+N5pWw6YeP5pyA5bCR77ybXHJcblx0ICogYeOAgeivjeW5s+Wdh+mikeeOh+acgOWkp++8m1xyXG5cdCAqIGLjgIHmr4/kuKror43plb/luqbmoIflh4blt67mnIDlsI/vvJtcclxuXHQgKiBj44CB5pyq6K+G5Yir6K+N5pyA5bCR77ybXHJcblx0ICogZOOAgeespuWQiOivreazlee7k+aehOmhue+8muWmguS4pOS4qui/nue7reeahOWKqOivjeWHj+WIhu+8jOaVsOivjeWQjumdoui3n+mHj+ivjeWKoOWIhu+8m1xyXG5cdCAqXHJcblx0ICog5Y+W5Lul5LiK5Yeg6aG557u85ZCI5o6S5ZCN5pyA5pyA5aW955qEXHJcblx0ICovXHJcblx0ZXhwb3J0IHR5cGUgSUFzc2Vzc1JvdyA9IHtcclxuXHRcdC8qKlxyXG5cdFx0ICog6K+N5pWw6YeP77yM6LaK5bCP6LaK5aW9XHJcblx0XHQgKi9cclxuXHRcdHg6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICog6K+N5oC76aKR546H77yM6LaK5aSn6LaK5aW9XHJcblx0XHQgKi9cclxuXHRcdGE6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICog6K+N5qCH5YeG5beu77yM6LaK5bCP6LaK5aW9XHJcblx0XHQgKiDmr4/kuKror43plb/luqbmoIflh4blt67mnIDlsI9cclxuXHRcdCAqL1xyXG5cdFx0YjogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiDmnKror4bliKvor43vvIzotorlsI/otorlpb1cclxuXHRcdCAqL1xyXG5cdFx0YzogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiDnrKblkIjor63ms5Xnu5PmnoTnqIvluqbvvIzotorlpKfotorlpb1cclxuXHRcdCAqIOespuWQiOivreazlee7k+aehOmhue+8muWmguS4pOS4qui/nue7reeahOWKqOivjeWHj+WIhu+8jOaVsOivjeWQjumdoui3n+mHj+ivjeWKoOWIhlxyXG5cdFx0ICovXHJcblx0XHRkOiBudW1iZXIsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiDntZDnrpfoqZXliIYo6Ieq5YuV6KiI566XKVxyXG5cdFx0ICovXHJcblx0XHRzY29yZT86IG51bWJlcixcclxuXHRcdHJlYWRvbmx5IGluZGV4PzogbnVtYmVyLFxyXG5cdH07XHJcbn1cclxuXHJcbmV4cG9ydCBpbXBvcnQgSUFzc2Vzc1JvdyA9IERpY3RUb2tlbml6ZXIuSUFzc2Vzc1JvdztcclxuXHJcbmV4cG9ydCBjb25zdCBpbml0ID0gRGljdFRva2VuaXplci5pbml0LmJpbmQoRGljdFRva2VuaXplcikgYXMgSVN1YlRva2VuaXplckNyZWF0ZTxEaWN0VG9rZW5pemVyPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IERpY3RUb2tlbml6ZXI7XHJcbiJdfQ==