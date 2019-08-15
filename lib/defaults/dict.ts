import { Segment } from '../Segment';
import { IUseDefaultOptions } from './index';
import getDefaultModList from '../mod/index';
import SegmentCore from '../segment/core';

export function useDefaultDicts(segment: Segment, options: IUseDefaultOptions = {})
{
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
		.loadSynonymDict('synonym')   // 同义词
		.loadSynonymDict('zht.synonym', false)
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

		.loadDict('lazy/index')

		.loadDict('pangu/num')

		.loadDict('lazy/badword')

		.loadDict('pangu/wildcard', 'WILDCARD', true)

		.loadBlacklistDict('blacklist')
		.loadBlacklistOptimizerDict('blacklist.name')
		.loadBlacklistSynonymDict('blacklist.synonym')

		.doBlacklist()
	;

	return segment
}
