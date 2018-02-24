/**
 * 外文字符、数字识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
declare var debug: {
    (message?: any, ...optionalParams: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};
/**
 * 匹配包含的英文字符和数字，并分割
 *
 * @param {string} text 文本
 * @param {int} cur 开始位置
 * @return {array}  返回格式   {w: '单词', c: 开始位置}
 */
declare var splitForeign: (text: any, cur: any) => any[];
