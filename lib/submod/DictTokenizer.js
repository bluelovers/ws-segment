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
                            // 如果是连词，前后两个词词性相同则加分
                            if ((w.p & POSTAG.D_C) && prew.p == nextw.p) {
                                assess[i].d++;
                            }
                            // 如果当前是“的”+ 名词，则加分
                            if ((w.w == '的' || w.w == '之')
                                && ((nextw.p & POSTAG.D_N)
                                    || (nextw.p & POSTAG.A_NR)
                                    || (nextw.p & POSTAG.A_NS)
                                    || (nextw.p & POSTAG.A_NZ)
                                    || (nextw.p & POSTAG.A_NT))) {
                                assess[i].d += 1.5;
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
        //console.log(assess);
        //console.log(Object.entries(chunks));
        //console.log(Object.entries(chunks).map(([i, chunk]) => { return { i, asses: assess[i as unknown as number], chunk } }));
        //console.log({ i: top, asses: assess[top], currchunk });
        //console.log(top);
        //console.log(currchunk);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGljdFRva2VuaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRpY3RUb2tlbml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLGdDQUE4RTtBQUk5RSx5Q0FBaUQ7QUFDakQsZ0RBQXNIO0FBR3RILHdDQUF3QztBQUczQixRQUFBLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztBQUUxQzs7OztHQUlHO0FBQ0gsTUFBYSxhQUFjLFNBQVEseUJBQW1CO0lBQXREOztRQUdDOzs7Ozs7Ozs7V0FTRztRQUNILG9CQUFlLEdBQUcsK0JBQXVCLENBQUM7SUFzckIzQyxDQUFDO0lBanJCQSxNQUFNO1FBRUwsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFbkMsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUMvRjtZQUNDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1NBQzFEO0lBQ0YsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLEtBQWM7UUFFbkIsZUFBZTtRQUNmLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUU1QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7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QUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFbEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDOUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQ3RDO29CQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDbkM7Z0JBRUQsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNkO1NBQ0Q7UUFFRCxLQUFLLEdBQUcsU0FBUyxDQUFDO1FBRWxCLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUNEO0FBbnNCRCxzQ0Ftc0JDO0FBa0RZLFFBQUEsSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBdUMsQ0FBQztBQUVqRyxrQkFBZSxhQUFhLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IFN1YlNNb2R1bGUsIFN1YlNNb2R1bGVUb2tlbml6ZXIsIElTdWJUb2tlbml6ZXJDcmVhdGUgfSBmcm9tICcuLi9tb2QnO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHsgVVN0cmluZyB9IGZyb20gJ3VuaS1zdHJpbmcnO1xuaW1wb3J0IHsgSVRhYmxlRGljdFJvdyB9IGZyb20gJy4uL3RhYmxlL2RpY3QnO1xuaW1wb3J0IHsgaGV4QW5kQW55LCB0b0hleCB9IGZyb20gJy4uL3V0aWwvaW5kZXgnO1xuaW1wb3J0IENIU19OQU1FUywgeyBGQU1JTFlfTkFNRV8xLCBGQU1JTFlfTkFNRV8yLCBTSU5HTEVfTkFNRSwgRE9VQkxFX05BTUVfMSwgRE9VQkxFX05BTUVfMiB9IGZyb20gJy4uL21vZC9DSFNfTkFNRVMnO1xuaW1wb3J0IFNlZ21lbnQsIHsgSURJQ1QsIElXb3JkLCBJRElDVDIgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCB7IGRlYnVnIH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgeyBEQVRFVElNRSB9IGZyb20gJy4uL21vZC9jb25zdCc7XG5pbXBvcnQgSVBPU1RBRyBmcm9tICcuLi9QT1NUQUcnO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9NQVhfQ0hVTktfQ09VTlQgPSA0MDtcblxuLyoqXG4gKiDlrZflhbjor4bliKvmqKHlnZdcbiAqXG4gKiBAYXV0aG9yIOiAgembtzxsZWl6b25nbWluQGdtYWlsLmNvbT5cbiAqL1xuZXhwb3J0IGNsYXNzIERpY3RUb2tlbml6ZXIgZXh0ZW5kcyBTdWJTTW9kdWxlVG9rZW5pemVyXG57XG5cblx0LyoqXG5cdCAqIOmYsuatouWboOeEoeWIhuauteWwjuiHtOWIhuaekOmBjuS5heeUmuiHs+i2hemBjuiZleeQhuiyoOiNt1xuXHQgKiDotorpq5jotornsr7mupbkvYbmmK/omZXnkIbmmYLplpPmnIPliqDlgI3miJDplbfnlJroh7PotoXpgY7oqJjmhrbpq5Tog73omZXnkIbnmoTnqIvluqZcblx0ICpcblx0ICog5pW45a2X6LaK5bCP6LaK5b+rXG5cdCAqXG5cdCAqIEZBVEFMIEVSUk9SOiBDQUxMX0FORF9SRVRSWV9MQVNUIEFsbG9jYXRpb24gZmFpbGVkIC0gSmF2YVNjcmlwdCBoZWFwIG91dCBvZiBtZW1vcnlcblx0ICpcblx0ICogQHR5cGUge251bWJlcn1cblx0ICovXG5cdE1BWF9DSFVOS19DT1VOVCA9IERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UO1xuXG5cdHByb3RlY3RlZCBfVEFCTEU6IElESUNUPElXb3JkPjtcblx0cHJvdGVjdGVkIF9UQUJMRTI6IElESUNUMjxJV29yZD47XG5cblx0X2NhY2hlKClcblx0e1xuXHRcdHN1cGVyLl9jYWNoZSgpO1xuXHRcdHRoaXMuX1RBQkxFID0gdGhpcy5zZWdtZW50LmdldERpY3QoJ1RBQkxFJyk7XG5cdFx0dGhpcy5fVEFCTEUyID0gdGhpcy5zZWdtZW50LmdldERpY3QoJ1RBQkxFMicpO1xuXHRcdHRoaXMuX1BPU1RBRyA9IHRoaXMuc2VnbWVudC5QT1NUQUc7XG5cblx0XHRpZiAodHlwZW9mIHRoaXMuc2VnbWVudC5vcHRpb25zLm1heENodW5rQ291bnQgPT0gJ251bWJlcicgJiYgdGhpcy5zZWdtZW50Lm9wdGlvbnMubWF4Q2h1bmtDb3VudClcblx0XHR7XG5cdFx0XHR0aGlzLk1BWF9DSFVOS19DT1VOVCA9IHRoaXMuc2VnbWVudC5vcHRpb25zLm1heENodW5rQ291bnQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIOWvueacquivhuWIq+eahOWNleivjei/m+ihjOWIhuivjVxuXHQgKlxuXHQgKiBAcGFyYW0ge2FycmF5fSB3b3JkcyDljZXor43mlbDnu4Rcblx0ICogQHJldHVybiB7YXJyYXl9XG5cdCAqL1xuXHRzcGxpdCh3b3JkczogSVdvcmRbXSk6IElXb3JkW11cblx0e1xuXHRcdC8vZGVidWcod29yZHMpO1xuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5fVEFCTEU7XG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5fUE9TVEFHO1xuXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgcmV0OiBJV29yZFtdID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDAsIHdvcmQ7IHdvcmQgPSB3b3Jkc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICh3b3JkLnAgPiAwKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIOS7heWvueacquivhuWIq+eahOivjei/m+ihjOWMuemFjVxuXHRcdFx0bGV0IHdvcmRpbmZvID0gdGhpcy5tYXRjaFdvcmQod29yZC53LCAwLCB3b3Jkc1tpIC0gMV0pO1xuXHRcdFx0aWYgKHdvcmRpbmZvLmxlbmd0aCA8IDEpXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKHdvcmQpO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8g5YiG56a75Ye65bey6K+G5Yir55qE5Y2V6K+NXG5cdFx0XHRsZXQgbGFzdGMgPSAwO1xuXG5cdFx0XHR3b3JkaW5mby5mb3JFYWNoKGZ1bmN0aW9uIChidywgdWkpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChidy5jID4gbGFzdGMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaCh7XG5cdFx0XHRcdFx0XHR3OiB3b3JkLncuc3Vic3RyKGxhc3RjLCBidy5jIC0gbGFzdGMpLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IGN3ID0gc2VsZi5jcmVhdGVSYXdUb2tlbih7XG5cdFx0XHRcdFx0dzogYncudyxcblx0XHRcdFx0XHRmOiBidy5mLFxuXHRcdFx0XHR9LCBUQUJMRVtidy53XSk7XG5cblx0XHRcdFx0cmV0LnB1c2goY3cpO1xuXG5cdFx0XHRcdC8qXG5cdFx0XHRcdHJldC5wdXNoKHtcblx0XHRcdFx0XHR3OiBidy53LFxuXHRcdFx0XHRcdHA6IHd3LnAsXG5cdFx0XHRcdFx0ZjogYncuZixcblx0XHRcdFx0XHRzOiB3dy5zLFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0Ki9cblx0XHRcdFx0bGFzdGMgPSBidy5jICsgYncudy5sZW5ndGg7XG5cdFx0XHR9KTtcblxuXHRcdFx0bGV0IGxhc3R3b3JkID0gd29yZGluZm9bd29yZGluZm8ubGVuZ3RoIC0gMV07XG5cdFx0XHRpZiAobGFzdHdvcmQuYyArIGxhc3R3b3JkLncubGVuZ3RoIDwgd29yZC53Lmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0bGV0IGN3ID0gc2VsZi5jcmVhdGVSYXdUb2tlbih7XG5cdFx0XHRcdFx0dzogd29yZC53LnN1YnN0cihsYXN0d29yZC5jICsgbGFzdHdvcmQudy5sZW5ndGgpLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXQucHVzaChjdyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cblx0LyoqXG5cdCAqIOWMuemFjeWNleivje+8jOi/lOWbnuebuOWFs+S/oeaBr1xuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmlofmnKxcblx0ICogQHBhcmFtIHtpbnR9IGN1ciDlvIDlp4vkvY3nva5cblx0ICogQHBhcmFtIHtvYmplY3R9IHByZXdvcmQg5LiK5LiA5Liq5Y2V6K+NXG5cdCAqIEByZXR1cm4ge2FycmF5fSAg6L+U5Zue5qC85byPICAge3c6ICfljZXor40nLCBjOiDlvIDlp4vkvY3nva59XG5cdCAqL1xuXHRwcm90ZWN0ZWQgbWF0Y2hXb3JkKHRleHQ6IHN0cmluZywgY3VyOiBudW1iZXIsIHByZXdvcmQ6IElXb3JkKVxuXHR7XG5cdFx0aWYgKGlzTmFOKGN1cikpIGN1ciA9IDA7XG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xuXHRcdGxldCBzID0gZmFsc2U7XG5cblx0XHRjb25zdCBUQUJMRTIgPSB0aGlzLl9UQUJMRTI7XG5cblx0XHQvLyDljLnphY3lj6/og73lh7rnjrDnmoTljZXor41cblx0XHR3aGlsZSAoY3VyIDwgdGV4dC5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Zm9yIChsZXQgaSBpbiBUQUJMRTIpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB3ID0gdGV4dC5zdWJzdHIoY3VyLCBpIGFzIGFueSBhcyBudW1iZXIpO1xuXHRcdFx0XHRpZiAodyBpbiBUQUJMRTJbaV0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaCh7XG5cdFx0XHRcdFx0XHR3OiB3LFxuXHRcdFx0XHRcdFx0YzogY3VyLFxuXHRcdFx0XHRcdFx0ZjogVEFCTEUyW2ldW3ddLmYsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGN1cisrO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmZpbHRlcldvcmQocmV0LCBwcmV3b3JkLCB0ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiDpgInmi6nmnIDmnInlj6/og73ljLnphY3nmoTljZXor41cblx0ICpcblx0ICogQHBhcmFtIHthcnJheX0gd29yZHMg5Y2V6K+N5L+h5oGv5pWw57uEXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwcmV3b3JkIOS4iuS4gOS4quWNleivjVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmnKzoioLopoHliIbor43nmoTmlofmnKxcblx0ICogQHJldHVybiB7YXJyYXl9XG5cdCAqL1xuXHRwcm90ZWN0ZWQgZmlsdGVyV29yZCh3b3JkczogSVdvcmRbXSwgcHJld29yZDogSVdvcmQsIHRleHQ6IHN0cmluZylcblx0e1xuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5fVEFCTEU7XG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5fUE9TVEFHO1xuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblxuXHRcdC8vIOWwhuWNleivjeaMieS9jee9ruWIhue7hFxuXHRcdGxldCB3b3JkcG9zID0gdGhpcy5nZXRQb3NJbmZvKHdvcmRzLCB0ZXh0KTtcblx0XHQvL2RlYnVnKHdvcmRwb3MpO1xuXG5cdFx0LyoqXG5cdFx0ICog5L2/55So57G75Ly85LqOTU1TR+eahOWIhuivjeeul+azlVxuXHRcdCAqIOaJvuWHuuaJgOacieWIhuivjeWPr+iDve+8jOS4u+imgeagueaNruS4gOS4i+WHoOmhueadpeivhOS7t++8mlxuXHRcdCAqIHjjgIHor43mlbDph4/mnIDlsJHvvJtcblx0XHQgKiBh44CB6K+N5bmz5Z2H6aKR546H5pyA5aSn77ybXG5cdFx0ICogYuOAgeavj+S4quivjemVv+W6puagh+WHhuW3ruacgOWwj++8m1xuXHRcdCAqIGPjgIHmnKror4bliKvor43mnIDlsJHvvJtcblx0XHQgKiBk44CB56ym5ZCI6K+t5rOV57uT5p6E6aG577ya5aaC5Lik5Liq6L+e57ut55qE5Yqo6K+N5YeP5YiG77yM5pWw6K+N5ZCO6Z2i6Lef6YeP6K+N5Yqg5YiG77ybXG5cdFx0ICog5Y+W5Lul5LiK5Yeg6aG557u85ZCI5o6S5ZCN5pyA5pyA5aW955qEXG5cdFx0ICovXG5cdFx0bGV0IGNodW5rcyA9IHRoaXMuZ2V0Q2h1bmtzKHdvcmRwb3MsIDAsIHRleHQpO1xuXHRcdC8vZGVidWcoY2h1bmtzKTtcblx0XHRsZXQgYXNzZXNzOiBBcnJheTxJQXNzZXNzUm93PiA9IFtdOyAgLy8g6K+E5Lu36KGoXG5cblx0XHQvL2NvbnNvbGUubG9nKGNodW5rcyk7XG5cblx0XHQvLyDlr7nlkITkuKrliIbmlK/lsLHooYzor4TkvLBcblx0XHRmb3IgKGxldCBpID0gMCwgY2h1bms6IElXb3JkW107IGNodW5rID0gY2h1bmtzW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0YXNzZXNzW2ldID0ge1xuXHRcdFx0XHR4OiBjaHVuay5sZW5ndGgsXG5cdFx0XHRcdGE6IDAsXG5cdFx0XHRcdGI6IDAsXG5cdFx0XHRcdGM6IDAsXG5cdFx0XHRcdGQ6IDAsXG5cblx0XHRcdFx0aW5kZXg6IGksXG5cdFx0XHR9O1xuXHRcdFx0Ly8g6K+N5bmz5Z2H6ZW/5bqmXG5cdFx0XHRsZXQgc3AgPSB0ZXh0Lmxlbmd0aCAvIGNodW5rLmxlbmd0aDtcblx0XHRcdC8vIOWPpeWtkOe7j+W4uOWMheWQq+eahOivreazlee7k+aehFxuXHRcdFx0bGV0IGhhc19EX1YgPSBmYWxzZTsgIC8vIOaYr+WQpuWMheWQq+WKqOivjVxuXG5cdFx0XHQvLyDpgY3ljoblkITkuKror41cblx0XHRcdGxldCBwcmV3OiBJV29yZDtcblxuXHRcdFx0aWYgKHByZXdvcmQpXG5cdFx0XHR7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdHByZXcgPSB7XG5cdFx0XHRcdFx0dzogcHJld29yZC53LFxuXHRcdFx0XHRcdHA6IHByZXdvcmQucCxcblx0XHRcdFx0XHRmOiBwcmV3b3JkLmYsXG5cdFx0XHRcdFx0czogcHJld29yZC5zLFxuXHRcdFx0XHR9XG5cdFx0XHRcdCovXG5cblx0XHRcdFx0cHJldyA9IHRoaXMuY3JlYXRlUmF3VG9rZW4ocHJld29yZCk7XG5cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0cHJldyA9IG51bGw7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGxldCBqID0gMCwgdzogSVdvcmQ7IHcgPSBjaHVua1tqXTsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAody53IGluIFRBQkxFKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dy5wID0gVEFCTEVbdy53XS5wO1xuXHRcdFx0XHRcdGFzc2Vzc1tpXS5hICs9IHcuZjsgICAvLyDmgLvor43popFcblxuXHRcdFx0XHRcdGlmIChqID09IDAgJiYgIXByZXdvcmQgJiYgKHcucCAmIFBPU1RBRy5EX1YpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0ICog5bCH56ys5LiA5YCL5a2X5Lmf6KiI566X6YCy5Y675piv5ZCm5YyF5ZCr5YuV6KmeXG5cdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdGhhc19EX1YgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vID09PT09PT09PT09PT09PT0g5qOA5p+l6K+t5rOV57uT5p6EID09PT09PT09PT09PT09PT09PT1cblx0XHRcdFx0XHRpZiAocHJldylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzkuIrkuIDkuKror43mmK/mlbDor43kuJTlvZPliY3or43mmK/ph4/or43vvIjljZXkvY3vvInvvIzliJnliqDliIZcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0KHByZXcucCAmIFBPU1RBRy5BX00pXG5cdFx0XHRcdFx0XHRcdCYmXG5cdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHQoKHcucCAmIFBPU1RBRy5BX1EpKVxuXHRcdFx0XHRcdFx0XHRcdHx8IHcudyBpbiBEQVRFVElNRVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIOWmguaenOW9k+WJjeivjeaYr+WKqOivjVxuXHRcdFx0XHRcdFx0aWYgKCh3LnAgJiBQT1NUQUcuRF9WKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aGFzX0RfViA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdC8vIOWmguaenOaYr+i/nue7reeahOS4pOS4quWKqOivje+8jOWImeWHj+WIhlxuXHRcdFx0XHRcdFx0XHQvL2lmICgocHJldy5wICYgUE9TVEFHLkRfVikgPiAwKVxuXHRcdFx0XHRcdFx0XHQvL2Fzc2Vzc1tpXS5kLS07XG5cblx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0Ly8g5aaC5p6c5pivIOW9ouWuueivjSArIOWKqOivje+8jOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0XHRpZiAoKHByZXcucCAmIFBPU1RBRy5EX0EpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDlia/or40gKyDliqjor43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdFx0aWYgKHByZXcucCAmIFBPU1RBRy5EX0QpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK/lnLDljLrlkI3jgIHmnLrmnoTlkI3miJblvaLlrrnor43vvIzlkI7pnaLot5/lnLDljLrjgIHmnLrmnoTjgIHku6Por43jgIHlkI3or43nrYnvvIzliJnliqDliIZcblx0XHRcdFx0XHRcdGlmICgoXG5cdFx0XHRcdFx0XHRcdFx0KHByZXcucCAmIFBPU1RBRy5BX05TKVxuXHRcdFx0XHRcdFx0XHRcdHx8IChwcmV3LnAgJiBQT1NUQUcuQV9OVClcblx0XHRcdFx0XHRcdFx0XHR8fCAocHJldy5wICYgUE9TVEFHLkRfQSlcblx0XHRcdFx0XHRcdFx0KSAmJlxuXHRcdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdFx0KHcucCAmIFBPU1RBRy5EX04pXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05SKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OUylcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkFfTlopXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05UKVxuXHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5pivIOaWueS9jeivjSArIOaVsOmHj+ivje+8jOWImeWKoOWIhlxuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHQocHJldy5wICYgUE9TVEFHLkRfRilcblx0XHRcdFx0XHRcdFx0JiZcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdCh3LnAgJiBQT1NUQUcuQV9NKVxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuRF9NUSlcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9kZWJ1ZyhwcmV3LCB3KTtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDlp5MgKyDlkI3or43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdHByZXcudyBpbiBGQU1JTFlfTkFNRV8xXG5cdFx0XHRcdFx0XHRcdFx0fHwgcHJldy53IGluIEZBTUlMWV9OQU1FXzJcblx0XHRcdFx0XHRcdFx0KSAmJlxuXHRcdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdFx0KHcucCAmIFBPU1RBRy5EX04pXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHcucCAmIFBPU1RBRy5BX05aKVxuXHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvL2RlYnVnKHByZXcsIHcpO1xuXHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdCAqIOWcsOWQjS/lpITmiYAgKyDmlrnkvY1cblx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0aWYgKGhleEFuZEFueShwcmV3LnBcblx0XHRcdFx0XHRcdFx0LCBQT1NUQUcuRF9TXG5cdFx0XHRcdFx0XHRcdCwgUE9TVEFHLkFfTlMsXG5cdFx0XHRcdFx0XHQpICYmIGhleEFuZEFueSh3LnBcblx0XHRcdFx0XHRcdFx0LCBQT1NUQUcuRF9GLFxuXHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMC41O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyDmjqLmtYvkuIvkuIDkuKror41cblx0XHRcdFx0XHRcdGxldCBuZXh0dyA9IGNodW5rW2ogKyAxXTtcblx0XHRcdFx0XHRcdGlmIChuZXh0dylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKG5leHR3LncgaW4gVEFCTEUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRuZXh0dy5wID0gVEFCTEVbbmV4dHcud10ucDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK/ov57or43vvIzliY3lkI7kuKTkuKror43or43mgKfnm7jlkIzliJnliqDliIZcblx0XHRcdFx0XHRcdFx0aWYgKCh3LnAgJiBQT1NUQUcuRF9DKSAmJiBwcmV3LnAgPT0gbmV4dHcucClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Ly8g5aaC5p6c5b2T5YmN5piv4oCc55qE4oCdKyDlkI3or43vvIzliJnliqDliIZcblx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdCh3LncgPT0gJ+eahCcgfHwgdy53ID09ICfkuYsnKVxuXHRcdFx0XHRcdFx0XHRcdCYmIChcblx0XHRcdFx0XHRcdFx0XHRcdChuZXh0dy5wICYgUE9TVEFHLkRfTilcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkFfTlIpXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCAobmV4dHcucCAmIFBPU1RBRy5BX05TKVxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OWilcblx0XHRcdFx0XHRcdFx0XHRcdHx8IChuZXh0dy5wICYgUE9TVEFHLkFfTlQpXG5cdFx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kICs9IDEuNTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdC8vIEBGSVhNRSDmmrTlipvop6Pmsbog5LiJ5aSp5ZCOIOeahOWVj+mhjFxuXHRcdFx0XHRcdFx0XHRpZiAobmV4dHcudyA9PSAn5ZCOJyAmJiB3LnAgJiBQT1NUQUcuRF9UICYmIGhleEFuZEFueShwcmV3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfTVEsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkFfTSxcblx0XHRcdFx0XHRcdFx0KSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Ly8gQEZJWE1FIOWIsOa5luS4remWk+WQjuaJi+e1guaWvOiDveS8keaBr+S6hlxuXHRcdFx0XHRcdFx0XHRlbHNlIGlmIChcblx0XHRcdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdFx0XHRuZXh0dy53ID09ICflkI4nXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCBuZXh0dy53ID09ICflvownXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdCYmIGhleEFuZEFueSh3LnAsXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfRixcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdFx0dy53ID09ICflkI4nXG5cdFx0XHRcdFx0XHRcdFx0XHR8fCB3LncgPT0gJ+W+jCdcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0JiYgaGV4QW5kQW55KHByZXcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9GLFxuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHQmJiBoZXhBbmRBbnkobmV4dHcucCxcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9OLFxuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8g5pyq6K+G5Yir55qE6K+N5pWw6YePXG5cdFx0XHRcdFx0YXNzZXNzW2ldLmMrKztcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyDmoIflh4blt65cblx0XHRcdFx0YXNzZXNzW2ldLmIgKz0gTWF0aC5wb3coc3AgLSB3LncubGVuZ3RoLCAyKTtcblx0XHRcdFx0cHJldyA9IGNodW5rW2pdO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyDlpoLmnpzlj6XlrZDkuK3ljIXlkKvkuoboh7PlsJHkuIDkuKrliqjor41cblx0XHRcdGlmIChoYXNfRF9WID09PSBmYWxzZSkgYXNzZXNzW2ldLmQgLT0gMC41O1xuXG5cdFx0XHRhc3Nlc3NbaV0uYSA9IGFzc2Vzc1tpXS5hIC8gY2h1bmsubGVuZ3RoO1xuXHRcdFx0YXNzZXNzW2ldLmIgPSBhc3Nlc3NbaV0uYiAvIGNodW5rLmxlbmd0aDtcblx0XHR9XG5cblx0XHQvL2NvbnNvbGUuZGlyKGFzc2Vzcyk7XG5cblx0XHQvLyDorqHnrpfmjpLlkI1cblx0XHRsZXQgdG9wID0gdGhpcy5nZXRUb3BzKGFzc2Vzcyk7XG5cdFx0bGV0IGN1cnJjaHVuayA9IGNodW5rc1t0b3BdO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhhc3Nlc3MpO1xuXHRcdC8vY29uc29sZS5sb2coT2JqZWN0LmVudHJpZXMoY2h1bmtzKSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhPYmplY3QuZW50cmllcyhjaHVua3MpLm1hcCgoW2ksIGNodW5rXSkgPT4geyByZXR1cm4geyBpLCBhc3NlczogYXNzZXNzW2kgYXMgdW5rbm93biBhcyBudW1iZXJdLCBjaHVuayB9IH0pKTtcblx0XHQvL2NvbnNvbGUubG9nKHsgaTogdG9wLCBhc3NlczogYXNzZXNzW3RvcF0sIGN1cnJjaHVuayB9KTtcblx0XHQvL2NvbnNvbGUubG9nKHRvcCk7XG5cdFx0Ly9jb25zb2xlLmxvZyhjdXJyY2h1bmspO1xuXG5cdFx0Ly8g5YmU6Zmk5LiN6IO96K+G5Yir55qE6K+NXG5cdFx0Zm9yIChsZXQgaSA9IDAsIHdvcmQ6IElXb3JkOyB3b3JkID0gY3VycmNodW5rW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKCEod29yZC53IGluIFRBQkxFKSlcblx0XHRcdHtcblx0XHRcdFx0Y3VycmNodW5rLnNwbGljZShpLS0sIDEpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXQgPSBjdXJyY2h1bms7XG5cblx0XHQvLyDoqablnJbkuLvli5XmuIXpmaToqJjmhrbpq5Rcblx0XHRhc3Nlc3MgPSB1bmRlZmluZWQ7XG5cdFx0Y2h1bmtzID0gdW5kZWZpbmVkO1xuXG5cdFx0Ly9kZWJ1ZyhyZXQpO1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHQvKipcblx0ICog6K+E5Lu35o6S5ZCNXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhc3Nlc3Ncblx0ICogQHJldHVybiB7b2JqZWN0fVxuXHQgKi9cblx0Z2V0VG9wcyhhc3Nlc3M6IEFycmF5PElBc3Nlc3NSb3c+KVxuXHR7XG5cdFx0Ly9kZWJ1Zyhhc3Nlc3MpO1xuXHRcdC8vIOWPluWQhOmhueacgOWkp+WAvFxuXHRcdGxldCB0b3A6IElBc3Nlc3NSb3cgPSB7XG5cdFx0XHR4OiBhc3Nlc3NbMF0ueCxcblx0XHRcdGE6IGFzc2Vzc1swXS5hLFxuXHRcdFx0YjogYXNzZXNzWzBdLmIsXG5cdFx0XHRjOiBhc3Nlc3NbMF0uYyxcblx0XHRcdGQ6IGFzc2Vzc1swXS5kLFxuXHRcdH07XG5cblx0XHRmb3IgKGxldCBpID0gMSwgYXNzOiBJQXNzZXNzUm93OyBhc3MgPSBhc3Nlc3NbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAoYXNzLmEgPiB0b3AuYSkgdG9wLmEgPSBhc3MuYTsgIC8vIOWPluacgOWkp+W5s+Wdh+ivjemikVxuXHRcdFx0aWYgKGFzcy5iIDwgdG9wLmIpIHRvcC5iID0gYXNzLmI7ICAvLyDlj5bmnIDlsI/moIflh4blt65cblx0XHRcdGlmIChhc3MuYyA+IHRvcC5jKSB0b3AuYyA9IGFzcy5jOyAgLy8g5Y+W5pyA5aSn5pyq6K+G5Yir6K+NXG5cdFx0XHRpZiAoYXNzLmQgPCB0b3AuZCkgdG9wLmQgPSBhc3MuZDsgIC8vIOWPluacgOWwj+ivreazleWIhuaVsFxuXHRcdFx0aWYgKGFzcy54ID4gdG9wLngpIHRvcC54ID0gYXNzLng7ICAvLyDlj5bmnIDlpKfljZXor43mlbDph49cblx0XHR9XG5cdFx0Ly9kZWJ1Zyh0b3ApO1xuXG5cdFx0Ly8g6K+E5Lyw5o6S5ZCNXG5cdFx0bGV0IHRvcHM6IG51bWJlcltdID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDAsIGFzczogSUFzc2Vzc1JvdzsgYXNzID0gYXNzZXNzW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0dG9wc1tpXSA9IDA7XG5cdFx0XHQvLyDor43mlbDph4/vvIzotorlsI/otorlpb1cblx0XHRcdHRvcHNbaV0gKz0gKHRvcC54IC0gYXNzLngpICogMS41O1xuXHRcdFx0Ly8g6K+N5oC76aKR546H77yM6LaK5aSn6LaK5aW9XG5cdFx0XHRpZiAoYXNzLmEgPj0gdG9wLmEpIHRvcHNbaV0gKz0gMTtcblx0XHRcdC8vIOivjeagh+WHhuW3ru+8jOi2iuWwj+i2iuWlvVxuXHRcdFx0aWYgKGFzcy5iIDw9IHRvcC5iKSB0b3BzW2ldICs9IDE7XG5cdFx0XHQvLyDmnKror4bliKvor43vvIzotorlsI/otorlpb1cblx0XHRcdHRvcHNbaV0gKz0gKHRvcC5jIC0gYXNzLmMpOy8vZGVidWcodG9wc1tpXSk7XG5cdFx0XHQvLyDnrKblkIjor63ms5Xnu5PmnoTnqIvluqbvvIzotorlpKfotorlpb1cblx0XHRcdHRvcHNbaV0gKz0gKGFzcy5kIDwgMCA/IHRvcC5kICsgYXNzLmQgOiBhc3MuZCAtIHRvcC5kKSAqIDE7XG5cblx0XHRcdGFzcy5zY29yZSA9IHRvcHNbaV07XG5cblx0XHRcdC8vZGVidWcodG9wc1tpXSk7ZGVidWcoJy0tLScpO1xuXHRcdH1cblx0XHQvL2RlYnVnKHRvcHMuam9pbignICAnKSk7XG5cblx0XHQvL2NvbnNvbGUubG9nKHRvcHMpO1xuXHRcdC8vY29uc29sZS5sb2coYXNzZXNzKTtcblxuXHRcdC8vY29uc3Qgb2xkX21ldGhvZCA9IHRydWU7XG5cdFx0Y29uc3Qgb2xkX21ldGhvZCA9IGZhbHNlO1xuXG5cdFx0Ly8g5Y+W5YiG5pWw5pyA6auY55qEXG5cdFx0bGV0IGN1cnJpID0gMDtcblx0XHRsZXQgbWF4cyA9IHRvcHNbMF07XG5cdFx0Zm9yIChsZXQgaSBpbiB0b3BzKVxuXHRcdHtcblx0XHRcdGxldCBzID0gdG9wc1tpXTtcblx0XHRcdGlmIChzID4gbWF4cylcblx0XHRcdHtcblx0XHRcdFx0Y3VycmkgPSBpIGFzIGFueSBhcyBudW1iZXI7XG5cdFx0XHRcdG1heHMgPSBzO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocyA9PSBtYXhzKVxuXHRcdFx0e1xuXHRcdFx0XHQvKipcblx0XHRcdFx0ICog5aaC5p6c5YiG5pWw55u45ZCM77yM5YiZ5qC55o2u6K+N6ZW/5bqm44CB5pyq6K+G5Yir6K+N5Liq5pWw5ZKM5bmz5Z2H6aKR546H5p2l6YCJ5oupXG5cdFx0XHRcdCAqXG5cdFx0XHRcdCAqIOWmguaenOS+neeEtuWQjOWIhu+8jOWJh+S/neaMgeS4jeiuilxuXHRcdFx0XHQgKi9cblx0XHRcdFx0bGV0IGEgPSAwO1xuXHRcdFx0XHRsZXQgYiA9IDA7XG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0uYyA8IGFzc2Vzc1tjdXJyaV0uYylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGErKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0uYyAhPT0gYXNzZXNzW2N1cnJpXS5jKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0uYSA+IGFzc2Vzc1tjdXJyaV0uYSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGErKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0uYSAhPT0gYXNzZXNzW2N1cnJpXS5hKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0ueCA8IGFzc2Vzc1tjdXJyaV0ueClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGErKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0ueCAhPT0gYXNzZXNzW2N1cnJpXS54KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhID4gYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGN1cnJpID0gaSBhcyBhbnkgYXMgbnVtYmVyO1xuXHRcdFx0XHRcdG1heHMgPSBzO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvL2RlYnVnKHsgaSwgcywgbWF4cywgY3VycmkgfSk7XG5cdFx0fVxuXHRcdC8vZGVidWcoJ21heDogaT0nICsgY3VycmkgKyAnLCBzPScgKyB0b3BzW2N1cnJpXSk7XG5cdFx0cmV0dXJuIGN1cnJpO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWwhuWNleivjeaMieeFp+S9jee9ruaOkuWIl1xuXHQgKlxuXHQgKiBAcGFyYW0ge2FycmF5fSB3b3Jkc1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuXHQgKiBAcmV0dXJuIHtvYmplY3R9XG5cdCAqL1xuXHRnZXRQb3NJbmZvKHdvcmRzOiBJV29yZFtdLCB0ZXh0OiBzdHJpbmcpOiB7XG5cdFx0W2luZGV4OiBudW1iZXJdOiBJV29yZFtdO1xuXHR9XG5cdHtcblx0XHRsZXQgd29yZHBvcyA9IHt9O1xuXHRcdC8vIOWwhuWNleivjeaMieS9jee9ruWIhue7hFxuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOyB3b3JkID0gd29yZHNbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAoIXdvcmRwb3Nbd29yZC5jXSlcblx0XHRcdHtcblx0XHRcdFx0d29yZHBvc1t3b3JkLmNdID0gW107XG5cdFx0XHR9XG5cdFx0XHR3b3JkcG9zW3dvcmQuY10ucHVzaCh3b3JkKTtcblx0XHR9XG5cdFx0Ly8g5oyJ5Y2V5a2X5YiG5Ymy5paH5pys77yM5aGr6KGl56m657y655qE5L2N572uXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0Lmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICghd29yZHBvc1tpXSlcblx0XHRcdHtcblx0XHRcdFx0d29yZHBvc1tpXSA9IFt7IHc6IHRleHQuY2hhckF0KGkpLCBjOiBpLCBmOiAwIH1dO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB3b3JkcG9zO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWPluaJgOacieWIhuaUr1xuXHQgKlxuXHQgKiBAcGFyYW0ge3tbcDogbnVtYmVyXTogU2VnbWVudC5JV29yZFtdfX0gd29yZHBvc1xuXHQgKiBAcGFyYW0ge251bWJlcn0gcG9zIOW9k+WJjeS9jee9rlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmnKzoioLopoHliIbor43nmoTmlofmnKxcblx0ICogQHBhcmFtIHtudW1iZXJ9IHRvdGFsX2NvdW50XG5cdCAqIEByZXR1cm5zIHtTZWdtZW50LklXb3JkW11bXX1cblx0ICovXG5cdGdldENodW5rcyh3b3JkcG9zOiB7XG5cdFx0W2luZGV4OiBudW1iZXJdOiBJV29yZFtdO1xuXHR9LCBwb3M6IG51bWJlciwgdGV4dD86IHN0cmluZywgdG90YWxfY291bnQgPSAwKTogSVdvcmRbXVtdXG5cdHtcblx0XHQvKipcblx0XHQgKiDlv73nlaXpgKPlrZdcblx0XHQgKlxuXHRcdCAqIOS+i+Wmgjog5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWK5ZWKXG5cdFx0ICovXG5cdFx0bGV0IG07XG5cdFx0aWYgKG0gPSB0ZXh0Lm1hdGNoKC9eKCguKylcXDJ7NSx9KS8pKVxuXHRcdHtcblx0XHRcdGxldCBzMSA9IHRleHQuc2xpY2UoMCwgbVsxXS5sZW5ndGgpO1xuXHRcdFx0bGV0IHMyID0gdGV4dC5zbGljZShtWzFdLmxlbmd0aCk7XG5cblx0XHRcdGxldCB3b3JkID0ge1xuXHRcdFx0XHR3OiBzMSxcblx0XHRcdFx0YzogcG9zLFxuXHRcdFx0XHRmOiAwLFxuXHRcdFx0fSBhcyBJV29yZDtcblxuXHRcdFx0bGV0IHJldDogSVdvcmRbXVtdID0gW107XG5cblx0XHRcdGlmIChzMiAhPT0gJycpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBjaHVua3MgPSB0aGlzLmdldENodW5rcyh3b3JkcG9zLCBwb3MgKyBzMS5sZW5ndGgsIHMyLCB0b3RhbF9jb3VudCk7XG5cblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBjaHVua3MubGVuZ3RoOyBqKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaChbd29yZF0uY29uY2F0KGNodW5rc1tqXSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKFt3b3JkXSk7XG5cdFx0XHR9XG5cbi8vXHRcdFx0Y29uc29sZS5kaXIod29yZHBvcyk7XG4vL1xuLy9cdFx0XHRjb25zb2xlLmRpcihyZXQpO1xuLy9cbi8vXHRcdFx0Y29uc29sZS5kaXIoW3BvcywgdGV4dCwgdG90YWxfY291bnRdKTtcblxuXHRcdFx0cmV0dXJuIHJldDtcblx0XHR9XG5cblx0XHR0b3RhbF9jb3VudCsrO1xuXG5cdFx0bGV0IHdvcmRzID0gd29yZHBvc1twb3NdIHx8IFtdO1xuXHRcdC8vIGRlYnVnKCdnZXRDaHVua3M6ICcpO1xuXHRcdC8vIGRlYnVnKHdvcmRzKTtcblx0XHQvLyB0aHJvdyBuZXcgRXJyb3IoKTtcblx0XHRsZXQgcmV0OiBJV29yZFtdW10gPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHdvcmRzLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGxldCB3b3JkID0gd29yZHNbaV07XG5cdFx0XHQvL2RlYnVnKHdvcmQpO1xuXHRcdFx0bGV0IG5leHRjdXIgPSB3b3JkLmMgKyB3b3JkLncubGVuZ3RoO1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBARklYTUVcblx0XHRcdCAqL1xuXHRcdFx0aWYgKCF3b3JkcG9zW25leHRjdXJdKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaChbd29yZF0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodG90YWxfY291bnQgPiB0aGlzLk1BWF9DSFVOS19DT1VOVClcblx0XHRcdHtcblx0XHRcdFx0Ly8gZG8gc29tZXRoaW5nXG5cbi8vXHRcdFx0XHRjb25zb2xlLmxvZyg0NDQsIHdvcmRzLnNsaWNlKGkpKTtcbi8vXHRcdFx0XHRjb25zb2xlLmxvZygzMzMsIHdvcmQpO1xuXG5cdFx0XHRcdGxldCB3MTogSVdvcmRbXSA9IFt3b3JkXTtcblxuXHRcdFx0XHRsZXQgaiA9IG5leHRjdXI7XG5cdFx0XHRcdHdoaWxlIChqIGluIHdvcmRwb3MpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdzIgPSB3b3JkcG9zW2pdWzBdO1xuXG5cdFx0XHRcdFx0aWYgKHcyKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHcxLnB1c2godzIpO1xuXG5cdFx0XHRcdFx0XHRqICs9IHcyLncubGVuZ3RoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0LnB1c2godzEpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdCA9IHRleHQuc2xpY2Uod29yZC53Lmxlbmd0aCk7XG5cblx0XHRcdFx0bGV0IGNodW5rcyA9IHRoaXMuZ2V0Q2h1bmtzKHdvcmRwb3MsIG5leHRjdXIsIHQsIHRvdGFsX2NvdW50KTtcblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBjaHVua3MubGVuZ3RoOyBqKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaChbd29yZF0uY29uY2F0KGNodW5rc1tqXSkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2h1bmtzID0gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR3b3JkcyA9IHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBEaWN0VG9rZW5pemVyXG57XG5cdC8qKlxuXHQgKiDkvb/nlKjnsbvkvLzkuo5NTVNH55qE5YiG6K+N566X5rOVXG5cdCAqIOaJvuWHuuaJgOacieWIhuivjeWPr+iDve+8jOS4u+imgeagueaNruS4gOS4i+WHoOmhueadpeivhOS7t++8mlxuXHQgKlxuXHQgKiB444CB6K+N5pWw6YeP5pyA5bCR77ybXG5cdCAqIGHjgIHor43lubPlnYfpopHnjofmnIDlpKfvvJtcblx0ICogYuOAgeavj+S4quivjemVv+W6puagh+WHhuW3ruacgOWwj++8m1xuXHQgKiBj44CB5pyq6K+G5Yir6K+N5pyA5bCR77ybXG5cdCAqIGTjgIHnrKblkIjor63ms5Xnu5PmnoTpobnvvJrlpoLkuKTkuKrov57nu63nmoTliqjor43lh4/liIbvvIzmlbDor43lkI7pnaLot5/ph4/or43liqDliIbvvJtcblx0ICpcblx0ICog5Y+W5Lul5LiK5Yeg6aG557u85ZCI5o6S5ZCN5pyA5pyA5aW955qEXG5cdCAqL1xuXHRleHBvcnQgdHlwZSBJQXNzZXNzUm93ID0ge1xuXHRcdC8qKlxuXHRcdCAqIOivjeaVsOmHj++8jOi2iuWwj+i2iuWlvVxuXHRcdCAqL1xuXHRcdHg6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDor43mgLvpopHnjofvvIzotorlpKfotorlpb1cblx0XHQgKi9cblx0XHRhOiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICog6K+N5qCH5YeG5beu77yM6LaK5bCP6LaK5aW9XG5cdFx0ICog5q+P5Liq6K+N6ZW/5bqm5qCH5YeG5beu5pyA5bCPXG5cdFx0ICovXG5cdFx0YjogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIOacquivhuWIq+ivje+8jOi2iuWwj+i2iuWlvVxuXHRcdCAqL1xuXHRcdGM6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDnrKblkIjor63ms5Xnu5PmnoTnqIvluqbvvIzotorlpKfotorlpb1cblx0XHQgKiDnrKblkIjor63ms5Xnu5PmnoTpobnvvJrlpoLkuKTkuKrov57nu63nmoTliqjor43lh4/liIbvvIzmlbDor43lkI7pnaLot5/ph4/or43liqDliIZcblx0XHQgKi9cblx0XHRkOiBudW1iZXIsXG5cblx0XHQvKipcblx0XHQgKiDntZDnrpfoqZXliIYo6Ieq5YuV6KiI566XKVxuXHRcdCAqL1xuXHRcdHNjb3JlPzogbnVtYmVyLFxuXHRcdHJlYWRvbmx5IGluZGV4PzogbnVtYmVyLFxuXHR9O1xufVxuXG5leHBvcnQgaW1wb3J0IElBc3Nlc3NSb3cgPSBEaWN0VG9rZW5pemVyLklBc3Nlc3NSb3c7XG5cbmV4cG9ydCBjb25zdCBpbml0ID0gRGljdFRva2VuaXplci5pbml0LmJpbmQoRGljdFRva2VuaXplcikgYXMgSVN1YlRva2VuaXplckNyZWF0ZTxEaWN0VG9rZW5pemVyPjtcblxuZXhwb3J0IGRlZmF1bHQgRGljdFRva2VuaXplcjtcblxuLy9kZWJ1ZyhEQVRFVElNRSk7XG5cbi8vZGVidWcobWF0Y2hXb3JkKCfplb/mmKXluILplb/mmKXoja/lupcnKSk7XG4iXX0=