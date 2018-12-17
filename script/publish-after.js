"use strict";
/**
 * Created by user on 2018/7/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const project_config_1 = require("../project.config");
const PackageJson = require("../package.json");
/// <reference types="cross-spawn" />
(async () => {
    let crossSpawn;
    // @ts-ignore
    crossSpawn = await Promise.resolve().then(() => require('cross-spawn-extra'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC1hZnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2gtYWZ0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDZCQUE2QjtBQUM3QixzREFBOEM7QUFDOUMsK0NBQStDO0FBRS9DLHFDQUFxQztBQUVyQyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBRVgsSUFBSSxVQUE2QixDQUFDO0lBQ2xDLGFBQWE7SUFDYixVQUFVLEdBQUcsMkNBQWEsbUJBQW1CLEVBQUMsQ0FBQztJQUUvQyxJQUFJLE9BQWUsQ0FBQztJQUVwQixhQUFhO0lBQ2IsT0FBTyxHQUFHLDJDQUFhLFdBQVcsRUFBQyxDQUFDO0lBQ3BDLGFBQWE7SUFDYixPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRTdCLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsd0JBQWEsQ0FBQyxZQUFZLENBQUMsRUFDbEU7UUFDQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzlCLE9BQU87S0FDUDtJQUVELElBQUksT0FBTyxHQUFHO1FBQ2IsR0FBRyxFQUFFLHdCQUFhLENBQUMsWUFBWTtRQUMvQixLQUFLLEVBQUUsU0FBUztLQUNoQixDQUFDO0lBRUYsSUFBSSxHQUFHLEdBQUcsZUFBZSxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7SUFFL0MsTUFBTSxVQUFVLENBQUMsS0FBSyxFQUFFO1FBQ3ZCLFFBQVE7UUFDUixJQUFJO1FBQ0osSUFBSTtRQUNKLEdBQUc7S0FFSCxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRVosTUFBTSxJQUFJLE9BQU8sQ0FBQyxVQUFVLElBQUk7UUFFL0IsVUFBVSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN2QixDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sVUFBVSxDQUFDLEtBQUssRUFBRTtRQUN2QixLQUFLO1FBQ0wsSUFBSTtRQUNKLFdBQVcsQ0FBQyxPQUFPO1FBQ25CLElBQUk7UUFDSixHQUFHO0tBRUgsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUViLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC83LzI0LzAyNC5cbiAqL1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IFByb2plY3RDb25maWcgZnJvbSAnLi4vcHJvamVjdC5jb25maWcnO1xuaW1wb3J0ICogYXMgUGFja2FnZUpzb24gZnJvbSAnLi4vcGFja2FnZS5qc29uJztcbmltcG9ydCBDcm9zc1NwYXduID0gcmVxdWlyZSgnY3Jvc3Mtc3Bhd24tZXh0cmEnKTtcbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwiY3Jvc3Mtc3Bhd25cIiAvPlxuXG4oYXN5bmMgKCkgPT5cbntcblx0bGV0IGNyb3NzU3Bhd246IHR5cGVvZiBDcm9zc1NwYXduO1xuXHQvLyBAdHMtaWdub3JlXG5cdGNyb3NzU3Bhd24gPSBhd2FpdCBpbXBvcnQoJ2Nyb3NzLXNwYXduLWV4dHJhJyk7XG5cblx0bGV0IGdpdHJvb3Q6IHN0cmluZztcblxuXHQvLyBAdHMtaWdub3JlXG5cdGdpdHJvb3QgPSBhd2FpdCBpbXBvcnQoJ2dpdC1yb290MicpO1xuXHQvLyBAdHMtaWdub3JlXG5cdGdpdHJvb3QgPSBnaXRyb290KF9fZGlybmFtZSk7XG5cblx0aWYgKCFnaXRyb290IHx8IHBhdGgucmVsYXRpdmUoZ2l0cm9vdCwgUHJvamVjdENvbmZpZy5wcm9qZWN0X3Jvb3QpKVxuXHR7XG5cdFx0Y29uc29sZS53YXJuKGBubyBnaXQgZXhpc3RzYCk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IG9wdGlvbnMgPSB7XG5cdFx0Y3dkOiBQcm9qZWN0Q29uZmlnLnByb2plY3Rfcm9vdCxcblx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHR9O1xuXG5cdGxldCBtc2cgPSBgbnBtIHB1Ymxpc2ggJHtQYWNrYWdlSnNvbi52ZXJzaW9ufWA7XG5cblx0YXdhaXQgY3Jvc3NTcGF3bignZ2l0JywgW1xuXHRcdCdjb21taXQnLFxuXHRcdCctYScsXG5cdFx0Jy1tJyxcblx0XHRtc2csXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRdLCBvcHRpb25zKTtcblxuXHRhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbiAoZG9uZSlcblx0e1xuXHRcdHNldFRpbWVvdXQoZG9uZSwgNTAwKTtcblx0fSk7XG5cblx0YXdhaXQgY3Jvc3NTcGF3bignZ2l0JywgW1xuXHRcdCd0YWcnLFxuXHRcdCctYScsXG5cdFx0UGFja2FnZUpzb24udmVyc2lvbixcblx0XHQnLW0nLFxuXHRcdG1zZyxcblx0XHQvLyBAdHMtaWdub3JlXG5cdF0sIG9wdGlvbnMpO1xuXG59KSgpLmNhdGNoKGUgPT4gY29uc29sZS5lcnJvcihlKSk7XG4iXX0=