/**
 * 中文人名识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
declare var FAMILY_NAME_1: string[];
declare var FAMILY_NAME_2: string[];
declare var SINGLE_NAME: string[];
declare var DOUBLE_NAME_1: string[];
declare var DOUBLE_NAME_2: string[];
declare var debug: (message?: any, ...optionalParams: any[]) => void;
/**
 * 匹配包含的人名，并返回相关信息
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @return {array}  返回格式   {w: '人名', c: 开始位置}
 */
declare var matchName: (text: any, cur: any) => any[];
