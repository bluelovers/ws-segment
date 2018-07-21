/**
 * Created by user on 2018/4/12/012.
 */
import requireLoader, { requireModule as requireLoaderModule } from './lib/loader';
export { requireLoader, requireLoaderModule };
import getDictPath from './lib/dict';
export { getDictPath };
export declare const ROOT: string;
export declare const DICT_ROOT: string;
export declare const version: string;
import * as self from './index';
export default self;
