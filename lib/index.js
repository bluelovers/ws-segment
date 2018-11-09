"use strict";
/**
 * Created by user on 2018/4/16/016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("./mod");
exports.getDefaultModList = mod_1.default;
const Segment_1 = require("./Segment");
exports.Segment = Segment_1.Segment;
function useDefault(segment, options = {}) {
    // 识别模块
    !options.nomod && segment.use(mod_1.default(options.all_mod));
    // 字典文件
    !options.nodict && segment
        //.loadDict('jieba') <=== bad file
        .loadDict('char')
        // 盘古词典
        .loadDict('pangu/phrases')
        .loadDict('pangu/phrases2')
        .loadDict('phrases/001')
        .loadDict('dict')
        .loadDict('dict2')
        .loadDict('dict3')
        .loadDict('dict4')
        .loadDict('pangu/dict005')
        .loadDict('pangu/dict006')
        //.loadDict('synonym/后')
        //.loadDict('synonym/參')
        //.loadDict('synonym/发')
        .loadDict('dict_synonym/*')
        //.loadDict('pangu/wildcard', 'WILDCARD', true)   // 通配符
        .loadSynonymDict('synonym') // 同义词
        .loadSynonymDict('zht.synonym')
        .loadStopwordDict('stopword') // 停止符
        .loadDict('lazy/dict_synonym')
        .loadDict('names/area')
        .loadDict('names/job')
        .loadDict('names/food')
        .loadDict('names/other')
        .loadDict('names/jp')
        .loadDict('names/zh')
        .loadDict('names/en')
        .loadDict('lazy/index')
        .loadDict('pangu/num')
        .loadDict('lazy/badword')
        .loadDict('pangu/wildcard', 'WILDCARD', true)
        .loadBlacklistDict('blacklist')
        .doBlacklist();
    return segment;
}
exports.useDefault = useDefault;
exports.default = Segment_1.Segment;
