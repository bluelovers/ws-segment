import { IStreamLineWithValue } from './line';
export interface ICallback<T> {
    (err: Error, data?: T, stream?: IStreamLineWithValue<T>): void;
}
export declare function createLoadStream<T>(file: string, options?: {
    mapper?(line: string);
    ondata?(data);
    callback?: ICallback<T>;
    onready?();
}): IStreamLineWithValue<T>;
export default createLoadStream;
