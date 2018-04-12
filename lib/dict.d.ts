export declare type IDictID = 'jieba-js' | 'nodejieba' | 'segment' | 'stopword' | 'synonym';
export declare function getDictPath(id: IDictID, file: string, ...argv: string[]): string;
export default getDictPath;
