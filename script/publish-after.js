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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC1hZnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2gtYWZ0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDZCQUE2QjtBQUM3QixzREFBOEM7QUFDOUMsK0NBQStDO0FBRS9DLHFDQUFxQztBQUVyQyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBRVgsSUFBSSxVQUE2QixDQUFDO0lBQ2xDLGFBQWE7SUFDYixVQUFVLEdBQUcsMkNBQWEsYUFBYSxFQUFDLENBQUM7SUFFekMsSUFBSSxPQUFlLENBQUM7SUFFcEIsYUFBYTtJQUNiLE9BQU8sR0FBRywyQ0FBYSxXQUFXLEVBQUMsQ0FBQztJQUNwQyxhQUFhO0lBQ2IsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUU3QixJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLHdCQUFhLENBQUMsWUFBWSxDQUFDLEVBQ2xFO1FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5QixPQUFPO0tBQ1A7SUFFRCxJQUFJLE9BQU8sR0FBRztRQUNiLEdBQUcsRUFBRSx3QkFBYSxDQUFDLFlBQVk7UUFDL0IsS0FBSyxFQUFFLFNBQVM7S0FDaEIsQ0FBQztJQUVGLElBQUksR0FBRyxHQUFHLGVBQWUsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRS9DLE1BQU0sVUFBVSxDQUFDLEtBQUssRUFBRTtRQUN2QixRQUFRO1FBQ1IsSUFBSTtRQUNKLElBQUk7UUFDSixHQUFHO0tBRUgsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVaLE1BQU0sSUFBSSxPQUFPLENBQUMsVUFBVSxJQUFJO1FBRS9CLFVBQVUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLFVBQVUsQ0FBQyxLQUFLLEVBQUU7UUFDdkIsS0FBSztRQUNMLElBQUk7UUFDSixXQUFXLENBQUMsT0FBTztRQUNuQixJQUFJO1FBQ0osR0FBRztLQUVILEVBQUUsT0FBTyxDQUFDLENBQUM7QUFFYixDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNy8yNC8wMjQuXG4gKi9cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBQcm9qZWN0Q29uZmlnIGZyb20gJy4uL3Byb2plY3QuY29uZmlnJztcbmltcG9ydCAqIGFzIFBhY2thZ2VKc29uIGZyb20gJy4uL3BhY2thZ2UuanNvbic7XG5pbXBvcnQgKiBhcyBDcm9zc1NwYXduIGZyb20gJ2Nyb3NzLXNwYXduJztcbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwiY3Jvc3Mtc3Bhd25cIiAvPlxuXG4oYXN5bmMgKCkgPT5cbntcblx0bGV0IGNyb3NzU3Bhd246IHR5cGVvZiBDcm9zc1NwYXduO1xuXHQvLyBAdHMtaWdub3JlXG5cdGNyb3NzU3Bhd24gPSBhd2FpdCBpbXBvcnQoJ2Nyb3NzLXNwYXduJyk7XG5cblx0bGV0IGdpdHJvb3Q6IHN0cmluZztcblxuXHQvLyBAdHMtaWdub3JlXG5cdGdpdHJvb3QgPSBhd2FpdCBpbXBvcnQoJ2dpdC1yb290MicpO1xuXHQvLyBAdHMtaWdub3JlXG5cdGdpdHJvb3QgPSBnaXRyb290KF9fZGlybmFtZSk7XG5cblx0aWYgKCFnaXRyb290IHx8IHBhdGgucmVsYXRpdmUoZ2l0cm9vdCwgUHJvamVjdENvbmZpZy5wcm9qZWN0X3Jvb3QpKVxuXHR7XG5cdFx0Y29uc29sZS53YXJuKGBubyBnaXQgZXhpc3RzYCk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IG9wdGlvbnMgPSB7XG5cdFx0Y3dkOiBQcm9qZWN0Q29uZmlnLnByb2plY3Rfcm9vdCxcblx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHR9O1xuXG5cdGxldCBtc2cgPSBgbnBtIHB1Ymxpc2ggJHtQYWNrYWdlSnNvbi52ZXJzaW9ufWA7XG5cblx0YXdhaXQgY3Jvc3NTcGF3bignZ2l0JywgW1xuXHRcdCdjb21taXQnLFxuXHRcdCctYScsXG5cdFx0Jy1tJyxcblx0XHRtc2csXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRdLCBvcHRpb25zKTtcblxuXHRhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbiAoZG9uZSlcblx0e1xuXHRcdHNldFRpbWVvdXQoZG9uZSwgNTAwKTtcblx0fSk7XG5cblx0YXdhaXQgY3Jvc3NTcGF3bignZ2l0JywgW1xuXHRcdCd0YWcnLFxuXHRcdCctYScsXG5cdFx0UGFja2FnZUpzb24udmVyc2lvbixcblx0XHQnLW0nLFxuXHRcdG1zZyxcblx0XHQvLyBAdHMtaWdub3JlXG5cdF0sIG9wdGlvbnMpO1xuXG59KSgpLmNhdGNoKGUgPT4gY29uc29sZS5lcnJvcihlKSk7XG4iXX0=