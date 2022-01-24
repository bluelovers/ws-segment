export interface IOptionsLazyMatch {
    firstOne?: boolean;
    /**
     * @example
     * inspectFn = chai.util.inspect
     * @example
     * import { inspect } from 'util';
     * inspectFn = inspect
     */
    inspectFn?(input: any, ...argv: any[]): any;
}
export declare function _handleLazyMatchOptions(options?: IOptionsLazyMatch): {
    inspectFn: (input: any, ...argv: any[]) => any;
    firstOne?: boolean;
};
/**
 * 分析後應該要符合以下結果
 * @example
 * [
 * 		'胡锦涛出席APEC领导人会议后回京',
 * 		[
 * 			'会议',
 * 			'回京',
 * 		],
 * 	],
 */
export declare function lazyMatch(a: string[], b: string[] | (string | string[])[], options?: IOptionsLazyMatch): boolean;
/**
 * 分析後應該要符合以下其中一個結果
 * @example
 * [
 * 		'在這裡有兩具自動人偶隨侍在側的烏列爾',
 * 		[
 * 			[
 * 				'兩具',
 * 				'自動',
 * 				'人偶',
 * 				'隨侍',
 * 			],
 * 			[
 * 				'兩具',
 * 				'自動人偶',
 * 				'隨侍',
 * 			],
 * 		],
 * 	],
 */
export declare function lazyMatch002(a: string[], b_arr: Parameters<typeof lazyMatch>['1'][], options?: IOptionsLazyMatch): void;
/**
 * 分析轉換後應該要具有以下字詞
 * @example
 * [
 * 		'大家干的好',
 * 		[
 * 			'幹',
 * 		],
 * 	],
 */
export declare function lazyMatchSynonym001(a: string, b_arr: (string | string[])[], options?: IOptionsLazyMatch): void;
/**
 * 分析轉換後不應該具有以下字詞
 * @example
 * [
 * 		'那是里靈魂的世界。',
 * 		[
 * 			'裡',
 * 		],
 * 	],
 */
export declare function lazyMatchSynonym001Not(a: string, b_arr: (string | string[])[], options?: IOptionsLazyMatch): void;
/**
 * 分析後不應該存在符合以下結果
 * @example
 * [
 * 		'這份毫不守舊的率直',
 * 		[
 * 			'份毫',
 * 		],
 * 	],
 */
export declare function lazyMatchNot(a: string[], b: string[] | (string | string[])[], options?: IOptionsLazyMatch): boolean;
