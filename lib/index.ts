/**
 * Created by user on 2018/4/16/016.
 */

import getDefaultModList, { Optimizer, ISubOptimizer, Tokenizer, ISubTokenizer } from './mod';

export { getDefaultModList }

import { Segment } from './Segment';
export { Segment }

export function useDefault(segment: Segment, options: {
	all?: boolean
} = {})
{
	// 识别模块
	segment.use(getDefaultModList(options.all));

	// 字典文件
	segment
		//.loadDict('jieba') <=== bad file

		.loadDict('dict4')

		.loadDict('char')

		.loadDict('phrases')
		.loadDict('phrases2')

		.loadDict('dict')           // 盘古词典
		.loadDict('dict2')          // 扩展词典（用于调整原盘古词典）
		.loadDict('dict3')          // 扩展词典（用于调整原盘古词典）
		.loadDict('names')          // 常见名词、人名
		.loadDict('wildcard', 'WILDCARD', true)   // 通配符
		.loadSynonymDict('synonym')   // 同义词
		.loadStopwordDict('stopword') // 停止符

		.loadDict('lazy/badword')
		.loadDict('lazy/dict_synonym')

		.loadDict('names/en')
		.loadDict('names/jp')
		.loadDict('lazy/index')
	;

	return segment;
}

export default Segment;
