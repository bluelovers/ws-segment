import { IStreamLineWithValue } from './line';
export interface ICallback<T> {
    (err: Error, data?: T, stream?: IStreamLineWithValue<T>): void;
}
export declare function createLoadStream<T>(file: string, options?: {
    mapper?(line: string): any;
    ondata?(data: any): any;
    callback?: ICallback<T>;
    onready?(...argv: any[]): any;
}): IStreamLineWithValue<T>;
export default createLoadStream;
