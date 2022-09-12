/**
 * Created by user on 2020/5/11.
 */
export type IDictID = 'jieba-js' | 'nodejieba' | 'segment' | 'stopword' | 'synonym';
export declare function getDictPath(id: IDictID, file: string, ...argv: string[]): string;
export default getDictPath;
