/**
 * URL识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
declare var debug: {
    (message?: any, ...optionalParams: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};
declare var PROTOTAL: string[];
declare var MIN_PROTOTAL_LEN: number;
declare var _URLCHAR: string[];
declare var URLCHAR: {};
/**
 * 匹配包含的网址，返回相关信息
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @return {array}  返回格式   {w: '网址', c: 开始位置}
 */
declare var matchURL: (text: any, cur: any) => any[];
