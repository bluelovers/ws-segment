"use strict";
/**
 * Created by user on 2018/7/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const project_config_1 = require("../project.config");
// @ts-ignore
const PackageJson = require("../package.json");
/// <reference types="cross-spawn" />
(async () => {
    let crossSpawn;
    // @ts-ignore
    crossSpawn = await Promise.resolve().then(() => require('cross-spawn'));
    let gitroot;
    // @ts-ignore
    gitroot = await Promise.resolve().then(() => require('git-root2'));
    // @ts-ignore
    gitroot = gitroot(__dirname);
    if (!gitroot || path.relative(gitroot, project_config_1.default.project_root)) {
        console.warn(`no git exists`);
        return;
    }
    let options = {
        cwd: project_config_1.default.project_root,
        stdio: 'inherit',
    };
    let msg = `npm publish ${PackageJson.version}`;
    await crossSpawn('git', [
        'commit',
        '-a',
        '-m',
        msg,
    ], options);
    await new Promise(function (done) {
        setTimeout(done, 500);
    });
    await crossSpawn('git', [
        'tag',
        '-a',
        PackageJson.version,
        '-m',
        msg,
    ], options);
})().catch(e => console.error(e));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC1hZnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2gtYWZ0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDZCQUE2QjtBQUM3QixzREFBOEM7QUFDOUMsYUFBYTtBQUNiLCtDQUErQztBQUUvQyxxQ0FBcUM7QUFFckMsQ0FBQyxLQUFLLElBQUksRUFBRTtJQUVYLElBQUksVUFBNkIsQ0FBQztJQUNsQyxhQUFhO0lBQ2IsVUFBVSxHQUFHLDJDQUFhLGFBQWEsRUFBQyxDQUFDO0lBRXpDLElBQUksT0FBZSxDQUFDO0lBRXBCLGFBQWE7SUFDYixPQUFPLEdBQUcsMkNBQWEsV0FBVyxFQUFDLENBQUM7SUFDcEMsYUFBYTtJQUNiLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFN0IsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSx3QkFBYSxDQUFDLFlBQVksQ0FBQyxFQUNsRTtRQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDOUIsT0FBTztLQUNQO0lBRUQsSUFBSSxPQUFPLEdBQUc7UUFDYixHQUFHLEVBQUUsd0JBQWEsQ0FBQyxZQUFZO1FBQy9CLEtBQUssRUFBRSxTQUFTO0tBQ2hCLENBQUM7SUFFRixJQUFJLEdBQUcsR0FBRyxlQUFlLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUUvQyxNQUFNLFVBQVUsQ0FBQyxLQUFLLEVBQUU7UUFDdkIsUUFBUTtRQUNSLElBQUk7UUFDSixJQUFJO1FBQ0osR0FBRztLQUNILEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFWixNQUFNLElBQUksT0FBTyxDQUFDLFVBQVUsSUFBSTtRQUUvQixVQUFVLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxVQUFVLENBQUMsS0FBSyxFQUFFO1FBQ3ZCLEtBQUs7UUFDTCxJQUFJO1FBQ0osV0FBVyxDQUFDLE9BQU87UUFDbkIsSUFBSTtRQUNKLEdBQUc7S0FDSCxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBRWIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzcvMjQvMDI0LlxuICovXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgUHJvamVjdENvbmZpZyBmcm9tICcuLi9wcm9qZWN0LmNvbmZpZyc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgKiBhcyBQYWNrYWdlSnNvbiBmcm9tICcuLi9wYWNrYWdlLmpzb24nO1xuaW1wb3J0ICogYXMgQ3Jvc3NTcGF3biBmcm9tICdjcm9zcy1zcGF3bic7XG4vLy8gPHJlZmVyZW5jZSB0eXBlcz1cImNyb3NzLXNwYXduXCIgLz5cblxuKGFzeW5jICgpID0+XG57XG5cdGxldCBjcm9zc1NwYXduOiB0eXBlb2YgQ3Jvc3NTcGF3bjtcblx0Ly8gQHRzLWlnbm9yZVxuXHRjcm9zc1NwYXduID0gYXdhaXQgaW1wb3J0KCdjcm9zcy1zcGF3bicpO1xuXG5cdGxldCBnaXRyb290OiBzdHJpbmc7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRnaXRyb290ID0gYXdhaXQgaW1wb3J0KCdnaXQtcm9vdDInKTtcblx0Ly8gQHRzLWlnbm9yZVxuXHRnaXRyb290ID0gZ2l0cm9vdChfX2Rpcm5hbWUpO1xuXG5cdGlmICghZ2l0cm9vdCB8fCBwYXRoLnJlbGF0aXZlKGdpdHJvb3QsIFByb2plY3RDb25maWcucHJvamVjdF9yb290KSlcblx0e1xuXHRcdGNvbnNvbGUud2Fybihgbm8gZ2l0IGV4aXN0c2ApO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGxldCBvcHRpb25zID0ge1xuXHRcdGN3ZDogUHJvamVjdENvbmZpZy5wcm9qZWN0X3Jvb3QsXG5cdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0fTtcblxuXHRsZXQgbXNnID0gYG5wbSBwdWJsaXNoICR7UGFja2FnZUpzb24udmVyc2lvbn1gO1xuXG5cdGF3YWl0IGNyb3NzU3Bhd24oJ2dpdCcsIFtcblx0XHQnY29tbWl0Jyxcblx0XHQnLWEnLFxuXHRcdCctbScsXG5cdFx0bXNnLFxuXHRdLCBvcHRpb25zKTtcblxuXHRhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbiAoZG9uZSlcblx0e1xuXHRcdHNldFRpbWVvdXQoZG9uZSwgNTAwKTtcblx0fSk7XG5cblx0YXdhaXQgY3Jvc3NTcGF3bignZ2l0JywgW1xuXHRcdCd0YWcnLFxuXHRcdCctYScsXG5cdFx0UGFja2FnZUpzb24udmVyc2lvbixcblx0XHQnLW0nLFxuXHRcdG1zZyxcblx0XSwgb3B0aW9ucyk7XG5cbn0pKCkuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKGUpKTtcbiJdfQ==