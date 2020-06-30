"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDefaultBlacklistDict = exports.useDefaultSynonymDict = exports.useDefaultDicts = void 0;
function useDefaultDicts(segment, options = {}) {
    if (!options.nodict) {
        // 字典文件
        segment
            //.loadDict('jieba') <=== bad file
            .loadDict('char')
            // 盘古词典
            .loadDict('pangu/phrases')
            .loadDict('pangu/phrases2')
            .loadDict('phrases/*')
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
            .loadStopwordDict('stopword') // 停止符
            .loadDict('lazy/dict_synonym')
            /*
            .loadDict('names/area')
            .loadDict('names/job')
            .loadDict('names/food')

            .loadDict('names/other')
            .loadDict('names/jp')
            .loadDict('names/zh')
            .loadDict('names/en')
            .loadDict('names/name')
             */
            .loadDict('names/*')
            .loadDict('lazy/*')
            .loadDict('pangu/num')
            .loadDict('lazy/badword')
            .loadDict('pangu/wildcard', 'WILDCARD', true);
        useDefaultSynonymDict(segment, options);
        useDefaultBlacklistDict(segment, options);
        segment.doBlacklist();
    }
    return segment;
}
exports.useDefaultDicts = useDefaultDicts;
function useDefaultSynonymDict(segment, options = {}) {
    if (!options.nodict) {
        segment
            .loadSynonymDict('synonym') // 同义词
            .loadSynonymDict('zht.synonym', false);
        if (options.nodeNovelMode) {
            segment
                .loadSynonymDict('badword.synonym', false)
                .loadSynonymDict('zht.common.synonym', false);
        }
    }
    return segment;
}
exports.useDefaultSynonymDict = useDefaultSynonymDict;
function useDefaultBlacklistDict(segment, options = {}) {
    if (!options.nodict) {
        segment
            .loadBlacklistDict('blacklist')
            .loadBlacklistOptimizerDict('blacklist.name')
            .loadBlacklistSynonymDict('blacklist.synonym');
    }
    return segment;
}
exports.useDefaultBlacklistDict = useDefaultBlacklistDict;
//# sourceMappingURL=dict.js.map