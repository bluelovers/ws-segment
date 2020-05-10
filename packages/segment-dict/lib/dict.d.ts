/**
 * Created by user on 2018/4/12/012.
 */
export declare type IDictID = 'jieba-js' | 'nodejieba' | 'segment' | 'stopword' | 'synonym';
export declare function getDictPath(id: IDictID, file: string, ...argv: string[]): string;
export default getDictPath;
