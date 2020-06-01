/**
 * Created by user on 2020/6/2.
 */

// @ts-ignore
export const version: string;
export default version
// @ts-ignore
export const version_dict: string;

// @ts-ignore
export const versions: {
	'novel-segment': string;
	'segment-dict': string;
	'regexp-cjk': string;
	'cjk-conv': string;
}

Object.defineProperty(exports, "version", {
	get()
	{
		return require('./package.json').version
	}
});

Object.defineProperty(exports, "version_dict", {
	get()
	{
		return require('segment-dict/version').version
	}
});

Object.defineProperty(exports, "versions", {
	get()
	{
		return {
			'novel-segment': version,
			'segment-dict': version_dict,
			'regexp-cjk': require('regexp-cjk/version').version,
			'cjk-conv': require('cjk-conv/version').version,
		}
	}
});

Object.defineProperty(exports, "default", {
	get()
	{
		return version
	}
});

