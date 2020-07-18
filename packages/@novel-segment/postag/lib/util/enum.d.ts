import { IEnumLike } from '../types';
export declare function enumIsNaN(v: any): boolean;
export declare function enumList<T extends IEnumLike<any>>(varEnum: T, byValue?: boolean): string[];
