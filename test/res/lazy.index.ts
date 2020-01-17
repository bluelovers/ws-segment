/**
 * Created by user on 2019/4/12.
 *
 * 測試段落 每次發布版本時 會保證以下分析轉換是符合預期
 */

import {
	lazyMatch,
	lazyMatch002,
	lazyMatchNot,
	lazyMatchSynonym001,
	sortTests,
	lazyMatchSynonym001Not,
} from '../lib/util';

import tests_lazy_base from './lazy.index/tests_lazy_base';
import tests_lazy_base_not from './lazy.index/tests_lazy_base_not';
import tests_lazy_array from './lazy.index/tests_lazy_array';
import tests_lazy_indexof from './lazy.index/tests_lazy_indexof';
import tests_lazy_indexof_not from './lazy.index/tests_lazy_indexof_not';

export {
	tests_lazy_base,
	tests_lazy_base_not,
	tests_lazy_array,
	tests_lazy_indexof,
	tests_lazy_indexof_not,
};

sortTests(tests_lazy_base);
sortTests(tests_lazy_base_not);
sortTests(tests_lazy_array);
sortTests(tests_lazy_indexof);
sortTests(tests_lazy_indexof_not);

export default {
	tests_lazy_base,
	tests_lazy_base_not,
	tests_lazy_array,
	tests_lazy_indexof,
	tests_lazy_indexof_not,
};
