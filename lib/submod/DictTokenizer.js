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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGljdFRva2VuaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRpY3RUb2tlbml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLGdDQUE4RTtBQUk5RSx5Q0FBaUQ7QUFDakQsZ0RBQXNIO0FBR3RILHdDQUF3QztBQUczQixRQUFBLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztBQUUxQzs7OztHQUlHO0FBQ0gsTUFBYSxhQUFjLFNBQVEseUJBQW1CO0lBQXREOztRQUdDOzs7Ozs7Ozs7V0FTRztRQUNILG9CQUFlLEdBQUcsK0JBQXVCLENBQUM7SUFzckIzQyxDQUFDO0lBanJCQSxNQUFNO1FBRUwsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFbkMsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUMvRjtZQUNDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1NBQzFEO0lBQ0YsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLEtBQWM7UUFFbkIsZUFBZTtRQUNmLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUU1QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7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QUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFbEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDOUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQ3RDO29CQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDbkM7Z0JBRUQsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNkO1NBQ0Q7UUFFRCxLQUFLLEdBQUcsU0FBUyxDQUFDO1FBRWxCLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUNEO0FBbnNCRCxzQ0Ftc0JDO0FBa0RZLFFBQUEsSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBdUMsQ0FBQztBQUVqRyxrQkFBZSxhQUFhLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBTdWJTTW9kdWxlLCBTdWJTTW9kdWxlVG9rZW5pemVyLCBJU3ViVG9rZW5pemVyQ3JlYXRlIH0gZnJvbSAnLi4vbW9kJztcclxuLy8gQHRzLWlnbm9yZVxyXG5pbXBvcnQgeyBVU3RyaW5nIH0gZnJvbSAndW5pLXN0cmluZyc7XHJcbmltcG9ydCB7IElUYWJsZURpY3RSb3cgfSBmcm9tICcuLi90YWJsZS9kaWN0JztcclxuaW1wb3J0IHsgaGV4QW5kQW55LCB0b0hleCB9IGZyb20gJy4uL3V0aWwvaW5kZXgnO1xyXG5pbXBvcnQgQ0hTX05BTUVTLCB7IEZBTUlMWV9OQU1FXzEsIEZBTUlMWV9OQU1FXzIsIFNJTkdMRV9OQU1FLCBET1VCTEVfTkFNRV8xLCBET1VCTEVfTkFNRV8yIH0gZnJvbSAnLi4vbW9kL0NIU19OQU1FUyc7XHJcbmltcG9ydCBTZWdtZW50LCB7IElESUNULCBJV29yZCwgSURJQ1QyIH0gZnJvbSAnLi4vU2VnbWVudCc7XHJcbmltcG9ydCB7IGRlYnVnIH0gZnJvbSAnLi4vdXRpbCc7XHJcbmltcG9ydCB7IERBVEVUSU1FIH0gZnJvbSAnLi4vbW9kL2NvbnN0JztcclxuaW1wb3J0IElQT1NUQUcgZnJvbSAnLi4vUE9TVEFHJztcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX01BWF9DSFVOS19DT1VOVCA9IDQwO1xyXG5cclxuLyoqXHJcbiAqIOWtl+WFuOivhuWIq+aooeWdl1xyXG4gKlxyXG4gKiBAYXV0aG9yIOiAgembtzxsZWl6b25nbWluQGdtYWlsLmNvbT5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBEaWN0VG9rZW5pemVyIGV4dGVuZHMgU3ViU01vZHVsZVRva2VuaXplclxyXG57XHJcblxyXG5cdC8qKlxyXG5cdCAqIOmYsuatouWboOeEoeWIhuauteWwjuiHtOWIhuaekOmBjuS5heeUmuiHs+i2hemBjuiZleeQhuiyoOiNt1xyXG5cdCAqIOi2iumrmOi2iueyvua6luS9huaYr+iZleeQhuaZgumWk+acg+WKoOWAjeaIkOmVt+eUmuiHs+i2hemBjuiomOaGtumrlOiDveiZleeQhueahOeoi+W6plxyXG5cdCAqXHJcblx0ICog5pW45a2X6LaK5bCP6LaK5b+rXHJcblx0ICpcclxuXHQgKiBGQVRBTCBFUlJPUjogQ0FMTF9BTkRfUkVUUllfTEFTVCBBbGxvY2F0aW9uIGZhaWxlZCAtIEphdmFTY3JpcHQgaGVhcCBvdXQgb2YgbWVtb3J5XHJcblx0ICpcclxuXHQgKiBAdHlwZSB7bnVtYmVyfVxyXG5cdCAqL1xyXG5cdE1BWF9DSFVOS19DT1VOVCA9IERFRkFVTFRfTUFYX0NIVU5LX0NPVU5UO1xyXG5cclxuXHRwcm90ZWN0ZWQgX1RBQkxFOiBJRElDVDxJV29yZD47XHJcblx0cHJvdGVjdGVkIF9UQUJMRTI6IElESUNUMjxJV29yZD47XHJcblxyXG5cdF9jYWNoZSgpXHJcblx0e1xyXG5cdFx0c3VwZXIuX2NhY2hlKCk7XHJcblx0XHR0aGlzLl9UQUJMRSA9IHRoaXMuc2VnbWVudC5nZXREaWN0KCdUQUJMRScpO1xyXG5cdFx0dGhpcy5fVEFCTEUyID0gdGhpcy5zZWdtZW50LmdldERpY3QoJ1RBQkxFMicpO1xyXG5cdFx0dGhpcy5fUE9TVEFHID0gdGhpcy5zZWdtZW50LlBPU1RBRztcclxuXHJcblx0XHRpZiAodHlwZW9mIHRoaXMuc2VnbWVudC5vcHRpb25zLm1heENodW5rQ291bnQgPT0gJ251bWJlcicgJiYgdGhpcy5zZWdtZW50Lm9wdGlvbnMubWF4Q2h1bmtDb3VudClcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5NQVhfQ0hVTktfQ09VTlQgPSB0aGlzLnNlZ21lbnQub3B0aW9ucy5tYXhDaHVua0NvdW50O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICog5a+55pyq6K+G5Yir55qE5Y2V6K+N6L+b6KGM5YiG6K+NXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSB3b3JkcyDljZXor43mlbDnu4RcclxuXHQgKiBAcmV0dXJuIHthcnJheX1cclxuXHQgKi9cclxuXHRzcGxpdCh3b3JkczogSVdvcmRbXSk6IElXb3JkW11cclxuXHR7XHJcblx0XHQvL2RlYnVnKHdvcmRzKTtcclxuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5fVEFCTEU7XHJcblx0XHRjb25zdCBQT1NUQUcgPSB0aGlzLl9QT1NUQUc7XHJcblxyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDAsIHdvcmQ7IHdvcmQgPSB3b3Jkc1tpXTsgaSsrKVxyXG5cdFx0e1xyXG5cdFx0XHRpZiAod29yZC5wID4gMClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHJldC5wdXNoKHdvcmQpO1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyDku4Xlr7nmnKror4bliKvnmoTor43ov5vooYzljLnphY1cclxuXHRcdFx0bGV0IHdvcmRpbmZvID0gdGhpcy5tYXRjaFdvcmQod29yZC53LCAwLCB3b3Jkc1tpIC0gMV0pO1xyXG5cdFx0XHRpZiAod29yZGluZm8ubGVuZ3RoIDwgMSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHJldC5wdXNoKHdvcmQpO1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyDliIbnprvlh7rlt7Lor4bliKvnmoTljZXor41cclxuXHRcdFx0bGV0IGxhc3RjID0gMDtcclxuXHJcblx0XHRcdHdvcmRpbmZvLmZvckVhY2goZnVuY3Rpb24gKGJ3LCB1aSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGlmIChidy5jID4gbGFzdGMpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cmV0LnB1c2goe1xyXG5cdFx0XHRcdFx0XHR3OiB3b3JkLncuc3Vic3RyKGxhc3RjLCBidy5jIC0gbGFzdGMpLFxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgY3cgPSBzZWxmLmNyZWF0ZVJhd1Rva2VuKHtcclxuXHRcdFx0XHRcdHc6IGJ3LncsXHJcblx0XHRcdFx0XHRmOiBidy5mLFxyXG5cdFx0XHRcdH0sIFRBQkxFW2J3LnddKTtcclxuXHJcblx0XHRcdFx0cmV0LnB1c2goY3cpO1xyXG5cclxuXHRcdFx0XHQvKlxyXG5cdFx0XHRcdHJldC5wdXNoKHtcclxuXHRcdFx0XHRcdHc6IGJ3LncsXHJcblx0XHRcdFx0XHRwOiB3dy5wLFxyXG5cdFx0XHRcdFx0ZjogYncuZixcclxuXHRcdFx0XHRcdHM6IHd3LnMsXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0Ki9cclxuXHRcdFx0XHRsYXN0YyA9IGJ3LmMgKyBidy53Lmxlbmd0aDtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRsZXQgbGFzdHdvcmQgPSB3b3JkaW5mb1t3b3JkaW5mby5sZW5ndGggLSAxXTtcclxuXHRcdFx0aWYgKGxhc3R3b3JkLmMgKyBsYXN0d29yZC53Lmxlbmd0aCA8IHdvcmQudy5sZW5ndGgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRsZXQgY3cgPSBzZWxmLmNyZWF0ZVJhd1Rva2VuKHtcclxuXHRcdFx0XHRcdHc6IHdvcmQudy5zdWJzdHIobGFzdHdvcmQuYyArIGxhc3R3b3JkLncubGVuZ3RoKSxcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0cmV0LnB1c2goY3cpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9XHJcblxyXG5cdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5cdC8qKlxyXG5cdCAqIOWMuemFjeWNleivje+8jOi/lOWbnuebuOWFs+S/oeaBr1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQg5paH5pysXHJcblx0ICogQHBhcmFtIHtpbnR9IGN1ciDlvIDlp4vkvY3nva5cclxuXHQgKiBAcGFyYW0ge29iamVjdH0gcHJld29yZCDkuIrkuIDkuKrljZXor41cclxuXHQgKiBAcmV0dXJuIHthcnJheX0gIOi/lOWbnuagvOW8jyAgIHt3OiAn5Y2V6K+NJywgYzog5byA5aeL5L2N572ufVxyXG5cdCAqL1xyXG5cdHByb3RlY3RlZCBtYXRjaFdvcmQodGV4dDogc3RyaW5nLCBjdXI6IG51bWJlciwgcHJld29yZDogSVdvcmQpXHJcblx0e1xyXG5cdFx0aWYgKGlzTmFOKGN1cikpIGN1ciA9IDA7XHJcblx0XHRsZXQgcmV0OiBJV29yZFtdID0gW107XHJcblx0XHRsZXQgcyA9IGZhbHNlO1xyXG5cclxuXHRcdGNvbnN0IFRBQkxFMiA9IHRoaXMuX1RBQkxFMjtcclxuXHJcblx0XHQvLyDljLnphY3lj6/og73lh7rnjrDnmoTljZXor41cclxuXHRcdHdoaWxlIChjdXIgPCB0ZXh0Lmxlbmd0aClcclxuXHRcdHtcclxuXHRcdFx0Zm9yIChsZXQgaSBpbiBUQUJMRTIpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRsZXQgdyA9IHRleHQuc3Vic3RyKGN1ciwgaSBhcyBhbnkgYXMgbnVtYmVyKTtcclxuXHRcdFx0XHRpZiAodyBpbiBUQUJMRTJbaV0pXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cmV0LnB1c2goe1xyXG5cdFx0XHRcdFx0XHR3OiB3LFxyXG5cdFx0XHRcdFx0XHRjOiBjdXIsXHJcblx0XHRcdFx0XHRcdGY6IFRBQkxFMltpXVt3XS5mLFxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGN1cisrO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLmZpbHRlcldvcmQocmV0LCBwcmV3b3JkLCB0ZXh0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIOmAieaLqeacgOacieWPr+iDveWMuemFjeeahOWNleivjVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gd29yZHMg5Y2V6K+N5L+h5oGv5pWw57uEXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IHByZXdvcmQg5LiK5LiA5Liq5Y2V6K+NXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQg5pys6IqC6KaB5YiG6K+N55qE5paH5pysXHJcblx0ICogQHJldHVybiB7YXJyYXl9XHJcblx0ICovXHJcblx0cHJvdGVjdGVkIGZpbHRlcldvcmQod29yZHM6IElXb3JkW10sIHByZXdvcmQ6IElXb3JkLCB0ZXh0OiBzdHJpbmcpXHJcblx0e1xyXG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLl9UQUJMRTtcclxuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuX1BPU1RBRztcclxuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcclxuXHJcblx0XHQvLyDlsIbljZXor43mjInkvY3nva7liIbnu4RcclxuXHRcdGxldCB3b3JkcG9zID0gdGhpcy5nZXRQb3NJbmZvKHdvcmRzLCB0ZXh0KTtcclxuXHRcdC8vZGVidWcod29yZHBvcyk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiDkvb/nlKjnsbvkvLzkuo5NTVNH55qE5YiG6K+N566X5rOVXHJcblx0XHQgKiDmib7lh7rmiYDmnInliIbor43lj6/og73vvIzkuLvopoHmoLnmja7kuIDkuIvlh6DpobnmnaXor4Tku7fvvJpcclxuXHRcdCAqIHjjgIHor43mlbDph4/mnIDlsJHvvJtcclxuXHRcdCAqIGHjgIHor43lubPlnYfpopHnjofmnIDlpKfvvJtcclxuXHRcdCAqIGLjgIHmr4/kuKror43plb/luqbmoIflh4blt67mnIDlsI/vvJtcclxuXHRcdCAqIGPjgIHmnKror4bliKvor43mnIDlsJHvvJtcclxuXHRcdCAqIGTjgIHnrKblkIjor63ms5Xnu5PmnoTpobnvvJrlpoLkuKTkuKrov57nu63nmoTliqjor43lh4/liIbvvIzmlbDor43lkI7pnaLot5/ph4/or43liqDliIbvvJtcclxuXHRcdCAqIOWPluS7peS4iuWHoOmhuee7vOWQiOaOkuWQjeacgOacgOWlveeahFxyXG5cdFx0ICovXHJcblx0XHRsZXQgY2h1bmtzID0gdGhpcy5nZXRDaHVua3Mod29yZHBvcywgMCwgdGV4dCk7XHJcblx0XHQvL2RlYnVnKGNodW5rcyk7XHJcblx0XHRsZXQgYXNzZXNzOiBBcnJheTxJQXNzZXNzUm93PiA9IFtdOyAgLy8g6K+E5Lu36KGoXHJcblxyXG5cdFx0Ly9jb25zb2xlLmxvZyhjaHVua3MpO1xyXG5cclxuXHRcdC8vIOWvueWQhOS4quWIhuaUr+WwseihjOivhOS8sFxyXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGNodW5rOiBJV29yZFtdOyBjaHVuayA9IGNodW5rc1tpXTsgaSsrKVxyXG5cdFx0e1xyXG5cdFx0XHRhc3Nlc3NbaV0gPSB7XHJcblx0XHRcdFx0eDogY2h1bmsubGVuZ3RoLFxyXG5cdFx0XHRcdGE6IDAsXHJcblx0XHRcdFx0YjogMCxcclxuXHRcdFx0XHRjOiAwLFxyXG5cdFx0XHRcdGQ6IDAsXHJcblxyXG5cdFx0XHRcdGluZGV4OiBpLFxyXG5cdFx0XHR9O1xyXG5cdFx0XHQvLyDor43lubPlnYfplb/luqZcclxuXHRcdFx0bGV0IHNwID0gdGV4dC5sZW5ndGggLyBjaHVuay5sZW5ndGg7XHJcblx0XHRcdC8vIOWPpeWtkOe7j+W4uOWMheWQq+eahOivreazlee7k+aehFxyXG5cdFx0XHRsZXQgaGFzX0RfViA9IGZhbHNlOyAgLy8g5piv5ZCm5YyF5ZCr5Yqo6K+NXHJcblxyXG5cdFx0XHQvLyDpgY3ljoblkITkuKror41cclxuXHRcdFx0bGV0IHByZXc6IElXb3JkO1xyXG5cclxuXHRcdFx0aWYgKHByZXdvcmQpXHJcblx0XHRcdHtcclxuXHRcdFx0XHQvKlxyXG5cdFx0XHRcdHByZXcgPSB7XHJcblx0XHRcdFx0XHR3OiBwcmV3b3JkLncsXHJcblx0XHRcdFx0XHRwOiBwcmV3b3JkLnAsXHJcblx0XHRcdFx0XHRmOiBwcmV3b3JkLmYsXHJcblx0XHRcdFx0XHRzOiBwcmV3b3JkLnMsXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHRcdHByZXcgPSB0aGlzLmNyZWF0ZVJhd1Rva2VuKHByZXdvcmQpO1xyXG5cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdHtcclxuXHRcdFx0XHRwcmV3ID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0XHRmb3IgKGxldCBqID0gMCwgdzogSVdvcmQ7IHcgPSBjaHVua1tqXTsgaisrKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYgKHcudyBpbiBUQUJMRSlcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHR3LnAgPSBUQUJMRVt3LnddLnA7XHJcblx0XHRcdFx0XHRhc3Nlc3NbaV0uYSArPSB3LmY7ICAgLy8g5oC76K+N6aKRXHJcblxyXG5cdFx0XHRcdFx0aWYgKGogPT0gMCAmJiAhcHJld29yZCAmJiAody5wICYgUE9TVEFHLkRfVikpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdC8qKlxyXG5cdFx0XHRcdFx0XHQgKiDlsIfnrKzkuIDlgIvlrZfkuZ/oqIjnrpfpgLLljrvmmK/lkKbljIXlkKvli5XoqZ5cclxuXHRcdFx0XHRcdFx0ICovXHJcblx0XHRcdFx0XHRcdGhhc19EX1YgPSB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdC8vID09PT09PT09PT09PT09PT0g5qOA5p+l6K+t5rOV57uT5p6EID09PT09PT09PT09PT09PT09PT1cclxuXHRcdFx0XHRcdGlmIChwcmV3KVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHQvLyDlpoLmnpzkuIrkuIDkuKror43mmK/mlbDor43kuJTlvZPliY3or43mmK/ph4/or43vvIjljZXkvY3vvInvvIzliJnliqDliIZcclxuXHRcdFx0XHRcdFx0aWYgKFxyXG5cdFx0XHRcdFx0XHRcdChwcmV3LnAgJiBQT1NUQUcuQV9NKVxyXG5cdFx0XHRcdFx0XHRcdCYmXHJcblx0XHRcdFx0XHRcdFx0KFxyXG5cdFx0XHRcdFx0XHRcdFx0KCh3LnAgJiBQT1NUQUcuQV9RKSlcclxuXHRcdFx0XHRcdFx0XHRcdHx8IHcudyBpbiBEQVRFVElNRVxyXG5cdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5b2T5YmN6K+N5piv5Yqo6K+NXHJcblx0XHRcdFx0XHRcdGlmICgody5wICYgUE9TVEFHLkRfVikpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoYXNfRF9WID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK/ov57nu63nmoTkuKTkuKrliqjor43vvIzliJnlh4/liIZcclxuXHRcdFx0XHRcdFx0XHQvL2lmICgocHJldy5wICYgUE9TVEFHLkRfVikgPiAwKVxyXG5cdFx0XHRcdFx0XHRcdC8vYXNzZXNzW2ldLmQtLTtcclxuXHJcblx0XHRcdFx0XHRcdFx0LypcclxuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK8g5b2i5a656K+NICsg5Yqo6K+N77yM5YiZ5Yqg5YiGXHJcblx0XHRcdFx0XHRcdFx0aWYgKChwcmV3LnAgJiBQT1NUQUcuRF9BKSlcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK8g5Ymv6K+NICsg5Yqo6K+N77yM5YiZ5Yqg5YiGXHJcblx0XHRcdFx0XHRcdFx0aWYgKHByZXcucCAmIFBPU1RBRy5EX0QpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5piv5Zyw5Yy65ZCN44CB5py65p6E5ZCN5oiW5b2i5a656K+N77yM5ZCO6Z2i6Lef5Zyw5Yy644CB5py65p6E44CB5Luj6K+N44CB5ZCN6K+N562J77yM5YiZ5Yqg5YiGXHJcblx0XHRcdFx0XHRcdGlmICgoXHJcblx0XHRcdFx0XHRcdFx0XHQocHJldy5wICYgUE9TVEFHLkFfTlMpXHJcblx0XHRcdFx0XHRcdFx0XHR8fCAocHJldy5wICYgUE9TVEFHLkFfTlQpXHJcblx0XHRcdFx0XHRcdFx0XHR8fCAocHJldy5wICYgUE9TVEFHLkRfQSlcclxuXHRcdFx0XHRcdFx0XHQpICYmXHJcblx0XHRcdFx0XHRcdFx0KFxyXG5cdFx0XHRcdFx0XHRcdFx0KHcucCAmIFBPU1RBRy5EX04pXHJcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkFfTlIpXHJcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkFfTlMpXHJcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkFfTlopXHJcblx0XHRcdFx0XHRcdFx0XHR8fCAody5wICYgUE9TVEFHLkFfTlQpXHJcblx0XHRcdFx0XHRcdFx0KSlcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0Ly8g5aaC5p6c5pivIOaWueS9jeivjSArIOaVsOmHj+ivje+8jOWImeWKoOWIhlxyXG5cdFx0XHRcdFx0XHRpZiAoXHJcblx0XHRcdFx0XHRcdFx0KHByZXcucCAmIFBPU1RBRy5EX0YpXHJcblx0XHRcdFx0XHRcdFx0JiZcclxuXHRcdFx0XHRcdFx0XHQoXHJcblx0XHRcdFx0XHRcdFx0XHQody5wICYgUE9TVEFHLkFfTSlcclxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuRF9NUSlcclxuXHRcdFx0XHRcdFx0XHQpKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0Ly9kZWJ1ZyhwcmV3LCB3KTtcclxuXHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdC8vIOWmguaenOaYryDlp5MgKyDlkI3or43vvIzliJnliqDliIZcclxuXHRcdFx0XHRcdFx0aWYgKFxyXG5cdFx0XHRcdFx0XHRcdChcclxuXHRcdFx0XHRcdFx0XHRcdHByZXcudyBpbiBGQU1JTFlfTkFNRV8xXHJcblx0XHRcdFx0XHRcdFx0XHR8fCBwcmV3LncgaW4gRkFNSUxZX05BTUVfMlxyXG5cdFx0XHRcdFx0XHRcdCkgJiZcclxuXHRcdFx0XHRcdFx0XHQoXHJcblx0XHRcdFx0XHRcdFx0XHQody5wICYgUE9TVEFHLkRfTilcclxuXHRcdFx0XHRcdFx0XHRcdHx8ICh3LnAgJiBQT1NUQUcuQV9OWilcclxuXHRcdFx0XHRcdFx0XHQpKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0Ly9kZWJ1ZyhwcmV3LCB3KTtcclxuXHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHQvKipcclxuXHRcdFx0XHRcdFx0ICog5Zyw5ZCNL+WkhOaJgCArIOaWueS9jVxyXG5cdFx0XHRcdFx0XHQgKi9cclxuXHRcdFx0XHRcdFx0aWYgKGhleEFuZEFueShwcmV3LnBcclxuXHRcdFx0XHRcdFx0XHQsIFBPU1RBRy5EX1NcclxuXHRcdFx0XHRcdFx0XHQsIFBPU1RBRy5BX05TLFxyXG5cdFx0XHRcdFx0XHQpICYmIGhleEFuZEFueSh3LnBcclxuXHRcdFx0XHRcdFx0XHQsIFBPU1RBRy5EX0YsXHJcblx0XHRcdFx0XHRcdCkpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCArPSAwLjU7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdC8vIOaOoua1i+S4i+S4gOS4quivjVxyXG5cdFx0XHRcdFx0XHRsZXQgbmV4dHcgPSBjaHVua1tqICsgMV07XHJcblx0XHRcdFx0XHRcdGlmIChuZXh0dylcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGlmIChuZXh0dy53IGluIFRBQkxFKVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdG5leHR3LnAgPSBUQUJMRVtuZXh0dy53XS5wO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK/ov57or43vvIzliY3lkI7kuKTkuKror43or43mgKfnm7jlkIzliJnliqDliIZcclxuXHRcdFx0XHRcdFx0XHRpZiAoKHcucCAmIFBPU1RBRy5EX0MpICYmIHByZXcucCA9PSBuZXh0dy5wKVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGFzc2Vzc1tpXS5kKys7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdC8vIOWmguaenOW9k+WJjeaYr+KAnOeahOKAnSsg5ZCN6K+N77yM5YiZ5Yqg5YiGXHJcblx0XHRcdFx0XHRcdFx0aWYgKFxyXG5cdFx0XHRcdFx0XHRcdFx0KHcudyA9PSAn55qEJyB8fCB3LncgPT0gJ+S5iycpXHJcblx0XHRcdFx0XHRcdFx0XHQmJiAoXHJcblx0XHRcdFx0XHRcdFx0XHRcdChuZXh0dy5wICYgUE9TVEFHLkRfTilcclxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OUilcclxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OUylcclxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OWilcclxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgKG5leHR3LnAgJiBQT1NUQUcuQV9OVClcclxuXHRcdFx0XHRcdFx0XHRcdCkpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQgKz0gMS41O1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8gQEZJWE1FIOaatOWKm+ino+axuiDkuInlpKnlkI4g55qE5ZWP6aGMXHJcblx0XHRcdFx0XHRcdFx0aWYgKG5leHR3LncgPT0gJ+WQjicgJiYgdy5wICYgUE9TVEFHLkRfVCAmJiBoZXhBbmRBbnkocHJldy5wLFxyXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfTVEsXHJcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuQV9NLFxyXG5cdFx0XHRcdFx0XHRcdCkpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0Ly8gQEZJWE1FIOWIsOa5luS4remWk+WQjuaJi+e1guaWvOiDveS8keaBr+S6hlxyXG5cdFx0XHRcdFx0XHRcdGVsc2UgaWYgKFxyXG5cdFx0XHRcdFx0XHRcdFx0KFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRuZXh0dy53ID09ICflkI4nXHJcblx0XHRcdFx0XHRcdFx0XHRcdHx8IG5leHR3LncgPT0gJ+W+jCdcclxuXHRcdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHRcdCYmIGhleEFuZEFueSh3LnAsXHJcblx0XHRcdFx0XHRcdFx0XHRQT1NUQUcuRF9GLFxyXG5cdFx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRhc3Nlc3NbaV0uZCsrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKFxyXG5cdFx0XHRcdFx0XHRcdFx0KFxyXG5cdFx0XHRcdFx0XHRcdFx0XHR3LncgPT0gJ+WQjidcclxuXHRcdFx0XHRcdFx0XHRcdFx0fHwgdy53ID09ICflvownXHJcblx0XHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0XHQmJiBoZXhBbmRBbnkocHJldy5wLFxyXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfRixcclxuXHRcdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHRcdCYmIGhleEFuZEFueShuZXh0dy5wLFxyXG5cdFx0XHRcdFx0XHRcdFx0UE9TVEFHLkRfTixcclxuXHRcdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0YXNzZXNzW2ldLmQrKztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdC8vIOacquivhuWIq+eahOivjeaVsOmHj1xyXG5cdFx0XHRcdFx0YXNzZXNzW2ldLmMrKztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Ly8g5qCH5YeG5beuXHJcblx0XHRcdFx0YXNzZXNzW2ldLmIgKz0gTWF0aC5wb3coc3AgLSB3LncubGVuZ3RoLCAyKTtcclxuXHRcdFx0XHRwcmV3ID0gY2h1bmtbal07XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIOWmguaenOWPpeWtkOS4reWMheWQq+S6huiHs+WwkeS4gOS4quWKqOivjVxyXG5cdFx0XHRpZiAoaGFzX0RfViA9PT0gZmFsc2UpIGFzc2Vzc1tpXS5kIC09IDAuNTtcclxuXHJcblx0XHRcdGFzc2Vzc1tpXS5hID0gYXNzZXNzW2ldLmEgLyBjaHVuay5sZW5ndGg7XHJcblx0XHRcdGFzc2Vzc1tpXS5iID0gYXNzZXNzW2ldLmIgLyBjaHVuay5sZW5ndGg7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly9jb25zb2xlLmRpcihhc3Nlc3MpO1xyXG5cclxuXHRcdC8vIOiuoeeul+aOkuWQjVxyXG5cdFx0bGV0IHRvcCA9IHRoaXMuZ2V0VG9wcyhhc3Nlc3MpO1xyXG5cdFx0bGV0IGN1cnJjaHVuayA9IGNodW5rc1t0b3BdO1xyXG5cclxuXHRcdC8vY29uc29sZS5sb2coYXNzZXNzKTtcclxuXHRcdC8vY29uc29sZS5sb2coT2JqZWN0LmVudHJpZXMoY2h1bmtzKSk7XHJcblx0XHQvL2NvbnNvbGUubG9nKE9iamVjdC5lbnRyaWVzKGNodW5rcykubWFwKChbaSwgY2h1bmtdKSA9PiB7IHJldHVybiB7IGksIGFzc2VzOiBhc3Nlc3NbaSBhcyB1bmtub3duIGFzIG51bWJlcl0sIGNodW5rIH0gfSkpO1xyXG5cdFx0Ly9jb25zb2xlLmxvZyh7IGk6IHRvcCwgYXNzZXM6IGFzc2Vzc1t0b3BdLCBjdXJyY2h1bmsgfSk7XHJcblx0XHQvL2NvbnNvbGUubG9nKHRvcCk7XHJcblx0XHQvL2NvbnNvbGUubG9nKGN1cnJjaHVuayk7XHJcblxyXG5cdFx0Ly8g5YmU6Zmk5LiN6IO96K+G5Yir55qE6K+NXHJcblx0XHRmb3IgKGxldCBpID0gMCwgd29yZDogSVdvcmQ7IHdvcmQgPSBjdXJyY2h1bmtbaV07IGkrKylcclxuXHRcdHtcclxuXHRcdFx0aWYgKCEod29yZC53IGluIFRBQkxFKSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGN1cnJjaHVuay5zcGxpY2UoaS0tLCAxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0ID0gY3VycmNodW5rO1xyXG5cclxuXHRcdC8vIOippuWcluS4u+WLlea4hemZpOiomOaGtumrlFxyXG5cdFx0YXNzZXNzID0gdW5kZWZpbmVkO1xyXG5cdFx0Y2h1bmtzID0gdW5kZWZpbmVkO1xyXG5cclxuXHRcdC8vZGVidWcocmV0KTtcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiDor4Tku7fmjpLlkI1cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhc3Nlc3NcclxuXHQgKiBAcmV0dXJuIHtvYmplY3R9XHJcblx0ICovXHJcblx0Z2V0VG9wcyhhc3Nlc3M6IEFycmF5PElBc3Nlc3NSb3c+KVxyXG5cdHtcclxuXHRcdC8vZGVidWcoYXNzZXNzKTtcclxuXHRcdC8vIOWPluWQhOmhueacgOWkp+WAvFxyXG5cdFx0bGV0IHRvcDogSUFzc2Vzc1JvdyA9IHtcclxuXHRcdFx0eDogYXNzZXNzWzBdLngsXHJcblx0XHRcdGE6IGFzc2Vzc1swXS5hLFxyXG5cdFx0XHRiOiBhc3Nlc3NbMF0uYixcclxuXHRcdFx0YzogYXNzZXNzWzBdLmMsXHJcblx0XHRcdGQ6IGFzc2Vzc1swXS5kLFxyXG5cdFx0fTtcclxuXHJcblx0XHRmb3IgKGxldCBpID0gMSwgYXNzOiBJQXNzZXNzUm93OyBhc3MgPSBhc3Nlc3NbaV07IGkrKylcclxuXHRcdHtcclxuXHRcdFx0aWYgKGFzcy5hID4gdG9wLmEpIHRvcC5hID0gYXNzLmE7ICAvLyDlj5bmnIDlpKflubPlnYfor43popFcclxuXHRcdFx0aWYgKGFzcy5iIDwgdG9wLmIpIHRvcC5iID0gYXNzLmI7ICAvLyDlj5bmnIDlsI/moIflh4blt65cclxuXHRcdFx0aWYgKGFzcy5jID4gdG9wLmMpIHRvcC5jID0gYXNzLmM7ICAvLyDlj5bmnIDlpKfmnKror4bliKvor41cclxuXHRcdFx0aWYgKGFzcy5kIDwgdG9wLmQpIHRvcC5kID0gYXNzLmQ7ICAvLyDlj5bmnIDlsI/or63ms5XliIbmlbBcclxuXHRcdFx0aWYgKGFzcy54ID4gdG9wLngpIHRvcC54ID0gYXNzLng7ICAvLyDlj5bmnIDlpKfljZXor43mlbDph49cclxuXHRcdH1cclxuXHRcdC8vZGVidWcodG9wKTtcclxuXHJcblx0XHQvLyDor4TkvLDmjpLlkI1cclxuXHRcdGxldCB0b3BzOiBudW1iZXJbXSA9IFtdO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGFzczogSUFzc2Vzc1JvdzsgYXNzID0gYXNzZXNzW2ldOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdHRvcHNbaV0gPSAwO1xyXG5cdFx0XHQvLyDor43mlbDph4/vvIzotorlsI/otorlpb1cclxuXHRcdFx0dG9wc1tpXSArPSAodG9wLnggLSBhc3MueCkgKiAxLjU7XHJcblx0XHRcdC8vIOivjeaAu+mikeeOh++8jOi2iuWkp+i2iuWlvVxyXG5cdFx0XHRpZiAoYXNzLmEgPj0gdG9wLmEpIHRvcHNbaV0gKz0gMTtcclxuXHRcdFx0Ly8g6K+N5qCH5YeG5beu77yM6LaK5bCP6LaK5aW9XHJcblx0XHRcdGlmIChhc3MuYiA8PSB0b3AuYikgdG9wc1tpXSArPSAxO1xyXG5cdFx0XHQvLyDmnKror4bliKvor43vvIzotorlsI/otorlpb1cclxuXHRcdFx0dG9wc1tpXSArPSAodG9wLmMgLSBhc3MuYyk7Ly9kZWJ1Zyh0b3BzW2ldKTtcclxuXHRcdFx0Ly8g56ym5ZCI6K+t5rOV57uT5p6E56iL5bqm77yM6LaK5aSn6LaK5aW9XHJcblx0XHRcdHRvcHNbaV0gKz0gKGFzcy5kIDwgMCA/IHRvcC5kICsgYXNzLmQgOiBhc3MuZCAtIHRvcC5kKSAqIDE7XHJcblxyXG5cdFx0XHRhc3Muc2NvcmUgPSB0b3BzW2ldO1xyXG5cclxuXHRcdFx0Ly9kZWJ1Zyh0b3BzW2ldKTtkZWJ1ZygnLS0tJyk7XHJcblx0XHR9XHJcblx0XHQvL2RlYnVnKHRvcHMuam9pbignICAnKSk7XHJcblxyXG5cdFx0Ly9jb25zb2xlLmxvZyh0b3BzKTtcclxuXHRcdC8vY29uc29sZS5sb2coYXNzZXNzKTtcclxuXHJcblx0XHQvL2NvbnN0IG9sZF9tZXRob2QgPSB0cnVlO1xyXG5cdFx0Y29uc3Qgb2xkX21ldGhvZCA9IGZhbHNlO1xyXG5cclxuXHRcdC8vIOWPluWIhuaVsOacgOmrmOeahFxyXG5cdFx0bGV0IGN1cnJpID0gMDtcclxuXHRcdGxldCBtYXhzID0gdG9wc1swXTtcclxuXHRcdGZvciAobGV0IGkgaW4gdG9wcylcclxuXHRcdHtcclxuXHRcdFx0bGV0IHMgPSB0b3BzW2ldO1xyXG5cdFx0XHRpZiAocyA+IG1heHMpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRjdXJyaSA9IGkgYXMgYW55IGFzIG51bWJlcjtcclxuXHRcdFx0XHRtYXhzID0gcztcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmIChzID09IG1heHMpXHJcblx0XHRcdHtcclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgKiDlpoLmnpzliIbmlbDnm7jlkIzvvIzliJnmoLnmja7or43plb/luqbjgIHmnKror4bliKvor43kuKrmlbDlkozlubPlnYfpopHnjofmnaXpgInmi6lcclxuXHRcdFx0XHQgKlxyXG5cdFx0XHRcdCAqIOWmguaenOS+neeEtuWQjOWIhu+8jOWJh+S/neaMgeS4jeiuilxyXG5cdFx0XHRcdCAqL1xyXG5cdFx0XHRcdGxldCBhID0gMDtcclxuXHRcdFx0XHRsZXQgYiA9IDA7XHJcblx0XHRcdFx0aWYgKGFzc2Vzc1tpXS5jIDwgYXNzZXNzW2N1cnJpXS5jKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGErKztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBpZiAoYXNzZXNzW2ldLmMgIT09IGFzc2Vzc1tjdXJyaV0uYylcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRiKys7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChhc3Nlc3NbaV0uYSA+IGFzc2Vzc1tjdXJyaV0uYSlcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRhKys7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2UgaWYgKGFzc2Vzc1tpXS5hICE9PSBhc3Nlc3NbY3VycmldLmEpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0YisrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoYXNzZXNzW2ldLnggPCBhc3Nlc3NbY3VycmldLngpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0YSsrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIGlmIChhc3Nlc3NbaV0ueCAhPT0gYXNzZXNzW2N1cnJpXS54KVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGIrKztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGEgPiBiKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGN1cnJpID0gaSBhcyBhbnkgYXMgbnVtYmVyO1xyXG5cdFx0XHRcdFx0bWF4cyA9IHM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vZGVidWcoeyBpLCBzLCBtYXhzLCBjdXJyaSB9KTtcclxuXHRcdH1cclxuXHRcdC8vZGVidWcoJ21heDogaT0nICsgY3VycmkgKyAnLCBzPScgKyB0b3BzW2N1cnJpXSk7XHJcblx0XHRyZXR1cm4gY3Vycmk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiDlsIbljZXor43mjInnhafkvY3nva7mjpLliJdcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHRcclxuXHQgKiBAcmV0dXJuIHtvYmplY3R9XHJcblx0ICovXHJcblx0Z2V0UG9zSW5mbyh3b3JkczogSVdvcmRbXSwgdGV4dDogc3RyaW5nKToge1xyXG5cdFx0W2luZGV4OiBudW1iZXJdOiBJV29yZFtdO1xyXG5cdH1cclxuXHR7XHJcblx0XHRsZXQgd29yZHBvcyA9IHt9O1xyXG5cdFx0Ly8g5bCG5Y2V6K+N5oyJ5L2N572u5YiG57uEXHJcblx0XHRmb3IgKGxldCBpID0gMCwgd29yZDsgd29yZCA9IHdvcmRzW2ldOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdGlmICghd29yZHBvc1t3b3JkLmNdKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0d29yZHBvc1t3b3JkLmNdID0gW107XHJcblx0XHRcdH1cclxuXHRcdFx0d29yZHBvc1t3b3JkLmNdLnB1c2god29yZCk7XHJcblx0XHR9XHJcblx0XHQvLyDmjInljZXlrZfliIblibLmlofmnKzvvIzloavooaXnqbrnvLrnmoTkvY3nva5cclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGV4dC5sZW5ndGg7IGkrKylcclxuXHRcdHtcclxuXHRcdFx0aWYgKCF3b3JkcG9zW2ldKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0d29yZHBvc1tpXSA9IFt7IHc6IHRleHQuY2hhckF0KGkpLCBjOiBpLCBmOiAwIH1dO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHdvcmRwb3M7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiDlj5bmiYDmnInliIbmlK9cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7e1twOiBudW1iZXJdOiBTZWdtZW50LklXb3JkW119fSB3b3JkcG9zXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHBvcyDlvZPliY3kvY3nva5cclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmnKzoioLopoHliIbor43nmoTmlofmnKxcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gdG90YWxfY291bnRcclxuXHQgKiBAcmV0dXJucyB7U2VnbWVudC5JV29yZFtdW119XHJcblx0ICovXHJcblx0Z2V0Q2h1bmtzKHdvcmRwb3M6IHtcclxuXHRcdFtpbmRleDogbnVtYmVyXTogSVdvcmRbXTtcclxuXHR9LCBwb3M6IG51bWJlciwgdGV4dD86IHN0cmluZywgdG90YWxfY291bnQgPSAwKTogSVdvcmRbXVtdXHJcblx0e1xyXG5cdFx0LyoqXHJcblx0XHQgKiDlv73nlaXpgKPlrZdcclxuXHRcdCAqXHJcblx0XHQgKiDkvovlpoI6IOWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWViuWVilxyXG5cdFx0ICovXHJcblx0XHRsZXQgbTtcclxuXHRcdGlmIChtID0gdGV4dC5tYXRjaCgvXigoLispXFwyezUsfSkvKSlcclxuXHRcdHtcclxuXHRcdFx0bGV0IHMxID0gdGV4dC5zbGljZSgwLCBtWzFdLmxlbmd0aCk7XHJcblx0XHRcdGxldCBzMiA9IHRleHQuc2xpY2UobVsxXS5sZW5ndGgpO1xyXG5cclxuXHRcdFx0bGV0IHdvcmQgPSB7XHJcblx0XHRcdFx0dzogczEsXHJcblx0XHRcdFx0YzogcG9zLFxyXG5cdFx0XHRcdGY6IDAsXHJcblx0XHRcdH0gYXMgSVdvcmQ7XHJcblxyXG5cdFx0XHRsZXQgcmV0OiBJV29yZFtdW10gPSBbXTtcclxuXHJcblx0XHRcdGlmIChzMiAhPT0gJycpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRsZXQgY2h1bmtzID0gdGhpcy5nZXRDaHVua3Mod29yZHBvcywgcG9zICsgczEubGVuZ3RoLCBzMiwgdG90YWxfY291bnQpO1xyXG5cclxuXHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGNodW5rcy5sZW5ndGg7IGorKylcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXQucHVzaChbd29yZF0uY29uY2F0KGNodW5rc1tqXSkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyZXQucHVzaChbd29yZF0pO1xyXG5cdFx0XHR9XHJcblxyXG4vL1x0XHRcdGNvbnNvbGUuZGlyKHdvcmRwb3MpO1xyXG4vL1xyXG4vL1x0XHRcdGNvbnNvbGUuZGlyKHJldCk7XHJcbi8vXHJcbi8vXHRcdFx0Y29uc29sZS5kaXIoW3BvcywgdGV4dCwgdG90YWxfY291bnRdKTtcclxuXHJcblx0XHRcdHJldHVybiByZXQ7XHJcblx0XHR9XHJcblxyXG5cdFx0dG90YWxfY291bnQrKztcclxuXHJcblx0XHRsZXQgd29yZHMgPSB3b3JkcG9zW3Bvc10gfHwgW107XHJcblx0XHQvLyBkZWJ1ZygnZ2V0Q2h1bmtzOiAnKTtcclxuXHRcdC8vIGRlYnVnKHdvcmRzKTtcclxuXHRcdC8vIHRocm93IG5ldyBFcnJvcigpO1xyXG5cdFx0bGV0IHJldDogSVdvcmRbXVtdID0gW107XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHdvcmRzLmxlbmd0aDsgaSsrKVxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgd29yZCA9IHdvcmRzW2ldO1xyXG5cdFx0XHQvL2RlYnVnKHdvcmQpO1xyXG5cdFx0XHRsZXQgbmV4dGN1ciA9IHdvcmQuYyArIHdvcmQudy5sZW5ndGg7XHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBARklYTUVcclxuXHRcdFx0ICovXHJcblx0XHRcdGlmICghd29yZHBvc1tuZXh0Y3VyXSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHJldC5wdXNoKFt3b3JkXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAodG90YWxfY291bnQgPiB0aGlzLk1BWF9DSFVOS19DT1VOVClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIGRvIHNvbWV0aGluZ1xyXG5cclxuLy9cdFx0XHRcdGNvbnNvbGUubG9nKDQ0NCwgd29yZHMuc2xpY2UoaSkpO1xyXG4vL1x0XHRcdFx0Y29uc29sZS5sb2coMzMzLCB3b3JkKTtcclxuXHJcblx0XHRcdFx0bGV0IHcxOiBJV29yZFtdID0gW3dvcmRdO1xyXG5cclxuXHRcdFx0XHRsZXQgaiA9IG5leHRjdXI7XHJcblx0XHRcdFx0d2hpbGUgKGogaW4gd29yZHBvcylcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRsZXQgdzIgPSB3b3JkcG9zW2pdWzBdO1xyXG5cclxuXHRcdFx0XHRcdGlmICh3MilcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0dzEucHVzaCh3Mik7XHJcblxyXG5cdFx0XHRcdFx0XHRqICs9IHcyLncubGVuZ3RoO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldC5wdXNoKHcxKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdHtcclxuXHRcdFx0XHRsZXQgdCA9IHRleHQuc2xpY2Uod29yZC53Lmxlbmd0aCk7XHJcblxyXG5cdFx0XHRcdGxldCBjaHVua3MgPSB0aGlzLmdldENodW5rcyh3b3JkcG9zLCBuZXh0Y3VyLCB0LCB0b3RhbF9jb3VudCk7XHJcblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBjaHVua3MubGVuZ3RoOyBqKyspXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cmV0LnB1c2goW3dvcmRdLmNvbmNhdChjaHVua3Nbal0pKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGNodW5rcyA9IG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR3b3JkcyA9IHVuZGVmaW5lZDtcclxuXHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IG5hbWVzcGFjZSBEaWN0VG9rZW5pemVyXHJcbntcclxuXHQvKipcclxuXHQgKiDkvb/nlKjnsbvkvLzkuo5NTVNH55qE5YiG6K+N566X5rOVXHJcblx0ICog5om+5Ye65omA5pyJ5YiG6K+N5Y+v6IO977yM5Li76KaB5qC55o2u5LiA5LiL5Yeg6aG55p2l6K+E5Lu377yaXHJcblx0ICpcclxuXHQgKiB444CB6K+N5pWw6YeP5pyA5bCR77ybXHJcblx0ICogYeOAgeivjeW5s+Wdh+mikeeOh+acgOWkp++8m1xyXG5cdCAqIGLjgIHmr4/kuKror43plb/luqbmoIflh4blt67mnIDlsI/vvJtcclxuXHQgKiBj44CB5pyq6K+G5Yir6K+N5pyA5bCR77ybXHJcblx0ICogZOOAgeespuWQiOivreazlee7k+aehOmhue+8muWmguS4pOS4qui/nue7reeahOWKqOivjeWHj+WIhu+8jOaVsOivjeWQjumdoui3n+mHj+ivjeWKoOWIhu+8m1xyXG5cdCAqXHJcblx0ICog5Y+W5Lul5LiK5Yeg6aG557u85ZCI5o6S5ZCN5pyA5pyA5aW955qEXHJcblx0ICovXHJcblx0ZXhwb3J0IHR5cGUgSUFzc2Vzc1JvdyA9IHtcclxuXHRcdC8qKlxyXG5cdFx0ICog6K+N5pWw6YeP77yM6LaK5bCP6LaK5aW9XHJcblx0XHQgKi9cclxuXHRcdHg6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICog6K+N5oC76aKR546H77yM6LaK5aSn6LaK5aW9XHJcblx0XHQgKi9cclxuXHRcdGE6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICog6K+N5qCH5YeG5beu77yM6LaK5bCP6LaK5aW9XHJcblx0XHQgKiDmr4/kuKror43plb/luqbmoIflh4blt67mnIDlsI9cclxuXHRcdCAqL1xyXG5cdFx0YjogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiDmnKror4bliKvor43vvIzotorlsI/otorlpb1cclxuXHRcdCAqL1xyXG5cdFx0YzogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiDnrKblkIjor63ms5Xnu5PmnoTnqIvluqbvvIzotorlpKfotorlpb1cclxuXHRcdCAqIOespuWQiOivreazlee7k+aehOmhue+8muWmguS4pOS4qui/nue7reeahOWKqOivjeWHj+WIhu+8jOaVsOivjeWQjumdoui3n+mHj+ivjeWKoOWIhlxyXG5cdFx0ICovXHJcblx0XHRkOiBudW1iZXIsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiDntZDnrpfoqZXliIYo6Ieq5YuV6KiI566XKVxyXG5cdFx0ICovXHJcblx0XHRzY29yZT86IG51bWJlcixcclxuXHRcdHJlYWRvbmx5IGluZGV4PzogbnVtYmVyLFxyXG5cdH07XHJcbn1cclxuXHJcbmV4cG9ydCBpbXBvcnQgSUFzc2Vzc1JvdyA9IERpY3RUb2tlbml6ZXIuSUFzc2Vzc1JvdztcclxuXHJcbmV4cG9ydCBjb25zdCBpbml0ID0gRGljdFRva2VuaXplci5pbml0LmJpbmQoRGljdFRva2VuaXplcikgYXMgSVN1YlRva2VuaXplckNyZWF0ZTxEaWN0VG9rZW5pemVyPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IERpY3RUb2tlbml6ZXI7XHJcblxyXG4vL2RlYnVnKERBVEVUSU1FKTtcclxuXHJcbi8vZGVidWcobWF0Y2hXb3JkKCfplb/mmKXluILplb/mmKXoja/lupcnKSk7XHJcbiJdfQ==