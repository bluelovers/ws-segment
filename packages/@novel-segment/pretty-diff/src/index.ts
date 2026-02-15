/**
 * 美化差異比較模組
 * Pretty Diff Module
 *
 * 提供斷詞結果的視覺化差異比較功能。
 * 使用色彩標記新增（綠色）、刪除（紅色）和未變更（灰色）的部分，
 * 便於直觀地比較斷詞或轉換前後的差異。
 *
 * Provides visual diff comparison functionality for segmentation results.
 * Uses color coding to mark additions (green), removals (red), and unchanged (gray) parts,
 * making it easy to intuitively compare differences before and after segmentation or transformation.
 *
 * @module @novel-segment/pretty-diff
 */

import { crlf } from 'crlf-normalize';
import { chalkByConsole, console } from 'debug-color2';
import { ITSValueOrArrayMaybeReadonly } from 'ts-type/lib/type/base';
import { IStylesColorNames } from 'debug-color2/lib/styles';
import { diffChars } from 'diff';
import { cn2tw_min } from '@lazy-cjk/zh-convert/min';
import { IWord } from '@novel-segment/types';
import { stringify } from '@novel-segment/stringify';

/**
 * 文字輸入類型
 * Text Input Type
 *
 * 支援單一詞詞物件、字串，或其陣列形式。
 * 可用於表示斷詞結果或原始文字。
 *
 * Supports single word object, string, or their array form.
 * Can be used to represent segmentation results or original text.
 */
export type ITextInput = ITSValueOrArrayMaybeReadonly<IWord | string>;

/**
 * 列印美化差異比較結果
 * Print Pretty Diff Result
 *
 * 比較新舊文字內容，以色彩標記差異並輸出至主控台。
 * 同時會進行簡繁轉換比較，顯示簡體轉繁體後的差異。
 *
 * Compares old and new text content, marks differences with colors and outputs to console.
 * Also performs Simplified-to-Traditional conversion comparison, showing differences after conversion.
 *
 * @param {ITextInput} text_old - 原始文字或斷詞結果 / Original text or segmentation result
 * @param {ITextInput} text_new - 新文字或斷詞結果 / New text or segmentation result
 * @returns {Object} 包含比較結果的物件 / Object containing comparison results
 * @returns {string} .text_old - 標準化後的原始文字 / Normalized original text
 * @returns {string} .text_new - 標準化後的新文字 / Normalized new text
 * @returns {boolean} .changed - 是否有變更 / Whether there are changes
 * @returns {string} .text_new2 - 簡轉繁後的新文字 / New text after Simplified-to-Traditional conversion
 */
export function printPrettyDiff(text_old: ITextInput, text_new: ITextInput)
{
	// 將輸入轉換為字串並標準化換行符 / Convert input to string and normalize line endings
	text_old = crlf(stringify([text_old].flat()));
	text_new = crlf(stringify([text_new].flat()));

	// 檢查是否有變更 / Check if there are changes
	const changed = text_old !== text_new;

	// 如果有變更，顯示變更狀態 / If changed, show change status
	if (changed)
	{
		console.red(`changed: ${changed}`);
	}

	console.gray("------------------");

	// 根據是否有變更選擇輸出方式 / Choose output method based on whether there are changes
	if (changed)
	{
		// 顯示帶有色彩標記的差異 / Show diff with color coding
		console.success(diff_log(text_old, text_new));
	}
	else
	{
		// 無變更時直接顯示新文字 / Show new text directly when no changes
		console.log(text_new);
	}

	console.gray("------------------");

	// 進行簡繁轉換比較 / Perform Simplified-to-Traditional conversion comparison
	const text_new2 = cn2tw_min(text_new);

	// 如果簡繁轉換有差異，顯示轉換結果 / If there's difference after conversion, show conversion result
	if (text_new !== text_new2)
	{
		console.log(diff_log(text_new, text_new2));
		console.gray("------------------");
	}

	return {
		text_old,
		text_new,
		changed,
		text_new2,
	}
}

/**
 * 產生差異日誌字串
 * Generate Diff Log String
 *
 * 比較兩個字串的差異，產生帶有色彩標記的字串。
 * 使用 diff 套件進行字元級別的差異比對。
 *
 * Compares two strings and generates a string with color coding.
 * Uses the diff package for character-level diff comparison.
 *
 * @param {string} src_text - 來源文字 / Source text
 * @param {string} new_text - 新文字 / New text
 * @returns {string} 帶有 ANSI 色彩碼的差異字串 / Diff string with ANSI color codes
 */
export function diff_log(src_text: string, new_text: string): string
{
	// 使用 diffChars 進行字元級別的差異比對 / Use diffChars for character-level diff comparison
	let diff = diffChars(src_text, new_text);

	// 使用 chalk 產生帶色彩的輸出 / Use chalk to generate colored output
	return chalkByConsole(function (chalk, _console)
	{
		// 將每個差異部分轉換為帶色彩的字串 / Convert each diff part to colored string
		let diff_arr: string[] = diff
			.reduce(function (a: string[], part)
			{
				// 根據差異類型選擇顏色 / Choose color based on diff type
				// 綠色：新增 / Green: added
				// 紅色：刪除 / Red: removed
				// 灰色：未變更 / Gray: unchanged
				let color: IStylesColorNames = part.added ? 'green' :
					part.removed ? 'red' : 'grey';

				// 套用顏色 / Apply color
				let t = chalk[color](part.value);

				a.push(t);

				return a;
			}, [])
		;

		// 將所有部分合併為完整字串 / Combine all parts into complete string
		return diff_arr.join('');
	});
}

export default printPrettyDiff
