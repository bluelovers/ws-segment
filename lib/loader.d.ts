export interface IOptionsLoader {
    toLowerCase?: boolean;
    encoding?: string;
}
export declare function loadTxtSync(filename: any, options?: IOptionsLoader): string;
import * as self from './loader';
export default self;
