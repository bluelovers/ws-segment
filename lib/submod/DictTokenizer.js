'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
const index_1 = require("../util/index");
const CHS_NAMES_1 = require("../mod/CHS_NAMES");
const const_1 = require("../mod/const");
exports.DEFAULT_MAX_CHUNK_COUNT = 40;
exports.DEFAULT_MAX_CHUNK_COUNT_MIN = 25;
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
    getChunks(wordpos, pos, text, total_count = 0, MAX_CHUNK_COUNT) {
        /**
         *
         * 追加新模式使 MAX_CHUNK_COUNT 遞減來防止無分段長段落的總處理次數過高 由 DEFAULT_MAX_CHUNK_COUNT_MIN 來限制最小值
         */
        if (total_count == 0) {
            MAX_CHUNK_COUNT = this.MAX_CHUNK_COUNT;
        }
        else {
            MAX_CHUNK_COUNT = Math.max(MAX_CHUNK_COUNT, this.DEFAULT_MAX_CHUNK_COUNT_MIN, exports.DEFAULT_MAX_CHUNK_COUNT_MIN);
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
                let chunks = this.getChunks(wordpos, pos + s1.length, s2, total_count, MAX_CHUNK_COUNT - 1);
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
            else if (total_count > MAX_CHUNK_COUNT - 1) {
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
                let chunks = this.getChunks(wordpos, nextcur, t, total_count, MAX_CHUNK_COUNT - 1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGljdFRva2VuaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRpY3RUb2tlbml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLGdDQUE4RTtBQUk5RSx5Q0FBaUQ7QUFDakQsZ0RBQXNIO0FBR3RILHdDQUF3QztBQUczQixRQUFBLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztBQUM3QixRQUFBLDJCQUEyQixHQUFHLEVBQUUsQ0FBQztBQUU5Qzs7OztHQUlHO0FBQ0gsTUFBYSxhQUFjLFNBQVEseUJBQW1CO0lBQXREOztRQUdDOzs7Ozs7Ozs7V0FTRztRQUNILG9CQUFlLEdBQUcsK0JBQXVCLENBQUM7UUFDMUM7OztXQUdHO1FBQ0gsZ0NBQTJCLEdBQUcsbUNBQTJCLENBQUM7SUF1eUIzRCxDQUFDO0lBbHlCQSxNQUFNO1FBRUwsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFbkMsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLG1DQUEyQixFQUM3SDtZQUNDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1NBQzFEO1FBRUQsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8s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LENBQUMsRUFBRSxXQUFXLEVBQUUsZUFBZSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNuRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFDdEM7b0JBQ0MsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNuQztnQkFFRCxNQUFNLEdBQUcsSUFBSSxDQUFDO2FBQ2Q7U0FDRDtRQUVELEtBQUssR0FBRyxTQUFTLENBQUM7UUFFbEIsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0NBQ0Q7QUF6ekJELHNDQXl6QkM7QUFrRFksUUFBQSxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUF1QyxDQUFDO0FBRWpHLGtCQUFlLGFBQWEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgU3ViU01vZHVsZSwgU3ViU01vZHVsZVRva2VuaXplciwgSVN1YlRva2VuaXplckNyZWF0ZSB9IGZyb20gJy4uL21vZCc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBVU3RyaW5nIH0gZnJvbSAndW5pLXN0cmluZyc7XG5pbXBvcnQgeyBJVGFibGVEaWN0Um93IH0gZnJvbSAnLi4vdGFibGUvZGljdCc7XG5pbXBvcnQgeyBoZXhBbmRBbnksIHRvSGV4IH0gZnJvbSAnLi4vdXRpbC9pbmRleCc7XG5pbXBvcnQgQ0hTX05BTUVTLCB7IEZBTUlMWV9OQU1FXzEsIEZBTUlMWV9OQU1FXzIsIFNJTkdMRV9OQU1FLCBET1VCTEVfTkFNRV8xLCBET1VCTEVfTkFNRV8yIH0gZnJvbSAnLi4vbW9kL0NIU19OQU1FUyc7XG5pbXBvcnQgU2VnbWVudCwgeyBJRElDVCwgSVdvcmQsIElESUNUMiB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0IHsgZGVidWcgfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7IERBVEVUSU1FIH0gZnJvbSAnLi4vbW9kL2NvbnN0JztcbmltcG9ydCBJUE9TVEFHIGZyb20gJy4uL1BPU1RBRyc7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX01BWF9DSFVOS19DT1VOVCA9IDQwO1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTiA9IDI1O1xuXG4vKipcbiAqIOWtl+WFuOivhuWIq+aooeWdl1xuICpcbiAqIEBhdXRob3Ig6ICB6Zu3PGxlaXpvbmdtaW5AZ21haWwuY29tPlxuICovXG5leHBvcnQgY2xhc3MgRGljdFRva2VuaXplciBleHRlbmRzIFN1YlNNb2R1bGVUb2tlbml6ZXJcbntcblxuXHQvKipcblx0ICog6Ziy5q2i5Zug54Sh5YiG5q615bCO6Ie05YiG5p6Q6YGO5LmF55Sa6Iez6LaF6YGO6JmV55CG6LKg6I23XG5cdCAqIOi2iumrmOi2iueyvua6luS9huaYr+iZleeQhuaZgumWk+acg+WKoOWAjeaIkOmVt+eUmuiHs+i2hemBjuiomOaGtumrlOiDveiZleeQhueahOeoi+W6plxuXHQgKlxuXHQgKiDmlbjlrZfotorlsI/otorlv6tcblx0ICpcblx0ICogRkFUQUwgRVJST1I6IENBTExfQU5EX1JFVFJZX0xBU1QgQWxsb2NhdGlvbiBmYWlsZWQgLSBKYXZhU2NyaXB0IGhlYXAgb3V0IG9mIG1lbW9yeVxuXHQgKlxuXHQgKiBAdHlwZSB7bnVtYmVyfVxuXHQgKi9cblx0TUFYX0NIVU5LX0NPVU5UID0gREVGQVVMVF9NQVhfQ0hVTktfQ09VTlQ7XG5cdC8qKlxuXHQgKlxuXHQgKiDov73liqDmlrDmqKHlvI/kvb8gTUFYX0NIVU5LX0NPVU5UIOmBnua4m+S+humYsuatoueEoeWIhuautemVt+auteiQveeahOe4veiZleeQhuasoeaVuOmBjumrmCDnlLEgREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOIOS+humZkOWItuacgOWwj+WAvFxuXHQgKi9cblx0REVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOID0gREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOO1xuXG5cdHByb3RlY3RlZCBfVEFCTEU6IElESUNUPElXb3JkPjtcblx0cHJvdGVjdGVkIF9UQUJMRTI6IElESUNUMjxJV29yZD47XG5cblx0X2NhY2hlKClcblx0e1xuXHRcdHN1cGVyLl9jYWNoZSgpO1xuXHRcdHRoaXMuX1RBQkxFID0gdGhpcy5zZWdtZW50LmdldERpY3QoJ1RBQkxFJyk7XG5cdFx0dGhpcy5fVEFCTEUyID0gdGhpcy5zZWdtZW50LmdldERpY3QoJ1RBQkxFMicpO1xuXHRcdHRoaXMuX1BPU1RBRyA9IHRoaXMuc2VnbWVudC5QT1NUQUc7XG5cblx0XHRpZiAodHlwZW9mIHRoaXMuc2VnbWVudC5vcHRpb25zLm1heENodW5rQ291bnQgPT0gJ251bWJlcicgJiYgdGhpcy5zZWdtZW50Lm9wdGlvbnMubWF4Q2h1bmtDb3VudCA+IERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UX01JTilcblx0XHR7XG5cdFx0XHR0aGlzLk1BWF9DSFVOS19DT1VOVCA9IHRoaXMuc2VnbWVudC5vcHRpb25zLm1heENodW5rQ291bnQ7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiB0aGlzLnNlZ21lbnQub3B0aW9ucy5taW5DaHVua0NvdW50ID09ICdudW1iZXInICYmIHRoaXMuc2VnbWVudC5vcHRpb25zLm1pbkNodW5rQ291bnQgPiBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4pXG5cdFx0e1xuXHRcdFx0dGhpcy5ERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4gPSB0aGlzLnNlZ21lbnQub3B0aW9ucy5taW5DaHVua0NvdW50O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiDlr7nmnKror4bliKvnmoTljZXor43ov5vooYzliIbor41cblx0ICpcblx0ICogQHBhcmFtIHthcnJheX0gd29yZHMg5Y2V6K+N5pWw57uEXG5cdCAqIEByZXR1cm4ge2FycmF5fVxuXHQgKi9cblx0c3BsaXQod29yZHM6IElXb3JkW10pOiBJV29yZFtdXG5cdHtcblx0XHQvL2RlYnVnKHdvcmRzKTtcblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuX1RBQkxFO1xuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuX1BPU1RBRztcblxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOyB3b3JkID0gd29yZHNbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAod29yZC5wID4gMClcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2god29yZCk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyDku4Xlr7nmnKror4bliKvnmoTor43ov5vooYzljLnphY1cblx0XHRcdGxldCB3b3JkaW5mbyA9IHRoaXMubWF0Y2hXb3JkKHdvcmQudywgMCwgd29yZHNbaSAtIDFdKTtcblx0XHRcdGlmICh3b3JkaW5mby5sZW5ndGggPCAxKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIOWIhuemu+WHuuW3suivhuWIq+eahOWNleivjVxuXHRcdFx0bGV0IGxhc3RjID0gMDtcblxuXHRcdFx0d29yZGluZm8uZm9yRWFjaChmdW5jdGlvbiAoYncsIHVpKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoYncuYyA+IGxhc3RjKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdFx0dzogd29yZC53LnN1YnN0cihsYXN0YywgYncuYyAtIGxhc3RjKSxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBjdyA9IHNlbGYuY3JlYXRlUmF3VG9rZW4oe1xuXHRcdFx0XHRcdHc6IGJ3LncsXG5cdFx0XHRcdFx0ZjogYncuZixcblx0XHRcdFx0fSwgVEFCTEVbYncud10pO1xuXG5cdFx0XHRcdHJldC5wdXNoKGN3KTtcblxuXHRcdFx0XHQvKlxuXHRcdFx0XHRyZXQucHVzaCh7XG5cdFx0XHRcdFx0dzogYncudyxcblx0XHRcdFx0XHRwOiB3dy5wLFxuXHRcdFx0XHRcdGY6IGJ3LmYsXG5cdFx0XHRcdFx0czogd3cucyxcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCovXG5cdFx0XHRcdGxhc3RjID0gYncuYyArIGJ3LncubGVuZ3RoO1xuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBsYXN0d29yZCA9IHdvcmRpbmZvW3dvcmRpbmZvLmxlbmd0aCAtIDFdO1xuXHRcdFx0aWYgKGxhc3R3b3JkLmMgKyBsYXN0d29yZC53Lmxlbmd0aCA8IHdvcmQudy5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBjdyA9IHNlbGYuY3JlYXRlUmF3VG9rZW4oe1xuXHRcdFx0XHRcdHc6IHdvcmQudy5zdWJzdHIobGFzdHdvcmQuYyArIGxhc3R3b3JkLncubGVuZ3RoKSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0LnB1c2goY3cpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5cdC8qKlxuXHQgKiDljLnphY3ljZXor43vvIzov5Tlm57nm7jlhbPkv6Hmga9cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQg5paH5pysXG5cdCAqIEBwYXJhbSB7aW50fSBjdXIg5byA5aeL5L2N572uXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwcmV3b3JkIOS4iuS4gOS4quWNleivjVxuXHQgKiBAcmV0dXJuIHthcnJheX0gIOi/lOWbnuagvOW8jyAgIHt3OiAn5Y2V6K+NJywgYzog5byA5aeL5L2N572ufVxuXHQgKi9cblx0cHJvdGVjdGVkIG1hdGNoV29yZCh0ZXh0OiBzdHJpbmcsIGN1cjogbnVtYmVyLCBwcmV3b3JkOiBJV29yZClcblx0e1xuXHRcdGlmIChpc05hTihjdXIpKSBjdXIgPSAwO1xuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblx0XHRsZXQgcyA9IGZhbHNlO1xuXG5cdFx0Y29uc3QgVEFCTEUyID0gdGhpcy5fVEFCTEUyO1xuXG5cdFx0Ly8g5Yy56YWN5Y+v6IO95Ye6546w55qE5Y2V6K+NXG5cdFx0d2hpbGUgKGN1ciA8IHRleHQubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGZvciAobGV0IGkgaW4gVEFCTEUyKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdyA9IHRleHQuc3Vic3RyKGN1ciwgaSBhcyBhbnkgYXMgbnVtYmVyKTtcblx0XHRcdFx0aWYgKHcgaW4gVEFCTEUyW2ldKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdFx0dzogdyxcblx0XHRcdFx0XHRcdGM6IGN1cixcblx0XHRcdFx0XHRcdGY6IFRBQkxFMltpXVt3XS5mLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjdXIrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5maWx0ZXJXb3JkKHJldCwgcHJld29yZCwgdGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICog6YCJ5oup5pyA5pyJ5Y+v6IO95Yy56YWN55qE5Y2V6K+NXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeS/oeaBr+aVsOe7hFxuXHQgKiBAcGFyYW0ge29iamVjdH0gcHJld29yZCDkuIrkuIDkuKrljZXor41cblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQg5pys6IqC6KaB5YiG6K+N55qE5paH5pysXG5cdCAqIEByZXR1cm4ge2FycmF5fVxuXHQgKi9cblx0cHJvdGVjdGVkIGZpbHRlcldvcmQod29yZHM6IElXb3JkW10sIHByZXdvcmQ6IElXb3JkLCB0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuX1RBQkxFO1xuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuX1BPU1RBRztcblx0XHRsZXQgcmV0OiBJV29yZFtdID0gW107XG5cblx0XHQvLyDlsIbljZXor43mjInkvY3nva7liIbnu4Rcblx0XHRsZXQgd29yZHBvcyA9IHRoaXMuZ2V0UG9zSW5mbyh3b3JkcywgdGV4dCk7XG5cdFx0Ly9kZWJ1Zyh3b3JkcG9zKTtcblxuXHRcdC8qKlxuXHRcdCAqIOS9v+eUqOexu+S8vOS6jk1NU0fnmoTliIbor43nrpfms5Vcblx0XHQgKiDmib7lh7rmiYDmnInliIbor43lj6/og73vvIzkuLvopoHmoLnmja7kuIDkuIvlh6DpobnmnaXor4Tku7fvvJpcblx0XHQgKiB444CB6K+N5pWw6YeP5pyA5bCR77ybXG5cdFx0ICogYeOAgeivjeW5s+Wdh+mikeeOh+acgOWkp++8m1xuXHRcdCAqIGLjgIHmr4/kuKror43plb/luqbmoIflh4blt67mnIDlsI/vvJtcblx0XHQgKiBj44CB5pyq6K+G5Yir6K+N5pyA5bCR77ybXG5cdFx0ICogZOOAgeespuWQiOivreazlee7k+aehOmhue+8muWmguS4pOS4qui/nue7reeahOWKqOivjeWHj+WIhu+8jOaVsOivjeWQjumdoui3n+mHj+ivjeWKoOWIhu+8m1xuXHRcdCAqIOWPluS7peS4iuWHoOmhuee7vOWQiOaOkuWQjeacgOacgOWlveeahFxuXHRcdCAqL1xuXHRcdGxldCBjaHVua3MgPSB0aGlzLmdldENodW5rcyh3b3JkcG9zLCAwLCB0ZXh0KTtcblx0XHQvL2RlYnVnKGNodW5rcyk7XG5cdFx0bGV0IGFzc2VzczogQXJyYXk8SUFzc2Vzc1Jvdz4gPSBbXTsgIC8vIOivhOS7t+ihqFxuXG5cdFx0Ly9jb25zb2xlLmxvZyhjaHVua3MpO1xuXG5cdFx0Ly8g5a+55ZCE5Liq5YiG5pSv5bCx6KGM6K+E5LywXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGNodW5rOiBJV29yZFtdOyBjaHVuayA9IGNodW5rc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGFzc2Vzc1tpXSA9IHtcblx0XHRcdFx0eDogY2h1bmsubGVuZ3RoLFxuXHRcdFx0XHRhOiAwLFxuXHRcdFx0XHRiOiAwLFxuXHRcdFx0XHRjOiAwLFxuXHRcdFx0XHRkOiAwLFxuXG5cdFx0XHRcdGluZGV4OiBpLFxuXHRcdFx0fTtcblx0XHRcdC8vIOivjeW5s+Wdh+mVv+W6plxuXHRcdFx0bGV0IHNwID0gdGV4dC5sZW5ndGggLyBjaHVuay5sZW5ndGg7XG5cdFx0XHQvLyDlj6XlrZDnu4/luLjljIXlkKvnmoTor63ms5Xnu5PmnoRcblx0XHRcdGxldCBoYXNfRF9WID0gZmFsc2U7ICAvLyDmmK/lkKbljIXlkKvliqjor41cblxuXHRcdFx0Ly8g6YGN5Y6G5ZCE5Liq6K+NXG5cdFx0XHRsZXQgcHJldzogSVdvcmQ7XG5cblx0XHRcdGlmIChwcmV3b3JkKVxuXHRcdFx0e1xuXHRcdFx0XHQvKlxuXHRcdFx0XHRwcmV3ID0ge1xuXHRcdFx0XHRcdHc6IHByZXdvcmQudyxcblx0XHRcdFx0XHRwOiBwcmV3b3JkLnAsXG5cdFx0XHRcdFx0ZjogcHJld29yZC5mLFxuXHRcdFx0XHRcdHM6IHByZXdvcmQucyxcblx0XHRcdFx0fVxuXHRcdFx0XHQqL1xuXG5cdFx0XHRcdHByZXcgPSB0aGlzLmNyZWF0ZVJhd1Rva2VuKHByZXdvcmQpO1xuXG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHByZXcgPSBudWxsO1xuXHRcdFx0fVxuXHRcdFx0Zm9yIChsZXQgaiA9IDAsIHc6IElXb3JkOyB3ID0gY2h1bmtbal07IGorKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHcudyBpbiBUQUJMRSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHcucCA9IFRBQkxFW3cud10ucDtcblx0XHRcdFx0XHRhc3Nlc3NbaV0uYSArPSB3LmY7ICAgLy8g5oC76K+N6aKRXG5cblx0XHRcdFx0XHRpZiAoaiA9PSAwICYmICFwcmV3b3JkICYmICh3LnAgJiBQT1NUQUcuRF9WKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdCAqIOWwh+esrOS4gOWAi+Wtl+S5n+ioiOeul+mAsuWOu+aYr+WQpuWMheWQq+WLleipnlxuXHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRoYXNfRF9WID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyA9PT09PT09PT09PT09PT09IOajgOafpeivreazlee7k+aehCA9PT09PT09PT09PT09PT09PT09XG5cdFx0XHRcdFx0aWYgKHByZXcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5LiK5LiA5Liq6K+N5piv5pWw6K+N5LiU5b2T5YmN6K+N5piv6YeP6K+N77yI5Y2V5L2N77yJ77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdChwcmV3LnAgJiBQT1NUQUcuQV9NKVxuXHRcdFx0XHRcdFx0XHQmJlxuXHRcdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdFx0KCh3LnAgJiBQT1NUQUcuQV9RKSlcblx0XHRcdFx0XHRcdFx0XHR8fCB3LncgaW4gREFURVRJTUVcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzlvZPliY3or43mmK/liqjor41cblx0XHRcdFx0XHRcdGlmICgody5wICYgUE9TVEFHLkRfVikpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGhhc19EX1YgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK/ov57nu63nmoTkuKTkuKrliqjor43vvIzliJnlh4/liIZcblx0XHRcdFx0XHRcdFx0Ly9pZiAoKHByZXcucCAmIFBPU1RBRy5EX1YpID4gMClcblx0XHRcdFx0XHRcdFx0Ly9hc3Nlc3NbaV0uZC0tO1xuXG5cdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDlvaLlrrnor40gKyDliqjor43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdFx0aWYgKChwcmV3LnAgJiBQT1NUQUcuRF9BKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK8g5Ymv6K+NICsg5Yqo6K+N77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRcdGlmIChwcmV3LnAgJiBQT1NUQUcuRF9EKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5piv5Zyw5Yy65ZCN44CB5py65p6E5ZCN5oiW5b2i5a656K+N77yM5ZCO6Z2i6Lef5Zyw5Yy644CB5py65p6E44CB5Luj6K+N44CB5ZCN6K+N562J77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRpZiAoKFxuXHRcdFx0XHRcdFx0XHRcdChwcmV3LnAgJiBQT1NUQUcuQV9OUylcblx0XHRcdFx0XHRcdFx0XHR8fCAocHJldy5wICYgUE9TVEFHLkFfTlQpXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHByZXcucCAmIFBPU1RBRy5EX0EpXG5cdFx0XHRcdFx0XHRcdCkgJiZcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdCh3LnAgJiBQT1NUQUcuRF9OKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OUilcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkFfTlMpXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05aKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OVClcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDmlrnkvY3or40gKyDmlbDph4/or43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0KHByZXcucCAmIFBPU1RBRy5EX0YpXG5cdFx0XHRcdFx0XHRcdCYmXG5cdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHQody5wICYgUE9TVEFHLkFfTSlcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkRfTVEpXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vZGVidWcocHJldywgdyk7XG5cdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK8g5aeTICsg5ZCN6K+N77yM5YiZ5Yqg5YiGXG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHRwcmV3LncgaW4gRkFNSUxZX05BTUVfMVxuXHRcdFx0XHRcdFx0XHRcdHx8IHByZXcudyBpbiBGQU1JTFlfTkFNRV8yXG5cdFx0XHRcdFx0XHRcdCkgJiZcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdCh3LnAgJiBQT1NUQUcuRF9OKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OWilcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9kZWJ1ZyhwcmV3LCB3KTtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHQgKiDlnLDlkI0v5aSE5omAICsg5pa55L2NXG5cdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdGlmIChoZXhBbmRBbnkocHJldy5wXG5cdFx0XHRcdFx0XHRcdCwgUE9TVEFHLkRfU1xuXHRcdFx0XHRcdFx0XHQsIFBPU1RBRy5BX05TLFxuXHRcdFx0XHRcdFx0KSAmJiBoZXhBbmRBbnkody5wXG5cdFx0XHRcdFx0XHRcdCwgUE9TVEFHLkRfRixcblx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kICs9IDAuNTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8g5o6i5rWL5LiL5LiA5Liq6K+NXG5cdFx0XHRcdFx0XHRsZXQgbmV4dHcgPSBjaHVua1tqICsgMV07XG5cdFx0XHRcdFx0XHRpZiAobmV4dHcpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChuZXh0dy53IGluIFRBQkxFKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bmV4dHcucCA9IFRBQkxFW25leHR3LnddLnA7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgX3RlbXBfb2s6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0XHQgKiDlpoLmnpzlvZPliY3mmK/igJznmoTigJ0rIOWQjeivje+8jOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdCh3LncgPT0gJ+eahCcgfHwgdy53ID09ICfkuYsnKVxuXHRcdFx0XHRcdFx0XHRcdCYmIG5leHR3LnAgJiYgKFxuXHRcdFx0XHRcdFx0XHRcdFx0KG5leHR3LnAgJiBQT1NUQUcuRF9OKVxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuRF9WKVxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OUilcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkFfTlMpXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCAobmV4dHcucCAmIFBPU1RBRy5BX05aKVxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OVClcblx0XHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMS41O1xuXHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdCAqIOWmguaenOaYr+i/nuivje+8jOWJjeWQjuS4pOS4quivjeivjeaAp+ebuOWQjOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAocHJldy5wICYmICh3LnAgJiBQT1NUQUcuRF9DKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBwID0gcHJldy5wICYgbmV4dHcucDtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChwcmV3LnAgPT09IG5leHR3LnApXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGVsc2UgaWYgKHApXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC4yNTtcblx0XHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmIChwICYgUE9TVEFHLkRfTilcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC43NTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoX3RlbXBfb2sgJiYgbmV4dHcucCAmJiAody5wICYgUE9TVEFHLkRfUCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpZiAobmV4dHcucCAmIFBPU1RBRy5BX05SICYmIChcblx0XHRcdFx0XHRcdFx0XHRcdG5leHR3LncubGVuZ3RoID4gMVxuXHRcdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHByZXcudyA9PSAn55qEJylcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAqIOeahCArIOS7i+ipniArIOS6uuWQjVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoX3RlbXBfb2sgJiYgKHcucCAmIFBPU1RBRy5EX1ApICYmIGhleEFuZEFueShwcmV3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfTixcblx0XHRcdFx0XHRcdFx0KSAmJiBoZXhBbmRBbnkobmV4dHcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9OLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX1YsXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoX3RlbXBfb2sgJiYgKHcucCAmIFBPU1RBRy5EX1ApICYmIGhleEFuZEFueShwcmV3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfUixcblx0XHRcdFx0XHRcdFx0KSAmJiBoZXhBbmRBbnkobmV4dHcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9SLFxuXHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC41O1xuXHRcdFx0XHRcdFx0XHRcdF90ZW1wX29rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvLyBARklYTUUg5pq05Yqb6Kej5rG6IOS4ieWkqeWQjiDnmoTllY/poYxcblx0XHRcdFx0XHRcdFx0aWYgKG5leHR3LncgPT0gJ+WQjicgJiYgdy5wICYgUE9TVEFHLkRfVCAmJiBoZXhBbmRBbnkocHJldy5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX01RLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5BX00sXG5cdFx0XHRcdFx0XHRcdCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8vIEBGSVhNRSDliLDmuZbkuK3plpPlkI7miYvntYLmlrzog73kvJHmga/kuoZcblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoXG5cdFx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdFx0bmV4dHcudyA9PSAn5ZCOJ1xuXHRcdFx0XHRcdFx0XHRcdFx0fHwgbmV4dHcudyA9PSAn5b6MJ1xuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHQmJiBoZXhBbmRBbnkody5wLFxuXHRcdFx0XHRcdFx0XHRcdFBPU1RBRy5EX0YsXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHRcdHcudyA9PSAn5ZCOJ1xuXHRcdFx0XHRcdFx0XHRcdFx0fHwgdy53ID09ICflvownXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdCYmIGhleEFuZEFueShwcmV3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfRixcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0JiYgaGV4QW5kQW55KG5leHR3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfTixcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IF90ZW1wX29rOiBib29sZWFuID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0ICog5aW55oqK6I235YyF6JuL5pGG5Zyo5YOP5piv5Y2w5bqm54Ok6aW855qE6Z2i5YyF5LiKXG5cdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRpZiAoX3RlbXBfb2sgJiYgKHcucCAmIFBPU1RBRy5EX0YpICYmIGhleEFuZEFueShwcmV3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfTixcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kICs9IDE7XG5cdFx0XHRcdFx0XHRcdFx0X3RlbXBfb2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8g5pyq6K+G5Yir55qE6K+N5pWw6YePXG5cdFx0XHRcdFx0YXNzZXNzW2ldLmMrKztcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyDmoIflh4blt65cblx0XHRcdFx0YXNzZXNzW2ldLmIgKz0gTWF0aC5wb3coc3AgLSB3LncubGVuZ3RoLCAyKTtcblx0XHRcdFx0cHJldyA9IGNodW5rW2pdO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyDlpoLmnpzlj6XlrZDkuK3ljIXlkKvkuoboh7PlsJHkuIDkuKrliqjor41cblx0XHRcdGlmIChoYXNfRF9WID09PSBmYWxzZSkgYXNzZXNzW2ldLmQgLT0gMC41O1xuXG5cdFx0XHRhc3Nlc3NbaV0uYSA9IGFzc2Vzc1tpXS5hIC8gY2h1bmsubGVuZ3RoO1xuXHRcdFx0YXNzZXNzW2ldLmIgPSBhc3Nlc3NbaV0uYiAvIGNodW5rLmxlbmd0aDtcblx0XHR9XG5cblx0XHQvL2NvbnNvbGUuZGlyKGFzc2Vzcyk7XG5cblx0XHQvLyDorqHnrpfmjpLlkI1cblx0XHRsZXQgdG9wID0gdGhpcy5nZXRUb3BzKGFzc2Vzcyk7XG5cdFx0bGV0IGN1cnJjaHVuayA9IGNodW5rc1t0b3BdO1xuXG5cdFx0aWYgKGZhbHNlKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coYXNzZXNzKTtcblx0XHRcdC8vY29uc29sZS5sb2coT2JqZWN0LmVudHJpZXMoY2h1bmtzKSk7XG5cdFx0XHRjb25zb2xlLmRpcihPYmplY3QuZW50cmllcyhjaHVua3MpXG5cdFx0XHRcdC5tYXAoKFtpLCBjaHVua10pID0+IHsgcmV0dXJuIHsgaSwgYXNzZXM6IGFzc2Vzc1tpIGFzIHVua25vd24gYXMgbnVtYmVyXSwgY2h1bmsgfSB9KSwgeyBkZXB0aDogNSB9KTtcblx0XHRcdGNvbnNvbGUuZGlyKHsgaTogdG9wLCBhc3NlczogYXNzZXNzW3RvcF0sIGN1cnJjaHVuayB9KTtcblx0XHRcdC8vY29uc29sZS5sb2codG9wKTtcblx0XHRcdC8vY29uc29sZS5sb2coY3VycmNodW5rKTtcblx0XHR9XG5cblx0XHQvLyDliZTpmaTkuI3og73or4bliKvnmoTor41cblx0XHRmb3IgKGxldCBpID0gMCwgd29yZDogSVdvcmQ7IHdvcmQgPSBjdXJyY2h1bmtbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAoISh3b3JkLncgaW4gVEFCTEUpKVxuXHRcdFx0e1xuXHRcdFx0XHRjdXJyY2h1bmsuc3BsaWNlKGktLSwgMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldCA9IGN1cnJjaHVuaztcblxuXHRcdC8vIOippuWcluS4u+WLlea4hemZpOiomOaGtumrlFxuXHRcdGFzc2VzcyA9IHVuZGVmaW5lZDtcblx0XHRjaHVua3MgPSB1bmRlZmluZWQ7XG5cblx0XHQvL2RlYnVnKHJldCk7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiDor4Tku7fmjpLlkI1cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IGFzc2Vzc1xuXHQgKiBAcmV0dXJuIHtvYmplY3R9XG5cdCAqL1xuXHRnZXRUb3BzKGFzc2VzczogQXJyYXk8SUFzc2Vzc1Jvdz4pXG5cdHtcblx0XHQvL2RlYnVnKGFzc2Vzcyk7XG5cdFx0Ly8g5Y+W5ZCE6aG55pyA5aSn5YC8XG5cdFx0bGV0IHRvcDogSUFzc2Vzc1JvdyA9IHtcblx0XHRcdHg6IGFzc2Vzc1swXS54LFxuXHRcdFx0YTogYXNzZXNzWzBdLmEsXG5cdFx0XHRiOiBhc3Nlc3NbMF0uYixcblx0XHRcdGM6IGFzc2Vzc1swXS5jLFxuXHRcdFx0ZDogYXNzZXNzWzBdLmQsXG5cdFx0fTtcblxuXHRcdGZvciAobGV0IGkgPSAxLCBhc3M6IElBc3Nlc3NSb3c7IGFzcyA9IGFzc2Vzc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGlmIChhc3MuYSA+IHRvcC5hKSB0b3AuYSA9IGFzcy5hOyAgLy8g5Y+W5pyA5aSn5bmz5Z2H6K+N6aKRXG5cdFx0XHRpZiAoYXNzLmIgPCB0b3AuYikgdG9wLmIgPSBhc3MuYjsgIC8vIOWPluacgOWwj+agh+WHhuW3rlxuXHRcdFx0aWYgKGFzcy5jID4gdG9wLmMpIHRvcC5jID0gYXNzLmM7ICAvLyDlj5bmnIDlpKfmnKror4bliKvor41cblx0XHRcdGlmIChhc3MuZCA8IHRvcC5kKSB0b3AuZCA9IGFzcy5kOyAgLy8g5Y+W5pyA5bCP6K+t5rOV5YiG5pWwXG5cdFx0XHRpZiAoYXNzLnggPiB0b3AueCkgdG9wLnggPSBhc3MueDsgIC8vIOWPluacgOWkp+WNleivjeaVsOmHj1xuXHRcdH1cblx0XHQvL2RlYnVnKHRvcCk7XG5cblx0XHQvLyDor4TkvLDmjpLlkI1cblx0XHRsZXQgdG9wczogbnVtYmVyW10gPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMCwgYXNzOiBJQXNzZXNzUm93OyBhc3MgPSBhc3Nlc3NbaV07IGkrKylcblx0XHR7XG5cdFx0XHR0b3BzW2ldID0gMDtcblx0XHRcdC8vIOivjeaVsOmHj++8jOi2iuWwj+i2iuWlvVxuXHRcdFx0dG9wc1tpXSArPSAodG9wLnggLSBhc3MueCkgKiAxLjU7XG5cdFx0XHQvLyDor43mgLvpopHnjofvvIzotorlpKfotorlpb1cblx0XHRcdGlmIChhc3MuYSA+PSB0b3AuYSkgdG9wc1tpXSArPSAxO1xuXHRcdFx0Ly8g6K+N5qCH5YeG5beu77yM6LaK5bCP6LaK5aW9XG5cdFx0XHRpZiAoYXNzLmIgPD0gdG9wLmIpIHRvcHNbaV0gKz0gMTtcblx0XHRcdC8vIOacquivhuWIq+ivje+8jOi2iuWwj+i2iuWlvVxuXHRcdFx0dG9wc1tpXSArPSAodG9wLmMgLSBhc3MuYyk7Ly9kZWJ1Zyh0b3BzW2ldKTtcblx0XHRcdC8vIOespuWQiOivreazlee7k+aehOeoi+W6pu+8jOi2iuWkp+i2iuWlvVxuXHRcdFx0dG9wc1tpXSArPSAoYXNzLmQgPCAwID8gdG9wLmQgKyBhc3MuZCA6IGFzcy5kIC0gdG9wLmQpICogMTtcblxuXHRcdFx0YXNzLnNjb3JlID0gdG9wc1tpXTtcblxuXHRcdFx0Ly9kZWJ1Zyh0b3BzW2ldKTtkZWJ1ZygnLS0tJyk7XG5cdFx0fVxuXHRcdC8vZGVidWcodG9wcy5qb2luKCcgICcpKTtcblxuXHRcdC8vY29uc29sZS5sb2codG9wcyk7XG5cdFx0Ly9jb25zb2xlLmxvZyhhc3Nlc3MpO1xuXG5cdFx0Ly9jb25zdCBvbGRfbWV0aG9kID0gdHJ1ZTtcblx0XHRjb25zdCBvbGRfbWV0aG9kID0gZmFsc2U7XG5cblx0XHQvLyDlj5bliIbmlbDmnIDpq5jnmoRcblx0XHRsZXQgY3VycmkgPSAwO1xuXHRcdGxldCBtYXhzID0gdG9wc1swXTtcblx0XHRmb3IgKGxldCBpIGluIHRvcHMpXG5cdFx0e1xuXHRcdFx0bGV0IHMgPSB0b3BzW2ldO1xuXHRcdFx0aWYgKHMgPiBtYXhzKVxuXHRcdFx0e1xuXHRcdFx0XHRjdXJyaSA9IGkgYXMgYW55IGFzIG51bWJlcjtcblx0XHRcdFx0bWF4cyA9IHM7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChzID09IG1heHMpXG5cdFx0XHR7XG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiDlpoLmnpzliIbmlbDnm7jlkIzvvIzliJnmoLnmja7or43plb/luqbjgIHmnKror4bliKvor43kuKrmlbDlkozlubPlnYfpopHnjofmnaXpgInmi6lcblx0XHRcdFx0ICpcblx0XHRcdFx0ICog5aaC5p6c5L6d54S25ZCM5YiG77yM5YmH5L+d5oyB5LiN6K6KXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHRsZXQgYSA9IDA7XG5cdFx0XHRcdGxldCBiID0gMDtcblx0XHRcdFx0aWYgKGFzc2Vzc1tpXS5jIDwgYXNzZXNzW2N1cnJpXS5jKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YSsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGFzc2Vzc1tpXS5jICE9PSBhc3Nlc3NbY3VycmldLmMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGFzc2Vzc1tpXS5hID4gYXNzZXNzW2N1cnJpXS5hKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YSsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGFzc2Vzc1tpXS5hICE9PSBhc3Nlc3NbY3VycmldLmEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGFzc2Vzc1tpXS54IDwgYXNzZXNzW2N1cnJpXS54KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YSsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGFzc2Vzc1tpXS54ICE9PSBhc3Nlc3NbY3VycmldLngpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGEgPiBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y3VycmkgPSBpIGFzIGFueSBhcyBudW1iZXI7XG5cdFx0XHRcdFx0bWF4cyA9IHM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vZGVidWcoeyBpLCBzLCBtYXhzLCBjdXJyaSB9KTtcblx0XHR9XG5cdFx0Ly9kZWJ1ZygnbWF4OiBpPScgKyBjdXJyaSArICcsIHM9JyArIHRvcHNbY3VycmldKTtcblx0XHRyZXR1cm4gY3Vycmk7XG5cdH1cblxuXHQvKipcblx0ICog5bCG5Y2V6K+N5oyJ54Wn5L2N572u5o6S5YiXXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG5cdCAqIEByZXR1cm4ge29iamVjdH1cblx0ICovXG5cdGdldFBvc0luZm8od29yZHM6IElXb3JkW10sIHRleHQ6IHN0cmluZyk6IHtcblx0XHRbaW5kZXg6IG51bWJlcl06IElXb3JkW107XG5cdH1cblx0e1xuXHRcdGxldCB3b3JkcG9zID0ge307XG5cdFx0Ly8g5bCG5Y2V6K+N5oyJ5L2N572u5YiG57uEXG5cdFx0Zm9yIChsZXQgaSA9IDAsIHdvcmQ7IHdvcmQgPSB3b3Jkc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICghd29yZHBvc1t3b3JkLmNdKVxuXHRcdFx0e1xuXHRcdFx0XHR3b3JkcG9zW3dvcmQuY10gPSBbXTtcblx0XHRcdH1cblx0XHRcdHdvcmRwb3Nbd29yZC5jXS5wdXNoKHdvcmQpO1xuXHRcdH1cblx0XHQvLyDmjInljZXlrZfliIblibLmlofmnKzvvIzloavooaXnqbrnvLrnmoTkvY3nva5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKCF3b3JkcG9zW2ldKVxuXHRcdFx0e1xuXHRcdFx0XHR3b3JkcG9zW2ldID0gW3sgdzogdGV4dC5jaGFyQXQoaSksIGM6IGksIGY6IDAgfV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdvcmRwb3M7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5omA5pyJ5YiG5pSvXG5cdCAqXG5cdCAqIEBwYXJhbSB7e1twOiBudW1iZXJdOiBTZWdtZW50LklXb3JkW119fSB3b3JkcG9zXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBwb3Mg5b2T5YmN5L2N572uXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IOacrOiKguimgeWIhuivjeeahOaWh+acrFxuXHQgKiBAcGFyYW0ge251bWJlcn0gdG90YWxfY291bnRcblx0ICogQHJldHVybnMge1NlZ21lbnQuSVdvcmRbXVtdfVxuXHQgKi9cblx0Z2V0Q2h1bmtzKHdvcmRwb3M6IHtcblx0XHRbaW5kZXg6IG51bWJlcl06IElXb3JkW107XG5cdH0sIHBvczogbnVtYmVyLCB0ZXh0Pzogc3RyaW5nLCB0b3RhbF9jb3VudCA9IDAsIE1BWF9DSFVOS19DT1VOVD86IG51bWJlcik6IElXb3JkW11bXVxuXHR7XG5cblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIOi/veWKoOaWsOaooeW8j+S9vyBNQVhfQ0hVTktfQ09VTlQg6YGe5rib5L6G6Ziy5q2i54Sh5YiG5q616ZW35q616JC955qE57i96JmV55CG5qyh5pW46YGO6auYIOeUsSBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4g5L6G6ZmQ5Yi25pyA5bCP5YC8XG5cdFx0ICovXG5cdFx0aWYgKHRvdGFsX2NvdW50ID09IDApXG5cdFx0e1xuXHRcdFx0TUFYX0NIVU5LX0NPVU5UID0gdGhpcy5NQVhfQ0hVTktfQ09VTlQ7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRNQVhfQ0hVTktfQ09VTlQgPSBNYXRoLm1heChNQVhfQ0hVTktfQ09VTlQsIHRoaXMuREVGQVVMVF9NQVhfQ0hVTktfQ09VTlRfTUlOLCBERUZBVUxUX01BWF9DSFVOS19DT1VOVF9NSU4pXG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICog5b+955Wl6YCj5a2XXG5cdFx0ICpcblx0XHQgKiDkvovlpoI6IOWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWVilxuXHRcdCAqL1xuXHRcdGxldCBtO1xuXHRcdGlmIChtID0gdGV4dC5tYXRjaCgvXigoLispXFwyezUsfSkvKSlcblx0XHR7XG5cdFx0XHRsZXQgczEgPSB0ZXh0LnNsaWNlKDAsIG1bMV0ubGVuZ3RoKTtcblx0XHRcdGxldCBzMiA9IHRleHQuc2xpY2UobVsxXS5sZW5ndGgpO1xuXG5cdFx0XHRsZXQgd29yZCA9IHtcblx0XHRcdFx0dzogczEsXG5cdFx0XHRcdGM6IHBvcyxcblx0XHRcdFx0ZjogMCxcblx0XHRcdH0gYXMgSVdvcmQ7XG5cblx0XHRcdGxldCByZXQ6IElXb3JkW11bXSA9IFtdO1xuXG5cdFx0XHRpZiAoczIgIT09ICcnKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgY2h1bmtzID0gdGhpcy5nZXRDaHVua3Mod29yZHBvcywgcG9zICsgczEubGVuZ3RoLCBzMiwgdG90YWxfY291bnQsIE1BWF9DSFVOS19DT1VOVCAtIDEpO1xuXG5cdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgY2h1bmtzLmxlbmd0aDsgaisrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goW3dvcmRdLmNvbmNhdChjaHVua3Nbal0pKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaChbd29yZF0pO1xuXHRcdFx0fVxuXG4vL1x0XHRcdGNvbnNvbGUuZGlyKHdvcmRwb3MpO1xuLy9cbi8vXHRcdFx0Y29uc29sZS5kaXIocmV0KTtcbi8vXG4vL1x0XHRcdGNvbnNvbGUuZGlyKFtwb3MsIHRleHQsIHRvdGFsX2NvdW50XSk7XG5cblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fVxuXG5cdFx0dG90YWxfY291bnQrKztcblxuXHRcdGxldCB3b3JkcyA9IHdvcmRwb3NbcG9zXSB8fCBbXTtcblxuXHRcdC8vZGVidWcodG90YWxfY291bnQsIE1BWF9DSFVOS19DT1VOVCk7XG5cbi8vXHRcdGRlYnVnKHtcbi8vXHRcdFx0dG90YWxfY291bnQsXG4vL1x0XHRcdE1BWF9DSFVOS19DT1VOVDogdGhpcy5NQVhfQ0hVTktfQ09VTlQsXG4vL1x0XHRcdHRleHQsXG4vL1x0XHRcdHdvcmRzLFxuLy9cdFx0fSk7XG5cblx0XHQvLyBkZWJ1ZygnZ2V0Q2h1bmtzOiAnKTtcblx0XHQvLyBkZWJ1Zyh3b3Jkcyk7XG5cdFx0Ly90aHJvdyBuZXcgRXJyb3IoKTtcblxuXHRcdGxldCByZXQ6IElXb3JkW11bXSA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgd29yZHMubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0bGV0IHdvcmQgPSB3b3Jkc1tpXTtcblx0XHRcdC8vZGVidWcod29yZCk7XG5cdFx0XHRsZXQgbmV4dGN1ciA9IHdvcmQuYyArIHdvcmQudy5sZW5ndGg7XG5cdFx0XHQvKipcblx0XHRcdCAqIEBGSVhNRVxuXHRcdFx0ICovXG5cdFx0XHRpZiAoIXdvcmRwb3NbbmV4dGN1cl0pXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKFt3b3JkXSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0b3RhbF9jb3VudCA+IE1BWF9DSFVOS19DT1VOVCAtIDEpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIGRvIHNvbWV0aGluZ1xuXG4vL1x0XHRcdFx0Y29uc29sZS5sb2coNDQ0LCB3b3Jkcy5zbGljZShpKSk7XG4vL1x0XHRcdFx0Y29uc29sZS5sb2coMzMzLCB3b3JkKTtcblxuXHRcdFx0XHRsZXQgdzE6IElXb3JkW10gPSBbd29yZF07XG5cblx0XHRcdFx0bGV0IGogPSBuZXh0Y3VyO1xuXHRcdFx0XHR3aGlsZSAoaiBpbiB3b3JkcG9zKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHcyID0gd29yZHBvc1tqXVswXTtcblxuXHRcdFx0XHRcdGlmICh3Milcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR3MS5wdXNoKHcyKTtcblxuXHRcdFx0XHRcdFx0aiArPSB3Mi53Lmxlbmd0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldC5wdXNoKHcxKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0bGV0IHQgPSB0ZXh0LnNsaWNlKHdvcmQudy5sZW5ndGgpO1xuXG5cdFx0XHRcdGxldCBjaHVua3MgPSB0aGlzLmdldENodW5rcyh3b3JkcG9zLCBuZXh0Y3VyLCB0LCB0b3RhbF9jb3VudCwgTUFYX0NIVU5LX0NPVU5UIC0gMSk7XG5cdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgY2h1bmtzLmxlbmd0aDsgaisrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goW3dvcmRdLmNvbmNhdChjaHVua3Nbal0pKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNodW5rcyA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0d29yZHMgPSB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG59XG5cbmV4cG9ydCBuYW1lc3BhY2UgRGljdFRva2VuaXplclxue1xuXHQvKipcblx0ICog5L2/55So57G75Ly85LqOTU1TR+eahOWIhuivjeeul+azlVxuXHQgKiDmib7lh7rmiYDmnInliIbor43lj6/og73vvIzkuLvopoHmoLnmja7kuIDkuIvlh6DpobnmnaXor4Tku7fvvJpcblx0ICpcblx0ICogeOOAgeivjeaVsOmHj+acgOWwke+8m1xuXHQgKiBh44CB6K+N5bmz5Z2H6aKR546H5pyA5aSn77ybXG5cdCAqIGLjgIHmr4/kuKror43plb/luqbmoIflh4blt67mnIDlsI/vvJtcblx0ICogY+OAgeacquivhuWIq+ivjeacgOWwke+8m1xuXHQgKiBk44CB56ym5ZCI6K+t5rOV57uT5p6E6aG577ya5aaC5Lik5Liq6L+e57ut55qE5Yqo6K+N5YeP5YiG77yM5pWw6K+N5ZCO6Z2i6Lef6YeP6K+N5Yqg5YiG77ybXG5cdCAqXG5cdCAqIOWPluS7peS4iuWHoOmhuee7vOWQiOaOkuWQjeacgOacgOWlveeahFxuXHQgKi9cblx0ZXhwb3J0IHR5cGUgSUFzc2Vzc1JvdyA9IHtcblx0XHQvKipcblx0XHQgKiDor43mlbDph4/vvIzotorlsI/otorlpb1cblx0XHQgKi9cblx0XHR4OiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICog6K+N5oC76aKR546H77yM6LaK5aSn6LaK5aW9XG5cdFx0ICovXG5cdFx0YTogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIOivjeagh+WHhuW3ru+8jOi2iuWwj+i2iuWlvVxuXHRcdCAqIOavj+S4quivjemVv+W6puagh+WHhuW3ruacgOWwj1xuXHRcdCAqL1xuXHRcdGI6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDmnKror4bliKvor43vvIzotorlsI/otorlpb1cblx0XHQgKi9cblx0XHRjOiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICog56ym5ZCI6K+t5rOV57uT5p6E56iL5bqm77yM6LaK5aSn6LaK5aW9XG5cdFx0ICog56ym5ZCI6K+t5rOV57uT5p6E6aG577ya5aaC5Lik5Liq6L+e57ut55qE5Yqo6K+N5YeP5YiG77yM5pWw6K+N5ZCO6Z2i6Lef6YeP6K+N5Yqg5YiGXG5cdFx0ICovXG5cdFx0ZDogbnVtYmVyLFxuXG5cdFx0LyoqXG5cdFx0ICog57WQ566X6KmV5YiGKOiHquWLleioiOeulylcblx0XHQgKi9cblx0XHRzY29yZT86IG51bWJlcixcblx0XHRyZWFkb25seSBpbmRleD86IG51bWJlcixcblx0fTtcbn1cblxuZXhwb3J0IGltcG9ydCBJQXNzZXNzUm93ID0gRGljdFRva2VuaXplci5JQXNzZXNzUm93O1xuXG5leHBvcnQgY29uc3QgaW5pdCA9IERpY3RUb2tlbml6ZXIuaW5pdC5iaW5kKERpY3RUb2tlbml6ZXIpIGFzIElTdWJUb2tlbml6ZXJDcmVhdGU8RGljdFRva2VuaXplcj47XG5cbmV4cG9ydCBkZWZhdWx0IERpY3RUb2tlbml6ZXI7XG4iXX0=