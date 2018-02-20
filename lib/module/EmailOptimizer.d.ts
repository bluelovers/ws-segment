/**
 * 邮箱地址识别优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
declare var debug: (message?: any, ...optionalParams: any[]) => void;
declare var _EMAILCHAR: string[];
declare var EMAILCHAR: {};
/**
 * 根据一组单词生成邮箱地址
 *
 * @param {array} words 单词数组
 * @return {string}
 */
declare var toEmailAddress: (words: any) => any;
